# Final Conventions Decision Summary

## TL;DR - Your Questions Answered

**Q1:** "Tables are singular - should we change them?"  
**A1:** ❌ **NO! Keep them singular. My documentation was wrong. Tables are CORRECT.**

**Q2:** "State in URL - is it because of token storage?"  
**A2:** ❌ **NO! Token is in localStorage (correct). Need to see URL to diagnose.**

**Q3:** "What are the proper conventions?"  
**A3:** ✅ **See below - official standard established.**

---

## Official Convention Standard (FINAL)

### The Simple Rule

> **Database = SINGULAR, User-Facing = PLURAL**

```
Database Table:  restaurant       (SINGULAR - one record)
REST API:        /api/restaurants (PLURAL - collection)  
Frontend:        /restaurants     (PLURAL - match API)
Menu:            /restaurants     (PLURAL - user-facing)
Entity/Class:    Restaurant       (SINGULAR - one object)
```

---

## Complete Convention Matrix

| Layer | Pattern | Example | Reason |
|-------|---------|---------|--------|
| **Database Table** | singular_snake | `restaurant` | JHipster: one entity = one table |
| **Database Table** | singular_snake | `menu_item` | Matches entity name |
| **Table Exception** | plural_snake | `orders` | "order" is SQL keyword |
| | | | |
| **REST API** | plural-kebab | `/api/restaurants` | RESTful: collection endpoint |
| **REST API** | plural-kebab | `/api/menu-items` | Industry standard |
| | | | |
| **Frontend** | plural-kebab | `/restaurants` | Matches API plurals |
| **Frontend** | plural-kebab | `/menu-items` | User-facing |
| | | | |
| **Menu Config** | plural-kebab | `/restaurants` | Matches frontend |
| | | | |
| **Java Entity** | PascalCase | `Restaurant` | One class = one concept |
| **Java Service** | PascalCase | `RestaurantService` | Java convention |
| **TypeScript** | PascalCase | `Restaurant` | One type = one concept |
| **API Client** | camelCase | `restaurantApi` | Variable naming |

---

## Why Different Per Layer?

### Each Layer Has Different Semantics

**Database Table (SINGULAR):**
```sql
-- Represents: ONE ROW in the table
SELECT * FROM restaurant WHERE id = 1;
-- "Get from the restaurant table"
```

**REST API (PLURAL):**
```
-- Represents: COLLECTION endpoint
GET /api/restaurants
-- "Get the collection of restaurants"
```

**Frontend (PLURAL):**
```
-- Represents: PAGE showing collection
URL: /restaurants
-- "The restaurants page" (usually shows multiple)
```

**Entity Class (SINGULAR):**
```java
-- Represents: ONE INSTANCE
Restaurant restaurant = new Restaurant();
-- "A restaurant object"
```

---

## Current State Analysis

### ✅ What's Already Correct

```
Database:
  ✅ restaurant (singular)
  ✅ menu_item (singular)
  ✅ branch (singular)
  ✅ orders (plural - exception for SQL keyword)

Backend API:
  ✅ /api/restaurants (plural)
  ✅ /api/menu-items (plural)
  ✅ /api/branches (plural)

Java Code:
  ✅ Restaurant (singular entity)
  ✅ RestaurantService (singular)
  ✅ RestaurantRepository (singular)

Token Storage:
  ✅ localStorage.setItem('kc_token', token)
  ✅ Authorization header (not URL)
```

### ❌ What Needs Fixing

```
Frontend Routes:
  ❌ /restaurant (currently singular)
  ✅ /restaurants (should be plural to match API)

Menu Config:
  ❌ /restaurant (currently singular)
  ✅ /restaurants (should be plural to match frontend)

URL State:
  ⚠️ Unknown - need to see actual URL
```

---

## Decision Matrix

| Question | Decision | Rationale |
|----------|----------|-----------|
| **Database tables: Plural or Singular?** | **SINGULAR** | JHipster standard, entity symmetry |
| **Should we change tables?** | **NO** | Current naming is correct |
| **REST APIs: Plural or Singular?** | **PLURAL** | RESTful standard, already correct |
| **Frontend: Plural or Singular?** | **PLURAL** | Must match API |
| **Should we change frontend?** | **YES** | To match API (consistency) |
| **Token in localStorage?** | **YES** | Standard pattern for SPAs |
| **Token in URL?** | **NO** | Security issue if present |

---

## Action Plan

### ✅ Completed

1. [x] Fixed token 401 errors (localStorage sync)
2. [x] Fixed API gateway URL (console.atparui.com)
3. [x] Fixed API service path (/services/rms-service/api)
4. [x] Added missing UI components
5. [x] Fixed TypeScript errors
6. [x] Corrected conventions documentation

### ⏳ Pending (Need Your Approval)

1. [ ] **Rename frontend routes:**
   - `app/(dashboard)/restaurant/` → `app/(dashboard)/restaurants/`
   - Update 11 internal links

2. [ ] **Update menu configuration:**
   ```sql
   UPDATE app_menu 
   SET route_path = '/restaurants'
   WHERE route_path = '/restaurant';
   ```

3. [ ] **Investigate URL state issue:**
   - Need screenshot or copy-paste of URL
   - Will provide specific fix once seen

---

## Why This Matters

### Automation & Code Generation

With consistent conventions, we can auto-generate code:

