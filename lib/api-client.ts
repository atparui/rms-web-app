/**
 * API Client for RMS Service
 * Provides type-safe functions for all API endpoints
 */

import {
  Restaurant,
  RestaurantCreate,
  RestaurantUpdate,
  RestaurantSearchParams,
  Branch,
  BranchCreate,
  BranchUpdate,
  BranchSearchParams,
  RmsUser,
  RmsUserCreate,
  RmsUserUpdate,
  RmsUserSearchParams,
  UserBranchRole,
  UserBranchRoleAssignment,
  Permission,
  RolePermission,
  RolePermissionCreate,
  RolePermissionUpdate,
  RoleAssignmentRequest,
  RoleRevokeRequest,
  MenuCategory,
  MenuCategoryCreate,
  MenuCategoryUpdate,
  MenuCategorySearchParams,
  MenuItem,
  MenuItemCreate,
  MenuItemUpdate,
  MenuItemSearchParams,
  MenuItemAvailabilityUpdate,
  Customer,
  CustomerCreate,
  CustomerUpdate,
  CustomerSearchParams,
  Inventory,
  InventoryCreate,
  InventoryUpdate,
  Order,
  OrderCreate,
  OrderUpdate,
  Bill,
  BillCreate,
  BillUpdate,
  BranchTable,
  BranchTableCreate,
  BranchTableUpdate,
  BranchTableSearchParams,
  TableAssignment,
  TableAssignmentCreate,
  TableAssignmentUpdate,
} from '@/types';
import { apiConfig } from './config';

// API Base Configuration
const API_BASE_URL = apiConfig.apiOrigin || 'https://console.atparui.com';
const API_PATH = '/services/rms-service/api';

/**
 * Extract tenant ID from JWT token
 */
function getTenantIdFromToken(token: string): string | null {
  try {
    // JWT structure: header.payload.signature
    const payload = token.split('.')[1];
    if (!payload) return null;
    
    // Decode base64url
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded.tenant_id || null;
  } catch (error) {
    console.error('[api-client] Failed to extract tenant_id from token:', error);
    return null;
  }
}

/**
 * Fetch wrapper with authentication and error handling
 */
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('kc_token') : null;
  
  // Extract tenant ID from token
  const tenantId = token ? getTenantIdFromToken(token) : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(tenantId && { 'X-Tenant-ID': tenantId }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `API Error: ${response.status} ${response.statusText}`,
    }));
    throw new Error(error.message || error.title || `API Error: ${response.status}`);
  }

  // Handle DELETE responses (often 204 No Content)
  if (response.status === 204 || options.method === 'DELETE') {
    return null;
  }

  return response.json();
}

/**
 * Build query string from parameters
 */
function buildQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => query.append(key, String(v)));
      } else {
        query.append(key, String(value));
      }
    }
  });
  
  const str = query.toString();
  return str ? `?${str}` : '';
}

// ============================================================================
// Restaurant API
// ============================================================================

