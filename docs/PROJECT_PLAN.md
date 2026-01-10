# Restaurant Management System - Web Dashboard
## Detailed Implementation Plan

### 1. Project Overview

**Objective**: Build a web-based dashboard for configuring a restaurant management backend API with industry-standard practices, API-first approach, and comprehensive authentication/authorization.

**Key Requirements**:
- Frontend: React + shadcn/ui + Next.js (SSR)
- Backend: NestJS
- API Documentation: Swagger/OpenAPI
- Authentication: Keycloak (OAuth2)
- Role-Based Access Control (RBAC)

---

### 2. Technology Stack

#### Frontend
- **Next.js 14+** (App Router) - Server-side rendering, API routes
- **React 18+** - UI framework
- **TypeScript** - Type safety
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **TanStack Query (React Query)** - Data fetching & caching
- **next-auth** or **@react-keycloak/nextjs** - Keycloak integration
- **Axios** - HTTP client

#### Backend
- **NestJS** - Node.js framework
- **TypeScript** - Type safety
- **Swagger/OpenAPI** - API documentation
- **@nestjs/swagger** - Swagger integration
- **@nestjs/passport** - Authentication
- **passport-jwt** - JWT strategy for Keycloak
- **class-validator** - DTO validation
- **class-transformer** - Data transformation
- **TypeORM** or **Prisma** - Database ORM (if needed)

#### Authentication & Authorization
- **Keycloak** - Identity and access management
- **OAuth2/OIDC** - Authentication flow
- **JWT** - Token-based authentication

---

### 3. Project Structure

```
rms-web-app/
├── frontend/                    # Next.js application
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/              # Auth routes (login, callback)
│   │   ├── (dashboard)/         # Protected dashboard routes
│   │   │   ├── admin/           # Admin-only routes
│   │   │   ├── cashier/         # Cashier routes
│   │   │   ├── waiter/          # Waiter routes
│   │   │   ├── supervisor/      # Supervisor routes
│   │   │   ├── chef/            # Chef routes
│   │   │   └── customer/        # Customer routes
│   │   ├── api/                 # Next.js API routes (if needed)
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Home page
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── auth/                # Auth-related components
│   │   ├── dashboard/           # Dashboard components
│   │   └── layout/              # Layout components
│   ├── lib/                     # Utilities
│   │   ├── auth/                # Auth utilities
│   │   ├── api/                 # API client
│   │   └── utils.ts             # General utilities
│   ├── hooks/                   # Custom React hooks
│   ├── types/                   # TypeScript types
│   ├── middleware.ts            # Next.js middleware (auth)
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                     # NestJS application
│   ├── src/
│   │   ├── main.ts              # Application entry
│   │   ├── app.module.ts        # Root module
│   │   ├── config/              # Configuration
│   │   │   └── keycloak.config.ts
│   │   ├── auth/                # Authentication module
│   │   │   ├── guards/          # Auth guards
│   │   │   ├── strategies/      # Passport strategies
│   │   │   └── decorators/      # Custom decorators (@Roles, @Public)
│   │   ├── common/              # Shared modules
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   └── interceptors/
│   │   ├── modules/             # Feature modules
│   │   │   ├── restaurant/      # Restaurant config
│   │   │   ├── menu/            # Menu management
│   │   │   ├── orders/          # Order management
│   │   │   ├── tables/          # Table management
│   │   │   └── users/           # User management
│   │   └── swagger/             # Swagger configuration
│   ├── test/                    # E2E tests
│   ├── nest-cli.json
│   ├── tsconfig.json
│   └── package.json
│
├── docs/                        # Documentation
│   ├── api/                     # API documentation
│   └── architecture.md          # Architecture docs
│
├── docker-compose.yml           # Local development setup
├── .gitignore
└── README.md
```

---

### 4. Keycloak Configuration

#### Roles Definition
```
ROLE_ADMIN        - Full system access, configuration management
ROLE_SUPERVISOR   - Oversight, reporting, limited configuration
ROLE_CASHIER      - Payment processing, order completion
ROLE_WAITER       - Order taking, table management
ROLE_CHEF         - Kitchen operations, order status updates
ROLE_CUSTOMER     - Limited read access (if applicable)
```

