# URL State Investigation

## Issue Reported

User reported: "When moving between menu links, state is coming in the URL"

## Question

Is the token being added to the URL? Is this the right approach?

---

## Analysis

### Token Storage - Correct Approach ✅

**Current Implementation:**
```typescript
// components/auth/keycloak-provider.tsx
localStorage.setItem('kc_token', token);

// lib/api-client.ts
const token = localStorage.getItem('kc_token');
headers: { Authorization: `Bearer ${token}` }
```

**This is CORRECT!** ✅

- Token stored in: `localStorage` (not URL)
- Token sent via: `Authorization` header (not URL parameter)
- Token NOT in URL (secure)

### Why localStorage Is Correct

**Standard pattern for SPAs:**
```
1. Login → Keycloak → Get JWT token
2. Store: localStorage.setItem('kc_token', token)
3. API call: Add to Authorization header
4. Token never appears in URL
```

**Security:**
- ✅ localStorage: OK for JWTs in SPAs
- ❌ URL parameters: INSECURE (shareable, logged)
- ❌ URL hash: Still visible in browser history

---

## What Could Be in the URL?

### Possibility 1: Keycloak Redirect Parameters

**During login flow, Keycloak adds parameters:**

```
❌ Bad (during auth):
https://rms-demo.atparui.com/restaurant?state=abc123&session_state=xyz&code=def456

✅ Good (after auth):
https://rms-demo.atparui.com/restaurant
```

**If you see this:**
- This is TEMPORARY during OAuth flow
- Keycloak cleans it up after successful auth
- Should disappear after page loads

**Fix:** Not needed - this is normal OAuth2 flow

### Possibility 2: Next.js Router State

**Next.js router preserves scroll position:**

```
❌ Might see:
https://rms-demo.atparui.com/restaurant#__next_state_key__=abc

✅ Should see:
https://rms-demo.atparui.com/restaurant
```

**If you see `#__next_state_key__`:**
- This is Next.js internal state
- Used for scroll restoration
- Should not affect functionality

**Fix:** Can disable with:
```typescript
// next.config.ts
experimental: {
  scrollRestoration: false
}
```

### Possibility 3: React Query Devtools

**If React Query devtools is open:**

```
URL might show internal state in browser devtools, but NOT in actual URL bar
```

### Possibility 4: URL Query Parameters (Unintended)

**If navigation code adds query params:**

```typescript
// ❌ Bad:
<Link href="/restaurant?from=menu">

// ✅ Good:
<Link href="/restaurant">
```

**Current code inspection:** ✅ No query parameters being added

---

## Investigation Steps

### Step 1: Check Actual URL

**Please provide the EXACT URL you see in browser address bar:**

```
Example 1 (Clean - Good):
https://rms-demo.atparui.com/restaurant

Example 2 (OAuth params - Temporary, OK):
https://rms-demo.atparui.com/restaurant?state=xyz&session_state=abc

Example 3 (Unwanted state - Bad):
https://rms-demo.atparui.com/restaurant?someParam=value

Example 4 (Next.js hash - Might need fix):
https://rms-demo.atparui.com/restaurant#__next_state_key__=abc123
```

### Step 2: Check Network Tab

**Open DevTools → Network tab:**

1. Click menu link (e.g., "Restaurants")
2. Check Request URL in Network tab
3. Does it have extra parameters?

**Expected:**
```
Request URL: https://console.atparui.com/services/rms-service/api/restaurants
Query String Parameters: (none)
Request Headers:
  Authorization: Bearer eyJ...  ← Token HERE (not in URL)
```

### Step 3: Check localStorage

**Open DevTools → Console → Run:**

```javascript
localStorage.getItem('kc_token')
// Should return: "eyJhbGci..." (JWT token)
```

---

## Expected Behavior

### ✅ Correct Flow

```
1. User clicks "Restaurants" menu
   URL: https://rms-demo.atparui.com/restaurant
   
2. Page loads, calls API
   API URL: https://console.atparui.com/services/rms-service/api/restaurants
   Headers: Authorization: Bearer eyJ...
   
3. Data loads
   URL still: https://rms-demo.atparui.com/restaurant (clean)
```

