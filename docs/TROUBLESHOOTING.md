# MCP Server Troubleshooting Guide

## Issue: "Could not fetch OpenAPI spec from any endpoint" after assigning ROLE_ADMIN

### Common Causes

1. **Role Location in Token**
   - The gateway might expect roles in `resource_access.gateway-web.roles` instead of `realm_access.roles`
   - Or vice versa - check your gateway's role validation logic

2. **Token Cache**
   - Old token without roles is cached
   - Solution: Restart MCP server or wait for token expiry

3. **Role Assignment Type**
   - Role must be assigned as the correct type (Realm Role vs Client Role)
   - Gateway might expect a specific type

4. **Role Name Format**
   - Gateway might expect `ROLE_ADMIN` vs `ADMIN` vs `role_admin`
   - Check gateway's role validation code

## Step-by-Step Debugging

### Step 1: Test Token and View Claims

Run the test script to see what's in your token:

**Linux/Mac (Bash):**
```bash
cd frontend
KEYCLOAK_URL=https://rmsauth.atparui.com \
KEYCLOAK_REALM=gateway \
KEYCLOAK_CLIENT_ID=gateway-web \
KEYCLOAK_CLIENT_SECRET=your-secret \
GATEWAY_URL=https://rmsgateway.atparui.com \
API_DOCS_ENDPOINT=/services/rms-service/v3/api-docs \
npm run test-token
```

**Windows (PowerShell):**
```powershell
cd frontend
$env:KEYCLOAK_URL="https://rmsauth.atparui.com"
$env:KEYCLOAK_REALM="gateway"
$env:KEYCLOAK_CLIENT_ID="gateway-web"
$env:KEYCLOAK_CLIENT_SECRET="M5nP8qR2sT6uV9wX1yZ3aC4dE7fG0h"
$env:GATEWAY_URL="https://rmsgateway.atparui.com"
$env:API_DOCS_ENDPOINT="/services/rms-service/v3/api-docs"
npm run test-token
```

**Windows (CMD):**
```cmd
cd frontend
set KEYCLOAK_URL=https://rmsauth.atparui.com
set KEYCLOAK_REALM=gateway
set KEYCLOAK_CLIENT_ID=gateway-web
set KEYCLOAK_CLIENT_SECRET=your-secret
set GATEWAY_URL=https://rmsgateway.atparui.com
set API_DOCS_ENDPOINT=/services/rms-service/v3/api-docs
npm run test-token
```

This will show:
- All token claims
- Where roles are located (realm_access vs resource_access vs direct `roles` claim)
- Whether ROLE_ADMIN is present
- Gateway access test result

**Example Output:**
If you see roles in a direct `roles` claim (like `"roles": ["ROLE_ADMIN"]`), this is valid! Some Keycloak configurations use this format for service accounts. The gateway should accept tokens with roles in this location.

### Step 2: Verify Role Assignment in Keycloak

1. Go to Keycloak Admin Console
2. Realm: `gateway`
3. Clients → `gateway-web`
4. **Service account roles** tab
5. Check:
   - Is `ROLE_ADMIN` listed under "Assigned roles"?
   - Is it a Realm role or Client role?
   - Note the exact role name (case-sensitive)

### Step 3: Check Gateway Role Validation

The gateway might be checking roles in a specific location. Common patterns:

**Pattern 1: Realm Roles**
```typescript
// Gateway checks: token.realm_access.roles
const roles = token.realm_access?.roles || [];
```

**Pattern 2: Client Roles**
```typescript
// Gateway checks: token.resource_access.gateway-web.roles
const roles = token.resource_access?.['gateway-web']?.roles || [];
```

**Pattern 3: Direct Roles Claim**
```typescript
// Gateway checks: token.roles (direct claim at root level)
const roles = token.roles || [];
```

**Pattern 4: Custom Claim**
```typescript
// Gateway checks: token.authorities or other custom claim
const roles = token.authorities || [];
```

**Note:** Some Keycloak configurations (especially for service accounts) put roles directly in a `roles` array at the token root level, rather than in `realm_access.roles` or `resource_access`. This is valid and the gateway should accept it.

### Step 4: Assign Role in Correct Location

Based on what the gateway expects:

**If gateway expects Realm Roles:**
1. In Keycloak: Clients → `gateway-web` → Service account roles
2. Click "Assign role"
3. Uncheck "Filter by clients"
4. Check "Filter by realm roles"
5. Find and assign `ROLE_ADMIN`

**If gateway expects Client Roles:**
1. Ensure `ROLE_ADMIN` exists as a client role (not realm role)
2. Create it if needed: Clients → `gateway-web` → Roles → Create role
3. Assign it to service account: Service account roles → Assign role → Filter by clients → Select `gateway-web` → Assign `ROLE_ADMIN`

### Step 5: Clear Token Cache

The MCP server caches tokens. To force a refresh:

1. **Restart Cursor** (this restarts the MCP server)
2. **Or wait** for token expiry (usually 5-15 minutes)
3. **Or delete cache file** (if exists): `.mcp-cache/openapi.json`

**Delete cache file:**

**Linux/Mac:**
```bash
rm -rf .mcp-cache/openapi.json
```

**Windows (PowerShell):**
```powershell
Remove-Item -Path .mcp-cache\openapi.json -ErrorAction SilentlyContinue
```

**Windows (CMD):**
```cmd
del /q .mcp-cache\openapi.json
```

### Step 6: Check MCP Server Logs

The MCP server now logs role information. Check Cursor's Output panel:
- Look for `[MCP] Token roles` messages
- This shows where roles are in the token
- **Important**: If you see roles in a direct `roles` claim (not `realm_access` or `resource_access`), this is valid! Your Keycloak configuration uses this format for service accounts.

