# Restaurant Management System - Web Dashboard

A comprehensive web-based dashboard for configuring and managing a restaurant management backend API, built with industry-standard practices and modern technologies.

## 📋 Overview

This project implements a full-stack restaurant management dashboard with:
- **Frontend**: Next.js 14+ with React, TypeScript, and shadcn/ui
- **Backend**: NestJS with TypeScript
- **Authentication**: Keycloak (OAuth2/OIDC)
- **API Documentation**: Swagger/OpenAPI (API-first approach)
- **Authorization**: Role-Based Access Control (RBAC)

## 🎯 Features

- ✅ Server-Side Rendering (SSR) with Next.js
- ✅ API-first development approach
- ✅ Comprehensive Swagger/OpenAPI documentation
- ✅ Keycloak OAuth2 authentication
- ✅ Role-based access control (6 roles)
- ✅ Modern UI with shadcn/ui components
- ✅ Type-safe development with TypeScript
- ✅ Industry-standard architecture

## 📚 Documentation

- **[PROJECT_PLAN.md](./PROJECT_PLAN.md)** - Detailed implementation plan and phases
- **[TECH_STACK_REFERENCE.md](./TECH_STACK_REFERENCE.md)** - Technology stack and dependencies
- **[API_STRUCTURE.md](./API_STRUCTURE.md)** - API endpoints and structure
- **[RBAC_MATRIX.md](./RBAC_MATRIX.md)** - Role-based access control matrix

## 🏗️ Architecture

```
┌─────────────────┐
│   Next.js App   │  (Frontend - SSR)
│  React + shadcn │
└────────┬────────┘
         │ HTTPS
         │ OAuth2/JWT
┌────────▼────────┐
│   Keycloak      │  (Identity Provider)
│   OAuth2/OIDC   │
└────────┬────────┘
         │
┌────────▼────────┐
│   NestJS API    │  (Backend)
│   Swagger Docs  │
└─────────────────┘
```

## 👥 Roles

| Role | Description |
|------|-------------|
| **ROLE_ADMIN** | Full system access, configuration management |
| **ROLE_SUPERVISOR** | Management & oversight, reports access |
| **ROLE_CASHIER** | Payment processing, order completion |
| **ROLE_WAITER** | Order taking, table management |
| **ROLE_CHEF** | Kitchen operations, order status updates |
| **ROLE_CUSTOMER** | Limited read access |

See [RBAC_MATRIX.md](./RBAC_MATRIX.md) for detailed permissions.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (for Keycloak)
- PostgreSQL (optional, if not using Docker)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd rms-web-app

# The project structure will be created during implementation
```

### 2. Start Keycloak

```bash
# Using Docker Compose
docker-compose up -d keycloak

# Access Keycloak Admin Console
# URL: http://localhost:8080
# Username: admin
# Password: admin
```

### 3. Configure Keycloak

1. Create a new realm: `rms-realm`
2. Create clients:
   - `rms-web-app` (public client, frontend)
   - `rms-backend-api` (confidential client, backend)
3. Create roles: `ROLE_ADMIN`, `ROLE_SUPERVISOR`, `ROLE_CASHIER`, `ROLE_WAITER`, `ROLE_CHEF`, `ROLE_CUSTOMER`
4. Assign roles to users

### 4. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your Keycloak configuration
npm run dev
```

### 5. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Keycloak configuration
npm run start:dev
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api/docs
- **Keycloak**: http://localhost:8080

## 📁 Project Structure

```
rms-web-app/
├── frontend/          # Next.js application
├── backend/           # NestJS application
├── docs/              # Documentation
├── docker-compose.yml # Local development setup
└── README.md
```

## 🔧 Technology Stack

### Frontend
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- shadcn/ui
- Tailwind CSS
- React Query
- React Hook Form + Zod

### Backend
- NestJS
- TypeScript
- Swagger/OpenAPI
- Passport.js (JWT)
- class-validator

### Infrastructure
- Keycloak (OAuth2/OIDC)
- Docker (for local development)

See [TECH_STACK_REFERENCE.md](./TECH_STACK_REFERENCE.md) for complete list.

## 📡 API Endpoints

The backend exposes RESTful APIs with Swagger documentation:

- `/api/v1/auth` - Authentication
- `/api/v1/restaurants` - Restaurant configuration
- `/api/v1/menus` - Menu management
- `/api/v1/tables` - Table management
- `/api/v1/orders` - Order management
- `/api/v1/users` - User management (admin only)
- `/api/v1/reports` - Reports & analytics

See [API_STRUCTURE.md](./API_STRUCTURE.md) for detailed endpoint documentation.

## 🔐 Security

- OAuth2/OIDC authentication via Keycloak
- JWT token-based authorization
- Role-based access control (RBAC)
- HTTPS enforcement in production
- CORS configuration
- Input validation
- SQL injection prevention
- XSS protection

## 📝 Development Workflow

1. **API-First**: Define endpoints in Swagger/OpenAPI
2. **Backend**: Implement endpoints with NestJS
3. **Frontend**: Consume APIs with React Query
4. **Testing**: Unit, integration, and E2E tests
5. **Documentation**: Auto-generated Swagger docs

## 🗺️ Implementation Phases

1. **Phase 1**: Project Setup & Foundation
2. **Phase 2**: Authentication & Authorization
3. **Phase 3**: API Design & Swagger
4. **Phase 4**: Core Dashboard Features
5. **Phase 5**: Advanced Features & Polish

See [PROJECT_PLAN.md](./PROJECT_PLAN.md) for detailed phase breakdown.

## 🤝 Contributing

1. Follow the API-first approach
2. Maintain TypeScript type safety
3. Write tests for new features
4. Update Swagger documentation
5. Follow the established code style

## 📄 License

[Specify your license here]

## 🆘 Support

For questions or issues:
1. Check the documentation files
2. Review the Swagger API docs
3. Check Keycloak configuration
4. Review environment variables

## 🔮 Future Enhancements

- Real-time updates (WebSockets)
- Mobile responsive design
- Advanced reporting & analytics
- Multi-restaurant support
- Integration with payment gateways
- Inventory management
- Staff scheduling

---

**Note**: This is a planning document. The actual implementation will follow the phases outlined in [PROJECT_PLAN.md](./PROJECT_PLAN.md).