```typescript
// From OpenAPI spec
const spec = loadOpenAPI();

// /api/restaurants (PLURAL API)
generateFromEndpoint('/api/restaurants', {
  // Auto-infers:
  tableName: 'restaurant',          // SINGULAR (convention)
  entityClass: 'Restaurant',         // SINGULAR (Java)
  frontendRoute: '/restaurants',     // PLURAL (matches API)
  menuPath: '/restaurants',          // PLURAL (user-facing)
});

// Result: Consistent code across all layers!
```

**Without conventions, automation fails!**

### Developer Experience

**With conventions:**
- ✅ No mental translation needed
- ✅ Predictable patterns
- ✅ Easier onboarding
- ✅ Faster development

**Without conventions:**
- ❌ Is it plural here? Singular there?
- ❌ Need to look up each time
- ❌ Inconsistency breeds bugs
- ❌ Confusing for new developers

---

## Examples from the Codebase

### Example 1: Restaurant Resource

```
Database:   SELECT * FROM restaurant       (SINGULAR)
            ↓
Entity:     Restaurant.java                (SINGULAR)
            ↓
Service:    RestaurantService.java         (SINGULAR)
            ↓
Controller: @RequestMapping("/api/restaurants")  (PLURAL)
            ↓
Frontend:   /restaurants                   (PLURAL - must match!)
```

### Example 2: Menu Item Resource

```
Database:   SELECT * FROM menu_item        (SINGULAR)
            ↓
Entity:     MenuItem.java                  (SINGULAR)
            ↓  
Service:    MenuItemService.java           (SINGULAR)
            ↓
Controller: @RequestMapping("/api/menu-items")  (PLURAL)
            ↓
Frontend:   /menu-items                    (PLURAL - must match!)
```

---

## SQL Reserved Words - Important!

### When Singular Is a Keyword, Use Plural

```sql
❌ CREATE TABLE order (...);       -- ERROR: "order" is keyword
✅ CREATE TABLE orders (...);      -- OK: Plural avoids conflict

❌ CREATE TABLE group (...);       -- ERROR: "group" is keyword  
✅ CREATE TABLE groups (...);      -- OK: Plural avoids conflict
✅ CREATE TABLE user_group (...);  -- OK: Compound avoids conflict
```

### Safe Words (Use Singular)

```sql
✅ restaurant  -- Not a keyword
✅ branch      -- Not a keyword
✅ customer    -- Not a keyword
✅ menu_item   -- Not a keyword
```

---

## Next Steps

### Immediate Actions

1. **Provide URL screenshot/details:**
   - What does the URL look like when you navigate?
   - Is there `?state=` or `#` in the URL?

2. **Approve plural frontend routes:**
   - Rename `/restaurant` → `/restaurants`
   - Update menu config in database
   - Update internal links

### After Approval

I will immediately:
1. Fix URL state issue (once seen)
2. Rename frontend routes to plural
3. Provide SQL for menu config update
4. Test everything end-to-end
5. Create final commit
6. Mark conventions as LOCKED

---

## Official Convention Reference

### Use This Checklist for All Future Development

**When creating a new resource (e.g., "Customer"):**

```
Step 1: Database Table
  → Name: customer (SINGULAR)
  → Exception: Use plural if "customer" was SQL keyword

Step 2: Java Entity
  → Class: Customer (SINGULAR, PascalCase)
  → @Table(name = "customer")

Step 3: Java Service/Repository
  → CustomerService (SINGULAR)
  → CustomerRepository (SINGULAR)

Step 4: REST API
  → @RequestMapping("/api/customers")  (PLURAL)

Step 5: TypeScript
  → interface Customer (SINGULAR)
  → const customerApi (SINGULAR variable)

Step 6: Frontend
  → app/(dashboard)/customers/ (PLURAL folder)
  → Route: /customers (PLURAL URL)

Step 7: Menu
  → label: "Customers"
  → routePath: "/customers" (PLURAL)
```

**Follow this checklist = Consistency guaranteed!**

---

## Summary

### Corrected Understanding

| My Original Doc | Reality | Correction |
|----------------|---------|------------|
| "Tables should be PLURAL" | Tables ARE singular | ❌ Doc was wrong |
| "Token in URL is wrong" | Token NOT in URL | ✅ Already correct |
| "Frontend should be plural" | Currently singular | ⏳ Need to fix |

### Official Decisions

1. ✅ **Database tables: SINGULAR** (keep current)
2. ✅ **REST APIs: PLURAL** (already correct)
3. ✅ **Frontend routes: PLURAL** (need to rename)
4. ✅ **Token: localStorage** (already correct)
5. ⏳ **URL state: TBD** (need to see URL)

### Status

- ✅ Token 401: Fixed
- ✅ Conventions: Documented (corrected)
- ✅ Tables: No change needed
- ⏳ Frontend: Pending rename to plural
- ⏳ URL state: Pending investigation

---

## What I Need From You

1. **📸 Screenshot or exact URL text** showing the "state in URL" issue
   ```
   Example: https://rms-demo.atparui.com/restaurant?state=xyz&session_state=abc
   ```

2. **✅ Approval** to rename frontend routes to plural:
   - `/restaurant` → `/restaurants`
   - Update menu database
   - Update internal links

3. **✅ Confirmation** this will be the FINAL standard going forward

---

**Once you approve, I'll implement immediately and we'll never worry about conventions again!**

**This standard will enable:**
- ✅ Code generation from OpenAPI specs
- ✅ Automated CRUD page creation
- ✅ Consistent development patterns
- ✅ Easy onboarding for new developers
- ✅ No more confusion about naming

---

**Prepared By:** AI Assistant  
**Date:** 2026-02-08  
**Status:** ✅ Ready for Final Approval  
**Priority:** HIGH - Establishes foundation for all future work
