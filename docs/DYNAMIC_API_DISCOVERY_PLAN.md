# Dynamic API Discovery & Frontend Scaffolding Plan

## Overview

This document outlines a comprehensive plan for dynamically discovering APIs from the gateway (`rmsgateway.atparui.com`) and automatically scaffolding frontend pages in the Next.js application. The approach avoids manual copy-pasting of Swagger specs and creates a maintainable, dynamic system.

## Architecture Decision: Do We Need NestJS?

### Recommendation: **NO, NestJS is NOT needed**

**Reasoning:**
1. **You already have RESTful endpoints** in your Spring Boot services (rms, rms-service)
2. **Gateway already exists** - Spring Cloud Gateway at `rmsgateway.atparui.com`
3. **Next.js API Routes are sufficient** - For proxying, authentication, and middleware
4. **Avoid duplication** - Adding NestJS would create another backend layer unnecessarily
5. **Next.js middleware** can handle authentication, request proxying, and API orchestration

**What Next.js provides:**
- API Routes (`/app/api/*`) for server-side logic
- Middleware for authentication and request handling
- Server Components for data fetching
- Built-in proxy capabilities

**When NestJS would make sense:**
- If you need complex business logic on the server
- If you need real-time features (WebSockets) that Next.js can't handle well
- If you need background job processing
- If you want a separate API layer for aggregation

**For your use case:** Next.js API routes + middleware is the optimal solution.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  Components  │  │   Hooks      │      │
│  │ (Generated)  │  │ (Generated)  │  │ (Generated)  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
│  ┌──────▼─────────────────▼──────────────────▼───────┐      │
│  │         API Client Layer (React Query)            │      │
│  │         - Auto-generated hooks                    │      │
│  │         - Type-safe API calls                     │      │
│  └───────────────────────┬───────────────────────────┘      │
│                          │                                   │
│  ┌───────────────────────▼───────────────────────────┐      │
│  │         Next.js Middleware                         │      │
│  │         - Authentication (Keycloak)               │      │
│  │         - Token refresh                            │      │
│  │         - Request proxying                         │      │
│  └───────────────────────┬───────────────────────────┘      │
│                          │                                   │
│  ┌───────────────────────▼───────────────────────────┐      │
│  │         API Discovery Service                      │      │
│  │         - Fetches OpenAPI/Swagger specs            │      │
│  │         - Parses endpoints                         │      │
│  │         - Generates TypeScript types               │      │
│  │         - Scaffolds pages/components                │      │
│  └───────────────────────┬───────────────────────────┘      │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTPS + Bearer Token
                           ▼
┌─────────────────────────────────────────────────────────────┐
│         Spring Cloud Gateway                                 │
│         rmsgateway.atparui.com                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   /v3/api-   │  │  /swagger.   │  │  /actuator/   │      │
│  │   docs       │  │  json        │  │  gateway/     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────┬──────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   RMS       │ │ RMS-Service │ │  Other      │
│   Service   │ │             │ │  Services   │
└─────────────┘ └─────────────┘ └─────────────┘
```

---

## Implementation Plan

### Phase 1: API Discovery Infrastructure

#### 1.1 API Discovery Service
**Location:** `frontend/lib/api-discovery.ts`

**Purpose:** Dynamically fetch and parse OpenAPI/Swagger specifications from the gateway

**Key Features:**
- Try multiple common OpenAPI endpoints:
  - `/v3/api-docs` (OpenAPI 3.0)
  - `/swagger.json` (Swagger 2.0)
  - `/api-docs`
  - `/actuator/gateway/routes` (Spring Cloud Gateway)
- Parse OpenAPI/Swagger JSON
- Extract endpoints, schemas, parameters, responses
- Group endpoints by tags/services
- Handle authentication (Bearer token)

**Methods:**
```typescript
class APIDiscoveryService {
  discoverServices(): Promise<DiscoveredService[]>
  fetchOpenAPISpec(serviceName: string): Promise<OpenAPISpec>
  parseService(spec: OpenAPISpec): DiscoveredService
  groupEndpointsByTag(service: DiscoveredService): Record<string, Endpoint[]>
}
```

#### 1.2 Type Generator
**Location:** `frontend/lib/type-generator.ts`

**Purpose:** Generate TypeScript types from OpenAPI schemas

**Key Features:**
- Parse OpenAPI schema definitions
- Generate TypeScript interfaces/types
- Handle nested schemas, arrays, enums
- Generate request/response types for each endpoint
- Output to `frontend/types/api-generated.ts`

**Output Example:**
```typescript
// Auto-generated from OpenAPI spec
export interface RestaurantDto {
  id: string;
  name: string;
  address: string;
  // ... from schema
}

