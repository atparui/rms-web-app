# Convention Correction - Database Tables

## Critical Correction Required

**Original Document Error:** Stated tables should be **PLURAL**  
**Actual Reality:** Tables ARE **SINGULAR** (correct!)  
**Action:** ✅ **Keep tables as SINGULAR** - Documentation needs correction

---

## Current Database Reality

### Actual Table Names (from Liquibase)

```sql
✅ SINGULAR (Correct - Current Standard):
- restaurant
- branch  
- bill
- customer
- discount
- inventory
- menu_category
- menu_item
- order_item
- bill_item
- rms_user
- user_branch_role
- role_permission
- restaurant_role
- table_assignment
- branch_table

❌ EXCEPTION (due to SQL reserved word):
- orders              -- Cannot use "order" (SQL keyword)
```

### Why Singular Is Correct

#### 1. **JHipster Convention**

This project was generated with JHipster, which uses **singular** table names:

```java
@Entity
@Table(name = "restaurant")  // ← SINGULAR
public class Restaurant {    // ← SINGULAR
}
```

**JHipster Philosophy:**
- One entity = One table
- Entity name matches table name
- Singular entity → Singular table

#### 2. **SQL Readability**

**Singular reads more naturally:**
```sql
✅ SELECT * FROM restaurant WHERE id = 1;
   -- "Get from THE restaurant where..."
   
❌ SELECT * FROM restaurants WHERE id = 1;
   -- "Get from THE restaurants where..." (confusing)
```

**Joins are clearer:**
```sql
✅ SELECT restaurant.name, branch.location
   FROM restaurant
   JOIN branch ON restaurant.id = branch.restaurant_id;
   -- Clear: "the restaurant's name, the branch's location"

❌ SELECT restaurants.name, branches.location
   FROM restaurants
   JOIN branches ON restaurants.id = branches.restaurant_id;
   -- Awkward: "the restaurants' name" (possessive plural confusion)
```

#### 3. **Entity-Table Symmetry**

```java
// Entity (Java) - Singular
public class Restaurant { }

// Table (SQL) - Singular  
CREATE TABLE restaurant ( );

// Perfect symmetry! Easy to understand.
```

#### 4. **Multi-word Tables**

**With singular, relationships are clear:**
```sql
✅ menu_item          -- One menu item
✅ order_item         -- One order item
✅ user_branch_role   -- One user's role at one branch
✅ role_permission    -- One permission for one role

vs.

❌ menu_items         -- Multiple? One? Confusing.
❌ order_items        -- Same confusion
```

#### 5. **Other Major Frameworks**

While REST APIs use plurals, **databases** often use singular:

**Rails (Active Record):**
- Model: `User` (singular)
- Table: `users` (plural)

**Laravel (Eloquent):**
- Model: `User` (singular)  
- Table: `users` (plural)

**JHipster / Spring:**
- Entity: `Restaurant` (singular)
- Table: `restaurant` (singular) ✅ **This is us!**

**Django:**
- Model: `Restaurant` (singular)
- Table: `restaurant` (auto-generated singular)

---

## Corrected Convention Standard

### ✅ OFFICIAL DECISION: Use SINGULAR for Database Tables

| Layer | Convention | Example | Reason |
|-------|-----------|---------|--------|
| **Database Table** | **singular_snake** | `restaurant` | JHipster standard |
| **Database Table** | **singular_snake** | `menu_item` | Entity mapping |
| **Database Table** | **plural (exception)** | `orders` | SQL keyword avoidance |
| **Java Entity** | PascalCase-Singular | `Restaurant` | Java convention |
| **REST API URL** | plural-kebab | `/api/restaurants` | RESTful standard |
| **Frontend Route** | plural-kebab | `/restaurants` | Match API |

### Complete Corrected Matrix

| Layer | Pattern | Example | Plural/Singular |
|-------|---------|---------|-----------------|
| **Database Table** | snake_case | `restaurant` | **SINGULAR** ✅ |
| **Database Table** | snake_case | `menu_item` | **SINGULAR** ✅ |
| **Database Table** | snake_case | `orders` | **PLURAL** (exception) |
| **Java Entity** | PascalCase | `Restaurant` | **SINGULAR** ✅ |
| **Java Repository** | PascalCase | `RestaurantRepository` | **SINGULAR** ✅ |
| **Java Service** | PascalCase | `RestaurantService` | **SINGULAR** ✅ |
| **REST API URL** | kebab-case | `/api/restaurants` | **PLURAL** ✅ |
| **Frontend Route** | kebab-case | `/restaurants` | **PLURAL** ✅ |
| **Menu Config** | kebab-case | `/restaurants` | **PLURAL** ✅ |
| **TypeScript Type** | PascalCase | `Restaurant` | **SINGULAR** ✅ |
| **API Client** | camelCase | `restaurantApi` | **SINGULAR** ✅ |

---

## Why Different Layers Use Different Conventions