export const restaurantApi = {
  /**
   * Get all restaurants
   */
  getAll: (): Promise<Restaurant[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/restaurants`),
  
  /**
   * Get restaurant by ID
   */
  getById: (id: string): Promise<Restaurant> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/restaurants/${id}`),
  
  /**
   * Search restaurants
   */
  search: (params: RestaurantSearchParams): Promise<Restaurant[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/restaurants/_search${buildQueryString(params)}`),
  
  /**
   * Create new restaurant
   */
  create: (data: RestaurantCreate): Promise<Restaurant> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/restaurants`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  /**
   * Update restaurant (full update)
   */
  update: (data: RestaurantUpdate): Promise<Restaurant> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/restaurants/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  /**
   * Partially update restaurant
   */
  partialUpdate: (id: string, data: Partial<Restaurant>): Promise<Restaurant> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/restaurants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  /**
   * Delete restaurant
   */
  delete: (id: string): Promise<void> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/restaurants/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// Branch API
// ============================================================================

export const branchApi = {
  /**
   * Get all branches
   */
  getAll: (): Promise<Branch[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/branches`),
  
  /**
   * Get branch by ID
   */
  getById: (id: string): Promise<Branch> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/branches/${id}`),
  
  /**
   * Search branches
   */
  search: (params: BranchSearchParams): Promise<Branch[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/branches/_search${buildQueryString(params)}`),
  
  /**
   * Create new branch
   */
  create: (data: BranchCreate): Promise<Branch> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/branches`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  /**
   * Update branch (full update)
   */
  update: (data: BranchUpdate): Promise<Branch> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/branches/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  /**
   * Partially update branch
   */
  partialUpdate: (id: string, data: Partial<Branch>): Promise<Branch> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/branches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  /**
   * Delete branch
   */
  delete: (id: string): Promise<void> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/branches/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// RMS User API
// ============================================================================

export const rmsUserApi = {
  /**
   * Get all users
   */
  getAll: (): Promise<RmsUser[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/rms-users`),
  
  /**
   * Get user by ID
   */
  getById: (id: string): Promise<RmsUser> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/rms-users/${id}`),
  
  /**
   * Search users
   */
  search: (params: RmsUserSearchParams): Promise<RmsUser[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/rms-users/_search${buildQueryString(params)}`),
  
  /**
   * Create new user
   */
  create: (data: RmsUserCreate): Promise<RmsUser> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/rms-users`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  /**
   * Update user (full update)
   */
  update: (data: RmsUserUpdate): Promise<RmsUser> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/rms-users/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  /**
   * Partially update user
   */
  partialUpdate: (id: string, data: Partial<RmsUser>): Promise<RmsUser> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/rms-users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  /**
   * Delete user
   */
  delete: (id: string): Promise<void> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/rms-users/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// User Branch Role API
// ============================================================================

export const userBranchRoleApi = {
  /**
   * Get all user branch role assignments
   */
  getAll: (): Promise<UserBranchRole[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/user-branch-roles`),
  
  /**
   * Get user branch role by ID
   */
  getById: (id: string): Promise<UserBranchRole> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/user-branch-roles/${id}`),
  
  /**
   * Assign role to user for a branch
   */
  assign: (data: UserBranchRoleAssignment): Promise<UserBranchRole> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/user-branch-roles`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  /**
   * Revoke role from user for a branch
   */
  revoke: (id: string): Promise<void> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/user-branch-roles/${id}/revoke`, {
      method: 'POST',
    }),
  
  /**
   * Delete user branch role
   */
  delete: (id: string): Promise<void> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/user-branch-roles/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// Permission API
// ============================================================================

export const permissionApi = {
  /**
   * Get all permissions
   */
  getAll: (): Promise<Permission[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/permissions`),
  
  /**
   * Get permission by ID
   */
  getById: (id: string): Promise<Permission> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/permissions/${id}`),
};

// ============================================================================
// Role Permission API
// ============================================================================

export const rolePermissionApi = {
  /**
   * Get all roles
   */
  getAll: (): Promise<RolePermission[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/role-permissions`),
  
  /**
   * Get role by ID
   */
  getById: (id: string): Promise<RolePermission> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/role-permissions/${id}`),
  
  /**
   * Create new role
   */
  create: (data: RolePermissionCreate): Promise<RolePermission> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/role-permissions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  /**
   * Update role (full update)
   */
  update: (data: RolePermissionUpdate): Promise<RolePermission> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/role-permissions/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  /**
   * Delete role
   */
  delete: (id: string): Promise<void> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/role-permissions/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// Menu Category API
// ============================================================================

export const menuCategoryApi = {
  /**
   * Get all menu categories
   */
  getAll: (): Promise<MenuCategory[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-categories`),
  
  /**
   * Get menu category by ID
   */
  getById: (id: string): Promise<MenuCategory> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-categories/${id}`),
  
  /**
   * Search menu categories
   */
  search: (params: MenuCategorySearchParams): Promise<MenuCategory[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-categories/_search${buildQueryString(params)}`),
  
  /**
   * Create new menu category
   */
  create: (data: MenuCategoryCreate): Promise<MenuCategory> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-categories`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  /**
   * Update menu category (full update)
   */
  update: (data: MenuCategoryUpdate): Promise<MenuCategory> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-categories/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  /**
   * Partially update menu category
   */
  partialUpdate: (id: string, data: Partial<MenuCategory>): Promise<MenuCategory> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  /**
   * Delete menu category
   */
  delete: (id: string): Promise<void> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-categories/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// Menu Item API
// ============================================================================

export const menuItemApi = {
  /**
   * Get all menu items
   */
  getAll: (): Promise<MenuItem[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-items`),
  
  /**
   * Get menu item by ID
   */
  getById: (id: string): Promise<MenuItem> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-items/${id}`),
  
  /**
   * Get menu items by category
   */
  getByCategory: (categoryId: string): Promise<MenuItem[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-items/category/${categoryId}`),
  
  /**
   * Get available menu items by branch
   */
  getByBranchAvailable: (branchId: string): Promise<MenuItem[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-items/branch/${branchId}/available`),
  
  /**
   * Get filtered menu items by branch
   */
  getByBranchFiltered: (branchId: string, params?: MenuItemSearchParams): Promise<MenuItem[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-items/branch/${branchId}/filtered${buildQueryString(params)}`),
  
  /**
   * Search menu items
   */
  search: (params: MenuItemSearchParams): Promise<MenuItem[]> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-items/_search${buildQueryString(params)}`),
  
  /**
   * Create new menu item
   */
  create: (data: MenuItemCreate): Promise<MenuItem> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-items`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  /**
   * Update menu item (full update)
   */
  update: (data: MenuItemUpdate): Promise<MenuItem> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-items/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  /**
   * Partially update menu item
   */
  partialUpdate: (id: string, data: Partial<MenuItem>): Promise<MenuItem> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  /**
   * Update menu item availability
   */
  updateAvailability: (id: string, data: MenuItemAvailabilityUpdate): Promise<MenuItem> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-items/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  /**
   * Delete menu item
   */
  delete: (id: string): Promise<void> => 
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/menu-items/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// Customer API
// ============================================================================

export const customerApi = {
  getAll: (): Promise<Customer[]> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/customers`),
  getById: (id: string): Promise<Customer> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/customers/${id}`),
  search: (params?: CustomerSearchParams): Promise<Customer[]> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/customers/_search${buildQueryString(params)}`),
  create: (data: CustomerCreate): Promise<Customer> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/customers`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (data: CustomerUpdate): Promise<Customer> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/customers/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string): Promise<void> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/customers/${id}`, { method: 'DELETE' }),
};

// ============================================================================
// Inventory API
// ============================================================================

export const inventoryApi = {
  getAll: (): Promise<Inventory[]> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/inventories`),
  getById: (id: string): Promise<Inventory> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/inventories/${id}`),
  create: (data: InventoryCreate): Promise<Inventory> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/inventories`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (data: InventoryUpdate): Promise<Inventory> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/inventories/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string): Promise<void> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/inventories/${id}`, { method: 'DELETE' }),
};

// ============================================================================
// Order API
// ============================================================================

export const orderApi = {
  getAll: (): Promise<Order[]> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/orders`),
  getById: (id: string): Promise<Order> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/orders/${id}`),
  create: (data: OrderCreate): Promise<Order> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/orders`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (data: OrderUpdate): Promise<Order> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/orders/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string): Promise<void> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/orders/${id}`, { method: 'DELETE' }),
};

// ============================================================================
// Bill API
// ============================================================================

export const billApi = {
  getAll: (): Promise<Bill[]> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/bills`),
  getById: (id: string): Promise<Bill> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/bills/${id}`),
  search: (params?: Record<string, unknown>): Promise<Bill[]> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/bills/_search${buildQueryString(params)}`),
  create: (data: BillCreate): Promise<Bill> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/bills`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (data: BillUpdate): Promise<Bill> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/bills/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string): Promise<void> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/bills/${id}`, { method: 'DELETE' }),
};

// ============================================================================
// Branch Table API
// ============================================================================

export const branchTableApi = {
  getAll: (): Promise<BranchTable[]> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/branch-tables`),
  getById: (id: string): Promise<BranchTable> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/branch-tables/${id}`),
  search: (params?: BranchTableSearchParams): Promise<BranchTable[]> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/branch-tables/_search${buildQueryString(params)}`),
  create: (data: BranchTableCreate): Promise<BranchTable> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/branch-tables`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (data: BranchTableUpdate): Promise<BranchTable> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/branch-tables/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string): Promise<void> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/branch-tables/${id}`, { method: 'DELETE' }),
};

// ============================================================================
// Table Assignment API (Table Roster)
// ============================================================================

export const tableAssignmentApi = {
  getAll: (): Promise<TableAssignment[]> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/table-assignments`),
  getById: (id: string): Promise<TableAssignment> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/table-assignments/${id}`),
  create: (data: TableAssignmentCreate): Promise<TableAssignment> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/table-assignments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (data: TableAssignmentUpdate): Promise<TableAssignment> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/table-assignments/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string): Promise<void> =>
    fetchWithAuth(`${API_BASE_URL}${API_PATH}/table-assignments/${id}`, { method: 'DELETE' }),
};

// ============================================================================
// Utility function for fetching JSON from API
// Used by menu.ts and other modules
// ============================================================================

export async function fetchJson<T>(endpoint: string, options?: { token?: string }): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${API_PATH}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  let token: string | null = null;
  
  if (options?.token) {
    token = options.token;
    headers['Authorization'] = `Bearer ${token}`;
  } else if (typeof window !== 'undefined') {
    token = localStorage.getItem('kc_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  // Add tenant ID header
  if (token) {
    const tenantId = getTenantIdFromToken(token);
    if (tenantId) {
      headers['X-Tenant-ID'] = tenantId;
    }
  }
  
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}
