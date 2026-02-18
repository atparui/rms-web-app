import { BaseEntity } from './common';
import { Branch } from './branch';
import { Customer } from './customer';
import { RmsUser } from './user';
import { BranchTable } from './branch-table';

export interface Order extends BaseEntity {
  orderNumber?: string;
  orderType?: string;
  orderSource?: string;
  status?: string;
  orderDate?: string;
  estimatedReadyTime?: string;
  actualReadyTime?: string;
  specialInstructions?: string;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  isPaid?: boolean;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  branch?: Branch;
  customer?: Customer;
  user?: RmsUser;
  branchTable?: BranchTable;
}

export interface OrderCreate extends Omit<Order, 'id' | 'branch' | 'customer' | 'user' | 'branchTable' | 'createdDate' | 'lastModifiedDate'> {
  branchId: string;
  customerId?: string;
  userId?: string;
  branchTableId?: string;
}

export interface OrderUpdate extends Partial<OrderCreate> {
  id: string;
}
