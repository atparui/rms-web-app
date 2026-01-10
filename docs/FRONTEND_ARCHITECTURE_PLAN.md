# Frontend Architecture Plan
## Based on RMS Service API Analysis

**API Source:** https://rmsgateway.atparui.com/services/rms-service/v3/api-docs  
**OpenAPI Version:** 3.1.0  
**Current Stack:** Next.js 16, React 19, TypeScript, React Query, shadcn/ui, Tailwind CSS

---

## 1. API Endpoint Analysis

### 1.1 Core Domain Modules Identified

Based on the OpenAPI spec, the API is organized into the following functional domains:

#### **User & Access Management**
- `/api/user-sync-logs/{id}` - User synchronization tracking
- `/api/user-branch-roles/{id}` - User role assignments per branch
- `/api/user-branch-roles/{id}/revoke` - Role revocation

#### **Configuration & Settings**
- `/api/tax-configs/{id}` - Tax configuration management
- Various configuration endpoints for system settings

#### **Table & Service Management**
- `/api/table-waiter-assignments/{id}` - Waiter-to-table assignments
- `/api/table-assignments/{id}` - Table assignment management

#### **Order Management** (Inferred from DTOs)
- Order creation, updates, status tracking
- Order items with customizations
- Order status workflows (PENDING → PREPARING → READY → SERVED → PAID)

#### **Menu & Catalog**
- Menu items with variants and addons
- Menu categories
- Menu item customizations

#### **Billing & Payments**
- `/api/bills` - Bill generation and management
- Bill breakdown (items, taxes, discounts)
- Payment method summaries
- Payment processing

#### **Discounts & Promotions**
- Discount validation (`DiscountValidationRequestDTO`)
- Discount application (`DiscountApplicationRequestDTO`)
- Discount management

#### **Loyalty & Rewards**
- Loyalty points management (`LoyaltyPointsRequestDTO`)
- Points redemption

#### **Reporting & Analytics**
- Sales reports (`SalesReportDTO`)
- Sales by category (`SalesByCategoryDTO`)
- Sales by day (`SalesByDayDTO`)
- Daily summary reports (`DailySummaryReportDTO`)
- Payment summaries (`PaymentSummaryDTO`)

#### **Inventory Management** (Inferred)
- Stock adjustments (`StockAdjustmentRequestDTO`)
- Inventory tracking

#### **Navigation & UI Configuration**
- App navigation menus (`AppNavigationMenuResponseDTO`)
- Menu items with permissions

---

## 2. Frontend Architecture Structure

