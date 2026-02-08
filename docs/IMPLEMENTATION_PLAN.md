# RMS Web App Implementation Plan

## Overview

Based on the OpenAPI specification analysis from the RMS Service, we have **128 API endpoints** covering comprehensive restaurant management functionality. This plan outlines the implementation path from **Option C → Option B → Option A**.

## API Analysis Summary

### Available Resources (128 endpoints)

**Core Management (Priority 1)**
- Restaurants (3 endpoints: CRUD + search)
- Branches (3 endpoints: CRUD + search)  
- Users (rms-users: 3 endpoints: CRUD + search)
- Roles & Permissions (6 endpoints)

**Menu Management (Priority 2)**
- Menu Categories (3 endpoints: CRUD + search)
- Menu Items (9 endpoints: CRUD + search + availability + filtering)
- Menu Item Variants (3 endpoints)
- Menu Item Addons (3 endpoints)

**Operations (Priority 3)**
- Tables (BranchTables: 7 endpoints including status management)
- Orders (12 endpoints: CRUD + status updates + items)
- Bills (10 endpoints: generation + breakdown + discounts)
- Payments (9 endpoints: methods + processing + refunds)

**Configuration (Priority 4)**
- Tax Config (3 endpoints)
- Discounts (5 endpoints including validation)
- Inventory (6 endpoints including stock management)
- Shifts (3 endpoints)
- Table Assignments (9 endpoints)

**Analytics & Reporting (Priority 5)**
- Reports (3 endpoints: sales, summaries)
- Customer Loyalty (5 endpoints)

---

## Implementation Path: C → B → A

## Phase 1: Option C - Foundation (Week 1)

### Goal: Set up TypeScript types and API client structure

### Tasks:

#### 1.1 Create Type Definitions (`types/` directory)

Based on OpenAPI schemas, create type files for all resources:

```bash
types/
├── restaurant.ts         # RestaurantDTO
├── branch.ts             # BranchDTO
├── menu-category.ts      # MenuCategoryDTO
├── menu-item.ts          # MenuItemDTO
├── menu-item-variant.ts  # MenuItemVariantDTO
├── menu-item-addon.ts    # MenuItemAddonDTO
├── order.ts              # OrderDTO, OrderItemDTO
├── bill.ts               # BillDTO, BillItemDTO
├── payment.ts            # PaymentDTO, PaymentMethodDTO
├── customer.ts           # CustomerDTO
├── inventory.ts          # InventoryDTO
├── discount.ts           # DiscountDTO
├── tax-config.ts         # TaxConfigDTO
├── table.ts              # BranchTableDTO
├── shift.ts              # ShiftDTO
├── user.ts               # RmsUserDTO
├── role.ts               # RolePermissionDTO
└── common.ts             # Common types
```

**Example: `types/restaurant.ts`**

```typescript
export interface Restaurant {
  id: string;  // UUID
  code: string;
  name: string;
  description?: string;
  contactEmail: string;
  contactPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  timezone?: string;
  logoUrl?: string;
  isActive?: boolean;
  createdDate?: string;
  lastModifiedDate?: string;
}

export interface RestaurantCreate extends Omit<Restaurant, 'id' | 'createdDate' | 'lastModifiedDate'> {}

export interface RestaurantUpdate extends Partial<RestaurantCreate> {
  id: string;
}

export interface RestaurantSearchParams {
  query?: string;
  page?: number;
  size?: number;
  sort?: string[];
}
```

**Example: `types/branch.ts`**

```typescript
import { Restaurant } from './restaurant';

export interface Branch {
  id: string;  // UUID
  code?: string;
  name: string;
  description?: string;
  restaurant?: Restaurant;  // Nested object
  restaurantId?: string;     // For forms
  contactEmail?: string;
  contactPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  openingTime?: string;
  closingTime?: string;
  maxCapacity?: number;
  isActive?: boolean;
  createdDate?: string;
  lastModifiedDate?: string;
}

export interface BranchCreate extends Omit<Branch, 'id' | 'restaurant' | 'createdDate' | 'lastModifiedDate'> {
  restaurantId: string;  // Required for creation
}

export interface BranchUpdate extends Partial<BranchCreate> {
  id: string;
}

export interface BranchSearchParams {
  query?: string;
  restaurantId?: string;
  isActive?: boolean;
  page?: number;
  size?: number;
  sort?: string[];
}
```

#### 1.2 Update API Client (`lib/api-client.ts`)

Expand the API client with all resource endpoints:

