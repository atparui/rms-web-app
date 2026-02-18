import { BaseEntity, SearchParams } from './common';
import { RmsUser } from './user';

export interface Customer extends BaseEntity {
  customerCode?: string;
  phone?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isActive?: boolean;
  user?: RmsUser;
}

export interface CustomerCreate extends Omit<Customer, 'id' | 'user' | 'createdDate' | 'lastModifiedDate'> {
  userId?: string;
}

export interface CustomerUpdate extends Partial<CustomerCreate> {
  id: string;
}

export interface CustomerSearchParams extends SearchParams {
  isActive?: boolean;
  email?: string;
}
