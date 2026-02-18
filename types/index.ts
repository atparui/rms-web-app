/**
 * Central export file for all types
 * Import types like: import { Restaurant, Branch } from '@/types'
 */

// Common types
export * from './common';

// Core entities
export * from './restaurant';
export * from './branch';
export * from './user';
export * from './role';

// Menu entities
export * from './menu-category';
export * from './menu-item';

// Customer, Inventory, Orders, Billing, Tables
export * from './customer';
export * from './inventory';
export * from './order';
export * from './bill';
export * from './branch-table';
export * from './table-assignment';
