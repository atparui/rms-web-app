import { BaseEntity, SearchParams } from './common';
import { Branch } from './branch';

export interface BranchTable extends BaseEntity {
  tableNumber: string;
  tableName?: string;
  capacity: number;
  floor?: string;
  section?: string;
  status?: string;
  qrCode?: string;
  qrCodeUrl?: string;
  isActive?: boolean;
  branch?: Branch;
}

export interface BranchTableCreate extends Omit<BranchTable, 'id' | 'branch' | 'createdDate' | 'lastModifiedDate'> {
  branchId: string;
}

export interface BranchTableUpdate extends Partial<BranchTableCreate> {
  id: string;
}

export interface BranchTableSearchParams extends SearchParams {
  branchId?: string;
  isActive?: boolean;
}
