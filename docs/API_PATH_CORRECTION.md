# API Path Correction

## Issue Found

The API path was incorrectly set as `/services/rms/api` when it should be `/services/rms-service/api`.

## Root Cause

Spring Cloud Gateway routes services based on their **service name** in Consul/Eureka:
- Service name: `rms-service`
- Gateway route: `/services/{service-name}/api`
- Correct path: `/services/rms-service/api`

## Incorrect Path (Fixed)
```
❌ /services/rms/api/restaurants
```

## Correct Path
```
✅ /services/rms-service/api/restaurants
```

## Files Corrected

### Code Files
1. ✅ `lib/api-client.ts`
   - Changed: `const API_PATH = '/services/rms/api';`
   - To: `const API_PATH = '/services/rms-service/api';`

2. ✅ `lib/config.ts`
   - Changed: `https://rms-demo.atparui.com/services/rms/api`
   - To: `https://rms-demo.atparui.com/services/rms-service/api`

3. ✅ `.env.example`
   - Changed: `NEXT_PUBLIC_API_BASE_URL=.../services/rms/api`
   - To: `NEXT_PUBLIC_API_BASE_URL=.../services/rms-service/api`

### Documentation Files
4. ✅ `docs/PHASE1_COMPLETION_SUMMARY.md`
5. ✅ `docs/API_ANALYSIS_SUMMARY.md`
6. ✅ `docs/IMPLEMENTATION_PLAN.md`
7. ✅ `docs/ROUTING_AND_CRUD_PAGES_GUIDE.md`

## Gateway Routing Pattern

### How Spring Cloud Gateway Routes Services

```
Service Discovery (Consul):
- Service Name: rms-service
- Service Name: tenant-management-service

Gateway Routes:
- /services/rms-service/**      → rms-service
- /services/tenant-management-service/** → tenant-management-service
```

### Full URL Structure

```
Protocol + Domain + Gateway Path + Service Path
https:// + rms-demo.atparui.com + /services/rms-service + /api/restaurants
```

### Examples

**Correct URLs:**
```
✅ https://rms-demo.atparui.com/services/rms-service/api/restaurants
✅ https://rms-demo.atparui.com/services/rms-service/api/branches
✅ https://rms-demo.atparui.com/services/rms-service/api/menu-items
✅ https://rms-demo.atparui.com/services/rms-service/api/app-menus/tree
```

**Incorrect URLs (404 errors):**
```
❌ https://rms-demo.atparui.com/services/rms/api/restaurants
❌ https://rms-demo.atparui.com/services/rms/api/branches
❌ https://rms-demo.atparui.com/services/rms/api/app-menus/tree
```

## Why This Matters

### Gateway Behavior
- Gateway uses service name for routing
- Service name: `rms-service` (with hyphen)
- Must match exactly in URL path
- Otherwise: 404 Not Found

### Terminal Output Analysis

The terminal showed:
```
OPTIONS /services/rms/api/app-menus/tree?appKey=rms-demo 404 in 60ms
```

**Diagnosis:**
- ❌ Path: `/services/rms/api`
- ⚠️ Status: 404 Not Found
- ✅ Should be: `/services/rms-service/api`

## Verification

### Test with curl

```bash
# Get token
TOKEN=$(curl -s -X POST "https://auth.atparui.com/realms/rms-demo/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=rms-web" \
  -d "username=gwadmin" \
  -d "password=gwadmin" | jq -r .access_token)

# Test CORRECT path (should work)
curl -X GET "https://rms-demo.atparui.com/services/rms-service/api/restaurants" \
  -H "Authorization: Bearer $TOKEN"

# Test INCORRECT path (should 404)
curl -X GET "https://rms-demo.atparui.com/services/rms/api/restaurants" \
  -H "Authorization: Bearer $TOKEN"
```

### Test menu endpoint

```bash
# Correct path
curl -X GET "https://rms-demo.atparui.com/services/rms-service/api/app-menus/tree?appKey=rms-demo" \
  -H "Authorization: Bearer $TOKEN"
```

## Configuration Summary

### Environment Variables (Corrected)

```bash
# .env.local
NEXT_PUBLIC_API_ORIGIN=https://rms-demo.atparui.com
NEXT_PUBLIC_API_BASE_URL=https://rms-demo.atparui.com/services/rms-service/api
NEXT_PUBLIC_APP_KEY=RMS
```

### API Client (Corrected)

```typescript
// lib/api-client.ts
const API_BASE_URL = apiConfig.apiOrigin || 'https://rms-demo.atparui.com';
const API_PATH = '/services/rms-service/api';  // ✅ CORRECT

// Builds URLs like:
// https://rms-demo.atparui.com/services/rms-service/api/restaurants
```

### Menu API (Already Correct)

```typescript
// lib/menu.ts
return fetchJson<MenuTreeNode[]>(`/app-menus/tree${suffix}`, { token });

// fetchJson prepends API_PATH:
// /services/rms-service/api/app-menus/tree?appKey=rms-demo
```

## Impact

### Before Fix (404 errors)
```
GET /services/rms/api/restaurants          → 404
GET /services/rms/api/branches             → 404
GET /services/rms/api/app-menus/tree       → 404
```

### After Fix (Should work)
```
GET /services/rms-service/api/restaurants        → 200
GET /services/rms-service/api/branches           → 200
GET /services/rms-service/api/app-menus/tree     → 200
```

## Related Services

For reference, other services follow the same pattern:

```
Tenant Management Service:
/services/tenant-management-service/api/tenants
/services/tenant-management-service/api/platforms

RMS Service:
/services/rms-service/api/restaurants
/services/rms-service/api/branches
/services/rms-service/api/menu-items
```

## Summary

✅ **Fixed**: All API paths now use `/services/rms-service/api`
✅ **Corrected**: Code files (api-client.ts, config.ts, .env.example)
✅ **Updated**: All documentation files
✅ **Pattern**: Matches Spring Cloud Gateway service routing

The 404 errors should now be resolved!

---

Last Updated: 2026-02-04
Issue: Incorrect API path (/services/rms instead of /services/rms-service)
Status: Fixed in all files
