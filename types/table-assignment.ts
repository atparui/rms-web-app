import { BaseEntity } from './common';
import { BranchTable } from './branch-table';
import { RmsUser } from './user';

export interface TableAssignment extends BaseEntity {
  assignmentDate: string;
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
  branchTable?: BranchTable;
  supervisor?: RmsUser;
}

export interface TableAssignmentCreate extends Omit<TableAssignment, 'id' | 'branchTable' | 'supervisor' | 'createdDate' | 'lastModifiedDate'> {
  branchTableId: string;
  shiftId?: string;
  supervisorId?: string;
}

export interface TableAssignmentUpdate extends Partial<TableAssignmentCreate> {
  id: string;
}
