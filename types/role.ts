import { BaseEntity } from './common';

/**
 * Permission entity
 * Represents a permission in the system
 */
export interface Permission extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  category?: string;
  isActive?: boolean;
}

/**
 * Role Permission entity
 * Represents a role with its associated permissions
 */
export interface RolePermission extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  permissions?: Permission[];
  isActive?: boolean;
}

/**
 * Role creation payload
 */
export interface RolePermissionCreate extends Omit<RolePermission, 'id' | 'permissions' | 'createdDate' | 'lastModifiedDate'> {
  permissionIds?: string[];
}

/**
 * Role update payload
 */
export interface RolePermissionUpdate extends Partial<RolePermissionCreate> {
  id: string;
}

/**
 * Role assignment request
 */
export interface RoleAssignmentRequest {
  userId: string;
  roleId: string;
  branchId?: string;
}

/**
 * Role revoke request
 */
export interface RoleRevokeRequest {
  userId: string;
  roleId: string;
  branchId?: string;
}
