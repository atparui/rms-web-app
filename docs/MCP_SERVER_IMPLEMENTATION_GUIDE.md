# MCP Server Implementation Guide

## Overview

This guide explains the effort required to create an MCP (Model Context Protocol) server for API documentation access and how to implement it on a developer workstation.

---

## What is MCP?

**Model Context Protocol (MCP)** is a protocol that allows AI assistants (like Cursor) to access external resources and tools dynamically. It's like giving Cursor AI a way to "call functions" or "fetch data" from your own services.

**Key Concepts:**
- **MCP Server**: A service that provides resources/tools to Cursor
- **Resources**: Data that Cursor can read (like API docs)
- **Tools**: Functions that Cursor can call (like fetching latest API spec)
- **Protocol**: Standardized communication between Cursor and your server

---

## Effort Assessment

### Complexity: **Medium** (3-5 days for experienced developer)

### Breakdown:

| Task | Effort | Complexity |
|------|--------|------------|
| Understanding MCP | 2-4 hours | Low |
| Basic MCP server setup | 4-6 hours | Medium |
| API integration | 2-4 hours | Low |
| Authentication handling | 4-8 hours | Medium |
| Testing & debugging | 4-6 hours | Medium |
| Documentation | 2-3 hours | Low |
| **Total** | **18-31 hours** | **Medium** |

### Skills Required:
- TypeScript/JavaScript (Node.js)
- Understanding of HTTP/WebSockets
- Basic understanding of protocols
- API integration experience

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Cursor AI                             │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  MCP Client (built into Cursor)                  │   │
│  └──────────────────┬───────────────────────────────┘   │
└─────────────────────┼───────────────────────────────────┘
                      │
                      │ MCP Protocol (HTTP/WebSocket)
                      │
┌─────────────────────▼───────────────────────────────────┐
│              MCP Server (Your Implementation)           │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Resource: api-docs                              │   │
│  │  - Fetches OpenAPI spec from gateway            │   │
│  │  - Handles authentication                       │   │
│  │  - Returns formatted JSON                       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Tool: sync-api-docs                            │   │
│  │  - Can be called by Cursor to refresh docs      │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────────────────┐
│         Gateway (rmsgateway.atparui.com)                │
│         /v3/api-docs or /api-docs/public               │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Step 1: Install MCP SDK

**Option A: Official MCP SDK (Recommended)**

```bash
npm install @modelcontextprotocol/sdk
```

**Option B: Manual Implementation**

You can implement the protocol yourself, but it's more complex.

### Step 2: Create MCP Server

**File:** `frontend/mcp-server/index.ts`

```typescript
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

// Configuration
const GATEWAY_URL = process.env.GATEWAY_URL || 'https://rmsgateway.atparui.com';
const API_DOCS_ENDPOINT = process.env.API_DOCS_ENDPOINT || '/v3/api-docs';
const CACHE_FILE = path.join(process.cwd(), '.mcp-cache', 'openapi.json');
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: any;
  timestamp: number;
}

class APIDocsMCPServer {
  private server: Server;
  private cache: CacheEntry | null = null;

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

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'api-docs://openapi',
            name: 'OpenAPI Specification',
            description: 'Gateway API documentation (OpenAPI 3.0)',
            mimeType: 'application/json',
          },
          {
            uri: 'api-docs://services',
            name: 'Service List',
            description: 'List of available services',
            mimeType: 'application/json',
          },
        ],
      };
    });

    // Read a resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case 'api-docs://openapi':
          return await this.getOpenAPISpec();
        
        case 'api-docs://services':
          return await this.getServiceList();
        
        default:
          throw new Error(`Unknown resource: ${uri}`);
      }
    });

    // Call a tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'sync-api-docs':
          return await this.syncAPIDocs();
        
        case 'get-endpoint-schema':
          return await this.getEndpointSchema(args?.path, args?.method);
        
        default:
          throw new Error(`Unknown tool: ${name}`);
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
    try {
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
    } catch (error: any) {
      throw new Error(`Failed to fetch OpenAPI spec: ${error.message}`);
    }
  }

  private async getServiceList() {
    const spec = await this.getOpenAPISpec();
    const data = JSON.parse(spec.contents[0].text);
    
    // Extract service information
    const services = {
      gateway: {
        name: data.info?.title || 'Gateway',
        version: data.info?.version || '1.0.0',
        endpoints: Object.keys(data.paths || {}).length,
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

  private async syncAPIDocs() {
    try {
      const spec = await this.fetchOpenAPISpec();
      await this.cacheSpec(spec);
      
      return {
        content: [
          {
            type: 'text',
            text: `Successfully synced API documentation. Found ${Object.keys(spec.paths || {}).length} endpoints.`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to sync: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async getEndpointSchema(path?: string, method?: string) {
    if (!path || !method) {
      throw new Error('Path and method are required');
    }

    const spec = await this.getOpenAPISpec();
    const data = JSON.parse(spec.contents[0].text);
    
    const pathItem = data.paths?.[path];
    if (!pathItem) {
      throw new Error(`Endpoint not found: ${path}`);
    }

    const operation = pathItem[method.toLowerCase()];
    if (!operation) {
      throw new Error(`Method ${method} not found for ${path}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            path,
            method: method.toUpperCase(),
            summary: operation.summary,
            description: operation.description,
            parameters: operation.parameters,
            requestBody: operation.requestBody,
            responses: operation.responses,
          }, null, 2),
        },
      ],
    };
  }

  private async fetchOpenAPISpec(): Promise<any> {
    const endpoints = [
      `${GATEWAY_URL}${API_DOCS_ENDPOINT}`,
      `${GATEWAY_URL}/swagger.json`,
      `${GATEWAY_URL}/api-docs/public`,
    ];

    for (const url of endpoints) {
      try {
        const response = await axios.get(url, {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            // Add authentication if needed
            // 'Authorization': `Bearer ${process.env.API_TOKEN}`,
          },
        });

        if (response.data && (response.data.openapi || response.data.swagger)) {
          return response.data;
        }
      } catch (error) {
        // Try next endpoint
        continue;
      }
    }

    throw new Error('Could not fetch OpenAPI spec from any endpoint');
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
      const cacheDir = path.dirname(CACHE_FILE);
      await fs.mkdir(cacheDir, { recursive: true });
      
      const entry: CacheEntry = {
        data: spec,
        timestamp: Date.now(),
      };
      
      await fs.writeFile(CACHE_FILE, JSON.stringify(entry, null, 2));
    } catch (error) {
      // Cache write failed, but that's okay
      console.warn('Failed to cache spec:', error);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP API Docs Server running on stdio');
  }
}

