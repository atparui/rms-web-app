# Cursor AI API Documentation Integration Plan

## Overview

This plan focuses on making API documentation seamlessly accessible to Cursor AI during frontend development, eliminating the need for manual copy-pasting of request/response bodies. The goal is to create a development workflow where Cursor AI can automatically reference and understand your API structure.

## Core Requirements

1. **Cursor AI must access API docs automatically** during development
2. **No manual copy-paste** of request/response schemas
3. **Default development workflow** - works out of the box
4. **Public API docs endpoint** (development only) if needed for simplicity
5. **Real-time sync** with gateway API changes

---

## Approach Options

### Option 1: Local OpenAPI File (Recommended for Simplicity)

**Concept:** Download and store OpenAPI spec locally in the project, making it part of the codebase context.

**Pros:**
- ✅ Cursor AI can read files directly from workspace
- ✅ No authentication needed
- ✅ Works offline
- ✅ Version controlled
- ✅ Fast access
- ✅ Simple to implement

**Cons:**
- ⚠️ Requires manual/automated sync when API changes
- ⚠️ File can get large

**Implementation:**
```
frontend/
├── api-docs/
│   ├── openapi.json          # Main OpenAPI spec
│   ├── services/
│   │   ├── rms-service.json
│   │   └── rms.json
│   └── README.md
├── scripts/
│   └── sync-api-docs.ts      # Sync script
```

### Option 2: Public Development Endpoint

**Concept:** Expose OpenAPI spec via a public (unauthenticated) endpoint for development.

**Pros:**
- ✅ Always up-to-date
- ✅ No local file management
- ✅ Cursor can fetch via URL

**Cons:**
- ⚠️ Requires gateway configuration
- ⚠️ Security concerns (dev only)
- ⚠️ Requires network access

**Implementation:**
- Configure gateway to expose `/api-docs/public` (dev only)
- Cursor can reference this URL in context

### Option 3: MCP (Model Context Protocol) Server

**Concept:** Create an MCP server that fetches API docs dynamically.

**Pros:**
- ✅ Dynamic, always current
- ✅ Can handle authentication
- ✅ Structured access

**Cons:**
- ⚠️ More complex setup
- ⚠️ Requires MCP server implementation
- ⚠️ Additional infrastructure

### Option 4: Hybrid Approach (Recommended)

**Concept:** Combine local file storage with automated sync script.

**Pros:**
- ✅ Best of both worlds
- ✅ Fast local access
- ✅ Auto-sync capability
- ✅ Works offline
- ✅ Version controlled

**Cons:**
- ⚠️ Requires sync script setup

---

## Recommended Solution: Hybrid Approach

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Development Workflow                        │
│                                                          │
│  1. Developer runs: npm run sync-api-docs               │
│     └─> Fetches OpenAPI from gateway                    │
│     └─> Saves to frontend/api-docs/openapi.json        │
│                                                          │
│  2. Cursor AI reads: frontend/api-docs/openapi.json     │
│     └─> Understands API structure                      │
│     └─> Can generate code with correct types            │
│                                                          │
│  3. Developer codes with Cursor AI                      │
│     └─> AI references openapi.json automatically       │
│     └─> Generates type-safe API calls                   │
│     └─> Creates forms with correct schemas              │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: API Documentation Access Setup

#### 1.1 Create Public Development Endpoint (Gateway)

**Goal:** Expose OpenAPI spec without authentication for development.

**Location:** Gateway configuration

**Options:**

**Option A: Separate Development Endpoint**
```yaml
# Gateway configuration
spring:
  cloud:
    gateway:
      routes:
        - id: api-docs-public
          uri: http://localhost:8080
          predicates:
            - Path=/api-docs/public/**
          filters:
            - StripPrefix=1
          # Only enabled in dev profile
```

**Option B: Development Profile Override**
```yaml
# application-dev.yml
management:
  endpoints:
    web:
      exposure:
        include: "*"
  endpoint:
    gateway:
      enabled: true
```

**Option C: Nginx Public Route (Simplest)**
```nginx
# nginx config for development
location /api-docs/public {
    proxy_pass http://gateway:9293/v3/api-docs;
    # No auth required
    # Only in dev environment
}
```

**Recommendation:** Use Option C (Nginx) for simplicity - add a dev-only route.

#### 1.2 Local API Docs Directory Structure

**Create:**
```
frontend/
├── api-docs/
│   ├── openapi.json              # Combined OpenAPI spec
│   ├── services/
│   │   ├── gateway.json          # Gateway API
│   │   ├── rms-service.json      # RMS Service API
│   │   └── rms.json              # RMS API
│   ├── .gitignore                # Ignore if too large
│   └── README.md                 # Documentation
├── scripts/
│   └── sync-api-docs.ts          # Sync script
└── .cursorrules                   # Cursor AI instructions
```

