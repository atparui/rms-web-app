# Corrected Naming Conventions Standard

## Official Naming Conventions (CORRECTED)

**Date:** 2026-02-08  
**Status:** ✅ Official Standard - Must Follow  
**Correction:** Fixed database table convention (singular, not plural)

---

## Complete Convention Matrix

| Layer | Pattern | Example | Plural/Singular | Reason |
|-------|---------|---------|-----------------|--------|
| **Database Table** | singular_snake | `restaurant` | **SINGULAR** | JHipster standard |
| **Database Table** | singular_snake | `menu_item` | **SINGULAR** | Entity mapping |
| **Database Table** | plural_snake | `orders` | **PLURAL** | `order` is SQL keyword |
| **Database Column** | snake_case | `contact_email` | N/A | SQL standard |
| **REST API URL** | plural-kebab | `/api/restaurants` | **PLURAL** | RESTful standard |
| **REST API URL** | plural-kebab | `/api/menu-items` | **PLURAL** | Collection |
| **Frontend Route** | plural-kebab | `/restaurants` | **PLURAL** | Match API |
| **Frontend Route** | plural-kebab | `/menu-items` | **PLURAL** | Match API |
| **Menu Config** | plural-kebab | `/restaurants` | **PLURAL** | User-facing |
| **Service Name** | kebab-case | `rms-service` | N/A | Docker/K8s |
| **Database Name** | snake_case | `rms_demo` | N/A | SQL standard |
| **Domain Name** | kebab-case | `rms-demo.atparui.com` | N/A | DNS standard |
| **Java Entity** | PascalCase | `Restaurant` | **SINGULAR** | Java convention |
| **Java Service** | PascalCase | `RestaurantService` | **SINGULAR** | Java convention |
| **Java Repository** | PascalCase | `RestaurantRepository` | **SINGULAR** | Java convention |
| **Java Package** | lowercase | `restaurant` | **SINGULAR** | Java convention |
| **TypeScript Type** | PascalCase | `Restaurant` | **SINGULAR** | TS convention |
| **TypeScript Variable** | camelCase | `restaurant` | **SINGULAR** | TS convention |
| **API Client Object** | camelCase | `restaurantApi` | **SINGULAR** | TS convention |

---

## The Pattern (Corrected)

### Database Layer: SINGULAR ✅

```sql
-- Tables represent ONE record/row
CREATE TABLE restaurant (       -- SINGULAR ✅
    id UUID PRIMARY KEY,
    code VARCHAR(50),
    name VARCHAR(255)
);

-- Exception for SQL keywords
CREATE TABLE orders (           -- PLURAL (order = keyword)
    id UUID PRIMARY KEY
);

-- Multi-word tables
CREATE TABLE menu_item (        -- SINGULAR
    id UUID PRIMARY KEY
);
```

**Rule:** One entity = One table name = SINGULAR

### API Layer: PLURAL ✅

```java
// URL uses PLURAL (collection)
@RestController
@RequestMapping("/api/restaurants")  // PLURAL ✅
public class RestaurantResource {    // SINGULAR class ✅
    
    @GetMapping("")  // GET /api/restaurants
    public List<RestaurantDTO> getAllRestaurants() {
        // Returns collection (plural)
    }
    
    @GetMapping("/{id}")  // GET /api/restaurants/1
    public RestaurantDTO getRestaurant(@PathVariable UUID id) {
        // Returns single item from collection
    }
}
```

**Rule:** URL = Collection = PLURAL

### Code Layer: SINGULAR ✅

```java
// Java
@Entity
@Table(name = "restaurant")      // DB: singular
public class Restaurant {        // Class: singular
    // One instance
}

// TypeScript
export interface Restaurant {    // Type: singular
    id: string;
}

const restaurant: Restaurant = ...;  // Variable: singular
```

**Rule:** Class/Type = One instance = SINGULAR

---

## Why Different Conventions Per Layer?

### It's About Semantics!

**Database Table (SINGULAR):**
- Represents: **A row** in the table
- Concept: "The restaurant table contains restaurant records"
- Grammar: `SELECT * FROM restaurant` = "from the restaurant table"

**REST API (PLURAL):**
- Represents: **An endpoint** serving a collection
- Concept: "The restaurants endpoint returns multiple restaurants"
- Grammar: `GET /api/restaurants` = "get the restaurants (collection)"

**Example:**
```
User visits: GET /api/restaurants
↓
Controller queries: SELECT * FROM restaurant
↓
Returns: List<Restaurant> (multiple Restaurant objects)
↓
Frontend: Display in /restaurants route
```

---

## SQL Reserved Words - When to Use Plural

