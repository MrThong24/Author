import { Translations } from "./product.type";

export interface ProductCategory {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  name: string;
  translations: Translations[];
  storeId: string;
}