### Database Layer: SINGULAR

**Reason:** Represents a **single row/record**

```sql
-- Each row is ONE restaurant
SELECT * FROM restaurant WHERE id = 1;
-- "Get THE restaurant" (singular concept)
```

### API Layer: PLURAL

**Reason:** Represents a **collection/resource**

```
GET /api/restaurants  -- Get MULTIPLE restaurants (collection)
GET /api/restaurants/1 -- Get ONE from the collection
```

**Semantic difference:**
- URL `/restaurants` = "the restaurants endpoint" (collection)
- Table `restaurant` = "the restaurant record" (single row)

### Code Layer: SINGULAR

**Reason:** Class represents **one instance**

```java
Restaurant restaurant = new Restaurant();  // One object
List<Restaurant> restaurants = ...;        // Multiple objects
```

---

## The Pattern

```
┌──────────────────────────────────────────────────┐
│ REST API: /api/restaurants (PLURAL - collection) │
└──────────────┬───────────────────────────────────┘
               ↓ Routes to
┌──────────────────────────────────────────────────┐
│ Controller: RestaurantResource (SINGULAR class)  │
└──────────────┬───────────────────────────────────┘
               ↓ Uses
┌──────────────────────────────────────────────────┐
│ Service: RestaurantService (SINGULAR)            │
└──────────────┬───────────────────────────────────┘
               ↓ Uses  
┌──────────────────────────────────────────────────┐
│ Repository: RestaurantRepository (SINGULAR)      │
└──────────────┬───────────────────────────────────┘
               ↓ Maps to
┌──────────────────────────────────────────────────┐
│ Entity: Restaurant (SINGULAR class)              │
└──────────────┬───────────────────────────────────┘
               ↓ Maps to
┌──────────────────────────────────────────────────┐
│ Table: restaurant (SINGULAR table)               │
└──────────────────────────────────────────────────┘
```

**Rule:** Code uses SINGULAR (one class = one concept)  
**Rule:** APIs use PLURAL (endpoint = collection of resources)

---

## Do NOT Change Database Tables!

### ❌ DO NOT DO THIS:

```sql
-- DO NOT RENAME TABLES!
ALTER TABLE restaurant RENAME TO restaurants;  ❌
ALTER TABLE branch RENAME TO branches;          ❌
ALTER TABLE menu_item RENAME TO menu_items;     ❌
```

### Why Not?

1. ✅ **Current convention is correct** (JHipster standard)
2. ❌ **Breaking change** for existing code
3. ❌ **All Liquibase changelogs** would need updates
4. ❌ **All entity classes** would need `@Table` updates
5. ❌ **Database migrations** required across all environments
6. ❌ **Risk of data loss** if migration fails
7. ❌ **Zero benefit** - current setup works perfectly

---

## Exception: `orders` Table

### Why is it plural?

```sql
-- This won't work:
CREATE TABLE order ( ... );  ❌
-- ERROR: "order" is a SQL reserved keyword (ORDER BY)

-- Must be plural:
CREATE TABLE orders ( ... );  ✅
-- Works! Avoids keyword conflict.
```

**Other SQL Reserved Keywords to Avoid:**
- `order` → use `orders`
- `group` → use `groups` or `user_group`
- `user` → usually OK but `rms_user` is safer
- `table` → use `branch_table`, `restaurant_table`
- `index` → avoid as table name
- `select`, `insert`, `update`, `delete` → never use!

---

## Summary

### ✅ KEEP Current Database Convention

**Official Standard:**
- ✅ Database tables: **SINGULAR** (`restaurant`, `menu_item`)
- ✅ Exception for SQL keywords: **PLURAL** (`orders` not `order`)
- ✅ REST APIs: **PLURAL** (`/api/restaurants`)
- ✅ Frontend routes: **PLURAL** (`/restaurants`)
- ✅ Java classes: **SINGULAR** (`Restaurant`)

### Why This Works

1. **Database** = Record-oriented = SINGULAR
2. **API** = Collection-oriented = PLURAL  
3. **Code** = Object-oriented = SINGULAR

**Each layer uses the convention that makes semantic sense for that layer.**

---

## Updated Convention Document

The official `NAMING_CONVENTIONS_STANDARD.md` will be updated to reflect:

**Before (Incorrect):**
```
Table Name: restaurants (plural)  ❌
```

**After (Correct):**
```
Table Name: restaurant (singular) ✅
Exception: orders (when singular is SQL keyword)
```

---

## No Action Required

✅ **Database tables are already correct**  
✅ **Follow current JHipster convention**  
✅ **Do NOT rename any tables**  
✅ **Continue with singular table names for new tables**

**Exception:** If table name would be a SQL reserved word, use plural or prefix (e.g., `orders`, `user_groups`, `rms_user`)

---

**Status:** Convention document corrected  
**Action:** None - current tables are correct  
**Going Forward:** New tables should be singular (unless SQL keyword)