#### Keycloak Setup Requirements
1. **Realm**: `rms-realm`
2. **Client**: `rms-web-app` (public client for frontend)
3. **Client**: `rms-backend-api` (confidential client for backend)
4. **OAuth2 Flow**: Authorization Code Flow with PKCE
5. **Token Settings**: 
   - Access Token Lifespan: 5 minutes
   - Refresh Token Lifespan: 30 minutes
   - SSO Session Idle: 30 minutes

---

### 5. Implementation Phases

#### Phase 1: Project Setup & Foundation (Week 1)
**Frontend Setup**:
- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Install and configure shadcn/ui
- [ ] Set up project structure
- [ ] Configure ESLint and Prettier

**Backend Setup**:
- [ ] Initialize NestJS project
- [ ] Configure TypeScript
- [ ] Set up Swagger/OpenAPI
- [ ] Create basic project structure
- [ ] Configure environment variables

**Keycloak Setup**:
- [ ] Set up Keycloak instance (Docker/local)
- [ ] Create realm and clients
- [ ] Configure roles
- [ ] Set up user mappings

#### Phase 2: Authentication & Authorization (Week 2)
**Frontend**:
- [ ] Integrate Keycloak with Next.js
- [ ] Implement login/logout flows
- [ ] Create auth middleware for route protection
- [ ] Build auth context/provider
- [ ] Create role-based route guards
- [ ] Implement token refresh logic

**Backend**:
- [ ] Set up Passport JWT strategy
- [ ] Create authentication guards
- [ ] Implement role-based authorization decorators
- [ ] Create public route decorator
- [ ] Set up token validation with Keycloak

#### Phase 3: API Design & Swagger (Week 3)
**Backend**:
- [ ] Design API endpoints (API-first approach)
- [ ] Create DTOs for all endpoints
- [ ] Implement Swagger documentation
- [ ] Set up API versioning
- [ ] Create validation pipes
- [ ] Implement error handling

**API Endpoints Structure**:
```
/api/v1/
  ├── /auth          # Authentication endpoints
  ├── /restaurants   # Restaurant configuration
  ├── /menus         # Menu management
  ├── /tables        # Table management
  ├── /orders        # Order management
  ├── /users         # User management
  └── /reports       # Reporting
```

#### Phase 4: Core Dashboard Features (Week 4-5)
**Frontend**:
- [ ] Create dashboard layout with navigation
- [ ] Build role-based navigation menu
- [ ] Implement restaurant configuration UI
- [ ] Create menu management interface
- [ ] Build table management interface
- [ ] Implement order management dashboard
- [ ] Create user management interface (admin only)

**Backend**:
- [ ] Implement restaurant configuration endpoints
- [ ] Create menu management endpoints
- [ ] Build table management endpoints
- [ ] Implement order management endpoints
- [ ] Create user management endpoints

#### Phase 5: Advanced Features & Polish (Week 6)
- [ ] Implement real-time updates (WebSockets if needed)
- [ ] Add data validation and error handling
- [ ] Implement loading states and error boundaries
- [ ] Add responsive design
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Testing (unit & integration)

---

### 6. Authentication Flow

#### Frontend Flow (OAuth2 Authorization Code + PKCE)
1. User navigates to protected route
2. Middleware checks for valid session
3. If not authenticated, redirect to Keycloak login
4. User authenticates with Keycloak
5. Keycloak redirects back with authorization code
6. Frontend exchanges code for tokens
7. Store tokens securely (httpOnly cookies recommended)
8. Include access token in API requests
9. Refresh token when access token expires

#### Backend Flow
1. Extract JWT token from Authorization header
2. Validate token signature with Keycloak public key
3. Extract user roles from token
4. Apply role-based guards to endpoints
5. Return 401/403 for unauthorized requests

---

### 7. Role-Based Route Protection

