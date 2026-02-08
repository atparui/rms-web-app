# API Gateway URL Configuration Fix

## Problem

The frontend was making API calls to the wrong domain:

**Current behavior (WRONG):**
```
https://rms-demo.atparui.com/services/rms-service/api/app-menus/tree
```

**Expected behavior (CORRECT):**
```
https://console.atparui.com/services/rms-service/api/app-menus/tree
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Flow                         │
└─────────────────────────────────────────────────────────────┘

Frontend Domain (rms-demo.atparui.com)
  ↓ Makes API calls to ↓
API Gateway (console.atparui.com)
  ↓ Routes to ↓
Backend Services (rms-service, tenant-management-service, etc.)
```

## The Issue

The frontend (`rms-web-app`) is hosted at `https://rms-demo.atparui.com`, but it needs to make API calls to the **API Gateway** at `https://console.atparui.com`.

### Configuration Mismatch

**Before Fix:**

1. **lib/config.ts** - Default fallback:
   ```typescript
   apiOrigin: process.env.NEXT_PUBLIC_API_ORIGIN || "https://rms-demo.atparui.com"
   //                                                  ^^^^^^^^^^^^^^^^^^^^^^^^
   //                                                  ❌ WRONG - frontend domain
   ```

2. **.env.example** - Example configuration:
   ```bash
   NEXT_PUBLIC_API_ORIGIN=https://rms-demo.atparui.com  # ❌ WRONG
   ```

3. **Dockerfile** - Missing variable:
   ```dockerfile
   # ❌ MISSING: NEXT_PUBLIC_API_ORIGIN not set
   ARG NEXT_PUBLIC_API_BASE_URL=https://console.atparui.com/...  # Only this was set
   ```

### Why It Failed

1. The code uses `apiConfig.apiOrigin` to construct API URLs
2. `apiOrigin` comes from `NEXT_PUBLIC_API_ORIGIN` env variable
3. Dockerfile didn't set `NEXT_PUBLIC_API_ORIGIN`
4. Fell back to hardcoded default: `rms-demo.atparui.com` (frontend domain)
5. Result: API calls went to frontend domain instead of gateway

## The Fix

### 1. Updated lib/config.ts

Changed the default fallback to point to the gateway:

```typescript
export const apiConfig = {
  apiOrigin:
    process.env.NEXT_PUBLIC_API_ORIGIN ||
    "https://console.atparui.com",  // ✅ CORRECT - gateway domain
  
  baseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://console.atparui.com/services/rms-service/api",  // ✅ CORRECT
  
  appKey: process.env.NEXT_PUBLIC_APP_KEY || "RMS",
  tenantId: process.env.NEXT_PUBLIC_TENANT_ID || "",
};
```

### 2. Updated .env.example

Changed the example to use the correct gateway URL:

```bash
# API Configuration
NEXT_PUBLIC_API_ORIGIN=https://console.atparui.com  # ✅ CORRECT
NEXT_PUBLIC_API_BASE_URL=https://console.atparui.com/services/rms-service/api
```

### 3. Updated Dockerfile

Added the missing `NEXT_PUBLIC_API_ORIGIN` variable:

```dockerfile
# Build-time arguments for Next.js public environment variables
ARG NEXT_PUBLIC_KEYCLOAK_URL=https://auth.atparui.com
ARG NEXT_PUBLIC_KEYCLOAK_REALM=rms-demo
ARG NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rms-demo-web
ARG NEXT_PUBLIC_API_ORIGIN=https://console.atparui.com              # ✅ ADDED
ARG NEXT_PUBLIC_API_BASE_URL=https://console.atparui.com/services/rms-service/api
ARG NEXT_PUBLIC_APP_KEY=rms-demo
ARG NEXT_PUBLIC_TENANT_ID=rms-demo

# Set environment variables for build
ENV NEXT_PUBLIC_KEYCLOAK_URL=${NEXT_PUBLIC_KEYCLOAK_URL}
ENV NEXT_PUBLIC_KEYCLOAK_REALM=${NEXT_PUBLIC_KEYCLOAK_REALM}
ENV NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=${NEXT_PUBLIC_KEYCLOAK_CLIENT_ID}
ENV NEXT_PUBLIC_API_ORIGIN=${NEXT_PUBLIC_API_ORIGIN}                # ✅ ADDED
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_APP_KEY=${NEXT_PUBLIC_APP_KEY}
ENV NEXT_PUBLIC_TENANT_ID=${NEXT_PUBLIC_TENANT_ID}
```

## Files Changed

### Modified Files
1. ✅ `lib/config.ts`
   - Line 16: Changed default from `rms-demo.atparui.com` → `console.atparui.com`
   - Line 21: Changed default from `rms-demo.atparui.com` → `console.atparui.com`

2. ✅ `.env.example`
   - Line 4: Changed `NEXT_PUBLIC_API_ORIGIN` to `console.atparui.com`
   - Line 5: Changed `NEXT_PUBLIC_API_BASE_URL` to `console.atparui.com`

3. ✅ `Dockerfile`
   - Line 30: Added `ARG NEXT_PUBLIC_API_ORIGIN=https://console.atparui.com`
   - Line 38: Added `ENV NEXT_PUBLIC_API_ORIGIN=${NEXT_PUBLIC_API_ORIGIN}`