### 2.1 Directory Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes group
│   │   ├── login/
│   │   └── callback/
│   ├── (dashboard)/             # Protected routes group
│   │   ├── layout.tsx           # Dashboard layout with sidebar
│   │   ├── orders/
│   │   │   ├── page.tsx         # Orders list
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx     # Order details
│   │   │   └── new/
│   │   │       └── page.tsx     # Create order
│   │   ├── menu/
│   │   │   ├── page.tsx         # Menu management
│   │   │   ├── items/
│   │   │   │   ├── page.tsx     # Menu items list
│   │   │   │   └── [id]/
│   │   │   └── categories/
│   │   ├── tables/
│   │   │   ├── page.tsx         # Table management
│   │   │   └── [id]/
│   │   ├── bills/
│   │   │   ├── page.tsx         # Bills list
│   │   │   └── [id]/
│   │   ├── reports/
│   │   │   ├── page.tsx         # Reports dashboard
│   │   │   ├── sales/
│   │   │   ├── daily/
│   │   │   └── payments/
│   │   ├── users/
│   │   │   ├── page.tsx         # User management
│   │   │   ├── roles/
│   │   │   └── sync-logs/
│   │   ├── settings/
│   │   │   ├── page.tsx         # Settings dashboard
│   │   │   ├── tax/
│   │   │   ├── discounts/
│   │   │   └── navigation/
│   │   └── inventory/
│   │       ├── page.tsx
│   │       └── adjustments/
│   ├── api/                      # API routes (proxy, webhooks)
│   │   └── proxy/
│   │       └── [...path]/
│   │           └── route.ts
│   ├── layout.tsx
│   └── page.tsx                  # Landing/home
│
├── lib/
│   ├── api/                      # API client layer
│   │   ├── client.ts            # Axios instance with auth
│   │   ├── endpoints.ts         # Endpoint constants
│   │   └── types.ts             # Generated from OpenAPI
│   ├── hooks/                    # React Query hooks
│   │   ├── use-orders.ts
│   │   ├── use-menu.ts
│   │   ├── use-tables.ts
│   │   ├── use-bills.ts
│   │   ├── use-reports.ts
│   │   ├── use-users.ts
│   │   ├── use-settings.ts
│   │   └── use-inventory.ts
│   ├── utils/
│   │   ├── formatters.ts        # Date, currency formatters
│   │   ├── validators.ts        # Zod schemas from OpenAPI
│   │   └── constants.ts         # App constants
│   └── auth/
│       ├── keycloak.ts          # Keycloak client setup
│       └── middleware.ts        # Auth middleware
│
├── components/
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── form.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── sidebar.tsx          # Main navigation sidebar
│   │   ├── header.tsx           # Top header with user menu
│   │   ├── breadcrumbs.tsx
│   │   └── navigation-menu.tsx  # Dynamic from API
│   ├── orders/
│   │   ├── order-list.tsx
│   │   ├── order-card.tsx
│   │   ├── order-form.tsx
│   │   ├── order-status-badge.tsx
│   │   ├── order-items-table.tsx
│   │   └── order-timeline.tsx
│   ├── menu/
│   │   ├── menu-item-card.tsx
│   │   ├── menu-item-form.tsx
│   │   ├── menu-category-select.tsx
│   │   ├── variant-selector.tsx
│   │   └── addon-selector.tsx
│   ├── tables/
│   │   ├── table-grid.tsx       # Visual table layout
│   │   ├── table-status-card.tsx
│   │   ├── table-assignment-form.tsx
│   │   └── waiter-assignment.tsx
│   ├── bills/
│   │   ├── bill-summary.tsx
│   │   ├── bill-breakdown.tsx
│   │   ├── bill-items-table.tsx
│   │   ├── bill-taxes.tsx
│   │   ├── bill-discounts.tsx
│   │   └── payment-method-selector.tsx
│   ├── reports/
│   │   ├── sales-chart.tsx
│   │   ├── sales-by-category.tsx
│   │   ├── sales-by-day.tsx
│   │   ├── daily-summary-card.tsx
│   │   └── payment-summary.tsx
│   ├── users/
│   │   ├── user-list.tsx
│   │   ├── user-form.tsx
│   │   ├── role-assignment.tsx
│   │   └── sync-logs-table.tsx
│   ├── settings/
│   │   ├── tax-config-form.tsx
│   │   ├── discount-form.tsx
│   │   └── navigation-editor.tsx
│   └── shared/
│       ├── data-table.tsx        # Reusable table with sorting/filtering
│       ├── search-input.tsx
│       ├── filter-bar.tsx
│       ├── pagination.tsx
│       ├── loading-spinner.tsx
│       ├── error-boundary.tsx
│       └── empty-state.tsx
│
├── types/                        # TypeScript types
│   ├── api/                      # Generated from OpenAPI
│   │   ├── orders.ts
│   │   ├── menu.ts
│   │   ├── bills.ts
│   │   ├── reports.ts
│   │   └── index.ts
│   └── app/                      # App-specific types
│       ├── navigation.ts
│       └── common.ts
│
└── scripts/
    ├── generate-types.ts         # Generate TS from OpenAPI
    └── sync-api-docs.ts          # Sync OpenAPI spec
