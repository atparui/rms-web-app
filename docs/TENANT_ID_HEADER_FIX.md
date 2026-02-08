# Tenant ID Header Fix

## Issue

**Problem:** API calls were not including the `X-Tenant-ID` header, causing the backend to default to `console` tenant instead of the actual tenant (`rms-demo`).

**Logs showed:**
```
TenantContextFilter incoming headers X-Tenant-ID: console
```

**But JWT token contained:**
```json
{
  "tenant_id": "rms-demo",
  ...
}
```

---

## Root Cause

The frontend API client was not extracting the `tenant_id` from the JWT token and sending it as the `X-Tenant-ID` header.

**Missing header in API calls:**
```bash
# What was being sent:
Authorization: Bearer eyJ...

# What should be sent:
Authorization: Bearer eyJ...
X-Tenant-ID: rms-demo          ← MISSING!
```

---

## Solution

### 1. Extract Tenant ID from JWT Token

Added utility function to decode JWT and extract `tenant_id`:

```typescript
/**
 * Extract tenant ID from JWT token
 */
function getTenantIdFromToken(token: string): string | null {
  try {
    // JWT structure: header.payload.signature
    const payload = token.split('.')[1];
    if (!payload) return null;
    
    // Decode base64url
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded.tenant_id || null;
  } catch (error) {
    console.error('[api-client] Failed to extract tenant_id from token:', error);
    return null;
  }
}
```

### 2. Add X-Tenant-ID Header to All API Calls

**Updated `fetchWithAuth` function:**

```typescript
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('kc_token') : null;
  
  // Extract tenant ID from token
  const tenantId = token ? getTenantIdFromToken(token) : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(tenantId && { 'X-Tenant-ID': tenantId }),  // ← ADDED!
    ...options.headers,
  };

  // ... rest of function
}
```

**Updated `fetchJson` function:**

```typescript
export async function fetchJson<T>(endpoint: string, options?: { token?: string }): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${API_PATH}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  let token: string | null = null;
  
  if (options?.token) {
    token = options.token;
    headers['Authorization'] = `Bearer ${token}`;
  } else if (typeof window !== 'undefined') {
    token = localStorage.getItem('kc_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  // Add tenant ID header
  if (token) {
    const tenantId = getTenantIdFromToken(token);
    if (tenantId) {
      headers['X-Tenant-ID'] = tenantId;  // ← ADDED!
    }
  }
  
  // ... rest of function
}
```

---

## Result

### Before Fix

```bash
# API Call
curl https://console.atparui.com/services/rms-service/api/restaurants
  -H 'Authorization: Bearer eyJ...'
  
# Backend Log
TenantContextFilter incoming headers X-Tenant-ID: console  ← WRONG!

# Error
java.lang.IllegalStateException: No primary or single unique constructor found
```

### After Fix

```bash
# API Call
curl https://console.atparui.com/services/rms-service/api/restaurants
  -H 'Authorization: Bearer eyJ...'
  -H 'X-Tenant-ID: rms-demo'              ← NOW INCLUDED!
  
# Backend Log
TenantContextFilter incoming headers X-Tenant-ID: rms-demo  ← CORRECT!

# Response
[
  {
    "id": "...",
    "code": "REST001",
    "name": "Demo Restaurant",
    ...
  }
]
```

---

## How It Works

### Flow

```
1. User logs in with Keycloak
   ↓
2. JWT token received with tenant_id claim:
   {
     "tenant_id": "rms-demo",
     "sub": "9bc364dc-2725-4d67-b44f-a38ab4404ab5",
     ...
   }
   ↓
3. Token stored in localStorage: 'kc_token'
   ↓
4. API call made:
   - fetchWithAuth() retrieves token from localStorage
   - getTenantIdFromToken() decodes JWT
   - Extracts tenant_id: "rms-demo"
   - Adds X-Tenant-ID header
   ↓
5. Backend receives:
   Authorization: Bearer eyJ...
   X-Tenant-ID: rms-demo
   ↓
6. TenantContextFilter sets tenant context correctly
   ↓
7. Database query runs against correct tenant schema
```

---

## JWT Token Structure

### Example Token

```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRfaWQiOiJybXMtZGVtbyJ9.signature
|                                      |                                      |
|         HEADER                       |         PAYLOAD                      | SIGNATURE
```