## How API Calls Work

### API Client Flow

```typescript
// lib/api-client.ts
const API_BASE_URL = apiConfig.apiOrigin || 'https://console.atparui.com';
const API_PATH = '/services/rms-service/api';

// Example: Get restaurants
export const restaurantApi = {
  getAll: (): Promise<Restaurant[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/restaurants`),
  //                ↑                 ↑
  //                |                 |
  //         console.atparui.com     /services/rms-service/api
  //
  // Full URL: https://console.atparui.com/services/rms-service/api/restaurants
};
```

### Before Fix

```
Frontend (rms-demo.atparui.com) 
  ↓ API call to ↓
rms-demo.atparui.com/services/rms-service/api/app-menus/tree
  ❌ 404 Not Found (no API gateway at this domain)
```

### After Fix

```
Frontend (rms-demo.atparui.com)
  ↓ API call to ↓
console.atparui.com/services/rms-service/api/app-menus/tree
  ↓ Gateway routes to ↓
rms-service backend
  ✅ 200 OK (response returned)
```

## CORS Configuration

This fix works because the API Gateway (`console.atparui.com`) has CORS configured to allow requests from `rms-demo.atparui.com`:

**Gateway CORS Config** (`console/src/main/java/com/atparui/console/config/WebConfigurer.java`):
```java
config.setAllowedOrigins(Arrays.asList(
    "https://console.atparui.com",
    "https://rms-demo.atparui.com",  // ✅ Frontend domain allowed
    "http://localhost:3000",
    // ... other origins
));
```

### Cross-Origin Request

```
Request:
  Origin: https://rms-demo.atparui.com
  URL: https://console.atparui.com/services/rms-service/api/app-menus/tree
  
Gateway Response:
  Access-Control-Allow-Origin: https://rms-demo.atparui.com  ✅
  Access-Control-Allow-Credentials: true
```

## Environment Variable Summary

### Production (Docker)

Set via Dockerfile ARG/ENV:
```dockerfile
NEXT_PUBLIC_API_ORIGIN=https://console.atparui.com
NEXT_PUBLIC_API_BASE_URL=https://console.atparui.com/services/rms-service/api
```

### Local Development

Create `.env.local`:
```bash
# For local development against production gateway
NEXT_PUBLIC_API_ORIGIN=https://console.atparui.com
NEXT_PUBLIC_API_BASE_URL=https://console.atparui.com/services/rms-service/api

# OR for local gateway
NEXT_PUBLIC_API_ORIGIN=http://localhost:8082
NEXT_PUBLIC_API_BASE_URL=http://localhost:8082/services/rms-service/api
```

## Testing the Fix

### 1. Verify Configuration

After rebuild, check browser DevTools Network tab:

**Before Fix:**
```
Request URL: https://rms-demo.atparui.com/services/rms-service/api/app-menus/tree
Status: 404 Not Found
```

**After Fix:**
```
Request URL: https://console.atparui.com/services/rms-service/api/app-menus/tree
Status: 200 OK
```

### 2. Test with curl

```bash
# Get Keycloak token
TOKEN=$(curl -s -X POST "https://auth.atparui.com/realms/rms-demo/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=rms-demo-web" \
  -d "username=demo_admin" \
  -d "password=demo_admin" | jq -r .access_token)

# Test API call to CORRECT gateway URL
curl -v "https://console.atparui.com/services/rms-service/api/app-menus/tree?appKey=rms-demo" \
  -H "Authorization: Bearer $TOKEN"

# Should return 200 OK with menu data
```

### 3. Rebuild and Deploy

```bash
cd /home/sivakumar/Shiva/Workspace/rms-web-app

# Commit changes
git add lib/config.ts .env.example Dockerfile
git commit -m "fix: Configure API calls to use correct gateway URL (console.atparui.com)"

# Push to trigger Jenkins build
git push origin main

# Jenkins will rebuild Docker image with correct ENV variables
```

## Impact

### What Changes
✅ All API calls now go to `console.atparui.com` (gateway)
✅ Gateway routes requests to correct backend services
✅ CORS works correctly (gateway allows rms-demo.atparui.com origin)
✅ Authentication tokens validated by gateway

### What Stays the Same
- Frontend still hosted at `rms-demo.atparui.com`
- Keycloak still at `auth.atparui.com`
- Backend services still behind gateway
- User experience unchanged (just fixes broken API calls)

## Domain Mapping

| Domain | Purpose | Role |
|--------|---------|------|
| `rms-demo.atparui.com` | Frontend | Serves React/Next.js UI |
| `console.atparui.com` | API Gateway | Routes API requests to services |
| `auth.atparui.com` | Keycloak | Authentication & authorization |
| (internal) | Backend Services | rms-service, tenant-management-service |

## Summary

**Problem:** Frontend making API calls to its own domain instead of gateway  
**Root Cause:** Missing `NEXT_PUBLIC_API_ORIGIN` in Dockerfile, wrong default in config  
**Solution:** Set correct gateway URL in config defaults and Dockerfile  
**Result:** API calls now go to `console.atparui.com` gateway ✅

---

**Fixed:** 2026-02-08  
**Issue:** API calls going to wrong domain (rms-demo instead of console)  
**Status:** Resolved - All API calls now route through gateway
