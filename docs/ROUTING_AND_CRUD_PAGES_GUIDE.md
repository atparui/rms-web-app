# Routing and CRUD Pages Guide for RMS Web App

## Overview

This guide documents the conventions and best practices for creating routes, listing pages, and CRUD forms in the RMS Web App. These conventions are based on the proven patterns from the `tenant-manager-web-app` project.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Next.js App Router Conventions](#nextjs-app-router-conventions)
3. [Route Patterns](#route-patterns)
4. [Page Types](#page-types)
5. [API Client Setup](#api-client-setup)
6. [TypeScript Types](#typescript-types)
7. [Component Patterns](#component-patterns)
8. [Step-by-Step Implementation](#step-by-step-implementation)
9. [Available Resources](#available-resources)

---

## Project Structure

```
rms-web-app/
├── app/
│   ├── (dashboard)/           # Route group (doesn't affect URL)
│   │   ├── layout.tsx         # Shared dashboard layout
│   │   ├── dashboard/         # Dashboard home
│   │   │   └── page.tsx
│   │   ├── restaurants/       # Resource routes
│   │   │   ├── page.tsx       # List page
│   │   │   ├── create/
│   │   │   │   └── page.tsx   # Create form
│   │   │   └── [id]/
│   │   │       └── page.tsx   # Edit form
│   │   ├── branches/
│   │   │   └── ...            # Same structure
│   │   └── ...
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing page
├── components/
│   ├── ui/                    # shadcn/ui components
│   └── ...
├── lib/
│   ├── api-client.ts          # API client functions
│   ├── config.ts              # App configuration
│   └── utils.ts               # Utilities
└── types/
    ├── restaurant.ts          # TypeScript types
    └── ...
```

---

## Next.js App Router Conventions

### Route Groups

Use `(dashboard)` to group authenticated routes without affecting the URL:

```
app/(dashboard)/restaurants/page.tsx → /restaurants
```

### Dynamic Routes

Use `[param]` for dynamic segments:

```
app/(dashboard)/restaurants/[id]/page.tsx → /restaurants/:id
```

### Special Files

- `page.tsx` - Defines a route's UI
- `layout.tsx` - Shared UI for a segment and its children
- `route.ts` - API route handlers
- `loading.tsx` - Loading UI (optional)
- `error.tsx` - Error UI (optional)

---

## Route Patterns

### Standard CRUD Routes

For each resource (e.g., restaurants, branches, menu-categories):

```
/resource-name              → List all (GET)
/resource-name/create       → Create form (POST)
/resource-name/[id]         → Edit form (GET/PUT)
```

### Route Structure

```
app/
└── (dashboard)/
    └── restaurants/
        ├── page.tsx         # List page    → /restaurants
        ├── create/
        │   └── page.tsx     # Create form  → /restaurants/create
        └── [id]/
            └── page.tsx     # Edit form    → /restaurants/:id
```

---

## Page Types

### 1. List Page (index)

**File**: `app/(dashboard)/restaurants/page.tsx`

**Purpose**: Display all records in a table with CRUD actions

**Key Features**:
- Fetch data on mount
- Loading state
- Error handling
- Empty state
- Create button
- Edit/Delete actions per row
- Refresh capability

**Example Structure**:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { restaurantApi } from '@/lib/api-client';
import { Restaurant } from '@/types/restaurant';
import Link from 'next/link';

export default function RestaurantsPage() {
  const [data, setData] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await restaurantApi.getAll();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await restaurantApi.delete(id);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Restaurants</h1>
          <p className="text-muted-foreground">Manage restaurants</p>
        </div>
        <Link href="/restaurants/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Restaurant
          </Button>
        </Link>
      </div>

      {/* Empty State */}
      {data.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No restaurants found</p>
          <Link href="/restaurants/create">
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create your first restaurant
            </Button>
          </Link>
        </div>
      ) : (
        /* Table */
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.contactEmail}</TableCell>
                  <TableCell>
                    {item.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/restaurants/${item.id}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
```

---

### 2. Create Page

**File**: `app/(dashboard)/restaurants/create/page.tsx`

**Purpose**: Form to create a new record

**Key Features**:
- Form state management
- Validation
- Loading state during submission
- Error display
- Success redirect
- Cancel button (back to list)

**Example Structure**:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { restaurantApi } from '@/lib/api-client';
import { RestaurantCreate } from '@/types/restaurant';
import Link from 'next/link';

export default function RestaurantCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<RestaurantCreate>({
    name: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      await restaurantApi.create(formData);
      router.push('/restaurants');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof RestaurantCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/restaurants">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Restaurant</h1>
          <p className="text-muted-foreground">Add a new restaurant</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Restaurant details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Restaurant name"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone || ''}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <textarea
                id="address"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={3}
                placeholder="Restaurant address"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange('isActive', checked)}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/restaurants">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Creating...' : 'Create Restaurant'}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

---

### 3. Edit Page

**File**: `app/(dashboard)/restaurants/[id]/page.tsx`

**Purpose**: Form to edit an existing record

**Key Features**:
- Load existing data on mount
- Pre-populate form
- Loading state (initial load)
- Saving state (during update)
- Error handling
- Success redirect
- Cancel button

**Example Structure**:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { restaurantApi } from '@/lib/api-client';
import { Restaurant, RestaurantUpdate } from '@/types/restaurant';
import Link from 'next/link';

export default function RestaurantEditPage() {
  const router = useRouter();
  const params = useParams();
  const restaurantId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<RestaurantUpdate>({
    id: restaurantId,
    name: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    isActive: true,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await restaurantApi.getById(restaurantId);
        setFormData({
          id: data.id,
          name: data.name || '',
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          address: data.address || '',
          isActive: data.isActive !== false,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [restaurantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      await restaurantApi.update(formData);
      router.push('/restaurants');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof RestaurantUpdate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/restaurants">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Restaurant</h1>
          <p className="text-muted-foreground">Update restaurant information</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Same form fields as create page */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Restaurant details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Form fields... */}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/restaurants">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

---

## API Client Setup

### File: `lib/api-client.ts`

**Pattern**: Create API client functions for each resource

```typescript
import { Restaurant, RestaurantCreate, RestaurantUpdate } from '@/types/restaurant';
import { Branch, BranchCreate, BranchUpdate } from '@/types/branch';
import { apiConfig } from './config';

// Gateway origin
const API_BASE_URL = apiConfig.apiOrigin || 'https://rms-demo.atparui.com';

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
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  // Handle DELETE responses (often no content)
  if (response.status === 204 || options.method === 'DELETE') {
    return null;
  }

  return response.json();
}

// ============================================================================
// Restaurant API
// ============================================================================

export const restaurantApi = {
  getAll: (): Promise<Restaurant[]> => 
    fetchWithAuth(`${API_BASE_URL}/services/rms-service/api/restaurants`),
  
  getById: (id: string): Promise<Restaurant> => 
    fetchWithAuth(`${API_BASE_URL}/services/rms-service/api/restaurants/${id}`),
  
  create: (data: RestaurantCreate): Promise<Restaurant> => 
    fetchWithAuth(`${API_BASE_URL}/services/rms-service/api/restaurants`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (data: RestaurantUpdate): Promise<Restaurant> => 
    fetchWithAuth(`${API_BASE_URL}/services/rms-service/api/restaurants/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string): Promise<void> => 
    fetchWithAuth(`${API_BASE_URL}/services/rms-service/api/restaurants/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// Branch API
// ============================================================================

export const branchApi = {
  getAll: (): Promise<Branch[]> => 
    fetchWithAuth(`${API_BASE_URL}/services/rms/api/branches`),
  
  getById: (id: string): Promise<Branch> => 
    fetchWithAuth(`${API_BASE_URL}/services/rms/api/branches/${id}`),
  
  create: (data: BranchCreate): Promise<Branch> => 
    fetchWithAuth(`${API_BASE_URL}/services/rms/api/branches`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (data: BranchUpdate): Promise<Branch> => 
    fetchWithAuth(`${API_BASE_URL}/services/rms/api/branches/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string): Promise<void> => 
    fetchWithAuth(`${API_BASE_URL}/services/rms/api/branches/${id}`, {
      method: 'DELETE',
    }),
};

// Add more resource APIs following the same pattern...
```

---

## TypeScript Types

### File: `types/restaurant.ts`

**Pattern**: Define types for each resource

```typescript
export interface Restaurant {
  id: string;  // UUID
  name: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  isActive?: boolean;
  createdDate?: string;
  lastModifiedDate?: string;
}

// For POST requests (no id)
export interface RestaurantCreate extends Omit<Restaurant, 'id' | 'createdDate' | 'lastModifiedDate'> {}

// For PUT requests (id required, all other fields optional)
export interface RestaurantUpdate extends Partial<RestaurantCreate> {
  id: string;
}
```

### File: `types/branch.ts`

```typescript
export interface Branch {
  id: string;  // UUID
  name: string;
  code?: string;
  restaurantId: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  contactPhone?: string;
  contactEmail?: string;
  managerName?: string;
  isActive?: boolean;
  createdDate?: string;
  lastModifiedDate?: string;
}

export interface BranchCreate extends Omit<Branch, 'id' | 'createdDate' | 'lastModifiedDate'> {}

export interface BranchUpdate extends Partial<BranchCreate> {
  id: string;
}
```

---

## Component Patterns

### Common UI Components (from shadcn/ui)

- `Button` - Actions, links
- `Input` - Text fields
- `Label` - Form labels
- `Checkbox` - Boolean fields
- `Card` - Section containers
- `Table` - Data display
- `Badge` - Status indicators
- `Select` - Dropdowns
- `Textarea` - Multi-line text

### Icons (from lucide-react)

- `Plus` - Create/Add
- `Pencil` - Edit
- `Trash2` - Delete
- `Save` - Save action
- `ArrowLeft` - Back/Cancel
- `RefreshCw` - Loading spinner
- `Search` - Search
- `Filter` - Filter

### Layout Pattern

```typescript
<div className="space-y-6">
  {/* Header */}
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold">Title</h1>
      <p className="text-muted-foreground">Description</p>
    </div>
    <Button>Action</Button>
  </div>

  {/* Content */}
  <Card>
    <CardHeader>
      <CardTitle>Section Title</CardTitle>
      <CardDescription>Section description</CardDescription>
    </CardHeader>
    <CardContent>
      {/* Content here */}
    </CardContent>
  </Card>
</div>
```

---

## Step-by-Step Implementation

### Example: Creating "Branches" Resource

#### Step 1: Create TypeScript Types

Create `types/branch.ts`:

```typescript
export interface Branch {
  id: string;
  name: string;
  code?: string;
  restaurantId: string;
  address?: string;
  contactPhone?: string;
  isActive?: boolean;
}

export interface BranchCreate extends Omit<Branch, 'id'> {}
export interface BranchUpdate extends Partial<BranchCreate> { id: string; }
```

#### Step 2: Add API Client Functions

Add to `lib/api-client.ts`:

```typescript
export const branchApi = {
  getAll: (): Promise<Branch[]> => 
    fetchWithAuth(`${API_BASE_URL}/services/rms/api/branches`),
  getById: (id: string): Promise<Branch> => 
    fetchWithAuth(`${API_BASE_URL}/services/rms/api/branches/${id}`),
  create: (data: BranchCreate): Promise<Branch> => 
    fetchWithAuth(`${API_BASE_URL}/services/rms/api/branches`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (data: BranchUpdate): Promise<Branch> => 
    fetchWithAuth(`${API_BASE_URL}/services/rms/api/branches/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string): Promise<void> => 
    fetchWithAuth(`${API_BASE_URL}/services/rms/api/branches/${id}`, {
      method: 'DELETE',
    }),
};
```

#### Step 3: Create Route Structure

```bash
mkdir -p app/\(dashboard\)/branches/{create,[id]}
touch app/\(dashboard\)/branches/page.tsx
touch app/\(dashboard\)/branches/create/page.tsx
touch app/\(dashboard\)/branches/[id]/page.tsx
```

#### Step 4: Create List Page

`app/(dashboard)/branches/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { branchApi } from '@/lib/api-client';
import { Branch } from '@/types/branch';
import Link from 'next/link';

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await branchApi.getAll();
      setBranches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this branch?')) return;
    try {
      await branchApi.delete(id);
      await loadBranches();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete branch');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Branches</h1>
          <p className="text-muted-foreground">Manage restaurant branches</p>
        </div>
        <Link href="/branches/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Branch
          </Button>
        </Link>
      </div>

      {branches.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No branches found</p>
          <Link href="/branches/create">
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create your first branch
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium">{branch.name}</TableCell>
                  <TableCell className="font-mono text-sm">{branch.code}</TableCell>
                  <TableCell>{branch.contactPhone}</TableCell>
                  <TableCell>
                    {branch.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/branches/${branch.id}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(branch.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
```

#### Step 5: Create Form Pages

Create `app/(dashboard)/branches/create/page.tsx` and `app/(dashboard)/branches/[id]/page.tsx` following the patterns shown above.

---

## Available Resources

Based on the RMS Service API, here are the main resources that need pages:

### Core Resources (Priority 1)

1. **Restaurants** (`/api/restaurants`)
   - Restaurant management
   - Base entity for the system

2. **Branches** (`/api/branches`)
   - Restaurant locations
   - Branch management

3. **Users** (`/api/rms-users`)
   - User management
   - Role assignments

4. **Roles** (`/api/restaurant-roles`)
   - Role definitions
   - Permission assignments

### Menu Management (Priority 2)

5. **Menu Categories** (`/api/menu-categories`)
   - Category organization

6. **Menu Items** (`/api/menu-items`)
   - Menu item management
   - Pricing, descriptions

7. **Menu Item Variants** (`/api/menu-item-variants`)
   - Size/variant options

8. **Menu Item Addons** (`/api/menu-item-addons`)
   - Customization options

### Operations (Priority 3)

9. **Tables** (`/api/branch-tables`)
   - Table management per branch

10. **Orders** (`/api/orders`)
    - Order tracking
    - Order items
    - Order status

11. **Bills** (`/api/bills`)
    - Billing management
    - Bill items
    - Payments

12. **Payments** (`/api/payments`)
    - Payment processing
    - Payment methods

### Configuration (Priority 4)

13. **Tax Configuration** (`/api/tax-configs`)
    - Tax rules
    - Tax rates

14. **Discounts** (`/api/discounts`)
    - Discount management
    - Promotion rules

15. **Shifts** (`/api/shifts`)
    - Work shifts
    - Staff scheduling

16. **Permissions** (`/api/permissions`)
    - Permission definitions
    - Access control

### Reports & Analytics (Priority 5)

17. **Reports** (`/api/reports`)
    - Sales reports
    - Analytics

18. **Customer Loyalty** (`/api/customer-loyalties`)
    - Loyalty program
    - Points management

---

## Best Practices

### 1. Consistent Naming

- Files: lowercase with hyphens (`menu-categories`, not `menuCategories`)
- Types: PascalCase (`MenuCategory`)
- Variables: camelCase (`menuCategories`)
- API paths: lowercase with hyphens (`/api/menu-categories`)

### 2. Error Handling

Always handle three states:
- Loading
- Error
- Success (with data)

### 3. Form Validation

- Use HTML5 validation (`required`, `type="email"`, etc.)
- Add client-side validation for complex rules
- Display server errors clearly

### 4. User Feedback

- Loading spinners during async operations
- Success messages (or redirect)
- Error messages with details
- Confirmation dialogs for destructive actions

### 5. Accessibility

- Use semantic HTML
- Proper labels for form fields
- Keyboard navigation support
- ARIA attributes where needed

### 6. Responsive Design

- Use Tailwind's responsive classes (`md:grid-cols-2`)
- Test on mobile, tablet, desktop
- Touch-friendly button sizes

### 7. Performance

- Load data only when needed
- Cache API responses when appropriate
- Optimize re-renders with `useMemo`, `useCallback`
- Lazy load heavy components

---

## Next Steps

1. **Start with Core Resources**: Implement Restaurants and Branches first
2. **Build Reusable Components**: Create form field components, table wrappers
3. **Add Advanced Features**: Search, filters, pagination, sorting
4. **Implement Relationships**: Handle foreign keys (e.g., Branch → Restaurant)
5. **Add Validation**: Both client and server-side
6. **Improve UX**: Loading states, optimistic updates, error recovery

---

## Related Documentation

- [API Structure](API_STRUCTURE.md)
- [Frontend Architecture Plan](FRONTEND_ARCHITECTURE_PLAN.md)
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## Summary

This guide provides a complete blueprint for building CRUD pages in the RMS Web App:

✅ **Route Structure**: Next.js App Router conventions
✅ **Page Templates**: List, Create, Edit patterns
✅ **API Integration**: Type-safe client functions
✅ **TypeScript Types**: Consistent type definitions
✅ **UI Components**: Reusable shadcn/ui components
✅ **Best Practices**: Error handling, validation, accessibility

Follow these patterns consistently for all resources to maintain a clean, maintainable codebase!
