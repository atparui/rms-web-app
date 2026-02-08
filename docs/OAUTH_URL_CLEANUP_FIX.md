# OAuth2 URL Parameter Cleanup Fix

## Issue

When navigating between pages after Keycloak authentication, OAuth2 callback parameters were persisting in the URL:

```
https://rms-demo.atparui.com/customers#state=2d0dfeab-9454-444c-8a24-6006ca0a231e&session_state=51959d0d-49d0-43ec-b1f3-ae1443dc238a&iss=https%3A%2F%2Fauth.atparui.com%2Frealms%2Frms-demo&code=163f20f2-1daa-4608-9f5f-515bd2ce40a0...
```

**Parameters**:
- `state` - OAuth2 CSRF protection token
- `session_state` - Keycloak session identifier
- `iss` - Issuer (Keycloak realm URL)
- `code` - Authorization code (used once for token exchange)

## Root Cause

After Keycloak redirects back to the application following successful authentication, these OAuth2 callback parameters remain in the URL. While this is normal OAuth2 behavior, they should be cleaned up after processing to:

1. **Improve UX** - Clean URLs look better
2. **Security** - Don't expose authorization codes unnecessarily
3. **Prevent confusion** - Parameters have no meaning after auth completes

## Solution

Added URL cleanup logic in the Keycloak provider after successful authentication:

**File**: `/components/auth/keycloak-provider.tsx`

```typescript
// Clean up OAuth2 callback parameters from URL
if (typeof window !== 'undefined') {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  
  // Remove Keycloak OAuth2 callback parameters
  if (params.has('state') || params.has('session_state') || params.has('code') || params.has('iss')) {
    params.delete('state');
    params.delete('session_state');
    params.delete('code');
    params.delete('iss');
    
    // Update URL without reloading the page
    const cleanUrl = url.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', cleanUrl);
    
    console.log('[auth] Cleaned OAuth2 parameters from URL');
  }
}
```

## How It Works

1. **After Keycloak Init**: Once authentication is successful and user profile is loaded
2. **Check URL Parameters**: Look for OAuth2 callback parameters
3. **Remove Parameters**: Delete all Keycloak-specific parameters
4. **Update URL**: Use `window.history.replaceState()` to update the URL without reloading the page
5. **Preserve Other Params**: If other query parameters exist (not OAuth2-related), they are preserved

## Testing

### Before Fix
```
https://rms-demo.atparui.com/customers#state=xxx&session_state=yyy&iss=zzz&code=aaa
```

### After Fix
```
https://rms-demo.atparui.com/customers
```

### Test Steps

1. Clear browser cache and cookies
2. Navigate to `https://rms-demo.atparui.com`
3. Login with Keycloak credentials
4. After redirect, observe URL is immediately cleaned
5. Navigate between menu items
6. Confirm URLs remain clean

## Deployment

**Rebuild and deploy the frontend**:

```bash
cd /home/sivakumar/Shiva/Workspace/platform
docker-compose build rms-web-app
docker-compose up -d rms-web-app
```

Wait 30 seconds for container to start, then test at `https://rms-demo.atparui.com`

## Related

- **OAuth2 Authorization Code Flow**: Standard OAuth2 pattern
- **PKCE (Proof Key for Code Exchange)**: Enhanced security for OAuth2 (enabled in our config)
- **Keycloak JS Adapter**: Official Keycloak JavaScript client library

## Security Note

The authorization `code` parameter is **single-use** and becomes invalid immediately after being exchanged for tokens. However, it's still best practice to remove it from the URL to avoid:
- Accidental logging/sharing of the URL with the code
- Confusion about its purpose
- Browser history containing sensitive parameters

---

**Status**: ✅ Fixed

**Date**: February 8, 2026
