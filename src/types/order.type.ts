import { Product } from './product.type';
import { Request } from './request.type';
import { Session } from './session.type';
import { Table } from './table.type';
export interface OrderProduct {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  discountPercent: number;
  discountAmount: number;
  note: string;
  orderId: string;
  order: Order;
  productId: string;
  product: Product;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface Order {
  id: string;
  code: string;
  tableName: string;
  zoneName: string;
  customerName: string;
  customerPhone: string;
  status: string;
  paymentMethod: string;
  staffName: string;
  staffUsername: string;
  totalAmount: number;
  paidAt: string;
  tableId: string;
  requestIds: string;
  isCreatedEInvoice?: boolean;
  orderEInvoiceId?: string;
  table: Table;
  products: OrderProduct[];
  requests: Request[];
  session: Session;
  orderEInvoice: OrderEInvoice;
  isSaleInvoiceDiscount?: boolean;
  discountAmount?: number;
  discountPercent?: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CreateOrderPayload {
  tableId: string;
  sessionId: string;
  tableName: string;
  zoneName: string;
}

export interface UpdateOrderPayload {
  products: OrderProduct[];
}

export interface UpdateSaleDisCountOrderPayload {
  isSaleInvoiceDiscount: boolean;
}

export interface PayOrderPayload {
  status: string;
  paymentMethod: string;
  isSaleInvoiceDiscount?: boolean;
}

export interface QrCodePaymentPayload {
  amount: number;
  description: string;
  zone?: string;
  table?: string;
}

export interface OrderEInvoice {
  id: string;
  orderId: string;
  order: Order;
  eInvoiceType: string;
  eInvoiceFormat: string;
  eInvoiceMode: string;
  eInvoiceSymbol: string;
  paymentMethod: string;
  vendorCompanyName?: string;
  vendorAddress?: string;
  vendorEmail?: string;
  vendorBankNumber?: string;
  vendorTaxCode?: string;
  vendorPhone?: string;
  vendorBankName?: string;
  customerName?: string;
  customerTaxCode?: string;
  customerPhone?: string;
  customerCompanyName?: string;
  customerAddress?: string;
  customerEmail?: string;
  eInvoiceId?: string;
  eInvoiceSymbolId?: string;
  eInvoiceTaxAuthorityCode?: string;
  eInvoiceReplacedSymbol?: string;
  eInvoiceNumber?: string;
  eInvoiceCode?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}
