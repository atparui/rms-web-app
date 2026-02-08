# Final Naming Conventions Decision

## Executive Summary

**Date:** 2026-02-08  
**Status:** ✅ Official Standard - Final Decision  
**Valid:** All future development must follow this

---

## Issue 1: Database Table Naming ✅ RESOLVED

### Your Observation

> "We have tables created in singular which is not right as per your document"

### Analysis

You're **100% correct** - my initial document was **WRONG**! 

**I said:** Tables should be PLURAL  
**Reality:** Tables ARE SINGULAR (and this is correct!)

### Corrected Standard: Database Tables = SINGULAR ✅

```sql
✅ CORRECT (Current State - DO NOT CHANGE):
restaurant          -- SINGULAR table
branch              -- SINGULAR table
menu_item           -- SINGULAR table
bill                -- SINGULAR table
customer            -- SINGULAR table

✅ EXCEPTION (SQL reserved word):
orders              -- PLURAL (because "order" is SQL keyword)
```

### Why Singular Is Correct

**1. JHipster Standard**
- This project uses JHipster conventions
- JHipster always uses singular table names
- Matches entity-to-table mapping (one-to-one)

**2. Semantic Clarity**
```sql
-- Reads naturally
SELECT * FROM restaurant WHERE id = 1;
-- "Get from THE restaurant table"

-- Clearer joins
SELECT r.name, b.location
FROM restaurant r
JOIN branch b ON r.id = b.restaurant_id;
-- "The restaurant's name, the branch's location"
```

**3. Entity Symmetry**
```java
@Entity
@Table(name = "restaurant")  // Matches entity name ✅
public class Restaurant { }  // Perfect symmetry
```

### Decision: ✅ KEEP TABLES AS SINGULAR

**DO NOT RENAME TABLES!** Current naming is correct.

---

## Issue 2: REST API vs Frontend Mismatch ⚠️

### Current State

```
✅ Database Table:  restaurant       (SINGULAR - correct!)
✅ REST API:        /api/restaurants (PLURAL - correct!)
❌ Frontend Route:  /restaurant      (SINGULAR - wrong!)
❌ Menu Config:     /restaurant      (SINGULAR - wrong!)
```

### Problem

**Frontend doesn't match API!**

```
User clicks menu → /restaurant (singular)
Page calls API → /api/restaurants (plural)
Works, but inconsistent! ❌
```

### Decision: Frontend & Menu = PLURAL ✅

**Why?**
1. ✅ REST APIs are **always plural** (industry standard)
2. ✅ Frontend routes should **match API** (consistency)
3. ✅ Menu should **match frontend** (user expectation)
4. ✅ URLs represent **collections** (semantic)

**Changes Needed:**
- Frontend: `/restaurant` → `/restaurants`
- Menu DB: `/restaurant` → `/restaurants`

---

## Official Convention Standard (CORRECTED)

### Complete Matrix

| Layer | Convention | Example | Plural/Singular |
|-------|-----------|---------|-----------------|
| **Database Table** | singular_snake | `restaurant` | **SINGULAR** ✅ |
| **Database Table** | singular_snake | `menu_item` | **SINGULAR** ✅ |
| **Database Table** | plural_snake (exception) | `orders` | **PLURAL** (keyword) |
| | | | |
| **REST API URL** | plural-kebab | `/api/restaurants` | **PLURAL** ✅ |
| **REST API URL** | plural-kebab | `/api/menu-items` | **PLURAL** ✅ |
| | | | |
| **Frontend Route** | plural-kebab | `/restaurants` | **PLURAL** ✅ |
| **Frontend Route** | plural-kebab | `/menu-items` | **PLURAL** ✅ |
| | | | |
| **Menu Config** | plural-kebab | `/restaurants` | **PLURAL** ✅ |
| | | | |
| **Java Entity** | PascalCase | `Restaurant` | **SINGULAR** ✅ |
| **Java Service** | PascalCase | `RestaurantService` | **SINGULAR** ✅ |
| **TypeScript Type** | PascalCase | `Restaurant` | **SINGULAR** ✅ |
| **API Client** | camelCase | `restaurantApi` | **SINGULAR** ✅ |

---

## The Rule (Simple!)

### 👉 **"Database is SINGULAR, Everything User-Facing is PLURAL"**

**Database Layer (Internal):**
```sql
-- SINGULAR (one record)
restaurant
menu_item
branch
```

**API Layer (User-Facing):**
```
-- PLURAL (collection endpoint)
/api/restaurants
/api/menu-items
/api/branches
```

**Frontend Layer (User-Facing):**
```
-- PLURAL (matches API)
/restaurants
/menu-items  
/branches
```

