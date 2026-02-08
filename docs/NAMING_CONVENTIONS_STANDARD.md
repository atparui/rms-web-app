# Naming Conventions Standard

## Executive Summary

This document establishes the **official naming conventions** for the RMS (Restaurant Management System) project. These conventions ensure consistency across all layers and enable automation.

**Date:** 2026-02-08  
**Status:** ✅ Official Standard - Must Follow  
**Last Review:** Initial establishment

---

## Current State Analysis

### ❌ Problems Found

| Layer | Current State | Issue |
|-------|--------------|-------|
| **Backend API** | `/api/restaurants` | Uses PLURAL |
| **Frontend Route** | `/restaurant` | Uses SINGULAR |
| **Menu Config** | `/restaurant` | Uses SINGULAR |
| **Service Name** | `rms-service` | Uses hyphen |
| **Database** | `rms_rms_demo` | Uses underscore |
| **Domain** | `rms-demo.atparui.com` | Uses hyphen |

**Result:** Inconsistent! Frontend and backend don't match.

---

## Official Convention Standard

### 1. RESTful API Endpoints (Backend)

**Convention:** **PLURAL nouns** for collections

```
✅ CORRECT (Spring Boot Standard):
/api/restaurants          # Collection of restaurants
/api/restaurants/{id}     # Single restaurant
/api/branches             # Collection of branches  
/api/branches/{id}        # Single branch
/api/menu-items           # Hyphenated plurals
/api/menu-items/{id}

❌ INCORRECT:
/api/restaurant           # Singular (wrong)
/api/branch               # Singular (wrong)
```

**Rationale:**
- RESTful standard practice (REST API Design Rulebook)
- Spring Boot / JHipster convention
- Industry standard (Google, Twitter, GitHub APIs all use plurals)
- Semantic clarity: GET `/api/restaurants` returns multiple items

**Examples from major APIs:**
- GitHub: `/repos`, `/users`, `/issues`
- Twitter: `/tweets`, `/users`, `/followers`
- Stripe: `/customers`, `/charges`, `/invoices`

### 2. Frontend Routes (Next.js)

**Convention:** **MUST MATCH backend API plurals**

```
✅ CORRECT:
app/(dashboard)/restaurants/page.tsx    → /restaurants
app/(dashboard)/branches/page.tsx       → /branches
app/(dashboard)/menu-items/page.tsx     → /menu-items

❌ INCORRECT:
app/(dashboard)/restaurant/page.tsx     → /restaurant (doesn't match API)
```

**Rationale:**
- Consistency with API endpoints
- No mental translation needed
- Automation-friendly (generate CRUD from OpenAPI spec)
- URL structure matches data structure

### 3. Menu Configuration (Database)

**Convention:** **PLURAL**, matching frontend routes

```sql
✅ CORRECT:
INSERT INTO app_menu (label, route_path) VALUES
  ('Restaurants', '/restaurants'),      -- Plural
  ('Branches', '/branches'),            -- Plural
  ('Menu Items', '/menu-items');        -- Plural

❌ INCORRECT:
  ('Restaurant', '/restaurant'),        -- Singular (wrong)
```

### 4. Service Names

**Convention:** **Kebab-case** (hyphens)

```
✅ CORRECT:
rms-service                    # Microservice name
tenant-management-service      # Microservice name
user-authentication-service    # Microservice name

❌ INCORRECT:
rmsService                     # camelCase
rms_service                    # snake_case
RMSService                     # PascalCase
```

**Rationale:**
- DNS/URL safe
- Docker container naming convention
- Kubernetes service naming standard
- Spring Cloud / Consul discovery convention

### 5. Database Names

**Convention:** **Snake_case** (underscores)

```
✅ CORRECT:
rms_demo                       # Database name
tenant_management              # Database name
user_auth                      # Database name

Table Names (SINGULAR - JHipster Standard):
restaurant                     # Table for restaurant entities (SINGULAR)
branch                         # Table for branch entities (SINGULAR)
menu_item                      # Table for menu item entities (SINGULAR)

EXCEPTION (SQL Reserved Words):
orders                         # PLURAL - "order" is SQL keyword

❌ INCORRECT:
rms-demo                       # Hyphens (not SQL safe)
restaurants                    # Plural (wrong - see exception below)
```

