import { BaseEntity, SearchParams } from './common';
import { MenuCategory } from './menu-category';

/**
 * Menu Item entity
 * Represents an item on the menu
 */
export interface MenuItem extends BaseEntity {
  code?: string;
  name: string;
  description?: string;
  category?: MenuCategory;
  categoryId?: string;
  basePrice: number;
  imageUrl?: string;
  isAvailable?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  allergens?: string;
  preparationTime?: number;
  calories?: number;
  servingSize?: string;
  isActive?: boolean;
}

/**
 * Menu Item creation payload
 */
export interface MenuItemCreate extends Omit<MenuItem, 'id' | 'category' | 'createdDate' | 'lastModifiedDate'> {
  categoryId: string;
}

/**
 * Menu Item update payload
 */
export interface MenuItemUpdate extends Partial<MenuItemCreate> {
  id: string;
}

/**
 * Menu Item search parameters
 */
export interface MenuItemSearchParams extends SearchParams {
  categoryId?: string;
  branchId?: string;
  isAvailable?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isActive?: boolean;
}

/**
 * Menu Item availability update request
 */
export interface MenuItemAvailabilityUpdate {
  isAvailable: boolean;
}
