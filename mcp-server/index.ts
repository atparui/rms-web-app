#!/usr/bin/env node

/**
 * MCP Server for API Documentation
 * 
 * This server provides Cursor AI with access to OpenAPI specifications
 * from the gateway, with Keycloak authentication support.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';
import fs from 'fs/promises';
import path from 'path';

// Configuration from environment variables
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'https://rmsauth.atparui.com';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'gateway';
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || 'gateway-web';
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET || '';
const GATEWAY_URL = process.env.GATEWAY_URL || 'https://rmsgateway.atparui.com';
// Default endpoint: /services/rms-service/v3/api-docs (without /springdocDefault)
const API_DOCS_ENDPOINT = process.env.API_DOCS_ENDPOINT || '/services/rms-service/v3/api-docs';
const CACHE_DIR = path.join(process.cwd(), '.mcp-cache');
const CACHE_FILE = path.join(CACHE_DIR, 'openapi.json');
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: any;
  timestamp: number;
}

interface TokenCache {
  access_token: string;
  expires_at: number;
  token_type: string;
}

class APIDocsMCPServer {
  private server: Server;
  private cache: CacheEntry | null = null;
  private tokenCache: TokenCache | null = null;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.server = new Server(
      {
        name: 'api-docs-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MCP-API-Docs-Server/1.0.0',
      },
      maxRedirects: 5,
      validateStatus: (status) => status < 500, // Don't throw on 4xx errors, we'll handle them
    });

    // Log configuration on startup
    console.error('[MCP] Server initialized with configuration:');
    console.error(`[MCP]   GATEWAY_URL: ${GATEWAY_URL}`);
    console.error(`[MCP]   API_DOCS_ENDPOINT: ${API_DOCS_ENDPOINT}`);
    console.error(`[MCP]   KEYCLOAK_URL: ${KEYCLOAK_URL}`);
    console.error(`[MCP]   KEYCLOAK_REALM: ${KEYCLOAK_REALM}`);
    console.error(`[MCP]   KEYCLOAK_CLIENT_ID: ${KEYCLOAK_CLIENT_ID}`);
    console.error(`[MCP]   Full API docs URL will be: ${GATEWAY_URL}${API_DOCS_ENDPOINT}`);

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers() {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'api-docs://openapi',
            name: 'OpenAPI Specification',
            description: 'Complete OpenAPI 3.0 specification from the gateway',
            mimeType: 'application/json',
          },
          {
            uri: 'api-docs://services',
            name: 'Service List',
            description: 'List of available services and their endpoints',
            mimeType: 'application/json',
          },
          {
            uri: 'api-docs://endpoints',
            name: 'All Endpoints',
            description: 'List of all API endpoints with methods and descriptions',
            mimeType: 'application/json',
          },
        ],
      };
    });

    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'sync-api-docs',
            description: 'Sync API documentation from the gateway (forces refresh)',
            inputSchema: {
              type: 'object',
              properties: {
                force: {
                  type: 'boolean',
                  description: 'Force refresh even if cache is valid',
                  default: false,
                },
              },
            },
          },
          {
            name: 'get-endpoint-schema',
            description: 'Get detailed schema for a specific API endpoint',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'API path (e.g., /api/v1/restaurants)',
                },
                method: {
                  type: 'string',
                  description: 'HTTP method (GET, POST, PUT, DELETE, PATCH)',
                  enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                },
              },
              required: ['path', 'method'],
            },
          },
          {
            name: 'search-endpoints',
            description: 'Search for endpoints by tag, path, or description',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query',
                },
                tag: {
                  type: 'string',
                  description: 'Filter by tag',
                },
              },
            },
          },
        ],
      };
    });

    // Read a resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      console.error(`[MCP] Reading resource: ${uri}`);
      console.error(`[MCP] Note: 'api-docs://' is a resource URI scheme, not an HTTP URL.`);
      console.error(`[MCP] Actual HTTP requests will use GATEWAY_URL: ${GATEWAY_URL}`);

      try {
        switch (uri) {
          case 'api-docs://openapi':
            return await this.getOpenAPISpec();
          
          case 'api-docs://services':
            return await this.getServiceList();
          
          case 'api-docs://endpoints':
            return await this.getAllEndpoints();
          
          default:
            throw new Error(`Unknown resource: ${uri}`);
        }
      } catch (error: any) {
        console.error(`[MCP] Error reading resource ${uri}: ${error.message}`);
        throw new Error(`Failed to read resource ${uri}: ${error.message}`);
      }
    });

    // Call a tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const asString = (value: unknown) =>
        typeof value === 'string' ? value : undefined;

      try {
        switch (name) {
          case 'sync-api-docs':
            return await this.syncAPIDocs(args?.force === true);
        
          case 'get-endpoint-schema': {
            const path = asString(args?.path);
            const method = asString(args?.method);
            return await this.getEndpointSchema(path, method);
          }
        
          case 'search-endpoints': {
            const query = asString(args?.query);
            const tag = asString(args?.tag);
            return await this.searchEndpoints(query, tag);
          }
        
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async getOpenAPISpec() {
    // Check cache first
    const cached = await this.getCachedSpec();
    if (cached) {
      return {
        contents: [
          {
            uri: 'api-docs://openapi',
            mimeType: 'application/json',
            text: JSON.stringify(cached.data, null, 2),
          },
        ],
      };
    }

    // Fetch from gateway
    const spec = await this.fetchOpenAPISpec();
    
    // Cache it
    await this.cacheSpec(spec);
    
    return {
      contents: [
        {
          uri: 'api-docs://openapi',
          mimeType: 'application/json',
          text: JSON.stringify(spec, null, 2),
        },
      ],
    };
  }

  private async getServiceList() {
    const spec = await this.getOpenAPISpec();
    const data = JSON.parse(spec.contents[0].text);
    
    // Extract service information
    const services: Record<string, any> = {
      gateway: {
        name: data.info?.title || 'Gateway',
        version: data.info?.version || '1.0.0',
        description: data.info?.description || '',
        baseUrl: data.servers?.[0]?.url || GATEWAY_URL,
        endpointCount: Object.keys(data.paths || {}).length,
        tags: data.tags?.map((tag: any) => tag.name) || [],
      },
    };

    return {
      contents: [
        {
          uri: 'api-docs://services',
          mimeType: 'application/json',
          text: JSON.stringify(services, null, 2),
        },
      ],
    };
  }

  private async getAllEndpoints() {
    const spec = await this.getOpenAPISpec();
    const data = JSON.parse(spec.contents[0].text);
    
    const endpoints: any[] = [];
    const methods = ['get', 'post', 'put', 'patch', 'delete'] as const;

    Object.entries(data.paths || {}).forEach(([path, pathItem]: [string, any]) => {
      methods.forEach((method) => {
        const operation = pathItem[method];
        if (operation) {
          endpoints.push({
            path,
            method: method.toUpperCase(),
            operationId: operation.operationId,
            summary: operation.summary,
            description: operation.description,
            tags: operation.tags || [],
            parameters: operation.parameters?.length || 0,
            hasRequestBody: !!operation.requestBody,
            responses: Object.keys(operation.responses || {}),
          });
        }
      });
    });

    return {
      contents: [
        {
          uri: 'api-docs://endpoints',
          mimeType: 'application/json',
          text: JSON.stringify(endpoints, null, 2),
        },
      ],
    };
  }

  private async syncAPIDocs(force = false) {
    try {
      // Clear cache if forcing
      if (force) {
        this.cache = null;
        try {
          await fs.unlink(CACHE_FILE);
        } catch {
          // File doesn't exist, that's okay
        }
      }

      const spec = await this.fetchOpenAPISpec();
      await this.cacheSpec(spec);
      
      const endpointCount = Object.keys(spec.paths || {}).length;
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ Successfully synced API documentation.\n\n` +
                  `- Service: ${spec.info?.title || 'Gateway'}\n` +
                  `- Version: ${spec.info?.version || '1.0.0'}\n` +
                  `- Endpoints: ${endpointCount}\n` +
                  `- Cached: ${force ? 'Refreshed' : 'Updated'}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to sync API documentation: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async getEndpointSchema(endpointPath?: string, method?: string) {
    if (!endpointPath || !method) {
      throw new Error('Path and method are required');
    }

    const spec = await this.getOpenAPISpec();
    const data = JSON.parse(spec.contents[0].text);
    
    // Normalize path (remove /api/v1 prefix if present)
    const normalizedPath = endpointPath.replace(/^\/api\/v\d+\//, '/');
    const pathItem = data.paths?.[normalizedPath] || data.paths?.[endpointPath];
    
    if (!pathItem) {
      throw new Error(`Endpoint not found: ${endpointPath}`);
    }

    const operation = pathItem[method.toLowerCase()];
    if (!operation) {
      throw new Error(`Method ${method.toUpperCase()} not found for ${endpointPath}`);
    }

    // Resolve schema references
    const resolveSchema = (schema: any): any => {
      if (!schema) return null;
      if (schema.$ref) {
        const refPath = schema.$ref.replace('#/components/schemas/', '');
        return data.components?.schemas?.[refPath] || schema;
      }
      return schema;
    };

    const requestBodySchema = operation.requestBody?.content?.['application/json']?.schema;
    const responseSchema = operation.responses?.['200']?.content?.['application/json']?.schema ||
                          operation.responses?.['201']?.content?.['application/json']?.schema;

    const result = {
      path: endpointPath,
      method: method.toUpperCase(),
      operationId: operation.operationId,
      summary: operation.summary,
      description: operation.description,
      tags: operation.tags || [],
      parameters: operation.parameters || [],
      requestBody: requestBodySchema ? resolveSchema(requestBodySchema) : null,
      responses: Object.entries(operation.responses || {}).reduce((acc: any, [code, response]: [string, any]) => {
        acc[code] = {
          description: response.description,
          schema: response.content?.['application/json']?.schema 
            ? resolveSchema(response.content['application/json'].schema)
            : null,
        };
        return acc;
      }, {}),
      security: operation.security || [],
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async searchEndpoints(query?: string, tag?: string) {
    const spec = await this.getOpenAPISpec();
    const data = JSON.parse(spec.contents[0].text);
    
    const results: any[] = [];
    const methods = ['get', 'post', 'put', 'patch', 'delete'] as const;
    const searchLower = query?.toLowerCase() || '';

    Object.entries(data.paths || {}).forEach(([path, pathItem]: [string, any]) => {
      methods.forEach((method) => {
        const operation = pathItem[method];
        if (operation) {
          // Filter by tag
          if (tag && !operation.tags?.includes(tag)) {
            return;
          }

          // Filter by query
          if (query) {
            const matches =
              path.toLowerCase().includes(searchLower) ||
              operation.summary?.toLowerCase().includes(searchLower) ||
              operation.description?.toLowerCase().includes(searchLower) ||
              operation.operationId?.toLowerCase().includes(searchLower) ||
              operation.tags?.some((t: string) => t.toLowerCase().includes(searchLower));
            
            if (!matches) {
              return;
            }
          }

          results.push({
            path,
            method: method.toUpperCase(),
            operationId: operation.operationId,
            summary: operation.summary,
            description: operation.description,
            tags: operation.tags || [],
          });
        }
      });
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }

  private async fetchOpenAPISpec(): Promise<any> {
    // Get authentication token
    const token = await this.getAccessToken();
    
    // Log token presence (first/last 10 chars for debugging, not full token)
    if (token) {
      const tokenPreview = token.length > 20 
        ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}` 
        : '***';
      console.error(`[MCP] Using token: ${tokenPreview} (length: ${token.length})`);
    } else {
      console.error(`[MCP] WARNING: No token received from getAccessToken()`);
    }
    
    // Use the configured endpoint only
    const endpoints = [
      `${GATEWAY_URL}${API_DOCS_ENDPOINT}`, // Primary endpoint: /services/rms-service/v3/api-docs
    ];

    const errors: string[] = [];

    for (const url of endpoints) {
      // Try with authentication first
      try {
        console.error(`[MCP] Attempting to fetch from: ${url} (with authentication)`);
        console.error(`[MCP] Request headers: Authorization: Bearer ${token ? '***present***' : 'MISSING'}, Accept: application/json`);
        const response = await this.axiosInstance.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        // Log response details
        console.error(`[MCP] Response status: ${response.status}`);
        const contentType = response.headers['content-type'] || response.headers['Content-Type'] || '';
        console.error(`[MCP] Response Content-Type: ${contentType}`);
        
        // Check response status
        if (response.status >= 400) {
          console.error(`[MCP] Got error status ${response.status} from ${url}`);
          const errorPreview = typeof response.data === 'string' 
            ? response.data.substring(0, 200) 
            : JSON.stringify(response.data).substring(0, 200);
          errors.push(`${url} - HTTP ${response.status}: ${errorPreview}`);
          continue;
        }
        
        // Check if response is HTML (error page or redirect)
        if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE')) {
          console.error(`[MCP] Response from ${url} is HTML, not JSON. Trying without authentication...`);
          const htmlPreview = response.data.substring(0, 500);
          console.error(`[MCP] HTML preview: ${htmlPreview}`);
          
          // Try without authentication as fallback (endpoint might be public)
          try {
            console.error(`[MCP] Attempting to fetch from: ${url} (without authentication)`);
            const publicResponse = await this.axiosInstance.get(url, {
              headers: {
                'Accept': 'application/json',
              },
            });
            
            // Check if public response is JSON
            if (publicResponse.status === 200 && 
                (publicResponse.headers['content-type']?.includes('application/json') ||
                 (typeof publicResponse.data === 'object' || 
                  (typeof publicResponse.data === 'string' && !publicResponse.data.trim().startsWith('<!DOCTYPE'))))) {
              console.error(`[MCP] Successfully fetched from ${url} without authentication`);
              let data = publicResponse.data;
              if (typeof data === 'string') {
                data = JSON.parse(data);
              }
              if (data && (data.openapi || data.swagger)) {
                return data;
              }
            }
          } catch (publicError: any) {
            console.error(`[MCP] Public access also failed: ${publicError.message}`);
          }
          
          errors.push(`${url} - Server returned HTML instead of JSON (likely auth error or redirect)`);
          continue;
        }

        // Parse response data if it's a string (JSON string)
        let data = response.data;
        if (typeof data === 'string') {
          // Skip if it looks like HTML
          if (data.trim().startsWith('<!DOCTYPE') || data.trim().startsWith('<html')) {
            console.error(`[MCP] Response appears to be HTML, skipping parse`);
            errors.push(`${url} - Response is HTML, not JSON`);
            continue;
          }
          try {
            data = JSON.parse(data);
            console.error(`[MCP] Parsed JSON string response`);
          } catch (parseError: any) {
            console.error(`[MCP] Failed to parse JSON string: ${parseError.message}`);
            const preview = data.substring(0, 200);
            console.error(`[MCP] Response preview: ${preview}`);
            errors.push(`${url} - Response is not valid JSON: ${parseError.message}`);
            continue;
          }
        }

        // Validate OpenAPI spec - check for openapi/swagger property and paths
        if (data && typeof data === 'object') {
          const hasOpenAPI = data.openapi || data.swagger;
          const hasPaths = data.paths && typeof data.paths === 'object';
          
          if (hasOpenAPI && hasPaths) {
            console.error(`[MCP] Successfully fetched OpenAPI spec from: ${url}`);
            console.error(`[MCP] OpenAPI version: ${data.openapi || data.swagger}, Paths: ${Object.keys(data.paths || {}).length}`);
            return data;
          } else {
            console.error(`[MCP] Response from ${url} is not a valid OpenAPI spec:`);
            console.error(`[MCP]   - Has openapi/swagger: ${!!hasOpenAPI}`);
            console.error(`[MCP]   - Has paths: ${!!hasPaths}`);
            if (data.info) {
              console.error(`[MCP]   - Response type: ${data.info.title || 'unknown'}`);
            }
          }
        } else {
          console.error(`[MCP] Response from ${url} is not a valid object (type: ${typeof data})`);
        }
      } catch (error: any) {
        const status = error.response?.status;
        const statusText = error.response?.statusText;
        const errorMsg = error.response?.data?.message || error.message;
        const errorDetail = `Status: ${status || 'N/A'}, Error: ${errorMsg || statusText || 'Unknown error'}`;
        errors.push(`${url} - ${errorDetail}`);
        console.error(`[MCP] Failed to fetch from ${url}: ${errorDetail}`);
        
        // If 401, token might be expired, try refreshing
        if (status === 401) {
          console.error(`[MCP] Got 401, refreshing token and retrying ${url}`);
          this.tokenCache = null;
          const newToken = await this.getAccessToken(true);
          try {
            const response = await this.axiosInstance.get(url, {
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'Accept': 'application/json',
              },
            });
            
            // Check response status
            if (response.status >= 400) {
              console.error(`[MCP] Retry got error status ${response.status}`);
              continue;
            }
            
            // Check if response is HTML
            if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE')) {
              console.error(`[MCP] Retry response is HTML, not JSON`);
              continue;
            }
            
            // Parse response data if it's a string (JSON string)
            let data = response.data;
            if (typeof data === 'string') {
              // Skip if it looks like HTML
              if (data.trim().startsWith('<!DOCTYPE') || data.trim().startsWith('<html')) {
                console.error(`[MCP] Retry response appears to be HTML`);
                continue;
              }
              try {
                data = JSON.parse(data);
                console.error(`[MCP] Parsed JSON string response (after token refresh)`);
              } catch (parseError: any) {
                console.error(`[MCP] Failed to parse JSON string: ${parseError.message}`);
                continue;
              }
            }
            
            if (data && (data.openapi || data.swagger)) {
              console.error(`[MCP] Successfully fetched OpenAPI spec from: ${url} (after token refresh)`);
              return data;
            }
          } catch (retryError: any) {
            const retryStatus = retryError.response?.status;
            const retryErrorMsg = retryError.response?.data?.message || retryError.message;
            console.error(`[MCP] Retry failed for ${url}: Status ${retryStatus || 'N/A'}, Error: ${retryErrorMsg || 'Unknown'}`);
            // Continue to next endpoint
            continue;
          }
        }
        // Continue to next endpoint
        continue;
      }
    }

    const errorMessage = `Could not fetch OpenAPI spec from any endpoint. Tried:\n${errors.map(e => `  - ${e}`).join('\n')}\n\nGateway URL: ${GATEWAY_URL}\nAPI Docs Endpoint: ${API_DOCS_ENDPOINT}\nCheck authentication and gateway URL configuration.`;
    throw new Error(errorMessage);
  }

  private async getAccessToken(forceRefresh = false): Promise<string> {
    // Check if we have a valid cached token
    if (!forceRefresh && this.tokenCache && this.tokenCache.expires_at > Date.now()) {
      return this.tokenCache.access_token;
    }

    // Validate client secret is available
    if (!KEYCLOAK_CLIENT_SECRET) {
      throw new Error('KEYCLOAK_CLIENT_SECRET environment variable is not set');
    }

    try {
      const tokenUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
      
      const response = await this.axiosInstance.post(
        tokenUrl,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: KEYCLOAK_CLIENT_ID,
          client_secret: KEYCLOAK_CLIENT_SECRET,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const { access_token, expires_in, token_type } = response.data;
      
      // Debug: Log token claims to help troubleshoot role issues
      try {
        const parts = access_token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          const realmRoles = payload.realm_access?.roles || [];
          const resourceAccess = payload.resource_access || {};
          const directRoles = payload.roles || [];
          
          // Log role information for debugging
          if (realmRoles.length > 0 || Object.keys(resourceAccess).length > 0 || directRoles.length > 0) {
            if (realmRoles.length > 0) {
              console.error('[MCP] Token roles - Realm:', realmRoles);
            }
            Object.keys(resourceAccess).forEach(clientId => {
              const roles = resourceAccess[clientId]?.roles || [];
              if (roles.length > 0) {
                console.error(`[MCP] Token roles - ${clientId}:`, roles);
              }
            });
            if (directRoles.length > 0) {
              console.error('[MCP] Token roles - Direct (roles claim):', directRoles);
            }
          } else {
            console.error('[MCP] Warning: No roles found in token. Ensure ROLE_ADMIN is assigned to service account.');
          }
        }
      } catch (debugError) {
        // Ignore debug errors
      }
      
      // Cache the token (expire 30 seconds before actual expiry for safety)
      this.tokenCache = {
        access_token,
        expires_at: Date.now() + (expires_in - 30) * 1000,
        token_type: token_type || 'Bearer',
      };

      return access_token;
    } catch (error: any) {
      const errorMsg = error.response?.data?.error_description || error.message;
      throw new Error(`Failed to get access token from Keycloak: ${errorMsg}`);
    }
  }

  private async getCachedSpec(): Promise<CacheEntry | null> {
    try {
      const data = await fs.readFile(CACHE_FILE, 'utf-8');
      const entry: CacheEntry = JSON.parse(data);
      
      // Check if cache is still valid
      const age = Date.now() - entry.timestamp;
      if (age < CACHE_TTL) {
        return entry;
      }
    } catch (error) {
      // Cache doesn't exist or is invalid
    }
    
    return null;
  }

  private async cacheSpec(spec: any): Promise<void> {
    try {
      await fs.mkdir(CACHE_DIR, { recursive: true });
      
      const entry: CacheEntry = {
        data: spec,
        timestamp: Date.now(),
      };
      
      await fs.writeFile(CACHE_FILE, JSON.stringify(entry, null, 2));
    } catch (error) {
      // Cache write failed, but that's okay
      console.error('[MCP] Failed to cache spec:', error);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[MCP] API Docs Server running on stdio');
  }
}

// Start server
const server = new APIDocsMCPServer();
server.run().catch((error) => {
  console.error('[MCP] Fatal error:', error);
  process.exit(1);
});

