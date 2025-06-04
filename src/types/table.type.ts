import { TableStatus } from 'src/shared/common/enum';
import { Store } from './store.type';
import { Session } from './session.type';
import { User } from './user.type';

export interface Zone {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  storeId: string;
  store: Store;
  tables: Table[];
}

export interface TableUser {
  id: string;
  tableId: string;
  userId: string;
  user: User;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface Table {
  id: string;
  name: string;
  status: TableStatus;
  productCategoryId: string;
  zoneId: string;
  zone: Zone;
  storeId: string;
  store: Store;
  pendingRequestsCount?: number;
  sessions: Array<Session>;
  tableUsers: Array<TableUser>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface TableToPrint {
  tableId: string;
  tableName: string;
  zoneName: string;
  qrCodeOrder: string;
  qrCodePayment: string;
}

export type TableResponse = {
  data: string;
};