**No state in URL! Token in header only.**

### ❌ Incorrect (If This Happens)

```
URL: https://rms-demo.atparui.com/restaurant?token=eyJ...
```

**This would be WRONG!** Token should never be in URL.

---

## Current Code Review

### Navigation Code (components/layout/sidebar.tsx)

```typescript
// Line 55-56
<Link
  href={node.routePath || "#"}  // ← Clean href, no query params ✅
  className={...}
>
```

**Status:** ✅ Clean - No state being added

### Menu API (lib/menu.ts)

```typescript
// Line 34
return fetchJson<MenuTreeNode[]>(`/app-menus/tree${suffix}`, { token });
```

**Status:** ✅ Token in header, not URL

### API Client (lib/api-client.ts)

```typescript
// Line 47-52
const token = localStorage.getItem('kc_token');  // ← Get from localStorage ✅
const headers: HeadersInit = {
  'Content-Type': 'application/json',
  ...(token && { 'Authorization': `Bearer ${token}` }),  // ← Header ✅
};
```

**Status:** ✅ Token in header, not URL

---

## Diagnosis

### Based on code review:

✅ **Token handling is CORRECT**
- Stored in localStorage
- Sent in Authorization header
- Never in URL

### Possible causes of "state in URL":

1. **OAuth2 redirect parameters** (temporary, normal)
2. **Next.js internal state** (might be visible in hash)
3. **Browser extension** (adding parameters)
4. **Misunderstanding** (seeing state in DevTools, not URL)

---

## Action Required

### From You

Please provide:

1. **Screenshot** of browser address bar showing the URL
2. **Copy-paste** the exact URL when you navigate
3. **When** does it appear? (immediately, after API call, always?)

### From Me

Once I see the URL:
- Diagnose the exact issue
- Provide specific fix if needed
- Update documentation

---

## Token Storage Best Practices

### Current Implementation ✅

```typescript
// Storage
localStorage.setItem('kc_token', token);

// Retrieval  
const token = localStorage.getItem('kc_token');

// Usage
headers: { Authorization: `Bearer ${token}` }

// Cleanup
localStorage.removeItem('kc_token');
```

**This is the STANDARD pattern!**

### Why localStorage?

**Pros:**
- ✅ Standard for SPAs
- ✅ Persists across page reloads
- ✅ Not sent automatically (prevents CSRF)
- ✅ Can set expiration logic

**Cons:**
- ⚠️ Vulnerable to XSS (if XSS exists)

**Alternatives (and why we don't use them):**

**1. Cookies:**
```
❌ Sent automatically with every request (CSRF risk)
❌ Size limits (4KB)
✅ Better for server-side auth
```

**2. URL Parameters:**
```
❌ Visible to user
❌ Logged in server logs
❌ Shareable (security risk!)
❌ Browser history leaks
```

**3. Session Storage:**
```
❌ Cleared on tab close
❌ Not shared across tabs
✅ OK for single-tab workflows
```

**Our choice:** localStorage ✅ (standard for SPAs)

---

## Summary

### Your Questions

**Q1: "Tables in singular - should we change?"**  
**A:** ❌ NO! Tables are CORRECT as singular. My doc was wrong.

**Q2: "State in URL - is it token storage?"**  
**A:** ❌ NO! Token is in localStorage/header, not URL.

**Q3: "Is this the right way?"**  
**A:** ✅ YES! localStorage + Authorization header is the standard.

### What's Fixed

✅ Token storage (localStorage sync)  
✅ Documentation (corrected table naming)  
✅ Understanding (singular vs plural by layer)

### What's Pending

⏳ See the actual URL with "state" (need screenshot)  
⏳ Fix if it's actually a problem  
⏳ Rename frontend routes to plural

---

**Status:** Waiting for URL details to diagnose state issue  
**Next:** Share screenshot or exact URL when navigating

**Once resolved, conventions are FINAL and we never worry again!** 🎉