export interface GetRestaurantsResponse {
  data: RestaurantDto[];
}
```

#### 1.3 Scaffolding Engine
**Location:** `frontend/lib/scaffold-generator.ts`

**Purpose:** Generate Next.js pages and components from discovered endpoints

**Key Features:**
- Generate pages based on endpoint tags (e.g., `/restaurants`, `/orders`)
- Create list pages for GET endpoints
- Create detail pages for GET by ID endpoints
- Create form pages for POST/PUT endpoints
- Generate React Query hooks for each endpoint
- Create shadcn/ui components (tables, forms, cards)

**Generated Structure:**
```
app/
  (dashboard)/
    restaurants/
      page.tsx          # List page
      [id]/
        page.tsx        # Detail page
      new/
        page.tsx        # Create form
    orders/
      page.tsx
      [id]/
        page.tsx
```

---

### Phase 2: Next.js Middleware & Authentication

#### 2.1 Authentication Middleware
**Location:** `frontend/middleware.ts`

**Purpose:** Handle authentication, token management, and request proxying

**Key Features:**
- Keycloak OAuth2 integration
- Token refresh logic
- Route protection based on roles
- API request proxying to gateway
- Token injection into proxied requests

**Flow:**
1. User accesses protected route
2. Middleware checks for valid session/token
3. If invalid, redirect to Keycloak login
4. After login, store tokens securely
5. For API calls, inject Bearer token

**Implementation:**
```typescript
export function middleware(request: NextRequest) {
  // 1. Check authentication
  // 2. Validate token
  // 3. Refresh if needed
  // 4. Allow/deny based on roles
  // 5. Proxy API requests with token
}
```

#### 2.2 API Proxy Routes
**Location:** `frontend/app/api/proxy/[...path]/route.ts`

**Purpose:** Proxy API requests to gateway with authentication

**Key Features:**
- Forward requests to `rmsgateway.atparui.com`
- Inject authentication headers
- Handle CORS
- Error handling and transformation
- Request/response logging (dev only)

**Usage:**
- Frontend calls: `/api/proxy/restaurants`
- Proxies to: `https://rmsgateway.atparui.com/api/v1/restaurants`

---

### Phase 3: API Client & React Query Integration

#### 3.1 Auto-Generated API Client
**Location:** `frontend/lib/api-client.ts` (generated)

**Purpose:** Type-safe API client functions

**Features:**
- Auto-generated from OpenAPI spec
- Type-safe request/response handling
- Error handling
- Request interceptors for auth

#### 3.2 React Query Hooks Generator
**Location:** `frontend/hooks/api/` (generated)

**Purpose:** Generate React Query hooks for each endpoint

**Generated Hooks:**
```typescript
// hooks/api/useRestaurants.ts (generated)
export function useRestaurants() {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: () => apiClient.getRestaurants(),
  });
}

export function useRestaurant(id: string) {
  return useQuery({
    queryKey: ['restaurants', id],
    queryFn: () => apiClient.getRestaurant(id),
  });
}

export function useCreateRestaurant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.createRestaurant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
}
```

---

### Phase 4: Page & Component Scaffolding

#### 4.1 List Page Generator
**Template:** Generate pages for GET endpoints that return arrays

**Features:**
- Data table with shadcn/ui
- Pagination
- Filtering/search
- Sorting
- Actions (view, edit, delete)

**Example Generated:**
```typescript
// app/(dashboard)/restaurants/page.tsx
export default function RestaurantsPage() {
  const { data, isLoading } = useRestaurants();
  
  return (
    <div>
      <DataTable data={data} columns={columns} />
    </div>
  );
}
```

#### 4.2 Detail Page Generator
**Template:** Generate pages for GET by ID endpoints

**Features:**
- Display entity details
- Related data (if applicable)
- Action buttons (edit, delete)
- Breadcrumbs

#### 4.3 Form Page Generator
**Template:** Generate forms for POST/PUT endpoints

**Features:**
- React Hook Form integration
- Zod validation (from OpenAPI schema)
- shadcn/ui form components
- Error handling
- Success/error toasts