```

---

## 3. Data Layer Architecture

### 3.1 API Client Setup

**File:** `lib/api/client.ts`

```typescript
// Axios instance with:
// - Base URL: GATEWAY_URL + /services/rms-service
// - Automatic Bearer token injection from Keycloak
// - Request/response interceptors
// - Error handling
// - Retry logic for failed requests
```

### 3.2 React Query Hooks Structure

Each domain module will have custom hooks following this pattern:

**Example:** `lib/hooks/use-orders.ts`

```typescript
// Query hooks:
- useOrders(filters)           // List orders with filters
- useOrder(id)                  // Single order details
- useOrderItems(orderId)        // Order items with details

// Mutation hooks:
- useCreateOrder()              // Create new order
- useUpdateOrder()              // Update order
- useUpdateOrderStatus()        // Status transitions
- useDeleteOrder()              // Cancel/delete order
- useAddOrderItem()             // Add item to order
- useUpdateOrderItem()          // Modify order item
- useRemoveOrderItem()          // Remove item
```

**Similar patterns for:**
- `use-menu.ts` - Menu items, categories, variants, addons
- `use-tables.ts` - Tables, assignments, waiter assignments
- `use-bills.ts` - Bills, bill generation, payment processing
- `use-reports.ts` - Sales, daily summaries, payment summaries
- `use-users.ts` - Users, roles, sync logs
- `use-settings.ts` - Tax configs, discounts, navigation
- `use-inventory.ts` - Stock adjustments, inventory tracking

### 3.3 Type Generation Strategy

**Approach:** Generate TypeScript types from OpenAPI spec

1. **Use `openapi-typescript` or `swagger-typescript-api`**
2. **Generate types for all DTOs:**
   - Request DTOs (for forms)
   - Response DTOs (for data display)
   - Query/Path parameters
3. **Store in:** `types/api/` directory
4. **Auto-generate on:** API spec changes or build time

**Key DTOs to generate:**
- `OrderDTO`, `OrderWithItemsDTO`, `OrderItemWithDetailsDTO`
- `MenuItemDTO`, `MenuItemVariantDTO`, `MenuItemAddonDTO`
- `BillDTO`, `BillBreakdownDTO`, `BillItemBreakdownDTO`
- `SalesReportDTO`, `DailySummaryReportDTO`, `PaymentSummaryDTO`
- `UserDTO`, `UserBranchRoleDTO`, `UserSyncLogDTO`
- `TaxConfigDTO`, `DiscountDTO`
- All request DTOs for form validation

---

## 4. Component Architecture

### 4.1 Component Hierarchy

```
Page Component
  └── Layout (Sidebar + Header)
      └── Feature Container
          ├── Filters/Search Bar
          ├── Action Buttons
          └── Data Display
              ├── List/Table Component
              │   └── Item Card/Row Component
              └── Detail View (Modal/Drawer)
                  └── Form Components
