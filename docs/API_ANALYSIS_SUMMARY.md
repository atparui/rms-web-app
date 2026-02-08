# RMS API Analysis Summary

## Overview

Analysis of the RMS Service OpenAPI specification cached at `.mcp-cache/openapi.json`.

## API Statistics

- **Total Endpoints**: 128
- **Total Schemas**: 67
- **Base Path**: `/services/rms/api`
- **Authentication**: Bearer token (Keycloak)

## Resources by Category

### Core Management (13 endpoints)

| Resource | Endpoints | Operations |
|----------|-----------|------------|
| **Restaurants** | 3 | GET, POST, PUT, PATCH, DELETE, _search |
| **Branches** | 3 | GET, POST, PUT, PATCH, DELETE, _search |
| **RMS Users** | 3 | GET, POST, PUT, PATCH, DELETE, _search |
| **Roles & Permissions** | 4 | GET, POST, PUT, DELETE, assign |

### Menu Management (18 endpoints)

| Resource | Endpoints | Special Features |
|----------|-----------|------------------|
| **Menu Categories** | 3 | GET, POST, PUT, PATCH, DELETE, _search |
| **Menu Items** | 9 | CRUD + availability toggle + branch filtering |
| **Menu Item Variants** | 3 | CRUD |
| **Menu Item Addons** | 3 | CRUD |

### Operations (38 endpoints)

| Resource | Endpoints | Special Features |
|----------|-----------|------------------|
| **Branch Tables** | 7 | CRUD + status management + branch filtering |
| **Orders** | 12 | CRUD + status updates + cancellation + items |
| **Bills** | 10 | CRUD + generation + breakdown + discounts |
| **Payments** | 9 | CRUD + processing + refunds + methods |

### Configuration (21 endpoints)

| Resource | Endpoints | Special Features |
|----------|-----------|------------------|
| **Tax Config** | 3 | CRUD |
| **Discounts** | 5 | CRUD + validation + active filtering |
| **Inventory** | 6 | CRUD + stock management + low-stock alerts |
| **Shifts** | 3 | CRUD |
| **Table Assignments** | 4 | CRUD + daily assignments |

### Analytics & Reporting (11 endpoints)

| Resource | Endpoints | Special Features |
|----------|-----------|------------------|
| **Reports** | 3 | Sales reports, summaries, analytics |
| **Customer Loyalty** | 5 | CRUD + points management |
| **Customers** | 3 | CRUD + _search + loyalty + orders |

### System & Navigation (27 endpoints)

| Resource | Endpoints | Special Features |
|----------|-----------|------------------|
| **App Menus** | 5 | CRUD + tree structure |
| **App Navigation Menus** | 3 | CRUD + role-based |
| **App Navigation Menu Items** | 3 | CRUD |
| **App Navigation Menu Roles** | 3 | Role assignments |
| **Menu Permissions** | 3 | Permission management |
| **User Branch Roles** | 4 | Branch-specific role assignments |
| **User Sync Logs** | 3 | Keycloak sync tracking |
| **Table Waiter Assignments** | 3 | Waiter-table assignments |

## Key Schema Examples

### Restaurant Schema
```typescript
{
  id: string (UUID)
  code: string
  name: string
  description?: string
  contactEmail: string
  contactPhone?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  timezone?: string
  logoUrl?: string
  isActive?: boolean
}
```

### Branch Schema
```typescript
{
  id: string (UUID)
  code?: string
  name: string
  description?: string
  restaurant?: Restaurant
  contactEmail?: string
  contactPhone?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  timezone?: string
  latitude?: number
  longitude?: number
  openingTime?: string
  closingTime?: string
  maxCapacity?: number
  isActive?: boolean
}
```

### Menu Item Schema
```typescript
{
  id: string (UUID)
  code?: string
  name: string
  description?: string
  category?: MenuCategory
  basePrice: number
  imageUrl?: string
  isAvailable?: boolean
  isVegetarian?: boolean
  isVegan?: boolean
  allergens?: string
  preparationTime?: number
  calories?: number
  servingSize?: string
  isActive?: boolean
}
```

### Order Schema
```typescript
{
  id: string (UUID)
  orderNumber: string
  branch?: Branch
  table?: BranchTable
  customer?: Customer
  orderType: string
  status: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  notes?: string
  orderDate: string
  items?: OrderItem[]
}
```

## API Patterns

### Standard CRUD Pattern

Most resources follow this pattern:

- `GET /api/{resource}` - List all
- `GET /api/{resource}/{id}` - Get by ID
- `POST /api/{resource}` - Create
- `PUT /api/{resource}/{id}` - Update (full)
- `PATCH /api/{resource}/{id}` - Update (partial)
- `DELETE /api/{resource}/{id}` - Delete
- `GET /api/{resource}/_search?query=...` - Search

### Special Operations

Some resources have additional endpoints:

- **Menu Items**: `/api/menu-items/{id}/availability` - Toggle availability
- **Bills**: `/api/bills/generate` - Generate bill from order
- **Bills**: `/api/bills/{id}/breakdown` - Detailed breakdown
- **Bills**: `/api/bills/{id}/apply-discount` - Apply discount
- **Tables**: `/api/branch-tables/{id}/status` - Update table status
- **Inventory**: `/api/inventories/{id}/adjust` - Adjust stock
- **Customers**: `/api/customers/{id}/loyalty/add-points` - Add loyalty points
- **Payments**: `/api/payments/refund` - Process refund

## Nested Resources

Some resources are nested under parent resources:

- Menu Items by Category: `/api/menu-items/category/{categoryId}`
- Menu Items by Branch: `/api/menu-items/branch/{branchId}/available`
- Bills by Branch: `/api/bills/branch/{branchId}/date-range`
- Tables by Branch: `/api/branch-tables/branch/{branchId}/available`
- Customer Orders: `/api/customers/{id}/orders`
- Customer Loyalty: `/api/customers/{id}/loyalty`

