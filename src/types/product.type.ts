import { ProductCategory } from './categoryProduct.type';
import { Store } from './store.type';
export interface Translations {
  id: string;
  languageCode: string;
  name: string;
  unit: string;
  description: string | null;
  productId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface ProductType {
  id: string;
  name: string;
  discountPercent: number;
}

export interface Product {
  id: string;
  thumbnail: string;
  name: string;
  price: number;
  discountPercent: number;
  description: string;
  unit: string;
  status: string;
  isActive: boolean;
  productCategoryId: string;
  storeId: string;
  productCategory: ProductCategory;
  store: Store;
  translations: Translations[];
  note: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  productTypeId: string | null;
  productType: ProductType | null; // Sửa lại kiểu này
}

export interface ProductPublic {
  id: string;
  name: string;
  products: Product[];
  translations: Translations[];
}
export interface Unit {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  thumbnail: string;
  name: string;
  price: number;
  description: string;
  unit: string;
  status: string;
  productCategoryId: string;
  storeId: string;
  productCategory: ProductCategory;
  store: Store;
}

export type Products = Pick<Product, 'id' | 'thumbnail' | 'name' | 'price' | 'description'>;

export type ProductResponse = {
  data: string;
};
export interface ListUnit {
  id: string;
  name: string;
}
