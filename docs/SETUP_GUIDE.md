# Setup & Run Guide

## Prerequisites

- Node.js 18+ installed
- Docker & Docker Compose installed (for Keycloak)
- npm or yarn package manager

## Quick Start

### 1. Start Keycloak (Optional - for authentication)

```bash
# Start Keycloak and PostgreSQL using Docker Compose
docker-compose up -d

# Wait for Keycloak to be ready (about 30-60 seconds)
# Access Keycloak Admin Console at: http://localhost:8080
# Username: admin
# Password: admin
```

### 2. Start Backend API

```bash
cd backend
npm install  # If not already installed
npm run start:dev

# Backend will run on: http://localhost:3001
# Swagger docs available at: http://localhost:3001/api/docs
```

### 3. Start Frontend

```bash
cd frontend
npm install  # If not already installed
npm run dev

# Frontend will run on: http://localhost:3000
```

## Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Swagger Documentation**: http://localhost:3001/api/docs
- **Keycloak Admin**: http://localhost:8080 (if running)

## Environment Variables

### Backend (.env)
Create a `.env` file in the `backend/` directory:
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=rms-realm
KEYCLOAK_CLIENT_ID=rms-backend-api
KEYCLOAK_CLIENT_SECRET=your-client-secret-here
```

### Frontend (.env.local)
Create a `.env.local` file in the `frontend/` directory:
```env
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=rms-realm
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rms-web-app
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## Keycloak Setup (After starting Keycloak)

1. **Create Realm**:
   - Go to http://localhost:8080
   - Login with admin/admin
   - Click "Create Realm"
   - Name: `rms-realm`

2. **Create Frontend Client**:
   - Go to Clients → Create
   - Client ID: `rms-web-app`
   - Client protocol: `openid-connect`
   - Access type: `public`
   - Valid redirect URIs: `http://localhost:3000/*`
   - Web origins: `http://localhost:3000`

3. **Create Backend Client**:
   - Go to Clients → Create
   - Client ID: `rms-backend-api`
   - Client protocol: `openid-connect`
   - Access type: `confidential`
   - Service accounts enabled: `ON`
   - Copy the client secret to backend `.env`

4. **Create Roles**:
   - Go to Realm roles → Create role
   - Create: `ROLE_ADMIN`, `ROLE_SUPERVISOR`, `ROLE_CASHIER`, `ROLE_WAITER`, `ROLE_CHEF`, `ROLE_CUSTOMER`

## Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify all dependencies are installed: `npm install`
- Check `.env` file exists and has correct values

### Frontend won't start
- Check if port 3000 is available
- Verify all dependencies are installed: `npm install`
- Check `.env.local` file exists

### Keycloak connection issues
- Ensure Docker containers are running: `docker-compose ps`
- Check Keycloak logs: `docker-compose logs keycloak`
- Verify Keycloak is accessible at http://localhost:8080

## Development Commands

### Backend
```bash
npm run start:dev    # Start in watch mode
npm run build        # Build for production
npm run start:prod   # Start production server
npm run lint         # Run linter
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
```

## Next Steps

1. ✅ Project structure created
2. ✅ Dependencies installed
3. ✅ Basic configuration done
4. ⏭️ Set up Keycloak (if needed)
5. ⏭️ Implement authentication
6. ⏭️ Create API endpoints
7. ⏭️ Build dashboard UI