// Start server
const server = new APIDocsMCPServer();
server.run().catch(console.error);
```

### Step 3: Configure Cursor to Use MCP Server

**File:** `.cursor/mcp.json` (in workspace root)

```json
{
  "mcpServers": {
    "api-docs": {
      "command": "node",
      "args": [
        "frontend/mcp-server/index.js"
      ],
      "env": {
        "GATEWAY_URL": "https://rmsgateway.atparui.com",
        "API_DOCS_ENDPOINT": "/v3/api-docs"
      }
    }
  }
}
```

**Alternative:** `.cursor/mcp.json` in user home directory (affects all projects)

**File:** `~/.cursor/mcp.json` (macOS/Linux) or `%USERPROFILE%\.cursor\mcp.json` (Windows)

```json
{
  "mcpServers": {
    "rms-api-docs": {
      "command": "node",
      "args": [
        "C:\\Users\\shiva\\cursor_workspace\\rms-web-app\\frontend\\mcp-server\\index.js"
      ],
      "cwd": "C:\\Users\\shiva\\cursor_workspace\\rms-web-app",
      "env": {
        "GATEWAY_URL": "https://rmsgateway.atparui.com",
        "API_DOCS_ENDPOINT": "/v3/api-docs"
      }
    }
  }
}
```

### Step 4: Build and Test

**Build the server:**
```bash
cd frontend/mcp-server
npm install @modelcontextprotocol/sdk axios
npx tsc index.ts --outDir dist --module esnext --target es2020
```

**Or use tsx for development:**
```bash
npm install -D tsx
npm install @modelcontextprotocol/sdk axios
```

**Test the server:**
```bash
# Test stdio communication
echo '{"jsonrpc":"2.0","id":1,"method":"resources/list","params":{}}' | node mcp-server/index.js
```

### Step 5: Package.json Scripts

**Add to `frontend/package.json`:**
```json
{
  "scripts": {
    "mcp-server": "tsx mcp-server/index.ts",
    "mcp-server:build": "tsc mcp-server/index.ts --outDir mcp-server/dist"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "tsx": "^4.7.0",
    "@types/node": "^20.0.0"
  }
}
```

---

## Setup on Developer Workstation

### Prerequisites

1. **Node.js 18+** installed
2. **Cursor IDE** installed
3. **Access to gateway** (rmsgateway.atparui.com)

### Installation Steps

#### Step 1: Install Dependencies

```bash
cd frontend
npm install @modelcontextprotocol/sdk axios
npm install -D tsx @types/node typescript
```

#### Step 2: Create MCP Server

Create the server file as shown above in `frontend/mcp-server/index.ts`

#### Step 3: Configure Cursor

**Option A: Project-specific (Recommended)**

Create `.cursor/mcp.json` in project root:
```json
{
  "mcpServers": {
    "api-docs": {
      "command": "npm",
      "args": ["run", "mcp-server", "--prefix", "frontend"],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

**Option B: Global Configuration**

Edit `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "rms-api-docs": {
      "command": "node",
      "args": [
        "C:\\Users\\shiva\\cursor_workspace\\rms-web-app\\frontend\\mcp-server\\index.js"
      ],
      "cwd": "C:\\Users\\shiva\\cursor_workspace\\rms-web-app"
    }
  }
}
```

#### Step 4: Restart Cursor

Close and reopen Cursor for MCP configuration to take effect.

#### Step 5: Verify Connection

1. Open Cursor
2. Check MCP server status (usually in status bar or settings)
3. Try asking Cursor: "What API endpoints are available?"

---

## Advanced Features

### Authentication Support

**Add token handling:**
```typescript
private async fetchOpenAPISpec(): Promise<any> {
  const token = await this.getAuthToken();
  
  const response = await axios.get(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

private async getAuthToken(): Promise<string> {
  // Option 1: From environment variable
  if (process.env.API_TOKEN) {
    return process.env.API_TOKEN;
  }
  
  // Option 2: From Keycloak (for development)
  // Implement Keycloak token refresh logic
  
  // Option 3: From file (for security)
  try {
    const token = await fs.readFile('.api-token', 'utf-8');
    return token.trim();
  } catch {
    throw new Error('No authentication token available');
  }
}
```

### Multiple Services

**Support multiple service specs:**
```typescript
private async getOpenAPISpec(serviceName?: string) {
  if (serviceName) {
    return await this.fetchServiceSpec(serviceName);
  }
  return await this.fetchGatewaySpec();
}

private async fetchServiceSpec(serviceName: string) {
  const url = `${GATEWAY_URL}/${serviceName}/v3/api-docs`;
  // Fetch service-specific spec
}
```

### Caching Strategy

**Implement smart caching:**
```typescript
private async getCachedSpec(forceRefresh = false): Promise<CacheEntry | null> {
  if (forceRefresh) {
    return null;
  }
  
  // Check cache age
  // Check if gateway is reachable
  // Return cached if recent and gateway is down
}
```

---

## Comparison: MCP vs File-Based Approach

| Aspect | MCP Server | File-Based |
|--------|------------|------------|
| **Setup Complexity** | Medium (3-5 days) | Low (1-2 hours) |
| **Real-time Updates** | ✅ Yes (dynamic) | ❌ No (manual sync) |
| **Offline Support** | ⚠️ Limited | ✅ Yes |
| **Cursor Integration** | ✅ Native | ✅ File reading |
| **Maintenance** | Medium | Low |
| **Debugging** | More complex | Simple |
| **Performance** | Slightly slower | Faster |
| **Flexibility** | High | Medium |

### Recommendation

**Use MCP if:**
- You need real-time API docs
- You want dynamic tooling
- You have multiple developers
- You're building a complex system

**Use File-Based if:**
- You want simplicity
- You're okay with manual sync
- You prefer offline development
- You want faster setup

---

## Troubleshooting

### MCP Server Not Starting

**Check:**
1. Node.js version: `node --version` (should be 18+)
2. Dependencies installed: `npm list @modelcontextprotocol/sdk`
3. File permissions
4. Path in `mcp.json` is correct

**Debug:**
```bash
# Run server manually to see errors
node frontend/mcp-server/index.js
```

### Cursor Not Connecting

**Check:**
1. MCP configuration file location
2. Cursor restarted after config change
3. Server command is correct
4. Environment variables set

**Verify:**
- Check Cursor logs (Help → Toggle Developer Tools → Console)
- Look for MCP connection errors

### Authentication Issues

**Solutions:**
1. Use public dev endpoint
2. Store token in `.env` file
3. Implement token refresh
4. Use service account

---

## Security Considerations

### Development Environment

1. **Public Endpoint (Dev Only)**
   - Only enable in development
   - Use environment checks
   - Consider IP whitelisting

2. **Token Storage**
   - Never commit tokens
   - Use `.env` files (in `.gitignore`)
   - Use secure storage (OS keychain)

3. **Network Security**
   - Use HTTPS
   - Validate certificates
   - Consider VPN for remote access

### Production Considerations

- Don't use public endpoints
- Implement proper authentication
- Use service accounts
- Monitor MCP server usage
- Rate limiting

---

## Effort Summary

### Initial Setup: **18-31 hours**
- Learning MCP: 2-4 hours
- Basic server: 4-6 hours
- API integration: 2-4 hours
- Auth handling: 4-8 hours
- Testing: 4-6 hours
- Documentation: 2-3 hours

### Ongoing Maintenance: **2-4 hours/month**
- Updates for API changes
- Bug fixes
- Feature additions
- Documentation updates

### Alternative (File-Based): **1-2 hours**
- Much simpler
- Less flexible
- Requires manual sync

---

## Recommendation

**For your use case, I recommend:**

1. **Start with File-Based Approach** (1-2 hours)
   - Quick to implement
   - Meets your needs
   - Easy to maintain

2. **Upgrade to MCP Later** (if needed)
   - If you need real-time updates
   - If multiple developers need it
   - If you want advanced features

**The file-based approach gives you 90% of the benefit with 10% of the effort.**

---

## Next Steps

1. **Decide:** MCP vs File-Based
2. **If MCP:** Follow implementation steps above
3. **If File-Based:** Use the sync script from the previous plan
4. **Test:** Verify Cursor can access API docs
5. **Iterate:** Refine based on experience

---

## Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [MCP SDK GitHub](https://github.com/modelcontextprotocol/typescript-sdk)
- [Cursor MCP Guide](https://cursor.sh/docs/mcp)
- [OpenAPI Specification](https://swagger.io/specification/)

