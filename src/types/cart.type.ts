import { Translations } from './product.type';

export interface Cart {
  id: string;
  productName: string;
  quantity: number;
  note: string | null;
  price: number;
  status?: string;
  product: {
    thumbnail: string;
    translations: Translations[];
  };
}

export interface HistoryOrder {
  id: string;
  createdAt: string;
  type: string;
  status: string;
  note?: string;
  requestProducts: Cart[];
}