#### Frontend Route Structure
```typescript
// Middleware-based protection
app/
  (auth)/
    login/
    callback/
  (dashboard)/
    admin/          # ROLE_ADMIN only
    supervisor/     # ROLE_SUPERVISOR, ROLE_ADMIN
    cashier/        # ROLE_CASHIER, ROLE_SUPERVISOR, ROLE_ADMIN
    waiter/         # ROLE_WAITER, ROLE_SUPERVISOR, ROLE_ADMIN
    chef/           # ROLE_CHEF, ROLE_SUPERVISOR, ROLE_ADMIN
    customer/       # ROLE_CUSTOMER
```

#### Backend Endpoint Protection
```typescript
// Example
@Get('/restaurants')
@Roles('ROLE_ADMIN', 'ROLE_SUPERVISOR')
@UseGuards(JwtAuthGuard, RolesGuard)
getRestaurants() { ... }
```

---

### 8. API-First Approach Implementation

#### Swagger Configuration
1. **Define OpenAPI spec first** (or generate from code)
2. **Use decorators** for automatic documentation:
   ```typescript
   @ApiOperation({ summary: 'Get restaurants' })
   @ApiResponse({ status: 200, description: 'Success' })
   @ApiBearerAuth()
   ```
3. **Generate client SDKs** from Swagger spec (optional)
4. **Version API** using `/api/v1/` prefix
5. **Document all DTOs** with `@ApiProperty()`

#### Benefits
- Frontend and backend teams can work in parallel
- Contract-first development
- Automatic API documentation
- Client SDK generation
- API testing with Swagger UI

---

### 9. Security Considerations

1. **HTTPS Only** - Enforce in production
2. **CORS Configuration** - Restrict to frontend domain
3. **Token Storage** - Use httpOnly cookies (avoid localStorage)
4. **CSRF Protection** - Implement CSRF tokens
5. **Rate Limiting** - Protect API endpoints
6. **Input Validation** - Validate all inputs (DTOs)
7. **SQL Injection Prevention** - Use ORM/parameterized queries
8. **XSS Prevention** - Sanitize user inputs
9. **Role Validation** - Always validate roles on backend
10. **Token Refresh** - Implement secure token refresh

---

### 10. Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=rms-realm
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rms-web-app
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

#### Backend (.env)
```env
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=rms-realm
KEYCLOAK_CLIENT_ID=rms-backend-api
KEYCLOAK_CLIENT_SECRET=<secret>
PORT=3001
NODE_ENV=development
```

---

### 11. Development Workflow

1. **Local Development**:
   - Run Keycloak via Docker Compose
   - Run backend: `npm run start:dev`
   - Run frontend: `npm run dev`

2. **API Development**:
   - Define endpoints in Swagger/OpenAPI
   - Implement backend endpoints
   - Test with Swagger UI
   - Update frontend to consume APIs

3. **Testing**:
   - Unit tests for utilities and services
   - Integration tests for API endpoints
   - E2E tests for critical flows

---

### 12. Next Steps

1. Review and approve this plan
2. Set up development environment
3. Initialize projects (Next.js + NestJS)
4. Configure Keycloak
5. Begin Phase 1 implementation

---

### 13. Additional Considerations

- **State Management**: Consider Zustand or Redux Toolkit if needed
- **Form Handling**: React Hook Form + Zod for validation
- **Error Handling**: Centralized error handling with error boundaries
- **Logging**: Implement structured logging
- **Monitoring**: Consider adding monitoring (Sentry, etc.)
- **CI/CD**: Set up automated testing and deployment
- **Database**: Choose and configure database (PostgreSQL recommended)

---

## Questions to Consider

1. **Database**: Which database will be used? (PostgreSQL, MySQL, MongoDB?)
2. **Deployment**: Where will this be deployed? (AWS, Azure, self-hosted?)
3. **Real-time**: Do you need real-time features? (WebSockets, SSE?)
4. **File Storage**: Will you need file uploads? (Menu images, etc.)
5. **Reporting**: What kind of reports are needed?
6. **Multi-tenancy**: Single restaurant or multi-restaurant support?

---

This plan provides a comprehensive roadmap for building your restaurant management dashboard. Each phase builds upon the previous one, ensuring a solid foundation before adding complexity.

