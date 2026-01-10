# Technology Stack Quick Reference

## Frontend Dependencies

### Core
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.0"
}
```

### UI & Styling
```json
{
  "tailwindcss": "^3.3.0",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0",
  "lucide-react": "^0.294.0"
}
```

### Forms & Validation
```json
{
  "react-hook-form": "^7.48.0",
  "@hookform/resolvers": "^3.3.0",
  "zod": "^3.22.0"
}
```

### Data Fetching
```json
{
  "@tanstack/react-query": "^5.0.0",
  "axios": "^1.6.0"
}
```

### Authentication
```json
{
  "next-auth": "^4.24.0",
  "keycloak-js": "^24.0.0"
}
```

### Utilities
```json
{
  "date-fns": "^2.30.0",
  "react-hot-toast": "^2.4.0"
}
```

## Backend Dependencies

### Core
```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/core": "^10.0.0",
  "@nestjs/platform-express": "^10.0.0",
  "typescript": "^5.0.0",
  "rxjs": "^7.8.0"
}
```

### Authentication
```json
{
  "@nestjs/passport": "^10.0.0",
  "@nestjs/jwt": "^10.0.0",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1",
  "keycloak-connect": "^24.0.0"
}
```

### API Documentation
```json
{
  "@nestjs/swagger": "^7.1.0",
  "swagger-ui-express": "^5.0.0"
}
```

### Validation
```json
{
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.1"
}
```

### Database (Optional - choose one)
```json
{
  "@nestjs/typeorm": "^10.0.0",
  "typeorm": "^0.3.17",
  "pg": "^8.11.0"
}
```
OR
```json
{
  "@prisma/client": "^5.7.0",
  "prisma": "^5.7.0"
}
```

## Keycloak Setup

### Docker Compose (Local Development)
```yaml
version: '3.8'
services:
  keycloak:
    image: quay.io/keycloak/keycloak:24.0.0
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: keycloak
    ports:
      - "8080:8080"
    command: start-dev
    depends_on:
      - postgres
    networks:
      - rms-network

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: keycloak
      POSTGRES_USER: keycloak
      POSTGRES_PASSWORD: keycloak
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - rms-network

volumes:
  postgres_data:

networks:
  rms-network:
    driver: bridge
```

## shadcn/ui Components to Install

Essential components for dashboard:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add form
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add sidebar
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add skeleton
```

## Development Commands

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend
```bash
npm run start:dev    # Start development (watch mode)
npm run build        # Build for production
npm run start:prod   # Start production
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
```

## Environment Setup Checklist

- [ ] Node.js 18+ installed
- [ ] Docker & Docker Compose installed (for Keycloak)
- [ ] PostgreSQL installed (if not using Docker)
- [ ] Git configured
- [ ] IDE/Editor with TypeScript support
- [ ] Keycloak instance running
- [ ] Environment variables configured

