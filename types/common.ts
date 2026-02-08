/**
 * Common types used across the application
 */

// Base pagination parameters
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string[];
}

// Base search parameters
export interface SearchParams extends PaginationParams {
  query?: string;
}

// Base entity with timestamps
export interface BaseEntity {
  id: string;  // UUID
  createdDate?: string;
  lastModifiedDate?: string;
}

// Status types
export type ActiveStatus = boolean;

// Common response types
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
