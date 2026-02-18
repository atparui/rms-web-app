import { BaseEntity } from './common';
import { Branch } from './branch';
import { MenuItem } from './menu-item';

export interface Inventory extends BaseEntity {
  currentStock?: number;
  unit?: string;
  minStockLevel?: number;
  maxStockLevel?: number;
  lastUpdatedAt?: string;
  lastUpdatedBy?: string;
  branch?: Branch;
  menuItem?: MenuItem;
}

export interface InventoryCreate extends Omit<Inventory, 'id' | 'branch' | 'menuItem' | 'createdDate' | 'lastModifiedDate' | 'lastUpdatedAt' | 'lastUpdatedBy'> {
  branchId: string;
  menuItemId: string;
}

export interface InventoryUpdate extends Partial<InventoryCreate> {
  id: string;
}