```typescript
import { Restaurant, RestaurantCreate, RestaurantUpdate, RestaurantSearchParams } from '@/types/restaurant';
import { Branch, BranchCreate, BranchUpdate, BranchSearchParams } from '@/types/branch';
import { MenuCategory, MenuCategoryCreate, MenuCategoryUpdate } from '@/types/menu-category';
import { MenuItem, MenuItemCreate, MenuItemUpdate } from '@/types/menu-item';
// ... import other types

import { apiConfig } from './config';

// Use environment variable for API base URL
const API_BASE_URL = apiConfig.apiOrigin || 'https://rms-demo.atparui.com';
const API_PATH = '/services/rms/api';  // Gateway routing path

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('kc_token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status} ${response.statusText}`);
  }

  // Handle DELETE responses (often no content)
  if (response.status === 204 || options.method === 'DELETE') {
    return null;
  }

  return response.json();
}

// Helper for query params
function buildQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, String(value));
    }
  });
  const str = query.toString();
  return str ? `?${str}` : '';
}

// ============================================================================
// Restaurant API
// ============================================================================

export const restaurantApi = {
  getAll: (): Promise<Restaurant[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/restaurants`),
  
  getById: (id: string): Promise<Restaurant> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/restaurants/${id}`),
  
  search: (params: RestaurantSearchParams): Promise<Restaurant[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/restaurants/_search${buildQueryString(params)}`),
  
  create: (data: RestaurantCreate): Promise<Restaurant> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/restaurants`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (data: RestaurantUpdate): Promise<Restaurant> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/restaurants/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  partialUpdate: (id: string, data: Partial<Restaurant>): Promise<Restaurant> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/restaurants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string): Promise<void> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/restaurants/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// Branch API
// ============================================================================

export const branchApi = {
  getAll: (): Promise<Branch[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/branches`),
  
  getById: (id: string): Promise<Branch> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/branches/${id}`),
  
  search: (params: BranchSearchParams): Promise<Branch[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/branches/_search${buildQueryString(params)}`),
  
  create: (data: BranchCreate): Promise<Branch> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/branches`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (data: BranchUpdate): Promise<Branch> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/branches/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  partialUpdate: (id: string, data: Partial<Branch>): Promise<Branch> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/branches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string): Promise<void> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/branches/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// Menu Category API
// ============================================================================

export const menuCategoryApi = {
  getAll: (): Promise<MenuCategory[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-categories`),
  
  getById: (id: string): Promise<MenuCategory> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-categories/${id}`),
  
  search: (query: string): Promise<MenuCategory[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-categories/_search?query=${encodeURIComponent(query)}`),
  
  create: (data: MenuCategoryCreate): Promise<MenuCategory> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-categories`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (data: MenuCategoryUpdate): Promise<MenuCategory> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-categories/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string): Promise<void> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-categories/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// Menu Item API
// ============================================================================

export const menuItemApi = {
  getAll: (): Promise<MenuItem[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-items`),
  
  getById: (id: string): Promise<MenuItem> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-items/${id}`),
  
  getByCategory: (categoryId: string): Promise<MenuItem[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-items/category/${categoryId}`),
  
  getByBranchAvailable: (branchId: string): Promise<MenuItem[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-items/branch/${branchId}/available`),
  
  getByBranchFiltered: (branchId: string, params?: any): Promise<MenuItem[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-items/branch/${branchId}/filtered${buildQueryString(params)}`),
  
  search: (query: string): Promise<MenuItem[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-items/_search?query=${encodeURIComponent(query)}`),
  
  create: (data: MenuItemCreate): Promise<MenuItem> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-items`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (data: MenuItemUpdate): Promise<MenuItem> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-items/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  updateAvailability: (id: string, isAvailable: boolean): Promise<MenuItem> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-items/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable }),
    }),
  
  delete: (id: string): Promise<void> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-items/${id}`, {
      method: 'DELETE',
    }),
};

// Continue with other resources...
// - orderApi
// - billApi
// - paymentApi
// - customerApi
// - inventoryApi
// - discountApi
// - taxConfigApi
// - tableApi (branchTables)
// - shiftApi
// - userApi (rmsUsers)
// - roleApi
```

#### 1.3 Deliverables

✅ All TypeScript type definitions created
✅ Complete API client with all endpoints
✅ Utility functions (buildQueryString, fetchWithAuth)
✅ Error handling patterns established
✅ Ready for component development

---

## Phase 2: Option B - Reusable Components (Week 2)

### Goal: Build reusable form components and UI patterns

### Tasks:

#### 2.1 Create Shared Form Components

Build reusable form field components in `components/forms/`:

```bash
components/forms/
├── text-field.tsx          # Text input with label, validation
├── text-area-field.tsx     # Textarea with label
├── select-field.tsx        # Dropdown selector
├── checkbox-field.tsx      # Checkbox with label
├── date-field.tsx          # Date picker
├── time-field.tsx          # Time picker
├── number-field.tsx        # Number input with +/- controls
├── image-upload-field.tsx  # Image upload with preview
├── search-field.tsx        # Search input with icon
└── form-section.tsx        # Card wrapper for form sections
```

**Example: `components/forms/text-field.tsx`**

```typescript
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  type?: 'text' | 'email' | 'tel' | 'url';
}

export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  error,
  helpText,
  type = 'text',
}: TextFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={error ? 'border-destructive' : ''}
      />
      {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
```

#### 2.2 Create Data Table Component

Build a reusable data table component in `components/table/`:

```typescript
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  editPath?: (item: T) => string;
  idField?: keyof T;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onEdit,
  onDelete,
  editPath,
  idField = 'id' as keyof T,
}: DataTableProps<T>) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.label}
              </TableHead>
            ))}
            {(onEdit || onDelete || editPath) && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={String(item[idField])}>
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.render ? column.render(item) : item[column.key]}
                </TableCell>
              ))}
              {(onEdit || onDelete || editPath) && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {editPath && (
                      <Link href={editPath(item)}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    {onEdit && (
                      <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(item)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

#### 2.3 Create Loading & Error Components

```typescript
// components/ui/loading-spinner.tsx
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

// components/ui/error-message.tsx
export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
      <p className="text-sm text-destructive">{message}</p>
    </div>
  );
}

// components/ui/empty-state.tsx
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed p-12 text-center">
      <p className="text-lg font-medium">{title}</p>
      {description && <p className="text-muted-foreground mt-2">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

#### 2.4 Deliverables

✅ Reusable form field components
✅ Generic data table component
✅ Loading/Error/Empty state components
✅ Consistent styling and behavior
✅ Ready for rapid page development

---

## Phase 3: Option A - Feature Pages (Weeks 3-6)

### Goal: Build actual CRUD pages for all resources

### Implementation Order:

#### Week 3: Priority 1 - Core Management

**3.1 Restaurants Module**
- `app/(dashboard)/restaurants/page.tsx` - List page
- `app/(dashboard)/restaurants/create/page.tsx` - Create form
- `app/(dashboard)/restaurants/[id]/page.tsx` - Edit form

**3.2 Branches Module**
- `app/(dashboard)/branches/page.tsx` - List page
- `app/(dashboard)/branches/create/page.tsx` - Create form
- `app/(dashboard)/branches/[id]/page.tsx` - Edit form
- Branch selector component (for filtering by restaurant)

**3.3 Users Module**
- `app/(dashboard)/users/page.tsx` - List page
- `app/(dashboard)/users/create/page.tsx` - Create form
- `app/(dashboard)/users/[id]/page.tsx` - Edit form

**3.4 Roles & Permissions**
- `app/(dashboard)/roles/page.tsx` - List page
- `app/(dashboard)/roles/[id]/page.tsx` - Role details with permissions

#### Week 4: Priority 2 - Menu Management

**4.1 Menu Categories**
- `app/(dashboard)/menu-categories/page.tsx`
- `app/(dashboard)/menu-categories/create/page.tsx`
- `app/(dashboard)/menu-categories/[id]/page.tsx`

**4.2 Menu Items**
- `app/(dashboard)/menu-items/page.tsx`
- `app/(dashboard)/menu-items/create/page.tsx`
- `app/(dashboard)/menu-items/[id]/page.tsx`
- Filter by category
- Toggle availability

**4.3 Menu Variants & Addons**
- `app/(dashboard)/menu-items/[id]/variants/page.tsx`
- `app/(dashboard)/menu-items/[id]/addons/page.tsx`

#### Week 5: Priority 3 - Operations

**5.1 Tables**
- `app/(dashboard)/tables/page.tsx`
- `app/(dashboard)/tables/create/page.tsx`
- `app/(dashboard)/tables/[id]/page.tsx`
- Status management (Available, Occupied, Reserved)

**5.2 Orders**
- `app/(dashboard)/orders/page.tsx`
- `app/(dashboard)/orders/create/page.tsx`
- `app/(dashboard)/orders/[id]/page.tsx`
- Order status tracking

**5.3 Bills**
- `app/(dashboard)/bills/page.tsx`
- `app/(dashboard)/bills/[id]/page.tsx`
- Bill generation and breakdown

**5.4 Payments**
- `app/(dashboard)/payments/page.tsx`
- Payment methods management
- Payment processing

#### Week 6: Priority 4 & 5 - Configuration & Analytics

**6.1 Configuration**
- Tax Config pages
- Discount management
- Inventory management
- Shift management

**6.2 Analytics**
- Reports dashboard
- Sales analytics
- Customer loyalty

---

## Technical Specifications

### File Structure

```
rms-web-app/
├── app/
│   ├── (dashboard)/
│   │   ├── restaurants/
│   │   │   ├── page.tsx
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── branches/
│   │   ├── menu-categories/
│   │   ├── menu-items/
│   │   ├── orders/
│   │   ├── bills/
│   │   └── ...
│   └── ...
├── components/
│   ├── forms/          # Reusable form components
│   ├── table/          # Data table components
│   └── ui/             # shadcn/ui components
├── lib/
│   ├── api-client.ts   # Complete API client
│   ├── config.ts       # App configuration
│   ├── menu.ts         # Dynamic menu from backend
│   └── utils.ts        # Utilities
└── types/
    ├── restaurant.ts   # All type definitions
    ├── branch.ts
    └── ...
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_ORIGIN=https://rms-demo.atparui.com
NEXT_PUBLIC_APP_KEY=RMS
NEXT_PUBLIC_KEYCLOAK_URL=https://auth.atparui.com
NEXT_PUBLIC_KEYCLOAK_REALM=rms-demo
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rms-web
```

### API Configuration

```typescript
// lib/config.ts
export const apiConfig = {
  apiOrigin: process.env.NEXT_PUBLIC_API_ORIGIN || 'https://rms-demo.atparui.com',
  appKey: process.env.NEXT_PUBLIC_APP_KEY || 'RMS',
  keycloak: {
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'https://auth.atparui.com',
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'rms-demo',
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'rms-web',
  },
};
```

---

## Testing Strategy

### Manual Testing Checklist

For each resource page:

✅ **List Page**
- [ ] Data loads correctly
- [ ] Loading spinner shows while fetching
- [ ] Error message shows if API fails
- [ ] Empty state shows when no data
- [ ] Create button navigates to create page
- [ ] Edit button navigates to edit page
- [ ] Delete button shows confirmation and deletes
- [ ] Search/filter works (if applicable)

✅ **Create Page**
- [ ] Form fields render correctly
- [ ] Validation works (required fields)
- [ ] Submit creates record
- [ ] Success redirects to list page
- [ ] Error message shows if creation fails
- [ ] Cancel button returns to list

✅ **Edit Page**
- [ ] Existing data loads and populates form
- [ ] Form fields are editable
- [ ] Submit updates record
- [ ] Success redirects to list page
- [ ] Error message shows if update fails
- [ ] Cancel button returns to list

---

## Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| **Phase 1: Option C** | Week 1 | Types + API Client |
| **Phase 2: Option B** | Week 2 | Reusable Components |
| **Phase 3.1: Priority 1** | Week 3 | Restaurants, Branches, Users, Roles |
| **Phase 3.2: Priority 2** | Week 4 | Menu Categories, Items, Variants |
| **Phase 3.3: Priority 3** | Week 5 | Tables, Orders, Bills, Payments |
| **Phase 3.4: Priority 4-5** | Week 6 | Config, Analytics |

**Total Estimated Time: 6 weeks**

---

## Next Steps (Immediate Actions)

### Step 1: Verify API Access (Today)

Test API access with curl:

```bash
# Get token
curl -X POST "https://auth.atparui.com/realms/rms-demo/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=rms-web" \
  -d "username=gwadmin" \
  -d "password=gwadmin"

# Use token to test restaurants endpoint
curl -X GET "https://rms-demo.atparui.com/services/rms/api/restaurants" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 2: Start Phase 1 (Week 1)

1. Create `types/restaurant.ts`
2. Create `types/branch.ts`
3. Update `lib/api-client.ts` with restaurant and branch APIs
4. Test API calls in browser console

### Step 3: Start Phase 2 (Week 2)

1. Create `components/forms/text-field.tsx`
2. Create `components/table/data-table.tsx`
3. Create `components/ui/loading-spinner.tsx`

### Step 4: Start Phase 3 (Week 3)

1. Create `app/(dashboard)/restaurants/page.tsx`
2. Test with real API data
3. Continue with create and edit pages

---

## Success Criteria

✅ All 128 API endpoints have corresponding UI pages
✅ Menu items from backend automatically populate navigation
✅ Consistent UX across all pages
✅ Type-safe TypeScript throughout
✅ Responsive design (mobile, tablet, desktop)
✅ Proper error handling and loading states
✅ Authentication integrated with Keycloak
✅ CORS handled centrally in gateway

---

## Resources

- OpenAPI Spec: `.mcp-cache/openapi.json` (128 endpoints, 67 schemas)
- Routing Guide: `docs/ROUTING_AND_CRUD_PAGES_GUIDE.md`
- CORS Documentation: `console/docs/CORS_CENTRALIZED_GATEWAY_SOLUTION.md`
- Tenant Manager Reference: `/home/sivakumar/Shiva/Workspace/tenant-manager-web-app`

---

## Conclusion

This plan provides a clear path from **Option C → B → A**:

1. **Option C**: Build solid foundation with types and API client
2. **Option B**: Create reusable components for rapid development
3. **Option A**: Implement all feature pages systematically

The modular approach allows parallel development once the foundation is set, and the reusable components significantly accelerate page development in Phase 3.

**Ready to start? Let's begin with Phase 1: Type definitions!** 🚀