**Example Generated:**
```typescript
// app/(dashboard)/restaurants/new/page.tsx
export default function NewRestaurantPage() {
  const form = useForm<CreateRestaurantDto>({
    resolver: zodResolver(createRestaurantSchema),
  });
  
  const createMutation = useCreateRestaurant();
  
  // Form JSX with shadcn components
}
```

#### 4.4 Component Library Integration
**Use shadcn/ui components:**
- `DataTable` for lists
- `Form`, `Input`, `Select` for forms
- `Card`, `Dialog`, `Sheet` for layouts
- `Button`, `Badge` for actions
- `Alert`, `Toast` for feedback

---

### Phase 5: Scaffolding CLI/Command

#### 5.1 Scaffold Command
**Location:** `frontend/scripts/scaffold.ts` or npm script

**Purpose:** Run scaffolding process

**Usage:**
```bash
npm run scaffold
# or
npm run scaffold:discover
npm run scaffold:generate
npm run scaffold:types
```

**Process:**
1. Fetch OpenAPI spec from gateway
2. Parse and extract endpoints
3. Generate TypeScript types
4. Generate React Query hooks
5. Generate pages and components
6. Update navigation/routing

**Options:**
- `--force` - Overwrite existing files
- `--service <name>` - Scaffold specific service only
- `--tag <tag>` - Scaffold specific tag only
- `--dry-run` - Show what would be generated

---

## File Structure

```
frontend/
├── app/
│   ├── api/
│   │   └── proxy/
│   │       └── [...path]/
│   │           └── route.ts          # API proxy
│   ├── (dashboard)/
│   │   ├── restaurants/               # Generated
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   ├── orders/                    # Generated
│   │   └── ...
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                            # shadcn components
│   └── generated/                     # Generated components
│       ├── RestaurantTable.tsx
│       ├── RestaurantForm.tsx
│       └── ...
├── hooks/
│   └── api/                           # Generated hooks
│       ├── useRestaurants.ts
│       ├── useOrders.ts
│       └── ...
├── lib/
│   ├── api-discovery.ts               # Discovery service
│   ├── type-generator.ts              # Type generator
│   ├── scaffold-generator.ts          # Scaffold generator
│   ├── api-client.ts                  # Generated API client
│   └── auth.ts                        # Auth utilities
├── middleware.ts                      # Next.js middleware
├── types/
│   └── api-generated.ts               # Generated types
├── scripts/
│   └── scaffold.ts                    # Scaffolding CLI
└── package.json
```

---

## Environment Configuration

**`.env.local`:**
```env
# Gateway Configuration
NEXT_PUBLIC_GATEWAY_URL=https://rmsgateway.atparui.com
NEXT_PUBLIC_API_BASE_PATH=/api/v1

# Keycloak Configuration
NEXT_PUBLIC_KEYCLOAK_URL=https://keycloak.atparui.com
NEXT_PUBLIC_KEYCLOAK_REALM=gateway-realm
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rms-web-app

# API Discovery
NEXT_PUBLIC_API_DISCOVERY_ENABLED=true
NEXT_PUBLIC_OPENAPI_PATH=/v3/api-docs

# Development
NEXT_PUBLIC_DEV_MODE=true
```

---

## Best Practices & Considerations

### 1. Authentication Flow
- **Use httpOnly cookies** for token storage (not localStorage)
- **Token refresh** before expiration
- **Silent refresh** in background
- **Redirect to login** on 401 errors

### 2. API Proxying
- **Next.js API routes** act as proxy to avoid CORS issues
- **Server-side token injection** (tokens never exposed to client)
- **Request/response transformation** if needed
- **Error handling** and logging

### 3. Type Safety
- **Generate types** from OpenAPI spec
- **Keep types in sync** with API changes
- **Use Zod** for runtime validation
- **Type-safe API client**

### 4. Code Generation
- **Idempotent generation** - running multiple times is safe
- **Preserve custom code** - use markers/comments to protect manual edits
- **Incremental updates** - only regenerate changed parts
- **Version control** - commit generated files or add to .gitignore

### 5. Error Handling
- **Centralized error handling** in API client
- **User-friendly error messages**
- **Retry logic** for transient failures
- **Error boundaries** in React

### 6. Performance
- **React Query caching** for API responses
- **Optimistic updates** for mutations
- **Pagination** for large lists
- **Lazy loading** for routes