#### 1.3 Sync Script Implementation

**File:** `frontend/scripts/sync-api-docs.ts`

**Purpose:** Fetch OpenAPI specs from gateway and save locally

**Features:**
- Fetch from public endpoint or authenticated endpoint
- Merge multiple service specs if needed
- Validate OpenAPI format
- Save to `api-docs/` directory
- Generate TypeScript types (optional)
- Log changes

**Usage:**
```bash
npm run sync-api-docs
# or
npm run sync-api-docs:watch  # Watch mode for auto-sync
```

#### 1.4 Cursor AI Configuration

**File:** `frontend/.cursorrules` or `.cursor/instructions.md`

**Purpose:** Tell Cursor AI how to use the API docs

**Content:**
```
# API Documentation Context

When developing frontend components:
1. Always reference `api-docs/openapi.json` for API structure
2. Use the schemas defined in the OpenAPI spec for TypeScript types
3. Generate React Query hooks based on endpoints in the spec
4. Create forms using the request body schemas
5. Display data using the response schemas

The OpenAPI spec is located at: `frontend/api-docs/openapi.json`

Key endpoints:
- Gateway: https://rmsgateway.atparui.com
- API Docs: See api-docs/openapi.json
```

**Alternative:** Add to workspace context files that Cursor reads automatically.

---

### Phase 2: Development Workflow Integration

#### 2.1 Package.json Scripts

**Add to `frontend/package.json`:**
```json
{
  "scripts": {
    "sync-api-docs": "tsx scripts/sync-api-docs.ts",
    "sync-api-docs:watch": "tsx scripts/sync-api-docs.ts --watch",
    "dev": "npm run sync-api-docs && next dev",
    "dev:with-sync": "npm run sync-api-docs:watch & next dev"
  }
}
```

#### 2.2 Pre-commit Hook (Optional)

**File:** `.husky/pre-commit` or similar

**Purpose:** Auto-sync API docs before committing

```bash
#!/bin/sh
npm run sync-api-docs
git add api-docs/
```

#### 2.3 VS Code / Cursor Workspace Settings

**File:** `.vscode/settings.json` or `.cursor/settings.json`

```json
{
  "files.associations": {
    "api-docs/*.json": "jsonc"
  },
  "files.watcherExclude": {
    "**/api-docs/**": false
  }
}
```

---

### Phase 3: Cursor AI Integration Patterns

#### 3.1 Context File Strategy

**Create:** `frontend/api-docs/CURSOR_CONTEXT.md`

**Purpose:** Human-readable summary for Cursor AI

**Content:**
```markdown
# API Documentation for Cursor AI

## Overview
This project uses the API defined in `openapi.json`.

## Key Services
- Gateway: Main entry point at rmsgateway.atparui.com
- RMS Service: Restaurant management operations
- RMS: Core restaurant operations

## Common Patterns
- All endpoints require Bearer token authentication
- Base path: /api/v1
- Standard REST conventions

## Example Usage
See openapi.json for complete schema definitions.
```

#### 3.2 Type Generation Integration

**Generate types from OpenAPI:**
```bash
npm run generate-types
# Creates: types/api-generated.ts
```

**Cursor AI can then:**
- Reference generated types
- Use them in component development
- Ensure type safety

#### 3.3 Code Generation Prompts

**When asking Cursor AI to create components:**

**Good prompts:**
```
"Create a restaurant list page using the GET /restaurants endpoint 
from api-docs/openapi.json"

"Generate a form for creating a restaurant using the POST /restaurants 
schema from the OpenAPI spec"

"Create React Query hooks for all restaurant endpoints in openapi.json"
```

**Cursor AI will:**
1. Read `api-docs/openapi.json`
2. Find the relevant endpoint
3. Extract request/response schemas
4. Generate type-safe code

---

### Phase 4: Enhanced Development Experience

#### 4.1 API Docs Viewer (Optional)

**Create:** `frontend/app/api-docs/page.tsx`

**Purpose:** Visual API docs viewer in Next.js app

**Features:**
- Display OpenAPI spec in Swagger UI
- Search endpoints
- View schemas
- Copy code examples

#### 4.2 TypeScript Type Exports

**File:** `frontend/api-docs/types.ts`

**Purpose:** Export commonly used types

```typescript
// Auto-generated from openapi.json
export type RestaurantDto = {
  id: string;
  name: string;
  // ... from schema
};

export type CreateRestaurantDto = {
  // ... from schema
};
```

