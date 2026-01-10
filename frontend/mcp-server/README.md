# MCP Server for API Documentation

This MCP (Model Context Protocol) server provides Cursor AI with dynamic access to OpenAPI specifications from the gateway, with Keycloak authentication.

## Features

- 🔐 **Keycloak Authentication** - Uses client credentials flow
- 📚 **OpenAPI Spec Access** - Fetches and caches API documentation
- 🔍 **Endpoint Search** - Search endpoints by tag, path, or description
- 📋 **Schema Details** - Get detailed schemas for specific endpoints
- ⚡ **Smart Caching** - 5-minute cache to reduce API calls
- 🔄 **Auto Refresh** - Automatic token refresh on expiry

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

This will install:
- `@modelcontextprotocol/sdk` - MCP SDK
- `axios` - HTTP client
- `tsx` - TypeScript execution

### 2. Configure Environment Variables

Create `frontend/.env.local` (or set in system environment):

```env
KEYCLOAK_URL=https://rmsauth.atparui.com
KEYCLOAK_REALM=gateway
KEYCLOAK_CLIENT_ID=gateway-web
KEYCLOAK_CLIENT_SECRET=your-actual-secret-here
GATEWAY_URL=https://rmsgateway.atparui.com
API_DOCS_ENDPOINT=/services/rms-service/v3/api-docs
```

**Important:** The `KEYCLOAK_CLIENT_SECRET` must match the secret configured in Keycloak for the `gateway-web` client in the `gateway` realm.

### 3. Configure Cursor

The MCP server is configured in `.cursor/mcp.json`. The configuration uses environment variables from your system or `.env.local`.

**Option 1: Use System Environment Variables**

Set the environment variables in your system, and Cursor will pick them up.

**Option 2: Update `.cursor/mcp.json` Directly**

Edit `.cursor/mcp.json` and replace `${KEYCLOAK_CLIENT_SECRET}` with your actual secret:

```json
{
  "mcpServers": {
    "api-docs": {
      "command": "npm",
      "args": ["run", "mcp-server", "--prefix", "frontend"],
      "cwd": "${workspaceFolder}",
      "env": {
        "KEYCLOAK_URL": "https://rmsauth.atparui.com",
        "KEYCLOAK_REALM": "gateway",
        "KEYCLOAK_CLIENT_ID": "gateway-web",
        "KEYCLOAK_CLIENT_SECRET": "M5nP8qR2sT6uV9wX1yZ3aC4dE7fG0h",
        "GATEWAY_URL": "https://rmsgateway.atparui.com",
        "API_DOCS_ENDPOINT": "/services/rms-service/v3/api-docs"
      }
    }
  }
}
```

### 4. Restart Cursor

Close and reopen Cursor for the MCP configuration to take effect.

## Usage

### In Cursor AI

Once configured, you can ask Cursor AI:

- "What API endpoints are available?"
- "Show me the schema for POST /api/v1/restaurants"
- "Search for endpoints related to orders"
- "Get the OpenAPI specification"

The MCP server will automatically:
1. Authenticate with Keycloak
2. Fetch the OpenAPI spec from the gateway
3. Cache it for 5 minutes
4. Provide the data to Cursor AI

### Available Resources

- `api-docs://openapi` - Complete OpenAPI specification
- `api-docs://services` - Service information and statistics
- `api-docs://endpoints` - List of all endpoints

### Available Tools

- `sync-api-docs` - Force refresh of API documentation
- `get-endpoint-schema` - Get detailed schema for a specific endpoint
- `search-endpoints` - Search endpoints by query or tag

## Testing

### Test the Server Manually

```bash
cd frontend
npm run mcp-server
```

The server will run on stdio and wait for MCP protocol messages.

### Test with Cursor

1. Open Cursor
2. Check MCP server status (should show "api-docs" as connected)
3. Ask: "What API endpoints are available in the gateway?"

## Troubleshooting

### Server Not Starting

**Check:**
- Node.js version: `node --version` (should be 18+)
- Dependencies installed: `npm list @modelcontextprotocol/sdk`
- Environment variables set correctly

**Debug:**
```bash
# Run server manually to see errors
cd frontend
npm run mcp-server
```

### Authentication Errors

**Error:** "Failed to get access token from Keycloak"

**Solutions:**
1. Verify `KEYCLOAK_CLIENT_SECRET` is correct
2. Check Keycloak URL is accessible
3. Verify client `gateway-web` exists in realm `gateway`
4. Ensure client is configured for "client_credentials" grant type
5. **Enable Service Accounts:** In Keycloak, go to Clients → `gateway-web` → Settings → Enable "Service accounts enabled"
6. **Assign Roles to Service Account:** 
   - Go to Clients → `gateway-web` → "Service account roles" tab
   - Click "Assign role"
   - Assign `ROLE_ADMIN` (or required roles) to the service account
   - This ensures the token includes the necessary roles for API access