**Example from test output:**
```
📋 Direct roles claim: default-roles-gateway, offline_access, ROLE_ADMIN, uma_authorization
✅ Gateway access successful! (status 200)
```

If the test shows `ROLE_ADMIN` and gateway access is successful, but MCP server still fails:
1. **Clear token cache** - Restart Cursor to get a fresh token
2. **Check MCP server logs** - Look for the `[MCP] Token roles` message to see what the MCP server sees
3. **Verify gateway endpoint** - Ensure the MCP server is using the correct gateway URL

## Quick Fixes

### Fix 1: Assign as Realm Role
If `ROLE_ADMIN` is a realm role but not assigned:
1. Keycloak → Realm → Roles → Ensure `ROLE_ADMIN` exists
2. Clients → `gateway-web` → Service account roles → Assign role → Realm roles → `ROLE_ADMIN`

### Fix 2: Assign as Client Role
If gateway expects client roles:
1. Keycloak → Clients → `gateway-web` → Roles → Create `ROLE_ADMIN` (if doesn't exist)
2. Clients → `gateway-web` → Service account roles → Assign role → Client roles → `gateway-web` → `ROLE_ADMIN`

### Fix 3: Check Role Name
Verify the exact role name matches what gateway expects:
- `ROLE_ADMIN` (uppercase with prefix)
- `ADMIN` (no prefix)
- `role_admin` (lowercase)
- Check gateway code or API documentation

### Fix 4: Token Scope
Add scope parameter to token request (if needed):
```typescript
scope: 'openid profile email'
```

## Still Not Working?

1. **Check Gateway Logs**: Look at gateway server logs for authentication errors
2. **Test with Postman/curl**: Manually test the gateway endpoint with the token
   - **Postman**: Create a new request, set Authorization header to `Bearer <token>`
   - **Windows**: Use PowerShell `Invoke-RestMethod` or install curl via Chocolatey
3. **Contact Gateway Admin**: Verify the gateway's role validation logic
4. **Check Keycloak Version**: Some versions handle service account roles differently

## Windows-Specific Notes

### Environment Variables
- **PowerShell**: Use `$env:VARIABLE_NAME="value"` (session-scoped) or `[Environment]::SetEnvironmentVariable("VARIABLE_NAME", "value", "User")` (persistent)
- **CMD**: Use `set VARIABLE_NAME=value` (session-scoped) or `setx VARIABLE_NAME "value"` (persistent, requires new terminal)
- **For MCP Server**: Environment variables in `.cursor/mcp.json` are preferred as they work across all platforms

### Path Separators
- Windows uses backslashes (`\`) in paths, but Node.js and npm handle both `/` and `\`
- Cache file path: `.mcp-cache\openapi.json` or `.mcp-cache/openapi.json` (both work)

### Running Scripts
- Use PowerShell or CMD in the project root directory
- Ensure Node.js is in your PATH: `node --version`
- If npm scripts fail, try running directly: `node frontend/mcp-server/test-token.js`

## Example: Testing Token Manually

**Linux/Mac (Bash with curl and jq):**
```bash
# Get token
TOKEN=$(curl -X POST "https://rmsauth.atparui.com/realms/gateway/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=gateway-web" \
  -d "client_secret=your-secret" | jq -r '.access_token')

# Decode token (view claims)
echo $TOKEN | cut -d. -f2 | base64 -d | jq .

# Test gateway
curl -H "Authorization: Bearer $TOKEN" \
  https://rmsgateway.atparui.com/services/rms-service/v3/api-docs
```

**Windows (PowerShell):**
```powershell
# Get token
$response = Invoke-RestMethod -Uri "https://rmsauth.atparui.com/realms/gateway/protocol/openid-connect/token" `
  -Method Post `
  -ContentType "application/x-www-form-urlencoded" `
  -Body @{
    grant_type = "client_credentials"
    client_id = "gateway-web"
    client_secret = "your-secret"
  }

$TOKEN = $response.access_token

# Decode token (view claims) - PowerShell
$parts = $TOKEN.Split('.')
$payload = $parts[1]
# Add padding if needed
$padding = 4 - ($payload.Length % 4)
if ($padding -ne 4) {
    $payload = $payload + ("=" * $padding)
}
$decoded = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($payload))
$decoded | ConvertFrom-Json | ConvertTo-Json -Depth 10

# Test gateway
Invoke-RestMethod -Uri "https://rmsgateway.atparui.com/services/rms-service/v3/api-docs" `
  -Headers @{ Authorization = "Bearer $TOKEN" }
```

**Windows (PowerShell - Alternative with curl.exe if available):**
```powershell
# Get token (requires curl.exe and jq.exe in PATH, or use Chocolatey: choco install curl jq)
$TOKEN = (curl.exe -X POST "https://rmsauth.atparui.com/realms/gateway/protocol/openid-connect/token" `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "grant_type=client_credentials" `
  -d "client_id=gateway-web" `
  -d "client_secret=your-secret" | ConvertFrom-Json).access_token

# Decode token (view claims)
$parts = $TOKEN.Split('.')
$payload = $parts[1]
$padding = 4 - ($payload.Length % 4)
if ($padding -ne 4) { $payload = $payload + ("=" * $padding) }
[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($payload)) | ConvertFrom-Json | ConvertTo-Json -Depth 10

# Test gateway
curl.exe -H "Authorization: Bearer $TOKEN" https://rmsgateway.atparui.com/services/rms-service/v3/api-docs
```

**Note for Windows users:**
- If you don't have `curl` or `jq`, you can install them via:
  - **Chocolatey**: `choco install curl jq`
  - **Scoop**: `scoop install curl jq`
  - Or use PowerShell's `Invoke-RestMethod` (shown above) which doesn't require additional tools

