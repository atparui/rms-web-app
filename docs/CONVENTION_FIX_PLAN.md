# Convention Fix Plan - Final Decision

## Critical Issues Found

### Issue 1: ❌ Token Not Attached (401 Errors)

**Root Cause:** Keycloak provider stores token in React state, but API client looks for it in `localStorage`.

**Fix:** ✅ **COMPLETED** - Updated Keycloak provider to sync token to localStorage

**Changed File:** `components/auth/keycloak-provider.tsx`
- Store token in localStorage on login
- Update localStorage on token refresh  
- Clear localStorage on logout

### Issue 2: ❌ Naming Convention Mismatch

**Root Cause:** Backend API uses **PLURAL** but frontend/menu uses **SINGULAR**

```
Backend:  /api/restaurants  ✅ (RESTful standard - PLURAL)
Frontend: /restaurant       ❌ (Wrong - SINGULAR)
Menu:     /restaurant       ❌ (Wrong - SINGULAR)
```

---

## Official Convention Decision

✅ **DECISION: Use PLURAL everywhere (follow RESTful standard)**

### Why PLURAL?

1. **Industry Standard**: All major APIs use plurals (GitHub, Twitter, Google, Stripe)
2. **RESTful Best Practice**: Collections are plural (`/restaurants` = collection)
3. **Backend Already Uses It**: Spring Boot API uses `/api/restaurants`
4. **Semantic Clarity**: GET `/restaurants` clearly means "get multiple"
5. **Automation Friendly**: Code generators expect plurals

### What Needs to Change?

| Component | Current | Correct | Action |
|-----------|---------|---------|--------|
| Backend API | `/api/restaurants` | `/api/restaurants` | ✅ Already correct |
| Frontend Route | `/restaurant` | `/restaurants` | ❌ Must change |
| Menu Config (DB) | `/restaurant` | `/restaurants` | ❌ Must change |

---

## Fix Implementation

### Step 1: Update Menu Configuration (Backend Database)

**File:** Database migration or manual SQL

```sql
-- Update app menu configuration to use PLURAL
UPDATE app_menu 
SET route_path = '/restaurants',
    updated_at = NOW()
WHERE route_path = '/restaurant' 
  AND menu_key LIKE '%restaurant%';

-- Verify
SELECT menu_key, label, route_path, is_active 
FROM app_menu 
WHERE route_path LIKE '%restaurant%';
```

**Alternative:** If using Liquibase, create migration:

```xml
<!-- src/main/resources/config/liquibase/changelog/YYYYMMDD_fix_menu_plural.xml -->
<changeSet id="fix-restaurant-menu-plural" author="system">
    <update tableName="app_menu">
        <column name="route_path" value="/restaurants"/>
        <where>route_path = '/restaurant' AND menu_key LIKE '%restaurant%'</where>
    </update>
</changeSet>
```

### Step 2: Rename Frontend Routes

**Action:** Rename directory from `restaurant` to `restaurants`

```bash
cd /home/sivakumar/Shiva/Workspace/rms-web-app

# Rename directory
mv app/\(dashboard\)/restaurant app/\(dashboard\)/restaurants

# Verify
ls app/\(dashboard\)/restaurants/
# Should show: page.tsx, create/, [id]/
```

### Step 3: Update Internal Links (Frontend)

**Files to update:** 5 files, 11 references

**File 1:** `app/(dashboard)/restaurants/page.tsx` (3 changes)
```typescript
// Line 85: Create button
<Link href="/restaurants/create">  // was: /restaurant/create

// Line 99: Empty state
<Link href="/restaurants/create">  // was: /restaurant/create

// Line 145: Edit path
editPath={(item) => `/restaurants/${item.id}`}  // was: /restaurant/${item.id}
```

**File 2:** `app/(dashboard)/restaurants/create/page.tsx` (3 changes)
```typescript
// Line 58: Success redirect
router.push('/restaurants');  // was: /restaurant

// Line 73: Back button
<Link href="/restaurants">  // was: /restaurant

// Line 237: Cancel button
onCancel={() => router.push('/restaurants')}  // was: /restaurant
```

