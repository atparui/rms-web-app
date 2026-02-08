# Restaurant Route Name Fix

## Problem

Browser DevTools showed 404 errors:
```
GET /restaurant 404 in 99ms
GET /restaurant 404 in 88ms
GET /restaurant 404 in 68ms
```

But the frontend had routes created as `/restaurants` (plural).

## Root Cause

**Mismatch between backend menu configuration and frontend routes:**

- **Backend Menu** (from database/API): Returns `/restaurant` (singular)
- **Frontend Routes** (created): Used `/restaurants` (plural)

The menu data comes from the backend API (`/app-menus/tree`), which is configured in the database. When users click the menu link, it tries to navigate to `/restaurant`, but the page was created at `/restaurants`.

## How Menu Works

```typescript
// lib/menu.ts
export function useMenuTree() {
  return useQuery({
    queryFn: async () => {
      return fetchJson<MenuTreeNode[]>(`/app-menus/tree${suffix}`, { token });
      // Returns menu items with routePath like "/restaurant"
    },
  });
}
```

The menu is **not hardcoded** - it comes from the backend database configuration.

## The Fix

### 1. Renamed Directory

```bash
# Before
app/(dashboard)/restaurants/
  - page.tsx          # /restaurants (plural)
  - create/
    - page.tsx        # /restaurants/create
  - [id]/
    - page.tsx        # /restaurants/[id]

# After
app/(dashboard)/restaurant/
  - page.tsx          # /restaurant (singular) ✅
  - create/
    - page.tsx        # /restaurant/create ✅
  - [id]/
    - page.tsx        # /restaurant/[id] ✅
```

### 2. Updated All Internal Links

Changed 6 occurrences of `/restaurants` → `/restaurant`:

**List Page** (`app/(dashboard)/restaurant/page.tsx`):
```typescript
// Line 85: Create button link
<Link href="/restaurant/create">  // was: /restaurants/create

// Line 99: Empty state action
<Link href="/restaurant/create">  // was: /restaurants/create

// Line 145: Edit path in DataTable
editPath={(item) => `/restaurant/${item.id}`}  // was: /restaurants/${item.id}
```

**Create Page** (`app/(dashboard)/restaurant/create/page.tsx`):
```typescript
// Line 58: Success redirect
router.push('/restaurant');  // was: /restaurants

// Line 73: Back button
<Link href="/restaurant">  // was: /restaurants

// Line 237: Cancel button
onCancel={() => router.push('/restaurant')}  // was: /restaurants
```

**Edit Page** (`app/(dashboard)/restaurant/[id]/page.tsx`):
```typescript
// Line 101: Success redirect
router.push('/restaurant');  // was: /restaurants

// Line 121: Back button
<Link href="/restaurant">  // was: /restaurants

// Line 285: Cancel button
onCancel={() => router.push('/restaurant')}  // was: /restaurants
```

## Files Changed

### Modified Files (3)
```
app/(dashboard)/restaurant/page.tsx         - 3 changes
app/(dashboard)/restaurant/create/page.tsx  - 3 changes
app/(dashboard)/restaurant/[id]/page.tsx    - 3 changes
```

**Total:** 9 route references updated

### Directory Renamed
```
app/(dashboard)/restaurants/  →  app/(dashboard)/restaurant/
```

## Build Verification

```bash
npm run build
```

**Result:**
```
✓ Compiled successfully in 4.4s
✓ Running TypeScript ...
✓ Generating static pages (8/8) in 721.3ms

Route (app)
├ ○ /restaurant              ← List page ✅
├ ƒ /restaurant/[id]          ← Edit page ✅
└ ○ /restaurant/create        ← Create page ✅
```

## Why This Happens

### Next.js File-Based Routing

Next.js creates routes based on folder structure:

```
app/
  (dashboard)/
    restaurant/         → /restaurant
      page.tsx         → /restaurant (GET)
      create/
        page.tsx       → /restaurant/create
      [id]/
        page.tsx       → /restaurant/:id
```

The **folder name** determines the **URL path**.

### Backend Menu Configuration

The backend menu is typically configured in the database with entries like:

```sql
INSERT INTO app_menu (label, route_path, ...) VALUES
  ('Restaurants', '/restaurant', ...);  -- Note: singular
```

When there's a mismatch, users click the menu but get 404.

## Naming Convention

### Backend Pattern (Spring Boot)
```
Resource Controller → Menu Route Path
RestaurantResource  → /restaurant  (singular)
BranchResource      → /branch      (singular)
UserResource        → /user        (singular)
```

Spring Boot typically uses **singular** for resource paths because it represents "the restaurant resource endpoint".

### Frontend Pattern (Next.js)
Should **match** the backend menu configuration:
```
/restaurant   → app/(dashboard)/restaurant/
/branch       → app/(dashboard)/branch/
/user         → app/(dashboard)/user/
```

## Best Practice

**Always check the backend menu configuration before creating frontend routes:**

```bash
# 1. Check menu API endpoint
curl "https://console.atparui.com/services/rms-service/api/app-menus/tree?appKey=RMS" \
  -H "Authorization: Bearer $TOKEN"

# Response shows:
{
  "label": "Restaurants",
  "routePath": "/restaurant",  ← Use THIS for folder name
  ...
}

# 2. Create frontend route to match
mkdir -p app/(dashboard)/restaurant
```

## Testing

### 1. Local Development

```bash
npm run dev

# Navigate to:
# - http://localhost:3000/restaurant          (list)
# - http://localhost:3000/restaurant/create   (create)
# - http://localhost:3000/restaurant/123      (edit)
```

### 2. After Deployment

Check browser DevTools Network tab:
```
✅ GET /restaurant 200 OK
✅ No 404 errors
```

### 3. Menu Click Test

1. Login to application
2. Click "Restaurants" in sidebar menu
3. Should navigate to `/restaurant` and load successfully
4. No 404 errors in console

## Impact

### Before Fix
```
User clicks menu → /restaurant (from backend)
Frontend route   → /restaurants (mismatch)
Result           → 404 Not Found ❌
```

### After Fix
```
User clicks menu → /restaurant (from backend)
Frontend route   → /restaurant (match)
Result           → 200 OK ✅
```

## Lesson Learned

**Frontend routes must match backend menu configuration**, not your preferred naming convention. The menu is data-driven from the backend database, so:

1. ✅ Always check `/app-menus/tree` API response first
2. ✅ Use exact `routePath` values for folder names
3. ✅ Don't assume plural/singular - check the actual menu data
4. ❌ Don't create routes based on "what sounds right"

## Summary

**Problem:** Frontend routes (`/restaurants`) didn't match backend menu (`/restaurant`)  
**Root Cause:** Assumed plural naming, didn't check backend menu config  
**Solution:** Renamed directory and updated all internal links to use singular  
**Result:** Routes now work, menu navigation succeeds ✅

---

**Fixed:** 2026-02-08  
**Issue:** 404 errors due to route name mismatch  
**Files Changed:** 3 files (9 route references)  
**Status:** Resolved - Build succeeds, routes match backend menu