**Rationale:**
- JHipster convention uses SINGULAR table names
- Entity-to-table symmetry (one entity = one table)
- SQL readability (FROM restaurant WHERE...)
- Exception: Use plural if singular is SQL keyword (order → orders)
- PostgreSQL / MySQL convention varies (JHipster uses singular)
- Liquibase: Follows JHipster pattern

### 6. Domain Names

**Convention:** **Kebab-case** (hyphens)

```
✅ CORRECT:
rms-demo.atparui.com           # Frontend domain
console.atparui.com            # Gateway domain
auth.atparui.com               # Keycloak domain

❌ INCORRECT:
rmsdemo.atparui.com            # No separator (hard to read)
rms_demo.atparui.com           # Underscores (invalid in domains)
```

**Rationale:**
- DNS standard (underscores invalid)
- SEO friendly
- Human readable

### 7. Java/Spring Boot Layer

**Convention:** Varies by context

```java
✅ CORRECT:

// Controller (Resource classes use singular entity name)
@RestController
@RequestMapping("/api/restaurants")    // ← PLURAL in URL
public class RestaurantResource {      // ← SINGULAR class name
}

// Service
public class RestaurantService {       // Singular
}

// Repository
public interface RestaurantRepository  // Singular
  extends JpaRepository<Restaurant, UUID> {
}

// Entity
@Entity
@Table(name = "restaurants")           // ← PLURAL table name
public class Restaurant {              // ← SINGULAR entity name
}

// DTO
public class RestaurantDTO {           // Singular
}
```

### 8. TypeScript/Frontend Layer

**Convention:** Matches Java patterns

```typescript
✅ CORRECT:

// Type definitions (singular)
export interface Restaurant extends BaseEntity {
}

// API client (plural URLs, singular method names)
export const restaurantApi = {
  getAll: (): Promise<Restaurant[]> => 
    fetchWithAuth(`${API_BASE_URL}/api/restaurants`),  // PLURAL URL
  
  getById: (id: string): Promise<Restaurant> =>        // SINGULAR return
    fetchWithAuth(`${API_BASE_URL}/api/restaurants/${id}`),
};

// Component files (singular for entity components)
components/forms/RestaurantForm.tsx
components/tables/RestaurantTable.tsx
```

---

## Complete Convention Matrix

| Layer | Pattern | Example | Reason |
|-------|---------|---------|--------|
| **REST API URL** | plural-kebab | `/api/restaurants` | RESTful standard |
| **REST API URL** | plural-kebab | `/api/menu-items` | Multi-word: hyphenated |
| **Frontend Route** | plural-kebab | `/restaurants` | Match API |
| **Menu Config** | plural-kebab | `/restaurants` | Match frontend route |
| **Service Name** | kebab-case | `rms-service` | Docker/K8s standard |
| **Database Name** | snake_case | `rms_demo` | SQL standard |
| **Table Name** | **singular_snake** | `restaurant` | **JHipster standard** |
| **Table Name** | **singular_snake** | `menu_item` | **Multi-word: underscored** |
| **Table Name (Exception)** | plural_snake | `orders` | **"order" is SQL keyword** |
| **Domain Name** | kebab-case | `rms-demo.atparui.com` | DNS standard |
| **Java Class** | PascalCase-Singular | `Restaurant` | Java convention |
| **Java Method** | camelCase | `findRestaurantById` | Java convention |
| **TypeScript Interface** | PascalCase-Singular | `Restaurant` | TS convention |
| **TypeScript Variable** | camelCase | `restaurantData` | TS convention |
| **API Client Object** | camelCase-Singular | `restaurantApi` | TS convention |

---

## Automation Benefits

### 1. Code Generation

With consistent conventions, we can auto-generate:

```bash
# From OpenAPI spec, generate:
# - TypeScript types
# - API client functions
# - CRUD pages
# - Menu entries

npx openapi-generator-cli generate \
  -i openapi.json \
  -g typescript-nextjs \
  -o src/generated

# Conventions ensure:
# - /api/restaurants → restaurantApi.getAll()
# - /api/restaurants → app/restaurants/page.tsx
# - /api/restaurants → Menu: "Restaurants" → /restaurants
```

### 2. Database Migrations