```

### 4.2 Component Patterns

#### **List/Table Components**
- Reusable `DataTable` component with:
  - Sorting
  - Filtering
  - Pagination
  - Row actions (edit, delete, view)
  - Bulk actions
  - Export functionality

#### **Form Components**
- Form builder using `react-hook-form` + `zod`
- Auto-generate forms from OpenAPI request schemas
- Field components:
  - Text inputs
  - Number inputs
  - Date/time pickers
  - Selects (single/multi)
  - Checkboxes/Radios
  - File uploads
  - Rich text editors (for descriptions)

#### **Status Components**
- Status badges with color coding
- Status transition buttons
- Status timeline/stepper

#### **Card Components**
- Summary cards for dashboards
- Detail cards for entity views
- Action cards with quick actions

---

## 5. Page Structure & Routing

### 5.1 Route Groups

#### **(auth)** - Authentication Routes
- `/login` - Keycloak login redirect
- `/callback` - OAuth callback handler
- `/logout` - Logout handler

#### **(dashboard)** - Protected Routes
All routes require authentication and role-based access.

### 5.2 Main Feature Pages

#### **Orders Management** (`/orders`)
- **List View:**
  - Filters: Status, date range, branch, waiter
  - Table with: Order #, table, status, total, time
  - Quick actions: View, edit status, generate bill
- **Detail View:** (`/orders/[id]`)
  - Order header (number, status, timestamps)
  - Customer/table info
  - Items table with customizations
  - Status timeline
  - Actions: Update status, add items, generate bill
- **Create Order:** (`/orders/new`)
  - Table selection
  - Menu item selection with variants/addons
  - Customer selection/creation
  - Special instructions

#### **Menu Management** (`/menu`)
- **Items List:** (`/menu/items`)
  - Grid/list view toggle
  - Filters: Category, availability, search
  - Actions: Create, edit, toggle availability
- **Item Detail:** (`/menu/items/[id]`)
  - Basic info form
  - Variants management
  - Addons management
  - Image upload
  - Pricing
- **Categories:** (`/menu/categories`)
  - Category tree/list
  - Create/edit categories

#### **Table Management** (`/tables`)
- **Visual Grid View:**
  - Table status indicators (available, occupied, reserved)
  - Click to view details
  - Drag-and-drop waiter assignment
- **Table Detail:** (`/tables/[id]`)
  - Table info
  - Current order (if occupied)
  - Waiter assignment
  - Assignment history

#### **Billing** (`/bills`)
- **Bills List:**
  - Filters: Date, payment status, branch
  - Table with: Bill #, order, amount, status
- **Bill Detail:** (`/bills/[id]`)
  - Bill breakdown component
  - Items breakdown
  - Tax breakdown
  - Discount breakdown
  - Payment methods
  - Print/export functionality

#### **Reports** (`/reports`)
- **Dashboard:** (`/reports`)
  - Summary cards (today's sales, orders, revenue)
  - Quick date range selector
- **Sales Report:** (`/reports/sales`)
  - Date range picker
  - Sales by category chart
  - Sales by day chart
  - Export to CSV/PDF
- **Daily Summary:** (`/reports/daily`)
  - Calendar view
  - Daily summary cards
  - Comparison charts
- **Payment Summary:** (`/reports/payments`)
  - Payment method breakdown
  - Transaction list
  - Charts

#### **User Management** (`/users`)
- **Users List:**
  - Search and filters
  - User cards with roles
  - Actions: Edit, assign roles, view sync logs
- **Role Management:** (`/users/roles`)
  - User-branch-role assignments
  - Role assignment form
  - Role revocation
- **Sync Logs:** (`/users/sync-logs`)
  - Sync history table
  - Filter by user, date, status

#### **Settings** (`/settings`)
- **Tax Configuration:** (`/settings/tax`)
  - Tax config list
  - Create/edit tax configs
  - Tax rate management
- **Discounts:** (`/settings/discounts`)
  - Discount list
  - Create/edit discounts
  - Discount validation testing
- **Navigation:** (`/settings/navigation`)
  - Menu editor (drag-and-drop)
  - Menu item permissions
  - Icon/route configuration

#### **Inventory** (`/inventory`)
- **Stock Overview:**
  - Current stock levels
  - Low stock alerts
- **Adjustments:** (`/inventory/adjustments`)
  - Adjustment history
  - Create adjustment form
  - Reason tracking

---

## 6. State Management Strategy

### 6.1 Server State (React Query)
- All API data managed by React Query
- Automatic caching, refetching, background updates
- Optimistic updates for mutations
- Query invalidation on mutations

### 6.2 Client State
- **Form State:** `react-hook-form` local state
- **UI State:** React `useState` for:
  - Modal/dialog open/close
  - Sidebar collapse
  - Theme (light/dark)
  - Filters (can be URL params)
- **Global UI State:** Context API for:
  - User profile
  - Notifications
  - Navigation menu (from API)

### 6.3 URL State
- Use Next.js search params for:
  - Filters
  - Pagination
  - Sort order
  - Date ranges
- Enables shareable URLs and browser back/forward

---

## 7. Form Handling & Validation

### 7.1 Validation Strategy
- **Generate Zod schemas from OpenAPI request schemas**
- Use `@hookform/resolvers/zod` for form validation
- Real-time validation feedback
- Server-side validation error display

### 7.2 Form Patterns

#### **Create Forms**
- Full form with all required fields
- Progressive disclosure for optional fields
- Inline validation

#### **Edit Forms**
- Pre-populated with existing data
- Dirty state tracking
- Save/cancel actions

#### **Quick Actions**
- Inline editing for simple fields
- Modal forms for complex operations
- Confirmation dialogs for destructive actions

### 7.3 Form Components
- Auto-generate form fields from OpenAPI schema
- Field types mapped to UI components:
  - `string` → TextInput
  - `number` → NumberInput
  - `date` → DatePicker
  - `enum` → Select
  - `boolean` → Checkbox
  - `array` → Multi-select or dynamic list
  - `object` → Nested form section

---

## 8. Authentication & Authorization

### 8.1 Authentication Flow
1. User visits protected route
2. Check Keycloak session
3. If not authenticated → redirect to Keycloak login
4. After login → redirect back with code
5. Exchange code for tokens
6. Store tokens (httpOnly cookies or secure storage)
7. Include Bearer token in API requests

### 8.2 Role-Based Access Control (RBAC)
- Use roles from Keycloak token (`ROLE_ADMIN`, etc.)
- Protect routes based on roles
- Hide/show UI elements based on permissions
- API-level permissions handled by backend

### 8.3 Implementation
- **Middleware:** Next.js middleware for route protection
- **HOC/Component:** `withAuth` HOC or `ProtectedRoute` component
- **Hook:** `useAuth()` hook for user/role info
- **API Client:** Automatic token injection in axios interceptor

---

## 9. Real-Time Features (Future)

### 9.1 WebSocket Integration
- Order status updates
- Table status changes
- New order notifications
- Bill generation notifications

### 9.2 Polling Strategy (Initial)
- Poll for order status changes
- Poll for new orders
- Configurable polling intervals

---

## 10. Performance Optimization

### 10.1 Data Fetching
- React Query caching (5-minute default)
- Pagination for large lists
- Infinite scroll or "Load More" for lists
- Lazy loading for detail views

### 10.2 Code Splitting
- Route-based code splitting (automatic with Next.js)
- Component lazy loading for heavy components
- Dynamic imports for charts/reports

### 10.3 Image Optimization
- Next.js Image component for menu item images
- Lazy loading images
- Responsive images

### 10.4 Bundle Optimization
- Tree shaking
- Minimize dependencies
- Code splitting by feature

---

## 11. Error Handling

### 11.1 Error Boundaries
- Global error boundary for app crashes
- Feature-level error boundaries
- Graceful error UI

### 11.2 API Error Handling
- Standardized error responses from API
- Error message display (toast notifications)
- Retry logic for transient errors
- Offline detection and messaging

### 11.3 Form Error Handling
- Field-level error messages
- Server validation error mapping
- Submission error display

---

## 12. Testing Strategy

### 12.1 Unit Tests
- Utility functions
- Form validators
- Data formatters
- Custom hooks (with React Query test utils)

### 12.2 Component Tests
- UI components (React Testing Library)
- Form components
- Integration tests for feature flows

### 12.3 E2E Tests
- Critical user flows:
  - Order creation
  - Bill generation
  - User role assignment
  - Report generation

---

## 13. Development Workflow

### 13.1 Type Generation
1. Sync OpenAPI spec (via MCP server or script)
2. Generate TypeScript types
3. Generate Zod schemas from types
4. Update API client types

### 13.2 Feature Development Flow
1. Analyze OpenAPI endpoint
2. Generate types/schemas
3. Create React Query hooks
4. Build UI components
5. Integrate into page
6. Add error handling
7. Test and refine

### 13.3 Code Generation Opportunities
- Generate React Query hooks from OpenAPI
- Generate form components from request schemas
- Generate table columns from response schemas
- Generate TypeScript types (already planned)

---

## 14. UI/UX Considerations

### 14.1 Design System
- Use shadcn/ui as base component library
- Consistent spacing, colors, typography
- Dark mode support
- Responsive design (mobile-first)

### 14.2 User Experience
- Loading states (skeletons, spinners)
- Empty states with helpful messages
- Success/error feedback (toasts)
- Confirmation dialogs for destructive actions
- Optimistic UI updates
- Keyboard shortcuts for power users

### 14.3 Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast compliance

---

## 15. Deployment Considerations

### 15.1 Environment Configuration
- API gateway URL
- Keycloak configuration
- Feature flags
- Analytics keys

### 15.2 Build Optimization
- Static generation where possible
- ISR (Incremental Static Regeneration) for reports
- API route optimization

### 15.3 Monitoring
- Error tracking (Sentry or similar)
- Performance monitoring
- User analytics
- API error logging

---

## 16. Implementation Priority

### Phase 1: Foundation (Week 1-2)
1. ✅ Type generation from OpenAPI
2. ✅ API client setup with auth
3. ✅ React Query configuration
4. ✅ Base UI components (shadcn/ui)
5. ✅ Layout structure (sidebar, header)
6. ✅ Authentication flow

### Phase 2: Core Features (Week 3-6)
1. Orders management (CRUD)
2. Menu management (CRUD)
3. Table management
4. Basic billing

### Phase 3: Advanced Features (Week 7-10)
1. Reports and analytics
2. User management
3. Settings configuration
4. Inventory management

### Phase 4: Polish & Optimization (Week 11-12)
1. Performance optimization
2. Error handling improvements
3. Accessibility enhancements
4. Testing
5. Documentation

---

## 17. Key Technical Decisions

### 17.1 Data Fetching
- **Choice:** React Query
- **Reason:** Excellent caching, background updates, optimistic updates, built-in loading/error states

### 17.2 Form Handling
- **Choice:** react-hook-form + Zod
- **Reason:** Performance, type safety, easy validation, good DX

### 17.3 UI Components
- **Choice:** shadcn/ui
- **Reason:** Customizable, accessible, modern, Tailwind-based

### 17.4 Type Safety
- **Choice:** Generate from OpenAPI
- **Reason:** Single source of truth, automatic updates, type safety end-to-end

### 17.5 State Management
- **Choice:** React Query + Context API (minimal)
- **Reason:** React Query handles server state excellently, minimal client state needed

---

## 18. Open Questions & Considerations

1. **Real-time Updates:** WebSocket vs polling? (Start with polling)
2. **Offline Support:** PWA capabilities needed?
3. **Mobile App:** Separate mobile app or responsive web?
4. **Multi-tenancy:** How to handle multiple restaurants/branches?
5. **Internationalization:** Multi-language support needed?
6. **Print Functionality:** PDF generation for bills/reports?
7. **Export Formats:** CSV, Excel, PDF exports?
8. **File Uploads:** Image storage strategy for menu items?
9. **Audit Logging:** Track all changes for compliance?
10. **Backup/Restore:** Data backup and restore functionality?

---

## 19. Success Metrics

- **Performance:** Page load < 2s, API response < 500ms
- **User Experience:** < 3 clicks to complete common tasks
- **Reliability:** 99.9% uptime, < 1% error rate
- **Developer Experience:** Type safety, auto-completion, fast builds
- **Maintainability:** Clear structure, reusable components, good documentation

---

## 20. Next Steps

1. **Review and approve this architecture plan**
2. **Set up type generation pipeline**
3. **Create base API client and React Query setup**
4. **Build layout components (sidebar, header)**
5. **Implement authentication flow**
6. **Start with Orders feature (highest priority)**
7. **Iterate and refine based on feedback**

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-04  
**Author:** Architecture Planning  
**Status:** Planning Phase - Awaiting Approval

