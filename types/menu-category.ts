import { BaseEntity, SearchParams } from './common';

/**
 * Menu Category entity
 * Represents a category for organizing menu items
 */
export interface MenuCategory extends BaseEntity {
  code?: string;
  name: string;
  description?: string;
  displayOrder?: number;
  imageUrl?: string;
  isActive?: boolean;
}

/**
 * Menu Category creation payload
 */
export interface MenuCategoryCreate extends Omit<MenuCategory, 'id' | 'createdDate' | 'lastModifiedDate'> {}

/**
 * Menu Category update payload
 */
export interface MenuCategoryUpdate extends Partial<MenuCategoryCreate> {
  id: string;
}

/**
 * Menu Category search parameters
 */
export interface MenuCategorySearchParams extends SearchParams {
  isActive?: boolean;
}
