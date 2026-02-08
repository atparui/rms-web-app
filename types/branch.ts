import { BaseEntity, SearchParams } from './common';
import { Restaurant } from './restaurant';

/**
 * Branch entity
 * Represents a branch/location of a restaurant
 */
export interface Branch extends BaseEntity {
  code?: string;
  name: string;
  description?: string;
  restaurant?: Restaurant;  // Nested restaurant object (from API)
  restaurantId?: string;     // For form submissions
  contactEmail?: string;
  contactPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  openingTime?: string;
  closingTime?: string;
  maxCapacity?: number;
  isActive?: boolean;
}

/**
 * Branch creation payload
 * Used when creating a new branch
 */
export interface BranchCreate extends Omit<Branch, 'id' | 'restaurant' | 'createdDate' | 'lastModifiedDate'> {
  restaurantId: string;  // Required for creation
}

/**
 * Branch update payload
 * Used when updating an existing branch (partial updates)
 */
export interface BranchUpdate extends Partial<BranchCreate> {
  id: string;
}

/**
 * Branch search parameters
 * Used for searching and filtering branches
 */
export interface BranchSearchParams extends SearchParams {
  restaurantId?: string;
  isActive?: boolean;
  city?: string;
  state?: string;
}
