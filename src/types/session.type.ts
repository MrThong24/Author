import { SessionStatus } from 'src/shared/common/enum';
import { Table } from './table.type';
import { SessionCustomer } from './request.type';

export interface Session {
  id: string;
  status: SessionStatus;
  customerName: string;
  customerPhone: string;
  tableId: string;
  table: Table;
  sessionCustomers: SessionCustomer[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  deletedAt: string | null;
}