**File 3:** `app/(dashboard)/restaurants/[id]/page.tsx` (3 changes)
```typescript
// Line 101: Success redirect
router.push('/restaurants');  // was: /restaurant

// Line 121: Back button
<Link href="/restaurants">  // was: /restaurant

// Line 285: Cancel button
onCancel={() => router.push('/restaurants')}  // was: /restaurant
```

**File 4:** `app/(dashboard)/page.tsx` (1 change)
```typescript
// Line 73: Comment update
Navigate to /restaurants to manage restaurants.  // was: /restaurant
```

**File 5:** `app/(dashboard)/dashboard/page.tsx` (1 change)
```typescript
// Line 73: Comment update
Navigate to /restaurants to manage restaurants.  // was: /restaurant
```

### Step 4: Verify Build

```bash
npm run build

# Expected output:
# Route (app)
# ├ ○ /restaurants         ✅ PLURAL (matches API)
# ├ ƒ /restaurants/[id]    ✅ PLURAL
# └ ○ /restaurants/create  ✅ PLURAL
```

---

## Verification Checklist

### Backend Verification

```bash
# Test API endpoint (should work)
curl -X GET "https://console.atparui.com/services/rms-service/api/restaurants" \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK with restaurant list
```

### Frontend Verification

```bash
# 1. Check menu loads
curl "https://console.atparui.com/services/rms-service/api/app-menus/tree?appKey=RMS" \
  -H "Authorization: Bearer $TOKEN"

# Should show:
# {
#   "label": "Restaurants",
#   "routePath": "/restaurants",  ← PLURAL
#   ...
# }
```

### Browser Verification

1. ✅ Login to application
2. ✅ Click "Restaurants" menu → navigates to `/restaurants`
3. ✅ Click "Create Restaurant" → navigates to `/restaurants/create`
4. ✅ Click edit on a restaurant → navigates to `/restaurants/{id}`
5. ✅ Check DevTools Network tab:
   - Request URL: `https://console.atparui.com/services/rms-service/api/restaurants`
   - Request Headers: `Authorization: Bearer eyJ...` (token present)
   - Status: `200 OK` (not 401)

---

## Expected Results

### Before Fix

❌ **Menu Click:**
```
User clicks "Restaurants" menu
  ↓ Menu configured as /restaurant (singular)
  ↓ Frontend route: /restaurant
  ↓ API call: /api/restaurants (plural - mismatch!)
  ↓ Result: Works but inconsistent
```

❌ **API Calls:**
```
Request: GET /api/restaurants
Headers: (no Authorization header)
Response: 401 Unauthorized
```

### After Fix

✅ **Menu Click:**
```
User clicks "Restaurants" menu
  ↓ Menu configured as /restaurants (plural)
  ↓ Frontend route: /restaurants (plural)
  ↓ API call: /api/restaurants (plural)
  ↓ Result: Perfect consistency! ✅
```

✅ **API Calls:**
```
Request: GET /api/restaurants
Headers: Authorization: Bearer eyJ...
Response: 200 OK
```

---

## Benefits of This Fix

### 1. Consistency Across All Layers

```
✅ Database Table:    restaurants          (PLURAL)
✅ Backend API:       /api/restaurants     (PLURAL)
✅ Frontend Route:    /restaurants         (PLURAL)
✅ Menu Config:       /restaurants         (PLURAL)
✅ URL in Browser:    /restaurants         (PLURAL)
```

### 2. Follows Industry Standards

- RESTful API design principles
- Spring Boot / JHipster conventions
- Next.js routing best practices
- Major API patterns (GitHub, Stripe, etc.)

### 3. Enables Automation

```typescript
// Can auto-generate from OpenAPI spec
const spec = await loadOpenAPI();
for (const path of spec.paths) {
  // /api/restaurants → restaurantsApi
  // /api/restaurants → app/restaurants/page.tsx
  // /api/restaurants → Menu: "Restaurants" → /restaurants
  
  generateApiClient(path);
  generateCRUDPages(path);
  generateMenuEntry(path);
}
```

### 4. Prevents Future Confusion

Developers won't need to remember:
- "Is it plural in the API but singular in the frontend?"
- "Which layer uses which convention?"
- "Do I need to translate the URL?"