### 7. Security
- **Never expose tokens** to client-side code
- **Validate all inputs** (Zod schemas)
- **Sanitize user inputs** to prevent XSS
- **Rate limiting** on API routes
- **CSRF protection**

---

## Scaffolding Workflow

### Initial Setup (One-time)
1. Configure environment variables
2. Set up Keycloak authentication
3. Run `npm run scaffold` to discover and generate

### Development Workflow
1. **API changes** in backend services
2. **Update OpenAPI spec** (auto or manual)
3. **Run scaffold command** to regenerate types/hooks/pages
4. **Review generated code** and customize as needed
5. **Test and iterate**

### Customization Strategy
- **Generated code** uses markers: `// AUTO-GENERATED - DO NOT EDIT`
- **Custom code** goes in separate files or marked sections
- **Templates** can be customized in `scripts/templates/`
- **Overrides** can be specified in `scaffold.config.ts`

---

## Alternative Approaches Considered

### 1. MCP (Model Context Protocol) Approach
**Pros:**
- Could use MCP to fetch API specs dynamically
- Real-time discovery

**Cons:**
- Adds complexity
- Requires MCP server setup
- Overkill for this use case

**Decision:** Not needed - direct HTTP calls to gateway are simpler

### 2. Swagger Codegen
**Pros:**
- Industry standard
- Mature tooling

**Cons:**
- Less flexible
- Harder to customize for Next.js/React
- Requires separate tool installation

**Decision:** Custom generator gives more control

### 3. OpenAPI Generator
**Pros:**
- Supports TypeScript/React
- Many templates available

**Cons:**
- Generated code may not match our patterns
- Harder to integrate with Next.js App Router
- Less control over output

**Decision:** Custom generator for better Next.js integration

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] API Discovery Service
- [ ] OpenAPI Parser
- [ ] Type Generator
- [ ] Basic scaffolding structure

### Phase 2: Authentication & Middleware (Week 1-2)
- [ ] Keycloak integration
- [ ] Next.js middleware
- [ ] API proxy routes
- [ ] Token management

### Phase 3: Code Generation (Week 2)
- [ ] React Query hooks generator
- [ ] API client generator
- [ ] Page generators (list, detail, form)
- [ ] Component generators

### Phase 4: Scaffolding CLI (Week 2-3)
- [ ] Scaffold command implementation
- [ ] Template system
- [ ] Configuration file
- [ ] Documentation

### Phase 5: Testing & Refinement (Week 3)
- [ ] Test with real gateway
- [ ] Refine generators
- [ ] Add error handling
- [ ] Performance optimization

### Phase 6: Documentation & Polish (Week 3-4)
- [ ] User documentation
- [ ] Developer guide
- [ ] Examples
- [ ] Best practices guide

---

## Success Criteria

1. ✅ Can discover APIs from gateway automatically
2. ✅ Generates TypeScript types from OpenAPI spec
3. ✅ Generates React Query hooks for all endpoints
4. ✅ Generates pages for CRUD operations
5. ✅ Authentication works seamlessly
6. ✅ Generated code is maintainable and customizable
7. ✅ Scaffolding can be run multiple times safely
8. ✅ Performance is acceptable
9. ✅ Code follows Next.js and React best practices

---

## Questions to Resolve

1. **Gateway OpenAPI endpoint:** What is the exact path? (`/v3/api-docs`, `/swagger.json`, etc.)
2. **Service discovery:** Does gateway expose service list? (Spring Cloud Gateway actuator?)
3. **Authentication:** How to get initial token for discovery? (Service account? User login first?)
4. **Customization:** How much customization is needed per page? (Templates vs. full generation)
5. **Versioning:** How to handle API versioning? (v1, v2, etc.)
6. **Multi-service:** How to handle multiple services? (Separate namespaces? Combined?)

---

## Next Steps

1. **Verify gateway endpoints** - Test OpenAPI discovery paths
2. **Review OpenAPI spec** - Understand structure and schemas
3. **Set up authentication** - Keycloak integration first
4. **Start with Phase 1** - Build discovery service
5. **Iterate and refine** - Test with real APIs

---

## References

- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [React Query](https://tanstack.com/query/latest)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Spring Cloud Gateway](https://spring.io/projects/spring-cloud-gateway)
- [shadcn/ui](https://ui.shadcn.com/)