**Code Layer (Internal):**
```java
// SINGULAR (one class = one instance)
class Restaurant { }
interface RestaurantRepository { }
```

---

## Why This Makes Sense

### Semantics Matter!

**Database:**
- Each row = ONE record
- Table contains restaurant records
- Query: "Get THE restaurant where id = 1"
- **Singular:** `restaurant` ✅

**REST API:**
- Endpoint serves MANY resources
- Collection of restaurants
- Request: "Get ALL restaurants"
- **Plural:** `/api/restaurants` ✅

**Frontend:**
- Page displays MANY items (usually)
- Route: "The restaurants page"
- URL: "Navigate to restaurants"
- **Plural:** `/restaurants` ✅

### Example Flow

```
User clicks: "Restaurants" menu
  ↓ Navigate to
Frontend: /restaurants (PLURAL - multiple items)
  ↓ Calls
API: GET /api/restaurants (PLURAL - collection)
  ↓ Queries
Database: SELECT * FROM restaurant (SINGULAR - one table)
  ↓ Maps to
Entity: Restaurant (SINGULAR - one class)
  ↓ Returns
Result: List<Restaurant> (collection of singular items)
```

**Perfect consistency at each layer!**

---

## Implementation Plan

### ✅ Step 1: Token Fix (DONE)

Updated `components/auth/keycloak-provider.tsx`:
- Store token in localStorage on login
- Update on refresh
- Clear on logout

**Result:** 401 errors fixed ✅

### ⏳ Step 2: Rename Frontend Routes

```bash
# Rename directory
cd /home/sivakumar/Shiva/Workspace/rms-web-app
mv app/\(dashboard\)/restaurant app/\(dashboard\)/restaurants

# Update all internal links (11 references in 5 files)
# - /restaurant → /restaurants
```

### ⏳ Step 3: Update Menu Configuration

**Option A: SQL Update (Quick)**
```sql
UPDATE app_menu 
SET route_path = '/restaurants'
WHERE route_path = '/restaurant';
```

**Option B: Liquibase Migration (Better)**
```xml
<!-- src/main/resources/config/liquibase/changelog/fix_menu_plural.xml -->
<changeSet id="fix-restaurant-menu-plural" author="system">
    <update tableName="app_menu">
        <column name="route_path" value="/restaurants"/>
        <where>route_path = '/restaurant'</where>
    </update>
</changeSet>
```

### ⏳ Step 4: Verify & Deploy

```bash
# Build test
npm run build

# Commit
git add .
git commit -m "fix: Use plural conventions for frontend routes

- Rename /restaurant → /restaurants (match API)
- Fix token localStorage sync (401 fix)  
- Update conventions documentation"

# Deploy
git push origin main
```

---

## Convention Enforcement

### Code Review Checklist

**Database Layer:**
- [ ] New tables use SINGULAR names (`restaurant`, not `restaurants`)
- [ ] Exception: Plural if singular is SQL keyword (`orders` not `order`)
- [ ] Use snake_case for multi-word (`menu_item`, not `menuItem`)

**API Layer:**
- [ ] Endpoints use PLURAL (`/api/restaurants`, not `/api/restaurant`)
- [ ] Use kebab-case for multi-word (`/api/menu-items`)
- [ ] Controller class is SINGULAR (`RestaurantResource`)

**Frontend Layer:**
- [ ] Routes use PLURAL (`/restaurants`, not `/restaurant`)
- [ ] Routes match API plurals exactly
- [ ] Directory names match routes

**Code Layer:**
- [ ] Entities/Types are SINGULAR (`Restaurant`, not `Restaurants`)
- [ ] Services are SINGULAR (`RestaurantService`)
- [ ] Variables are SINGULAR for one, plural for collections

---

## SQL Reserved Keywords Reference

### When to Use PLURAL Table Names

Only use plural if singular is a SQL reserved keyword:

```sql
✅ orders       -- "order" = ORDER BY keyword
✅ groups       -- "group" = GROUP BY keyword
✅ users        -- "user" can be problematic

Alternatives (prefix instead):
✅ rms_user     -- Safer than "user"
✅ app_order    -- Alternative to "orders"
✅ user_group   -- Alternative to "groups"
```

### Safe Words (Use SINGULAR)

```sql
✅ restaurant
✅ branch
✅ customer
✅ bill
✅ menu_item
✅ discount
✅ inventory
✅ payment
✅ table_assignment  -- "table" is keyword but compound name is safe
```

---

## Documentation Updates

### Files to Update