### Gateway Connection Errors

**Error:** "Could not fetch OpenAPI spec from any endpoint"

**Solutions:**
1. Verify `GATEWAY_URL` is correct
2. Check gateway is accessible
3. Verify the OpenAPI endpoint path (`/services/rms-service/v3/api-docs`)
4. Check if authentication token is valid

### Cursor Not Connecting

**Check:**
1. `.cursor/mcp.json` file exists and is valid JSON
2. Cursor restarted after configuration change
3. Server command path is correct
4. Environment variables are set

**Verify:**
- Open Cursor Developer Tools (Help → Toggle Developer Tools)
- Check Console for MCP connection errors
- Look for "api-docs" in MCP server list

## Viewing MCP Server Logs in Cursor

The MCP server outputs debug logs using `console.error()`. To view them:

### Method 1: Output Panel (Recommended)

1. **Open the Output Panel:**
   - Press `Ctrl+Shift+U` (Windows/Linux) or `Cmd+Shift+U` (Mac)
   - Or go to: **View → Output** (or **View → Terminal → Output**)

2. **Select MCP Server Output:**
   - In the Output panel dropdown (top right), select:
     - `MCP: user-api-docs` or
     - `MCP: api-docs` or
     - Look for any option containing "MCP" or "api-docs"

3. **View Logs:**
   - You'll see logs prefixed with `[MCP]` like:
     - `[MCP] Server initialized with configuration:`
     - `[MCP] Attempting to fetch from: https://...`
     - `[MCP] Token roles - Direct (roles claim): ...`

### Method 2: Problems Panel

1. **Open Problems Panel:**
   - Press `Ctrl+Shift+M` (Windows/Linux) or `Cmd+Shift+M` (Mac)
   - Or go to: **View → Problems**

2. **Check for MCP Errors:**
   - MCP errors may appear here, but detailed logs are in the Output panel

### Method 3: Developer Tools Console

1. **Open Developer Tools:**
   - Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
   - Or go to: **Help → Toggle Developer Tools**

2. **Check Console Tab:**
   - Look for MCP-related messages in the console
   - Note: Most MCP logs appear in the Output panel, not here

### What to Look For

When the MCP server starts, you should see:
```
[MCP] Server initialized with configuration:
[MCP]   GATEWAY_URL: https://rmsgateway.atparui.com
[MCP]   API_DOCS_ENDPOINT: /v3/api-docs
[MCP]   KEYCLOAK_URL: https://rmsauth.atparui.com
...
```

When fetching resources, you'll see:
```
[MCP] Reading resource: api-docs://openapi
[MCP] Attempting to fetch from: https://rmsgateway.atparui.com/v3/api-docs
[MCP] Token roles - Direct (roles claim): ROLE_ADMIN, ...
```

If there are errors, you'll see:
```
[MCP] Failed to fetch from https://...: Status: 401, Error: ...
```

### Troubleshooting: Can't Find Logs?

1. **Restart Cursor** - MCP server logs appear when the server starts
2. **Check MCP Server Status:**
   - Go to: **File → Preferences → Settings** (or `Ctrl+,`)
   - Search for "MCP" or "Tools & MCP"
   - Check if the server shows as "Active" or "Error"
3. **Verify Server is Running:**
   - If the server shows an error, check the error message
   - The logs will help diagnose the issue

## Security Notes

- **Never commit** `.env.local` or actual secrets to git
- The client secret should be kept secure
- Use environment variables or secure storage
- Consider using a service account with minimal permissions

## Cache

The server caches the OpenAPI spec for 5 minutes to reduce API calls. Cache is stored in `.mcp-cache/openapi.json`.

To force refresh:
- Use the `sync-api-docs` tool with `force: true`
- Delete `.mcp-cache/openapi.json`
- Wait 5 minutes for cache expiry

## Development

### File Structure

```
frontend/
├── mcp-server/
│   ├── index.ts          # MCP server implementation
│   └── README.md         # This file
├── .env.local            # Environment variables (not in git)
└── package.json         # Dependencies and scripts
```

### Adding Features

To add new resources or tools:

1. Add resource to `ListResourcesRequestSchema` handler
2. Add handler in `ReadResourceRequestSchema` for the resource
3. Add tool to `ListToolsRequestSchema` handler
4. Add handler in `CallToolRequestSchema` for the tool

## Support

For issues or questions:
1. Check this README
2. Review Cursor MCP documentation
3. Check server logs in Cursor Developer Tools
4. Verify environment configuration