### Common Reserved Keywords

If your entity name is a SQL keyword, use PLURAL table name:

```sql
✅ orders       -- "order" is keyword (ORDER BY)
✅ groups       -- "group" is keyword (GROUP BY)  
✅ users        -- "user" sometimes problematic
✅ indexes      -- "index" is keyword

or prefix:
✅ rms_user     -- Safer than "user"
✅ app_order    -- Alternative to "orders"
```

### Safe Words (Use SINGULAR)

```sql
✅ restaurant   -- Not a keyword
✅ branch       -- Not a keyword
✅ customer     -- Not a keyword
✅ menu_item    -- Not a keyword
✅ bill         -- Not a keyword
```

---

## Migration Checklist

### ❌ DO NOT Change Database Tables

**Current tables are CORRECT:**
```
✅ restaurant      -- Keep as is
✅ branch          -- Keep as is
✅ menu_item       -- Keep as is
✅ orders          -- Keep as is (exception)
```

**DO NOT RENAME THEM!**

### ✅ DO Change Frontend/Menu

**These need to be PLURAL:**
```
Frontend Route: /restaurant → /restaurants    (needs change)
Menu Config: /restaurant → /restaurants       (needs change)
```

---

## Final Corrected Standard

```
┌─────────────────────────────────────────────────────────────┐
│         CORRECTED NAMING CONVENTIONS CHEAT SHEET            │
├─────────────────────────────────────────────────────────────┤
│ Database Table:  restaurant              (SINGULAR)        │
│ Database Table:  menu_item               (SINGULAR)        │
│ Database Table:  orders                  (PLURAL-exception)│
│                                                             │
│ REST API:        /api/restaurants        (PLURAL)          │
│ REST API:        /api/menu-items         (PLURAL)          │
│                                                             │
│ Frontend:        /restaurants            (PLURAL)          │
│ Frontend:        /menu-items             (PLURAL)          │
│                                                             │
│ Menu:            /restaurants            (PLURAL)          │
│                                                             │
│ Java Entity:     Restaurant              (SINGULAR)        │
│ TypeScript:      Restaurant              (SINGULAR)        │
│                                                             │
│ API Client:      restaurantApi           (SINGULAR)        │
│ Service:         rms-service             (kebab)           │
│ Domain:          rms-demo.atparui.com    (kebab)           │
└─────────────────────────────────────────────────────────────┘
```

---

## When Creating New Resources

### Step 1: Choose Entity Name

```
Entity: MenuItem (PascalCase, singular)
```

### Step 2: Database Table

```sql
-- Use singular with underscores
CREATE TABLE menu_item (  -- SINGULAR ✅
    id UUID PRIMARY KEY
);

-- Exception: If singular is a SQL keyword, use plural
CREATE TABLE orders (     -- PLURAL (exception) ✅
    id UUID PRIMARY KEY
);
```

### Step 3: Java Layer

```java
@Entity
@Table(name = "menu_item")         // SINGULAR
public class MenuItem { }           // SINGULAR

public class MenuItemService { }    // SINGULAR
public interface MenuItemRepository { }  // SINGULAR
```

### Step 4: REST API

```java
@RestController
@RequestMapping("/api/menu-items")  // PLURAL, hyphenated
public class MenuItemResource { }   // SINGULAR class
```

### Step 5: Frontend

```
app/(dashboard)/menu-items/         // PLURAL, hyphenated
  - page.tsx
  - create/page.tsx
  - [id]/page.tsx
```

### Step 6: Menu

```sql
INSERT INTO app_menu (label, route_path) VALUES
  ('Menu Items', '/menu-items');    -- PLURAL, hyphenated
```

---

## Summary of Corrections

### What Was Wrong in Original Document

❌ Said: "Database tables should be PLURAL"  
✅ Correct: "Database tables should be SINGULAR (except SQL keywords)"

### What Is Correct

| Statement | Status |
|-----------|--------|
| REST APIs use PLURAL | ✅ Correct |
| Frontend routes use PLURAL | ✅ Correct |
| Menu paths use PLURAL | ✅ Correct |
| Java entities use SINGULAR | ✅ Correct |
| Database tables use SINGULAR | ✅ Corrected! |

### Action Required

1. ✅ Update `NAMING_CONVENTIONS_STANDARD.md`
2. ✅ Keep database tables as they are (singular)
3. ⏳ Change frontend routes to plural
4. ⏳ Change menu config to plural

**DO NOT change database tables - they are correct!**

---

**Last Updated:** 2026-02-08  
**Status:** ✅ Corrected and finalized  
**Review:** Matches JHipster and current codebase reality