#### 4.3 API Client Stubs

**File:** `frontend/lib/api-client-stubs.ts`

**Purpose:** Type-safe API client functions

```typescript
// Auto-generated from openapi.json
export async function getRestaurants(): Promise<RestaurantDto[]> {
  // Implementation
}

export async function createRestaurant(
  data: CreateRestaurantDto
): Promise<RestaurantDto> {
  // Implementation
}
```

---

## Detailed Implementation Steps

### Step 1: Gateway Configuration (Development)

**File:** `keycloak_with_plugins_deploy/nginx/rmsgateway.atparui.com.conf`

**Add development route:**
```nginx
# Development only - Public API docs
location /api-docs/public {
    # Only allow in dev environment
    if ($host != "localhost" && $host != "127.0.0.1") {
        return 403;
    }
    
    proxy_pass http://gateway:9293/v3/api-docs;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    
    # CORS for local development
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
}
```

**Or use environment variable:**
```nginx
location /api-docs/public {
    set $dev_mode "${DEV_MODE:-false}";
    if ($dev_mode != "true") {
        return 403;
    }
    # ... proxy config
}
```

### Step 2: Sync Script Implementation

**File:** `frontend/scripts/sync-api-docs.ts`

```typescript
#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://rmsgateway.atparui.com';
const API_DOCS_DIR = path.join(process.cwd(), 'api-docs');

async function fetchOpenAPISpec(): Promise<any> {
  const endpoints = [
    '/v3/api-docs',
    '/swagger.json',
    '/api-docs/public',
  ];

  for (const endpoint of endpoints) {
    try {
      const url = `${GATEWAY_URL}${endpoint}`;
      console.log(`Trying: ${url}`);
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.data && (response.data.openapi || response.data.swagger)) {
        console.log(`✓ Successfully fetched from ${endpoint}`);
        return response.data;
      }
    } catch (error) {
      console.warn(`✗ Failed to fetch from ${endpoint}:`, error.message);
    }
  }
  
  throw new Error('Could not fetch OpenAPI spec from any endpoint');
}

async function saveSpec(spec: any): Promise<void> {
  await fs.mkdir(API_DOCS_DIR, { recursive: true });
  const filePath = path.join(API_DOCS_DIR, 'openapi.json');
  await fs.writeFile(filePath, JSON.stringify(spec, null, 2));
  console.log(`✓ Saved to ${filePath}`);
}

async function main() {
  try {
    console.log('🔄 Syncing API documentation...');
    const spec = await fetchOpenAPISpec();
    await saveSpec(spec);
    console.log('✅ API documentation synced successfully');
  } catch (error) {
    console.error('❌ Failed to sync API documentation:', error);
    process.exit(1);
  }
}

main();
```

### Step 3: Cursor AI Instructions

**File:** `frontend/.cursorrules`

```markdown
# Cursor AI Development Rules

## API Documentation
- The OpenAPI specification is located at `api-docs/openapi.json`
- Always reference this file when creating API-related code
- Use the schemas defined in the spec for TypeScript types
- Generate React Query hooks based on endpoints in the spec

## Code Generation Guidelines
1. When creating API calls, use the endpoint definitions from `api-docs/openapi.json`
2. Generate TypeScript interfaces from the OpenAPI schemas
3. Create forms using the request body schemas
4. Display data using the response schemas
5. Include proper error handling based on response codes in the spec

## File Structure
- API docs: `api-docs/openapi.json`
- Generated types: `types/api-generated.ts` (if exists)
- API client: `lib/api-client.ts`
- React Query hooks: `hooks/api/`

## Authentication
- All API calls require Bearer token authentication
- Token is managed via Next.js middleware
- Use the proxy route: `/api/proxy/...` for API calls
```

### Step 4: Environment Configuration

**File:** `frontend/.env.local`

```env
# Gateway Configuration
NEXT_PUBLIC_GATEWAY_URL=https://rmsgateway.atparui.com

# API Docs Sync
API_DOCS_URL=https://rmsgateway.atparui.com/api-docs/public
# Or use authenticated endpoint:
# API_DOCS_URL=https://rmsgateway.atparui.com/v3/api-docs
# API_DOCS_TOKEN=your-token-here

# Development Mode
NEXT_PUBLIC_DEV_MODE=true
```

---

## Usage Workflow

### Initial Setup (One-time)

1. **Configure gateway** to expose public API docs endpoint (dev only)
2. **Run sync script:**
   ```bash
   cd frontend
   npm run sync-api-docs
   ```
3. **Verify:** Check `api-docs/openapi.json` exists

