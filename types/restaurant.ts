import { BaseEntity, SearchParams } from './common';

/**
 * Restaurant entity
 * Represents a restaurant in the RMS system
 */
export interface Restaurant extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  contactEmail: string;
  contactPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  timezone?: string;
  logoUrl?: string;
  isActive?: boolean;
}

/**
 * Restaurant creation payload
 * Used when creating a new restaurant
 */
export interface RestaurantCreate extends Omit<Restaurant, 'id' | 'createdDate' | 'lastModifiedDate'> {}

/**
 * Restaurant update payload
 * Used when updating an existing restaurant (partial updates)
 */
export interface RestaurantUpdate extends Partial<RestaurantCreate> {
  id: string;
}

/**
 * Restaurant search parameters
 * Used for searching and filtering restaurants
 */
export interface RestaurantSearchParams extends SearchParams {
  isActive?: boolean;
  country?: string;
  state?: string;
  city?: string;
}