1. ✅ `CORRECTED_NAMING_CONVENTIONS.md` - Created (this file)
2. ⏳ `NAMING_CONVENTIONS_STANDARD.md` - Needs correction
3. ✅ `CONVENTION_CORRECTION.md` - Explains the fix
4. ✅ `CONVENTION_FIX_PLAN.md` - Implementation plan

### Official Reference

**Going forward, use:** `CORRECTED_NAMING_CONVENTIONS.md`  
**Deprecate:** Original `NAMING_CONVENTIONS_STANDARD.md` (had errors)

---

## Quick Reference Card (CORRECTED)

```
┌─────────────────────────────────────────────────────────────┐
│           OFFICIAL NAMING CONVENTIONS (CORRECTED)           │
├─────────────────────────────────────────────────────────────┤
│ DATABASE:                                                   │
│   Tables:        restaurant (SINGULAR)                     │
│   Columns:       contact_email (snake_case)                │
│   Exception:     orders (PLURAL if keyword)                │
│                                                             │
│ REST API:                                                   │
│   Endpoints:     /api/restaurants (PLURAL)                 │
│   Multi-word:    /api/menu-items (kebab-case)              │
│                                                             │
│ FRONTEND:                                                   │
│   Routes:        /restaurants (PLURAL, match API)          │
│   Components:    RestaurantList.tsx (PascalCase)           │
│                                                             │
│ CODE:                                                       │
│   Entities:      Restaurant (SINGULAR)                     │
│   Services:      RestaurantService (SINGULAR)              │
│   Variables:     restaurant (one), restaurants (many)      │
│                                                             │
│ INFRASTRUCTURE:                                             │
│   Services:      rms-service (kebab-case)                  │
│   Databases:     rms_demo (snake_case)                     │
│   Domains:       rms-demo.atparui.com (kebab-case)         │
└─────────────────────────────────────────────────────────────┘
```

---

## Your Questions Answered

### Q1: "Should we change tables as per documentation?"

**A:** ❌ **NO! The tables are CORRECT. The documentation was WRONG.**

- Current tables: SINGULAR ✅
- My original doc: Said PLURAL ❌ (error)
- Decision: Keep tables as SINGULAR, update documentation

**Action:** ✅ DO NOTHING to database tables

### Q2: "State coming in URL - is it because token stored in state?"

**A:** ❌ **NO! Token storage is NOT related to URL.**

- Token stored in: `localStorage` (not URL)
- Token sent in: `Authorization` header (not URL)
- URL state: Likely Next.js router or React Query devtools

**Action:** Please share what you see in the URL so I can identify and fix it

**Expected URL:**
```
✅ https://rms-demo.atparui.com/restaurant
❌ https://rms-demo.atparui.com/restaurant?state=xxx
❌ https://rms-demo.atparui.com/restaurant#state=xxx
```

If you see `?state=` or `#state=`, that's wrong and we'll fix it.

### Q3: "Is it the right way?"

**A:** ✅ **YES! Token in localStorage is correct.**

```typescript
// This is the standard pattern:
1. Login → Store token in localStorage
2. API call → Read from localStorage → Add to header
3. Logout → Clear localStorage

// Token flow:
localStorage.setItem('kc_token', token);           // Storage
const token = localStorage.getItem('kc_token');    // Retrieval
headers: { Authorization: `Bearer ${token}` }      // Usage

// ✅ NOT in URL (insecure!)
// ✅ NOT in cookies (for SPA with separate auth)
// ✅ localStorage (standard for JWTs in SPAs)
```

---

## Final Decisions

### ✅ Decision 1: Database Tables Stay SINGULAR

**Rationale:**
- JHipster convention
- Current standard is correct
- Entity-table symmetry
- No changes needed

**Tables:**
```
restaurant, branch, menu_item, bill, customer, etc.
```

**Exception:**
```
orders (plural - because "order" is SQL keyword)
```

### ✅ Decision 2: Frontend Routes Must Be PLURAL

**Rationale:**
- Must match REST API plurals
- RESTful standard
- User-facing consistency
- Automation-friendly

**Routes:**
```
/restaurants, /branches, /menu-items, etc.
```

### ✅ Decision 3: Token in localStorage (Not URL)

**Rationale:**
- Standard for SPAs
- Secure (not in URL)
- Sent in Authorization header
- Refreshable

**Storage:**
```typescript
localStorage.setItem('kc_token', token)  ✅
```

---

## Implementation Checklist

### ✅ Completed

- [x] Fix token storage (localStorage sync)
- [x] Fix 401 authorization errors
- [x] Fix API gateway URL (console.atparui.com)
- [x] Fix API service path (/services/rms-service/api)
- [x] Add missing shadcn/ui components
- [x] Fix TypeScript undefined values
- [x] Create corrected conventions documentation

### ⏳ Pending