```typescript
// Auto-generate Liquibase changelogs
generateMigration({
  entity: 'Restaurant',
  tableName: 'restaurants',     // Plural, snake_case
  apiPath: '/api/restaurants',  // Plural, kebab-case
});
```

### 3. Testing

```typescript
// Auto-generate E2E tests
describe('Restaurant CRUD', () => {
  it('should list all restaurants', () => {
    cy.visit('/restaurants');           // Frontend route (plural)
    cy.request('/api/restaurants');     // API endpoint (plural)
  });
});
```

---

## Migration Plan (FIX CURRENT INCONSISTENCIES)

### Issue: Frontend uses `/restaurant` but API uses `/api/restaurants`

**Decision:** ✅ **Frontend must change to match backend** (less risky)

### Why not change backend?

❌ **Don't change backend** because:
1. Database already has data
2. API clients already exist
3. Breaking change for integrations
4. RESTful standard is plural anyway

### Migration Steps

1. ✅ **Update Menu Configuration** (Database)
   ```sql
   UPDATE app_menu 
   SET route_path = '/restaurants'  -- Change to plural
   WHERE menu_key = 'restaurant';
   ```

2. ✅ **Rename Frontend Route**
   ```bash
   mv app/(dashboard)/restaurant app/(dashboard)/restaurants
   ```

3. ✅ **Update Internal Links**
   - Change all `/restaurant` → `/restaurants`
   - Update 11 references in 5 files

4. ✅ **Test End-to-End**
   - Menu click navigates to `/restaurants`
   - API calls to `/api/restaurants`
   - Everything matches!

---

## Enforcement

### 1. Documentation

✅ This document is the official standard  
✅ All new code must follow these conventions  
✅ Review required for any deviations

### 2. Code Review Checklist

- [ ] API endpoints use plural nouns
- [ ] Frontend routes match API plurals
- [ ] Menu config matches frontend routes
- [ ] Service names use kebab-case
- [ ] Database/table names use snake_case (plural)
- [ ] Domain names use kebab-case
- [ ] Java classes follow Java conventions
- [ ] TypeScript follows TS conventions

### 3. Automated Checks

```typescript
// ESLint rule for API client
'api-client/plural-endpoints': [
  'error',
  { pattern: '/api/[a-z-]+s$' }  // Must end with 's' (plural)
]

// Lint database migrations
'liquibase/plural-table-names': 'error'
```

### 4. CI/CD Gates

```yaml
# .github/workflows/conventions.yml
- name: Check Naming Conventions
  run: |
    npm run lint:conventions
    # Fails if conventions violated
```

---

## Quick Reference Card (CORRECTED)

```
┌─────────────────────────────────────────────────────────────┐
│            NAMING CONVENTIONS CHEAT SHEET (CORRECTED)       │
├─────────────────────────────────────────────────────────────┤
│ REST API:        /api/restaurants        (PLURAL-kebab)    │
│ Frontend:        /restaurants            (PLURAL-kebab)    │
│ Menu:            /restaurants            (PLURAL-kebab)    │
│ Service:         rms-service             (kebab-case)      │
│ Database:        rms_demo                (snake_case)      │
│ Table:           restaurant              (SINGULAR-snake)  │
│ Table:           menu_item               (SINGULAR-snake)  │
│ Table Exception: orders                  (PLURAL-keyword)  │
│ Domain:          rms-demo.atparui.com    (kebab-case)      │
│ Java Class:      Restaurant              (PascalCase)      │
│ TS Interface:    Restaurant              (PascalCase)      │
│ API Client:      restaurantApi           (camelCase)       │
└─────────────────────────────────────────────────────────────┘

KEY INSIGHT: Database uses SINGULAR, User-facing uses PLURAL
```

---

## Summary

**Official Decision:** 

✅ **Use PLURAL for all user-facing URLs** (API, Frontend, Menu)  
✅ **Use SINGULAR for code entities** (Classes, Types)  
✅ **Use kebab-case for URLs** (DNS/HTTP safe)  
✅ **Use snake_case for databases** (SQL safe)

**Next Action:** Fix current `/restaurant` → `/restaurants` inconsistency

---

**Approved By:** Development Team  
**Effective Date:** 2026-02-08  
**Review Cycle:** Quarterly or when major inconsistencies found
