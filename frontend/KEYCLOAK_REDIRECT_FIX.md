# Fix: Keycloak Redirect to Production Instead of Localhost

## Problem
You're being redirected to `rmsgateway.atparui.com` instead of `localhost:9000` during authentication.

## Root Cause
The Keycloak client `gateway-web` in the `gateway` realm is configured with redirect URIs that only include production URLs, not localhost.

## Solution Options

### Option 1: Add Localhost to Keycloak Redirect URIs (Recommended for Development)

**You need access to Keycloak Admin Console:**

1. **Login to Keycloak Admin:**
   - URL: `https://rmsauth.atparui.com` (or your Keycloak admin URL)
   - Navigate to: **Realm: `gateway`** → **Clients** → **`gateway-web`**

2. **Update Valid Redirect URIs:**
   - Go to **Settings** tab
   - Find **Valid redirect URIs** field
   - Add these URIs (one per line):
     ```
     http://localhost:9000/*
     http://localhost:9000/api/auth/callback/keycloak
     http://localhost:3000/*
     http://localhost:3000/api/auth/callback/keycloak
     ```
   - **Important:** Keep existing production URIs, just ADD the localhost ones

3. **Update Web Origins:**
   - Find **Web origins** field
   - Add:
     ```
     http://localhost:9000
     http://localhost:3000
     ```
   - Click **Save**

4. **Restart your frontend dev server**

### Option 2: Use Local Keycloak for Development (Best Practice)

**This avoids production Keycloak configuration changes:**

1. **Start Local Keycloak:**
   ```bash
   docker-compose up -d
   ```

2. **Configure Local Keycloak:**
   - Access: `http://localhost:8080`
   - Login: `admin` / `admin`
   - Create realm: `gateway` (or use existing)
   - Create client: `gateway-web`
     - **Valid redirect URIs:** `http://localhost:9000/*`
     - **Web origins:** `http://localhost:9000`
     - **Access type:** `public` (for frontend)

3. **Update Frontend Environment Variables:**
   Create `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
   NEXT_PUBLIC_KEYCLOAK_REALM=gateway
   NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=gateway-web
   NEXT_PUBLIC_GATEWAY_URL=http://localhost:3001
   ```

4. **Update Next.js Port (if needed):**
   ```bash
   # In frontend/package.json, change dev script:
   "dev": "next dev -p 9000"
   ```

### Option 3: Use Environment-Specific Configuration

**Create separate configs for dev/prod:**

1. **Development Config (`frontend/.env.local`):**
   ```env
   NODE_ENV=development
   NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
   NEXT_PUBLIC_KEYCLOAK_REALM=gateway
   NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=gateway-web
   NEXT_PUBLIC_GATEWAY_URL=http://localhost:3001
   NEXT_PUBLIC_APP_URL=http://localhost:9000
   ```

2. **Production Config (`.env.production`):**
   ```env
   NODE_ENV=production
   NEXT_PUBLIC_KEYCLOAK_URL=https://rmsauth.atparui.com
   NEXT_PUBLIC_KEYCLOAK_REALM=gateway
   NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=gateway-web
   NEXT_PUBLIC_GATEWAY_URL=https://rmsgateway.atparui.com
   NEXT_PUBLIC_APP_URL=https://rmsgateway.atparui.com
   ```

3. **Update Next-Auth Config:**
   If using `next-auth`, ensure it uses `NEXT_PUBLIC_APP_URL` for callbacks:
   ```typescript
   // app/api/auth/[...nextauth]/route.ts
   export const authOptions = {
     // ...
     callbacks: {
       async redirect({ url, baseUrl }) {
         // Use environment variable for base URL
         const appUrl = process.env.NEXT_PUBLIC_APP_URL || baseUrl;
         if (url.startsWith("/")) return `${appUrl}${url}`;
         if (new URL(url).origin === appUrl) return url;
         return appUrl;
       },
     },
   };
   ```

## Quick Check: What Port Are You Actually Using?

**Check your Next.js dev server:**
```bash
cd frontend
npm run dev
# Should show: "Ready on http://localhost:3000" (default)
# Or: "Ready on http://localhost:9000" (if you configured it)
```

**If you want to use port 9000, update `package.json`:**
```json
{
  "scripts": {
    "dev": "next dev -p 9000"
  }
}
```

## Verify the Fix

1. **Clear browser cache/cookies** for localhost
2. **Restart dev server**
3. **Try login again** - should redirect back to `localhost:9000`

## If You Don't Have Keycloak Admin Access

**You have two options:**

1. **Ask your DevOps/Admin** to add localhost redirect URIs to the `gateway-web` client
2. **Use local Keycloak** (Option 2 above) - this is the recommended approach for development anyway

## Why This Happens

Keycloak validates redirect URIs for security. If your localhost URL isn't in the allowed list, Keycloak will:
- Reject the redirect
- Fall back to a default redirect URI (usually production)
- Or show an error

This is a **security feature**, not a bug - but it's frustrating during development!

## Alternative: Bypass Auth for Development (Not Recommended)

If you just need to work on the frontend without auth:

1. **Temporarily disable auth middleware**
2. **Use mock user data**
3. **Re-enable auth before deploying**

**But this is NOT recommended** - better to fix the Keycloak config properly.

---

## Still Having Issues?

1. **Check browser console** for redirect errors
2. **Check Network tab** - see what redirect URI is being sent to Keycloak
3. **Verify Keycloak client settings** - the redirect URI must match EXACTLY (including protocol, port, path)
4. **Check Next.js middleware** - ensure it's not forcing production URLs