- [ ] Rename frontend: `/restaurant` → `/restaurants`
- [ ] Update menu config: `/restaurant` → `/restaurants`
- [ ] Update 11 internal route links
- [ ] Fix URL state issue (need to see actual URL)
- [ ] Test end-to-end
- [ ] Deploy

---

## What You Need to Provide

### 1. URL State Issue

Please share a screenshot or copy-paste of what you see in the browser address bar:

```
Example (what it should be):
https://rms-demo.atparui.com/restaurant

Example (if there's unwanted state):
https://rms-demo.atparui.com/restaurant?state=xyz123
https://rms-demo.atparui.com/restaurant#state=xyz123
```

### 2. Approval to Proceed

Once you confirm, I will:
- [ ] Rename `/restaurant` → `/restaurants` (frontend)
- [ ] Update menu config (database)
- [ ] Fix URL state issue (once I see it)
- [ ] Complete testing
- [ ] Create commit

---

## The Bottom Line

### ✅ OFFICIAL STANDARD (CORRECTED & FINAL)

```
┌─────────────────────────────────────────────────────────────┐
│                  LAYER-SPECIFIC CONVENTIONS                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 📊 DATABASE (Internal, Record-Oriented)                     │
│    Tables:       SINGULAR     (restaurant)                 │
│    Exception:    PLURAL       (orders - SQL keyword)       │
│                                                             │
│ 🌐 REST API (External, Collection-Oriented)                 │
│    Endpoints:    PLURAL       (/api/restaurants)           │
│    Always:       PLURAL       (no exceptions)              │
│                                                             │
│ 💻 FRONTEND (External, User-Facing)                         │
│    Routes:       PLURAL       (/restaurants)               │
│    Must match:   API plurals  (consistency)                │
│                                                             │
│ 🔧 CODE (Internal, Object-Oriented)                         │
│    Classes:      SINGULAR     (Restaurant)                 │
│    Types:        SINGULAR     (Restaurant)                 │
│    One item:     SINGULAR     (restaurant)                 │
│    Multiple:     PLURAL       (restaurants)                │
│                                                             │
└─────────────────────────────────────────────────────────────┘

RULE: Use the convention that makes semantic sense for each layer.
```

---

## Why These Conventions?

### Not Arbitrary! Based on Semantics:

**Database (SINGULAR):**
- Stores individual records
- "The restaurant table"
- One row = one entity

**API (PLURAL):**
- Serves collections
- "The restaurants endpoint"  
- Endpoint can return many

**Frontend (PLURAL):**
- Displays collections
- "The restaurants page"
- Usually shows multiple items

**Code (SINGULAR):**
- Represents one instance
- "A Restaurant object"
- Class = template for one thing

---

## Automation Impact

### Code Generation Works!

```typescript
// From OpenAPI: /api/restaurants (PLURAL)
const endpoint = '/api/restaurants';

// Generate:
const entityName = singularize(endpoint);  // → "restaurant"
const tableName = entityName;              // → "restaurant" (singular)
const className = capitalize(entityName);  // → "Restaurant" (singular)
const routeName = endpoint.split('/').pop(); // → "restaurants" (plural)

// Creates:
@Entity
@Table(name = "restaurant")               // Singular
public class Restaurant { }               // Singular
  
@RestController  
@RequestMapping("/api/restaurants")       // Plural
public class RestaurantResource { }

// Frontend
app/restaurants/page.tsx                  // Plural
```

**This works because we follow PREDICTABLE patterns!**

---

## Summary

### What I Got Wrong

❌ Original doc said: "Database tables should be PLURAL"

### What Is Correct

✅ **Database tables should be SINGULAR** (except SQL keywords)

### What Needs Fixing

1. ✅ Documentation - **FIXED** (this document)
2. ⏳ Frontend routes - `/restaurant` → `/restaurants` (pending)
3. ⏳ Menu config - `/restaurant` → `/restaurants` (pending)
4. ⏳ URL state issue - Need to see the URL

### What Is Already Correct

✅ Database tables (singular)  
✅ REST APIs (plural)  
✅ Token storage (localStorage)  
✅ Java entities (singular)

---

## Next Steps

**Please provide:**
1. 📸 Screenshot or copy of URL when you navigate (to diagnose state issue)
2. ✅ Approval to rename frontend routes to plural

**Then I will:**
1. Fix URL state issue (once I see it)
2. Rename frontend routes to match API
3. Update menu configuration
4. Test everything
5. Deploy

**Result:** Perfect consistency forever! 🎉

---

**Last Updated:** 2026-02-08  
**Status:** Awaiting URL state details and approval  
**Priority:** HIGH - Establishes conventions for all future work
