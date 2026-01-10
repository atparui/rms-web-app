# How to View MCP Server Logs in Cursor AI

The MCP server outputs debug information using `console.error()`. Here's how to view these logs in Cursor.

## Quick Access

**Shortcut:** `Ctrl+Shift+U` (Windows/Linux) or `Cmd+Shift+U` (Mac)

## Step-by-Step Guide

### 1. Open Output Panel

**Option A: Keyboard Shortcut**
- Press `Ctrl+Shift+U` (Windows/Linux) or `Cmd+Shift+U` (Mac)

**Option B: Menu**
- Go to: **View → Output**
- Or: **View → Terminal → Output**

**Option C: Command Palette**
- Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
- Type: "Output: Focus on Output View"
- Press Enter

### 2. Select MCP Server Output

In the Output panel, look for a dropdown menu at the top right. Select one of:

- `MCP: user-api-docs`
- `MCP: api-docs`
- Any option containing "MCP" or "api-docs"

**Note:** The exact name may vary. Look for anything related to MCP or your server name.

### 3. View the Logs

You should now see logs prefixed with `[MCP]`, such as:

```
[MCP] Server initialized with configuration:
[MCP]   GATEWAY_URL: https://rmsgateway.atparui.com
[MCP]   API_DOCS_ENDPOINT: /services/rms-service/v3/api-docs
[MCP]   KEYCLOAK_URL: https://rmsauth.atparui.com
[MCP]   KEYCLOAK_REALM: gateway
[MCP]   KEYCLOAK_CLIENT_ID: gateway-web
[MCP]   Full API docs URL will be: https://rmsgateway.atparui.com/services/rms-service/v3/api-docs
```

## What Logs to Expect

### On Server Startup

```
[MCP] API Docs Server running on stdio
[MCP] Server initialized with configuration:
[MCP]   GATEWAY_URL: https://rmsgateway.atparui.com
...
```

### When Fetching Resources

```
[MCP] Reading resource: api-docs://openapi
[MCP] Note: 'api-docs://' is a resource URI scheme, not an HTTP URL.
[MCP] Actual HTTP requests will use GATEWAY_URL: https://rmsgateway.atparui.com
[MCP] Attempting to fetch from: https://rmsgateway.atparui.com/services/rms-service/v3/api-docs
[MCP] Token roles - Direct (roles claim): ROLE_ADMIN, default-roles-gateway, ...
[MCP] Successfully fetched OpenAPI spec from: https://rmsgateway.atparui.com/services/rms-service/v3/api-docs
```

### When There Are Errors

```
[MCP] Failed to fetch from https://rmsgateway.atparui.com/services/rms-service/v3/api-docs: Status: 401, Error: Unauthorized
[MCP] Got 401, refreshing token and retrying https://rmsgateway.atparui.com/services/rms-service/v3/api-docs
[MCP] Token roles - Direct (roles claim): ROLE_ADMIN, ...
```

## Alternative: Developer Tools

If you can't find logs in the Output panel:

1. **Open Developer Tools:**
   - Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
   - Or: **Help → Toggle Developer Tools**

2. **Check Console Tab:**
   - Some MCP messages may appear here
   - However, most logs are in the Output panel

## Troubleshooting

### Can't Find Output Panel?

1. **Check if it's hidden:**
   - Look for a panel at the bottom of the Cursor window
   - It might be collapsed - click to expand it

2. **Reset Layout:**
   - Go to: **View → Appearance → Reset Layout**

### No MCP Logs Appearing?

1. **Restart Cursor:**
   - Close Cursor completely
   - Reopen it
   - MCP server starts automatically

2. **Check MCP Server Status:**
   - Go to: **File → Preferences → Settings** (`Ctrl+,`)
   - Search for "MCP" or "Tools & MCP"
   - Check if server shows as "Active" or "Error"

3. **Verify Configuration:**
   - Check `.cursor/mcp.json` exists and is valid
   - Verify environment variables are set

### Logs Show Errors?

Common issues and what to check:

- **"GATEWAY_URL is undefined":** Check environment variables in `.cursor/mcp.json`
- **"Failed to get access token":** Check Keycloak credentials
- **"Could not fetch OpenAPI spec":** Check gateway URL and authentication
- **"No roles found in token":** Check service account role assignment in Keycloak

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions.

## Log Levels

The MCP server uses `console.error()` for all logs, so they appear in the Output panel. Logs are prefixed with `[MCP]` for easy filtering.

## Filtering Logs

In the Output panel, you can:
- Use `Ctrl+F` to search for specific terms like "GATEWAY_URL" or "ROLE_ADMIN"
- Scroll to see historical logs
- Clear logs by right-clicking and selecting "Clear Output" (if available)

## Example: Complete Log Flow

Here's what a successful flow looks like:

```
[MCP] API Docs Server running on stdio
[MCP] Server initialized with configuration:
[MCP]   GATEWAY_URL: https://rmsgateway.atparui.com
[MCP]   API_DOCS_ENDPOINT: /services/rms-service/v3/api-docs
[MCP]   KEYCLOAK_URL: https://rmsauth.atparui.com
[MCP]   KEYCLOAK_REALM: gateway
[MCP]   KEYCLOAK_CLIENT_ID: gateway-web
[MCP]   Full API docs URL will be: https://rmsgateway.atparui.com/services/rms-service/v3/api-docs
[MCP] Reading resource: api-docs://openapi
[MCP] Note: 'api-docs://' is a resource URI scheme, not an HTTP URL.
[MCP] Actual HTTP requests will use GATEWAY_URL: https://rmsgateway.atparui.com
[MCP] Attempting to fetch from: https://rmsgateway.atparui.com/services/rms-service/v3/api-docs
[MCP] Token roles - Direct (roles claim): ROLE_ADMIN, default-roles-gateway, offline_access, uma_authorization
[MCP] Successfully fetched OpenAPI spec from: https://rmsgateway.atparui.com/services/rms-service/v3/api-docs
```

This shows the server is working correctly!

