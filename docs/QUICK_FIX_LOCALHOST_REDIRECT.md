# 🚨 QUICK FIX: Stop Redirecting to Production

## The Problem
Keycloak is redirecting you to `rmsgateway.atparui.com` instead of `localhost:9000` because the production Keycloak client doesn't have localhost in its allowed redirect URIs.

## ⚡ FASTEST FIX (5 minutes)

### Step 1: Check What Port You're Using
```bash
cd frontend
npm run dev
# Note the port shown (probably 3000 or 9000)
```

### Step 2: Add Localhost to Keycloak (If You Have Admin Access)

1. Go to: `https://rmsauth.atparui.com/admin`
2. Login with admin credentials
3. Select realm: **`gateway`**
4. Go to: **Clients** → **`gateway-web`**
5. Click **Settings** tab
6. In **Valid redirect URIs**, add:
   ```
   http://localhost:9000/*
   http://localhost:9000/api/auth/callback/*
   http://localhost:3000/*
   http://localhost:3000/api/auth/callback/*
   ```
7. In **Web origins**, add:
   ```
   http://localhost:9000
   http://localhost:3000
   ```
8. Click **Save**
9. **Clear browser cache** and try again

## 🔧 ALTERNATIVE: Use Local Keycloak (Recommended)

### Why This is Better
- No need to modify production Keycloak
- Faster development (no network latency)
- Can't break production config
- Full control over users/roles

### Setup (10 minutes)

1. **Start Local Keycloak:**
   ```bash
   # From project root
   docker-compose up -d
   ```

2. **Wait 30 seconds**, then access: `http://localhost:8080`
   - Username: `admin`
   - Password: `admin`

3. **Create/Configure Realm:**
   - If `gateway` realm doesn't exist, create it
   - Or use existing realm

4. **Create Client for Frontend:**
   - Go to: **Clients** → **Create client**
   - **Client ID:** `gateway-web`
   - **Client protocol:** `openid-connect`
   - Click **Next**
   - **Access type:** `public`
   - **Valid redirect URIs:** `http://localhost:9000/*`
   - **Web origins:** `http://localhost:9000`
   - Click **Save**

5. **Create Environment File:**
   Create `frontend/.env.local`:
   ```env
   # Local Development Config
   NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
   NEXT_PUBLIC_KEYCLOAK_REALM=gateway
   NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=gateway-web
   NEXT_PUBLIC_GATEWAY_URL=http://localhost:3001
   NEXT_PUBLIC_APP_URL=http://localhost:9000
   ```

6. **Update Package.json to Use Port 9000:**
   ```json
   {
     "scripts": {
       "dev": "next dev -p 9000"
     }
   }
   ```

7. **Restart Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

8. **Test:**
   - Open: `http://localhost:9000`
   - Should redirect to: `http://localhost:8080` (local Keycloak)
   - After login, redirects back to: `http://localhost:9000` ✅

## 🎯 If You Don't Have Keycloak Admin Access

**Option A: Ask Your Team**
- Ask DevOps/admin to add `http://localhost:9000/*` to the `gateway-web` client's Valid redirect URIs
- Takes 2 minutes for them to do

**Option B: Temporary Workaround**
- Use a proxy/tunnel (ngrok, localtunnel) to get a public URL
- Add that URL to Keycloak redirect URIs
- Not ideal, but works temporarily

**Option C: Skip Auth for Now**
- Comment out auth middleware
- Work on UI without authentication
- Re-enable auth later

## 📝 Verify It's Working

After fixing, you should see:
1. ✅ Frontend loads at `http://localhost:9000`
2. ✅ Clicking login redirects to Keycloak (localhost:8080 or rmsauth.atparui.com)
3. ✅ After login, redirects BACK to `http://localhost:9000` (not production!)
4. ✅ You're logged in and can use the app

## 🐛 Still Not Working?

**Check these:**

1. **Browser Console Errors:**
   - Open DevTools (F12)
   - Check Console tab for redirect errors
   - Check Network tab - see what redirect_uri is being sent

2. **Keycloak Logs:**
   - If using local Keycloak: `docker-compose logs keycloak`
   - Look for "Invalid redirect_uri" errors

3. **Environment Variables:**
   ```bash
   # Make sure .env.local exists and has correct values
   cat frontend/.env.local
   ```

4. **Clear Everything:**
   ```bash
   # Clear Next.js cache
   rm -rf frontend/.next
   
   # Clear browser cache/cookies for localhost
   # Restart dev server
   npm run dev
   ```

## 💡 Pro Tip

**For development, always use local Keycloak:**
- Faster
- No network issues
- Can't affect production
- Full control

**Only use production Keycloak when:**
- Testing production-like environment
- Integration testing
- Staging environment

---

**This should fix your redirect issue!** The problem is 100% a Keycloak configuration issue, not your code. Once you add localhost to the allowed redirect URIs (or use local Keycloak), it will work perfectly.


