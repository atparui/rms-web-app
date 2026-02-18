# Tree Routes and Scaffolded Pages

**Date:** 2026-02-14  
**Status:** Complete

---

## Summary

Routes in the RMS web app were aligned with the **`/api/app-menus/tree`** response (`routePath` values), and missing routes were added with list/create/edit pages scaffolded from the RMS API DTOs.

---

## 1. Tree route_path alignment

The app menu seed and an optional migration were updated so that sidebar links match existing frontend routes:

| Menu key        | Old route_path   | New route_path   | Frontend route      |
|-----------------|------------------|------------------|----------------------|
| restaurant      | `/restaurant`    | `/restaurants`   | `/restaurants`       |
| menu_category   | `/menu/categories` | `/menu-categories` | `/menu-categories` |
| menu_item       | `/menu/items`    | `/menu-items`     | `/menu-items`        |

- **Seed:** `rms-service/src/main/resources/config/liquibase/changelog/20260123093000_seed_app_menu_permissions.xml`  
  - New installs get the updated `route_path` values.
- **Existing DBs:** `rms-service/.../20260214000000_fix_app_menu_route_paths.xml`  
  - Updates existing `app_menu` rows so Restaurant, Menu Categories, and Menu Items no longer 404.

---

## 2. Routes that already had pages

These tree routes already had list/create/edit pages; only the tree was updated so they match:

- `/restaurants` — list, create, `[id]` edit
- `/branches` — list, create, `[id]` edit
- `/users` — list, create, `[id]` edit
- `/menu-categories` — list, create, `[id]` edit
- `/menu-items` — list, create, `[id]` edit

---

## 3. New routes and scaffolded pages

For each of the following tree routes, list + create + edit (view) pages were added, with types and API client methods matching the RMS API.

| Tree route_path | App route        | List | Create | Edit (view) | API client / types |
|-----------------|------------------|------|--------|-------------|--------------------|
| `/customers`    | `/customers`     | ✅   | ✅     | ✅          | `customerApi`, Customer types |
| `/inventory`    | `/inventory`     | ✅   | ✅     | ✅          | `inventoryApi`, Inventory types |
| `/billing`      | `/billing`       | ✅   | ✅     | ✅          | `billApi`, Bill types |
| `/orders`       | `/orders`        | ✅   | ✅     | ✅          | `orderApi`, Order types |
| `/tables`       | `/tables`        | ✅   | ✅     | ✅          | `branchTableApi`, BranchTable types |
| `/table-roster` | `/table-roster`  | ✅   | ✅     | ✅          | `tableAssignmentApi`, TableAssignment types |

---

## 4. Files added/updated

### RMS service (route_path alignment)

- `config/liquibase/changelog/20260123093000_seed_app_menu_permissions.xml` — seed `route_path` values updated.
- `config/liquibase/changelog/20260214000000_fix_app_menu_route_paths.xml` — new changeset for existing DBs.
- `config/liquibase/master.xml` — include for the new changeset.

### RMS web app

**Types (DTO-based):**

- `types/customer.ts`
- `types/inventory.ts`
- `types/order.ts`
- `types/bill.ts`
- `types/branch-table.ts`
- `types/table-assignment.ts`
- `types/index.ts` — exports for the above.

**API client (`lib/api-client.ts`):**

- `customerApi`, `inventoryApi`, `orderApi`, `billApi`, `branchTableApi`, `tableAssignmentApi` with getAll, getById, create, update, delete (and search where applicable).

**Pages (scaffolded):**

- `app/(dashboard)/customers/page.tsx`, `create/page.tsx`, `[id]/page.tsx`
- `app/(dashboard)/inventory/page.tsx`, `create/page.tsx`, `[id]/page.tsx`
- `app/(dashboard)/billing/page.tsx`, `create/page.tsx`, `[id]/page.tsx`
- `app/(dashboard)/orders/page.tsx`, `create/page.tsx`, `[id]/page.tsx`
- `app/(dashboard)/tables/page.tsx`, `create/page.tsx`, `[id]/page.tsx`
- `app/(dashboard)/table-roster/page.tsx`, `create/page.tsx`, `[id]/page.tsx`

---

## 5. Result

- **No 404s for tree links:** Every `routePath` returned by `/api/app-menus/tree` has a matching Next.js route (list and, where applicable, create/edit).
- **Scaffolded CRUD:** List tables, create forms, and view/edit pages are in place for Customers, Inventory, Billing, Orders, Table Management, and Table Roster, using the same patterns as Branches and Restaurants.
- **Backend alignment:** Create/update payloads and types follow the RMS service DTOs; you may need to adjust request shape (e.g. nested `branch`/`menuItem`) if the backend expects different JSON.

---

## 6. Optional next steps

- Run Liquibase (or restart the RMS service) so the `route_path` fix is applied for existing environments.
- Refine create/edit forms (validation, required fields, nested payloads) to match exact API contracts.
- Add search/filters on list pages where the API supports `_search` or query params.