**Answer:** Everything is PLURAL. Simple!

### 5. Token Issue Resolved

```typescript
// Before: Token not attached
fetch('/api/restaurants')  
// Headers: (empty) → 401 Unauthorized

// After: Token attached automatically
fetch('/api/restaurants')  
// Headers: Authorization: Bearer eyJ... → 200 OK
```

---

## Rollout Plan

### Phase 1: Backend (Database) ✅
1. Create Liquibase migration or run SQL
2. Update menu config to use `/restaurants`
3. Deploy to database
4. **Timeline:** 5 minutes

### Phase 2: Frontend ✅
1. Rename `restaurant/` → `restaurants/`
2. Update all internal links (11 references)
3. Update Keycloak provider (token localStorage)
4. Test build
5. **Timeline:** 15 minutes

### Phase 3: Deploy 🚀
1. Commit all changes
2. Push to trigger Jenkins
3. Jenkins builds Docker image
4. Deploy to server
5. **Timeline:** 10 minutes (automated)

### Phase 4: Verify ✅
1. Test menu navigation
2. Test CRUD operations
3. Check token in API calls
4. **Timeline:** 10 minutes

**Total Time:** ~40 minutes

---

## Future-Proofing

### Convention Enforcement

**Add to `.eslintrc.json`:**
```json
{
  "rules": {
    "api-routes-plural": {
      "pattern": "^/api/[a-z-]+s(/|$)",
      "message": "API routes must use plural nouns"
    }
  }
}
```

**Add to CI/CD:**
```yaml
# .github/workflows/conventions.yml
- name: Check Naming Conventions
  run: |
    # Check that all API routes are plural
    if grep -r '@RequestMapping("/api/[a-z]*[^s]")' src/; then
      echo "❌ Found singular API route"
      exit 1
    fi
```

### Documentation

✅ Created: `docs/NAMING_CONVENTIONS_STANDARD.md`  
✅ All developers must follow  
✅ Review in onboarding  
✅ Reference in PR templates

---

## Migration Script

**Run this automated script:**

```bash
#!/bin/bash
# migrate-to-plural-conventions.sh

set -e

echo "🔧 Migrating to PLURAL conventions..."

# Step 1: Check if we're in the right directory
if [ ! -d "app/(dashboard)" ]; then
  echo "❌ Error: Must run from rms-web-app root"
  exit 1
fi

# Step 2: Rename directory
echo "📁 Renaming restaurant → restaurants..."
if [ -d "app/(dashboard)/restaurant" ]; then
  mv "app/(dashboard)/restaurant" "app/(dashboard)/restaurants"
  echo "✅ Directory renamed"
else
  echo "⚠️  Directory already named 'restaurants'"
fi

# Step 3: Update all /restaurant references to /restaurants
echo "🔍 Updating internal links..."
find app/(dashboard)/restaurants -name "*.tsx" -type f -exec sed -i 's|/restaurant|/restaurants|g' {} \;
find app/(dashboard)/{page.tsx,dashboard/page.tsx} -type f -exec sed -i 's|/restaurant|/restaurants|g' {} \;
echo "✅ Links updated"

# Step 4: Build test
echo "🏗️  Testing build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Build successful"
else
  echo "❌ Build failed - please review"
  exit 1
fi

echo ""
echo "🎉 Migration complete!"
echo ""
echo "Next steps:"
echo "1. Update database menu config (see SQL above)"
echo "2. Commit changes: git add . && git commit -m 'fix: Use plural conventions'"
echo "3. Push: git push origin main"
```

---

## Summary

| Issue | Fix | Status |
|-------|-----|--------|
| Token not attached (401) | Store in localStorage | ✅ Fixed |
| Inconsistent naming | Use PLURAL everywhere | ⏳ Ready to fix |
| Future conventions | Official standard doc | ✅ Created |

**Official Convention:** ✅ **PLURAL for all user-facing URLs**

**Next Action:** 
1. Run database migration (update menu)
2. Run migration script (rename routes)
3. Test and deploy

---

**Created:** 2026-02-08  
**Status:** Ready for implementation  
**Approval Required:** Yes - this is a breaking change for menu config