### Daily Development Workflow

1. **Start development:**
   ```bash
   npm run dev
   # Or with auto-sync:
   npm run dev:with-sync
   ```

2. **Ask Cursor AI to create components:**
   ```
   "Create a page to list restaurants using the GET /restaurants 
   endpoint from api-docs/openapi.json"
   ```

3. **Cursor AI will:**
   - Read `api-docs/openapi.json`
   - Find the `/restaurants` endpoint
   - Extract the response schema
   - Generate TypeScript types
   - Create React Query hook
   - Generate the page component

4. **When API changes:**
   ```bash
   npm run sync-api-docs
   # Cursor AI will use updated spec
   ```

---

## Alternative: MCP Server Approach

If you want dynamic, real-time access:

### MCP Server Implementation

**File:** `frontend/mcp-server/api-docs-server.ts`

```typescript
// MCP server that provides API docs to Cursor
export const apiDocsServer = {
  name: 'api-docs',
  resources: [
    {
      uri: 'api-docs://openapi',
      name: 'OpenAPI Specification',
      description: 'Gateway API documentation',
      handler: async () => {
        // Fetch from gateway
        const spec = await fetchOpenAPISpec();
        return JSON.stringify(spec, null, 2);
      },
    },
  ],
};
```

**Configuration:** `.cursor/mcp.json`
```json
{
  "mcpServers": {
    "api-docs": {
      "command": "tsx",
      "args": ["mcp-server/api-docs-server.ts"]
    }
  }
}
```

**Pros:**
- Always current
- No local file management
- Dynamic access

**Cons:**
- More complex
- Requires MCP setup
- Network dependency

---

## Security Considerations

### Development Only
- Public API docs endpoint should **only** be enabled in development
- Use environment checks
- Consider IP whitelisting
- Add authentication for production

### Production
- Remove public endpoint
- Use authenticated endpoint
- Store credentials securely
- Sync script uses service account token

---

## Best Practices

1. **Version Control:**
   - Commit `api-docs/openapi.json` if small (< 1MB)
   - Or add to `.gitignore` and sync in CI/CD

2. **Auto-sync:**
   - Run sync script in CI/CD
   - Pre-commit hook for developers
   - Watch mode during development

3. **Documentation:**
   - Keep `api-docs/README.md` updated
   - Document any custom endpoints
   - Note API versioning strategy

4. **Type Safety:**
   - Generate TypeScript types from spec
   - Use in components
   - Keep types in sync

5. **Cursor AI Context:**
   - Keep `.cursorrules` updated
   - Add examples of good prompts
   - Document common patterns

---

## Success Criteria

✅ Cursor AI can access API docs without manual intervention
✅ No copy-paste of request/response schemas needed
✅ Generated code uses correct types from API spec
✅ API changes are easily synced
✅ Development workflow is smooth and fast
✅ Works offline (with local file)
✅ Type-safe development

---

## Implementation Checklist

### Gateway Setup
- [ ] Configure public API docs endpoint (dev only)
- [ ] Test endpoint accessibility
- [ ] Verify OpenAPI format

### Frontend Setup
- [ ] Create `api-docs/` directory
- [ ] Implement sync script
- [ ] Add npm scripts
- [ ] Create `.cursorrules` file
- [ ] Test sync script

### Development Workflow
- [ ] Run initial sync
- [ ] Test Cursor AI with API docs
- [ ] Create sample component using AI
- [ ] Verify type safety
- [ ] Document workflow

### Optional Enhancements
- [ ] Add watch mode for auto-sync
- [ ] Create type generator
- [ ] Add API docs viewer page
- [ ] Set up pre-commit hook
- [ ] Configure MCP server (if needed)

---

## Questions to Resolve

1. **Gateway endpoint:** What's the exact OpenAPI endpoint path?
2. **Authentication:** Can we create a dev-only public endpoint?
3. **File size:** How large is the OpenAPI spec? (affects git strategy)
4. **Multiple services:** Do we need to merge multiple specs?
5. **Versioning:** How to handle API version changes?

---

## Next Steps

1. **Verify gateway OpenAPI endpoint** - Test accessibility
2. **Create public dev endpoint** - Configure nginx/gateway
3. **Implement sync script** - Fetch and save OpenAPI spec
4. **Test with Cursor AI** - Verify it can read and use the spec
5. **Refine workflow** - Optimize based on experience

---

## References

- [OpenAPI Specification](https://swagger.io/specification/)
- [Cursor AI Documentation](https://cursor.sh/docs)
- [MCP (Model Context Protocol)](https://modelcontextprotocol.io/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