## Authentication

All endpoints require Bearer token authentication from Keycloak:

```
Authorization: Bearer {token}
```

### Test Credentials (gwadmin)

```bash
# Get token
POST https://auth.atparui.com/realms/rms-demo/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=password
client_id=rms-web
username=gwadmin
password=gwadmin
```

## Gateway Routing

All requests go through the Gateway at `https://rms-demo.atparui.com`:

```
https://rms-demo.atparui.com/services/rms/api/{endpoint}
```

Gateway handles:
- CORS (centralized)
- Authentication (JWT validation)
- Routing to backend services
- Load balancing

## Implementation Priority

Based on dependencies and usage:

**Priority 1 (Week 3)**
1. Restaurants (base entity)
2. Branches (depends on restaurants)
3. Users (system users)
4. Roles & Permissions (access control)

**Priority 2 (Week 4)**
5. Menu Categories (menu structure)
6. Menu Items (depends on categories)
7. Menu Variants (depends on items)
8. Menu Addons (depends on items)

**Priority 3 (Week 5)**
9. Tables (branch resources)
10. Customers (customer management)
11. Orders (depends on menu items, tables)
12. Bills (depends on orders)
13. Payments (depends on bills)

**Priority 4 (Week 6)**
14. Tax Config (billing configuration)
15. Discounts (promotions)
16. Inventory (stock management)
17. Shifts (scheduling)

**Priority 5 (Week 6+)**
18. Reports (analytics)
19. Customer Loyalty (rewards program)
20. Navigation Menus (dynamic UI)

## Frontend Requirements

### Required TypeScript Types

Create types for all 67 schemas:

- RestaurantDTO
- BranchDTO
- MenuCategoryDTO
- MenuItemDTO
- MenuItemVariantDTO
- MenuItemAddonDTO
- OrderDTO
- OrderItemDTO
- BillDTO
- BillItemDTO
- PaymentDTO
- CustomerDTO
- InventoryDTO
- TaxConfigDTO
- DiscountDTO
- BranchTableDTO
- ShiftDTO
- RmsUserDTO
- RolePermissionDTO
- ... and more

### Required API Client Functions

For each resource, implement:
- `getAll()` - List all
- `getById(id)` - Get single
- `search(params)` - Search/filter
- `create(data)` - Create new
- `update(id, data)` - Update existing
- `partialUpdate(id, data)` - Partial update
- `delete(id)` - Delete
- Special operations (resource-specific)

### UI Pages Needed

**List Pages**: 20+ pages
**Create Forms**: 15+ pages
**Edit Forms**: 15+ pages
**Detail Pages**: 10+ pages

**Total**: ~60+ pages

## Testing Endpoints

### Quick Test with curl

```bash
# 1. Get token
TOKEN=$(curl -s -X POST "https://auth.atparui.com/realms/rms-demo/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=rms-web" \
  -d "username=gwadmin" \
  -d "password=gwadmin" | jq -r .access_token)

# 2. Test restaurants endpoint
curl -X GET "https://rms-demo.atparui.com/services/rms/api/restaurants" \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Test branches endpoint
curl -X GET "https://rms-demo.atparui.com/services/rms/api/branches" \
  -H "Authorization: Bearer $TOKEN" | jq

# 4. Test menu items endpoint
curl -X GET "https://rms-demo.atparui.com/services/rms/api/menu-items" \
  -H "Authorization: Bearer $TOKEN" | jq
```

## MCP Server Configuration

The MCP server at `mcp-server/index.ts` provides:

- OpenAPI spec caching (`.mcp-cache/openapi.json`)
- Automatic token refresh
- Three resources:
  - `api-docs://openapi` - Full spec
  - `api-docs://services` - Service list
  - `api-docs://endpoints` - Endpoint list
- Three tools:
  - `sync-api-docs` - Force refresh
  - `get-endpoint-schema` - Detailed endpoint info
  - `search-endpoints` - Search by tag/path

### MCP Server Configuration Issue

Currently getting 401 errors. Need to check:

1. Environment variables in MCP server config
2. Keycloak client credentials
3. Gateway URL configuration

**Current Config:**
- Gateway: `https://console.atparui.com` (may need to change to `https://rms-demo.atparui.com`)
- Endpoint: `/services/rms-service/v3/api-docs`

## Recommendations

### 1. Start with Priority 1 Resources

Begin implementation with:
- Restaurants
- Branches
- Users
- Roles

These are foundational and have no dependencies.

### 2. Use Cached OpenAPI Spec

The cached spec at `.mcp-cache/openapi.json` is comprehensive and up-to-date.

### 3. Follow Type-Safe Pattern

Generate TypeScript types directly from OpenAPI schemas for consistency.

### 4. Implement Incrementally

Build one complete resource (list + create + edit) before moving to the next.

### 5. Test with Real Data

Use gwadmin credentials to test with actual backend.

## Next Steps

1. ✅ Verify API access with curl (test gwadmin credentials)
2. ✅ Create type definitions for Priority 1 resources
3. ✅ Implement API client functions for Priority 1
4. ✅ Build restaurant list page (first complete page)
5. ✅ Build restaurant create/edit pages
6. ✅ Repeat for other Priority 1 resources

## Related Documentation

- [Implementation Plan](IMPLEMENTATION_PLAN.md) - Full 6-week plan
- [Routing Guide](ROUTING_AND_CRUD_PAGES_GUIDE.md) - Page patterns
- [CORS Documentation](../../console/docs/CORS_CENTRALIZED_GATEWAY_SOLUTION.md) - Gateway CORS
