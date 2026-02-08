import { BaseEntity, SearchParams } from './common';

/**
 * RMS User entity
 * Represents a user in the RMS system (synced from Keycloak)
 */
export interface RmsUser extends BaseEntity {
  keycloakUserId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive?: boolean;
  lastSyncDate?: string;
}

/**
 * User creation payload
 * Used when creating a new user
 */
export interface RmsUserCreate extends Omit<RmsUser, 'id' | 'createdDate' | 'lastModifiedDate' | 'lastSyncDate'> {}

/**
 * User update payload
 * Used when updating an existing user
 */
export interface RmsUserUpdate extends Partial<RmsUserCreate> {
  id: string;
}

/**
 * User search parameters
 * Used for searching and filtering users
 */
export interface RmsUserSearchParams extends SearchParams {
  isActive?: boolean;
  email?: string;
  username?: string;
}

/**
 * User Branch Role Assignment
 * Represents a role assigned to a user for a specific branch
 */
export interface UserBranchRole extends BaseEntity {
  userId: string;
  branchId: string;
  roleId: string;
  isActive?: boolean;
}

/**
 * User Branch Role Assignment payload
 */
export interface UserBranchRoleAssignment {
  userId: string;
  branchId: string;
  roleId: string;
}
