# MCP Server Setup Instructions

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

This installs:
- `@modelcontextprotocol/sdk` - MCP SDK
- `tsx` - TypeScript execution
- `axios` - HTTP client (already installed)

### 2. Set Environment Variables

**Option A: System Environment Variables (Recommended)**

Set these in your system environment or shell:

```bash
# Windows (PowerShell)
$env:KEYCLOAK_URL="https://rmsauth.atparui.com"
$env:KEYCLOAK_REALM="gateway"
$env:KEYCLOAK_CLIENT_ID="gateway-web"
$env:KEYCLOAK_CLIENT_SECRET="M5nP8qR2sT6uV9wX1yZ3aC4dE7fG0h"
$env:GATEWAY_URL="https://rmsgateway.atparui.com"
$env:API_DOCS_ENDPOINT="/services/rms-service/v3/api-docs"

# Linux/Mac
export KEYCLOAK_URL="https://rmsauth.atparui.com"
export KEYCLOAK_REALM="gateway"
export KEYCLOAK_CLIENT_ID="gateway-web"
export KEYCLOAK_CLIENT_SECRET="M5nP8qR2sT6uV9wX1yZ3aC4dE7fG0h"
export GATEWAY_URL="https://rmsgateway.atparui.com"
export API_DOCS_ENDPOINT="/services/rms-service/v3/api-docs"
```

**Option B: Update `.cursor/mcp.json` Directly**

Edit `.cursor/mcp.json` and replace the placeholder with your actual client secret:

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

**Important:** Replace `M5nP8qR2sT6uV9wX1yZ3aC4dE7fG0h` with your actual client secret from the Keycloak configuration.

### 3. Restart Cursor

1. Close Cursor completely
2. Reopen Cursor
3. The MCP server should automatically start

### 4. Verify Connection

1. Open Cursor
2. Check MCP server status (usually visible in status bar or settings)
3. Try asking Cursor: "What API endpoints are available in the gateway?"

## Configuration Details

### Keycloak Configuration

- **Realm:** `gateway`
- **Client ID:** `gateway-web`
- **Client Secret:** Get from your Keycloak admin console or `.env` file
- **Grant Type:** `client_credentials` (used automatically)

### Gateway Configuration

- **URL:** `https://rmsgateway.atparui.com`
- **OpenAPI Endpoint:** `/v3/api-docs` (or `/swagger.json`)

## Testing

### Test Server Manually

```bash
cd frontend
npm run mcp-server
```

The server should start and wait for MCP protocol messages. If you see errors, check:
1. Environment variables are set
2. Keycloak URL is accessible
3. Client secret is correct

### Test in Cursor

Ask Cursor AI:
- "What API endpoints are available?"
- "Show me the schema for POST /api/v1/restaurants"
- "Search for endpoints related to orders"
- "Get the OpenAPI specification"

## Troubleshooting

### Server Not Starting

**Error:** "Cannot find module '@modelcontextprotocol/sdk'"

**Solution:**
```bash
cd frontend
npm install
```

### Authentication Errors

**Error:** "Failed to get access token from Keycloak"

**Check:**
1. `KEYCLOAK_CLIENT_SECRET` is set correctly
2. Keycloak URL is accessible: `https://rmsauth.atparui.com`
3. Client `gateway-web` exists in realm `gateway`
4. Client is configured for "client_credentials" grant type

**Verify in Keycloak:**
1. Login to Keycloak admin console
2. Go to Realm: `gateway`
3. Go to Clients → `gateway-web`
4. Check "Client authentication" is ON
5. Verify the client secret matches

### Gateway Connection Errors

**Error:** "Could not fetch OpenAPI spec from any endpoint"

**Check:**
1. Gateway URL is correct: `https://rmsgateway.atparui.com`
2. Gateway is accessible
3. OpenAPI endpoint exists: `/v3/api-docs`
4. Authentication token is valid

### Cursor Not Connecting

**Check:**
1. `.cursor/mcp.json` file exists and is valid JSON
2. Cursor was restarted after configuration
3. Server command path is correct
4. Environment variables are set

**Debug:**
1. Open Cursor Developer Tools (Help → Toggle Developer Tools)
2. Check Console for MCP errors
3. Look for "api-docs" in MCP server list

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit secrets to git**
   - Add `.cursor/mcp.json` to `.gitignore` if it contains secrets
   - Or use environment variables instead

2. **Use environment variables when possible**
   - Set `KEYCLOAK_CLIENT_SECRET` in system environment
   - Don't hardcode in configuration files

3. **Rotate secrets regularly**
   - Update client secret in Keycloak
   - Update environment variables
   - Restart Cursor

## Next Steps

Once the MCP server is working:

1. **Use Cursor AI** to generate frontend code
2. **Ask for API endpoints** when building components
3. **Get schema details** for forms and data display
4. **Search endpoints** to find relevant APIs

## Support

For issues:
1. Check `frontend/mcp-server/README.md` for detailed documentation
2. Review server logs in Cursor Developer Tools
3. Verify environment configuration
4. Test server manually with `npm run mcp-server`

