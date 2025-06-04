import { Company } from './company.type';

export interface Store {
  id: string;
  name: string;
  address: string;
  thumbnail: string;
  email?: string;
  phone?: string;
  slogan: string;
  bankBin?: string;
  bankNumber?: string;
  accountHolder?: string;
  primaryColor: string;
  bankType?: string;
  taxCode?: string;
  eInvoiceUsername?: string;
  eInvoicePassword?: string;
  eInvoiceUrl?: string;
  eInvoiceType?: string;
  eInvoiceFormat?: string;
  eInvoiceMode?: string;
  eInvoiceSymbol?: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  company: Company;
  isQRIntegrated: boolean;
  kitchenDisabled: boolean;
  servingQuantityConfirmationDisabled: boolean;
  completingQuantityConfirmationDisabled: boolean;
  qrSoundRegistered: boolean;
  bPacTemplatePath: string;
  posStoreId: string;
}

export interface EInvoiceSymbol {
  qlmtke_id: string;
  qlkhsdung_id: string;
  lhdon: string;
  hthuc: string;
  khdon: string;
  khhdon: string;
  sdmau: number;
  code: string;
  nglap: string;
  nlap: string;
  loaikh: number;
  tenbl: string | null;
  loaibl: string | null;
  solienbl: string | null;
  sottbl: string | null;
  htbl: string | null;
  khmbl: string | null;
  tinh_code: string | null;
  mtttien: string;
  permission_id: string;
  qlkhsdung_id1: string;
  wb_user_id: string;
  value: string;
  id: string;
}
export interface ProductSettings {
  id: string;
  name: string;
  discountPercent: number;
}
export interface KitchenSettings {
  id: string;
  name: string;
  isPrintEnabled: boolean;
  zoneCount: number;
}
export interface KitchenDetailSetting {
  id: string;
  name: string;
  isPrintEnabled: boolean;
  kitchenZones: KitchenZone[];
  kitchenProductTypes: KitchenProductType[];
}
interface KitchenZone {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  kitchenId: string;
  zoneId: string;
  zone: Zone;
}

interface Zone {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  name: string;
  storeId: string;
}

interface KitchenProductType {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  kitchenId: string;
  productTypeId: string;
  productType: ProductType;
}

interface ProductType {
  discountPercent: number;
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  name: string;
  storeId: string;
}
export interface Kitchen1PostStore {
  id: string;
  name: string;
}
