import { BaseEntity } from './common';
import { Order } from './order';
import { Branch } from './branch';
import { Customer } from './customer';

export interface Bill extends BaseEntity {
  billNumber?: string;
  billDate?: string;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  serviceCharge?: number;
  totalAmount?: number;
  amountPaid?: number;
  amountDue?: number;
  status?: string;
  generatedBy?: string;
  notes?: string;
  order?: Order;
  branch?: Branch;
  customer?: Customer;
}

export interface BillCreate extends Omit<Bill, 'id' | 'order' | 'branch' | 'customer' | 'createdDate' | 'lastModifiedDate'> {
  orderId: string;
  branchId: string;
  customerId?: string;
}

export interface BillUpdate extends Partial<BillCreate> {
  id: string;
}