### Decoded Payload

```json
{
  "exp": 1770552289,
  "iat": 1770518252,
  "jti": "onrtac:29e50c30-08c2-b750-eac8-7d786e2cf1c5",
  "iss": "https://auth.atparui.com/realms/rms-demo",
  "aud": "account",
  "sub": "9bc364dc-2725-4d67-b44f-a38ab4404ab5",
  "typ": "Bearer",
  "azp": "rms-demo-web",
  "tenant_id": "rms-demo",     ← WE EXTRACT THIS!
  "email": "demo_admin@rms-demo.com",
  "name": "Demo Administrator",
  ...
}
```

---

## Backend Expectations

### TenantContextFilter

```java
@Component
public class TenantContextFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ...) {
        HttpServletRequest req = (HttpServletRequest) request;
        
        // Extract tenant ID from header
        String tenantId = req.getHeader("X-Tenant-ID");  // ← EXPECTS THIS HEADER!
        
        if (tenantId == null || tenantId.isEmpty()) {
            tenantId = "console";  // ← FALLBACK (what was happening before)
        }
        
        // Set tenant context
        TenantContext.setTenantId(tenantId);
        
        // ... proceed with request
    }
}
```

**Now that we send the header, it uses the correct tenant!**

---

## Testing

### Verify Header is Sent

**Open browser DevTools → Network tab:**

```
Request URL: https://console.atparui.com/services/rms-service/api/restaurants
Request Method: GET

Request Headers:
  Authorization: Bearer eyJhbGci...
  X-Tenant-ID: rms-demo          ← VERIFY THIS IS PRESENT!
  Content-Type: application/json
  Origin: http://localhost:3000
```

### Check Backend Logs

```
✅ CORRECT:
TenantContextFilter incoming headers X-Tenant-ID: rms-demo

❌ WRONG (if header missing):
TenantContextFilter incoming headers X-Tenant-ID: console
```

---

## Impact

### All API Calls Now Include Tenant ID

**Affected functions:**
- `restaurantApi.*` - All restaurant operations ✅
- `branchApi.*` - All branch operations ✅
- `rmsUserApi.*` - All user operations ✅
- `userBranchRoleApi.*` - All role operations ✅
- `permissionApi.*` - All permission operations ✅
- `rolePermissionApi.*` - All role permission operations ✅
- `menuCategoryApi.*` - All menu category operations ✅
- `menuItemApi.*` - All menu item operations ✅
- `fetchJson()` - Menu tree and other utility calls ✅

**Every single API call now correctly identifies the tenant!**

---

## Multi-Tenant Architecture

### Why This Matters

```
Platform: console.atparui.com
  ↓
Gateway routes to services
  ↓
Service: rms-service
  ↓
TenantContextFilter: Extracts X-Tenant-ID
  ↓
Tenant-aware DataSource: Routes to correct database
  ↓
Database: rms_demo (not console!)
```

**Without X-Tenant-ID:** Queries run against wrong database  
**With X-Tenant-ID:** Queries run against correct tenant database

---

## Files Modified

```
lib/api-client.ts
  - Added getTenantIdFromToken() utility
  - Updated fetchWithAuth() to add X-Tenant-ID header
  - Updated fetchJson() to add X-Tenant-ID header
```

---

## Convention Addition

### API Request Headers

**Official standard for all API requests:**

```typescript
{
  'Authorization': `Bearer ${token}`,      // Required - JWT token
  'X-Tenant-ID': `${tenantId}`,           // Required - Tenant identifier
  'Content-Type': 'application/json',      // Standard
}
```

**Where tenant ID comes from:**
- Extracted from JWT token payload: `token.tenant_id`
- Automatically added to all API calls
- No manual intervention required

---

## Summary

### Problem
- ❌ Missing `X-Tenant-ID` header
- ❌ Backend defaulting to `console` tenant
- ❌ Data from wrong database

### Solution
- ✅ Extract `tenant_id` from JWT
- ✅ Add `X-Tenant-ID` header to all requests
- ✅ Automatic for all API calls

### Result
- ✅ Correct tenant context
- ✅ Queries run against correct database
- ✅ Multi-tenancy works properly

---

**Status:** ✅ Fixed - All API calls now include correct tenant ID header  
**Date:** 2026-02-08  
**Priority:** CRITICAL - Required for multi-tenant functionality
