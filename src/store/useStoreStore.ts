import { notification } from 'antd';
import { RcFile } from 'antd/es/upload';
import { showError } from 'src/shared/utils/error';
import http from 'src/shared/utils/http';
import { uploadFileFn } from 'src/shared/utils/uploadFile';
import {
  EInvoiceConfigPayload,
  KitchenSettingPayload,
  ProductSettingPayload,
  StoreConfig,
  StorePayload,
  StorePayloadPartial,
  productSettingSchema
} from 'src/validate/userSchema';
import { create } from 'zustand';
import { Bank } from 'src/types/user.type';
import {
  EInvoiceSymbol,
  Kitchen1PostStore,
  KitchenDetailSetting,
  KitchenSettings,
  ProductSettings,
  Store
} from 'src/types/store.type';
import { Params } from 'react-router-dom';
import useAuthStore from './authStore';

export interface FilterStores extends Params {
  search?: string;
}
interface StoreStore {
  isLoading: boolean;
  isChecking: boolean;
  stores: Store[];
  banks: Bank[];
  detailStore: Store | null;
  total: number;
  eInvoiceConfig: Store | null;
  listSymbol: EInvoiceSymbol[];
  productSettings: ProductSettings[];
  totalProductSettings: number;
  kitchenSettings: KitchenSettings[];
  totalKitchenSettings: number;
  detailKitchenSetting: KitchenDetailSetting | null;
  listPosStore: Kitchen1PostStore[];
  loadingPosStore: boolean;
  createStore: (payload: StorePayload, thumbnail: RcFile | string) => Promise<void>;
  fetchStores: (params: FilterStores, getOnly?: boolean) => Promise<void>;
  deleteStores: (ids: React.Key[]) => Promise<void>;
  getDetailStore: (id: string) => Promise<Store>;
  updateStore: (
    id: string,
    payload: StorePayloadPartial,
    thumbnail?: RcFile | string,
    fromSystemConfig?: boolean
  ) => Promise<void>;
  updateEInvoiceConfig: (payload: EInvoiceConfigPayload) => Promise<void>;
  updateConfigStore: (id: string, payload: StoreConfig) => Promise<void>;
  getBanks: () => Promise<void>;
  getEInvoiceConfig: () => Promise<void>;
  setEInvoiceConfig: (data: Store | null) => void;
  getListSymbols: () => Promise<void>;
  checkEInvoiceConnection: (data: EInvoiceConfigPayload, hideMessage?: boolean) => Promise<boolean>;
  fetchProductSettings: () => Promise<void>;
  createProductSetting: (data: any) => Promise<void>;
  updateProductSetting: (id: string, data: ProductSettingPayload) => Promise<void>;
  deleteProductSettings: (ids: React.Key[]) => Promise<void>;
  fetchKitchenSettings: () => Promise<void>;
  createKitchenSetting: (data: KitchenSettingPayload) => Promise<void>;
  updateKitchenSetting: (id: string, data: KitchenSettingPayload) => Promise<void>;
  deleteKitchenSettings: (ids: React.Key[]) => Promise<void>;
  getDetailKitchenSetting: (id: string) => Promise<KitchenDetailSetting>;
  clearDetailKitchenSetting: () => void;
  getlistPosStore: () => void;
}

const useStoreStore = create<StoreStore>((set) => ({
  isLoading: false,
  isChecking: false,
  banks: [],
  detailStore: null,
  total: 0,
  stores: [],
  eInvoiceConfig: null,
  listSymbol: [],
  productSettings: [],
  totalProductSettings: 0,
  kitchenSettings: [],
  totalKitchenSettings: 0,
  detailKitchenSetting: null,
  listPosStore: [],
  loadingPosStore: false,

  fetchStores: async (params: FilterStores, getOnly?: boolean) => {
    if (!getOnly) {
      set({ isLoading: true });
    }
    try {
      const response = await http.get('/store', { params });
      if (!getOnly) {
        set({ stores: response.data.data, isLoading: false, total: response.data.totalItems, detailStore: null });
      }
      return response.data;
    } catch (error) {
      showError({ error, title: 'Lấy danh sách cửa hàng thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  createStore: async (data: StorePayload, thumbnail: RcFile | string) => {
    set({ isLoading: true });
    try {
      let resFile;
      if (thumbnail && typeof thumbnail !== 'string') {
        resFile = await uploadFileFn(thumbnail as RcFile);
        thumbnail = resFile.link;
      }
      const response = await http.post(`/store`, { ...data, thumbnail });
      await useAuthStore.getState().getCurrentUser();
      set({ isLoading: false });
      notification.success({
        message: 'Tạo mới cửa hàng thành công'
      });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Tạo mới cửa hàng thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  deleteStores: async (ids: React.Key[]) => {
    set({ isLoading: true });
    try {
      await http.delete<React.Key[]>(`/store`, { data: { ids } });
      set({ isLoading: false });
      notification.success({
        message: 'Xóa cửa hàng thành công'
      });
    } catch (error) {
      showError({ error, title: 'Xóa cửa hàng thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  getDetailStore: async (id: string): Promise<Store> => {
    set({ isLoading: true });
    try {
      const response = await http.get<Store>(`/store/${id}`);
      set({ detailStore: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Lấy chi tiết công ty thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  updateStore: async (
    id: string,
    data: StorePayloadPartial,
    thumbnail?: RcFile | string,
    fromSystemConfig?: boolean
  ) => {
    set({ isLoading: true });
    try {
      let resFile;
      if (thumbnail && typeof thumbnail !== 'string') {
        resFile = await uploadFileFn(thumbnail as RcFile);
        thumbnail = resFile.link;
      }
      const response = await http.put(`/store/${id}`, { ...data, thumbnail });
      await useAuthStore.getState().getCurrentUser();
      set({ isLoading: false });
      notification.success({
        message: fromSystemConfig ? 'Cập nhật thành công' : 'Chỉnh sửa thông tin cửa hàng thành công'
      });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Chỉnh sửa thông tin cửa hàng thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  updateEInvoiceConfig: async (data: EInvoiceConfigPayload) => {
    set({ isLoading: true });
    try {
      const response = await http.put(`/store/e-invoice/config`, { ...data });
      await useStoreStore.getState().getEInvoiceConfig();
      set({ isLoading: false });
      notification.success({
        message: 'Chỉnh sửa cấu hình HDDT thành công'
      });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Chỉnh sửa cấu hình HDDT thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  updateConfigStore: async (id: string, data: StoreConfig) => {
    set({ isLoading: true });
    try {
      const response = await http.put(`/store/${id}`, { ...data });
      await useAuthStore.getState().getCurrentUser();
      set({ isLoading: false });
      notification.success({
        message: 'Chỉnh sửa cài đặt cấu hình cửa hàng thành công'
      });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Chỉnh sửa cài đặt cấu hình cửa hàng thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  getBanks: async () => {
    set({ isLoading: true });
    try {
      const response = await http.get('/qr-code-payment/bank');
      set({ banks: response.data, isLoading: false });
    } catch (error) {
      showError({ error, title: 'Lấy thông tin thất bại' });
      set({ isLoading: false });
    }
  },

  getEInvoiceConfig: async () => {
    set({ isLoading: true });
    try {
      const response = await http.get('/store/e-invoice/config');
      set({ eInvoiceConfig: response.data, isLoading: false });
    } catch (error) {
      showError({ error, title: 'Lấy cấu hình HDDT thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  getListSymbols: async () => {
    set({ isLoading: true });
    try {
      const response = await http.get('/store/e-invoice/symbol');
      set({ listSymbol: response.data, isLoading: false });
    } catch (error) {
      showError({ error, title: 'Lấy danh sách ký hiệu HDDT thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  checkEInvoiceConnection: async (data: EInvoiceConfigPayload, hideMessage?: boolean) => {
    set({ isChecking: true });
    try {
      const response = await http.post('/store/e-invoice/auth', { ...data });
      set({ isChecking: false });
      if (!hideMessage)
        notification.success({
          message: 'Kết nối thành công'
        });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Kết nối thất bại' });
      set({ isChecking: false });
      throw error;
    }
  },

  setEInvoiceConfig: (data: Store | null) => {
    set({ eInvoiceConfig: data });
  },

  fetchProductSettings: async () => {
    set({ isLoading: true });
    try {
      const response = await http.get('/product-type');
      set({ productSettings: response?.data?.data, totalProductSettings: response.data.totalItems, isLoading: false });
    } catch (error) {
      showError({ error, title: 'Lấy dữ liệu thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  createProductSetting: async (data: ProductSettingPayload) => {
    set({ isLoading: true });
    try {
      await http.post('/product-type', data);
      set({ isLoading: false });
      notification.success({
        message: 'Tạo mới phân loại sản phẩm thành công'
      });
    } catch (error) {
      showError({ error, title: 'Tạo mới phân loại sản phẩm thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  updateProductSetting: async (id: string, data: ProductSettingPayload) => {
    set({ isLoading: true });
    try {
      await http.put(`/product-type/${id}`, data);
      set({ isLoading: false });
      notification.success({
        message: 'Chỉnh sửa phân loại sản phẩm thành công'
      });
    } catch (error) {
      showError({ error, title: 'Chỉnh sửa phân loại sản phẩm thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  deleteProductSettings: async (ids: React.Key[]) => {
    set({ isLoading: true });
    try {
      await http.delete<React.Key[]>(`/product-type`, { data: { ids } });
      set({ isLoading: false });
      notification.success({
        message: 'Xóa phân loại sản phẩm thành công'
      });
    } catch (error) {
      showError({ error, title: 'Xóa phân loại sản phẩm thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  fetchKitchenSettings: async () => {
    set({ isLoading: true });
    try {
      const response = await http.get('/kitchen');
      set({ kitchenSettings: response?.data?.data, totalKitchenSettings: response.data.totalItems, isLoading: false });
    } catch (error) {
      showError({ error, title: 'Lấy dữ liệu thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  createKitchenSetting: async (data: KitchenSettingPayload) => {
    set({ isLoading: true });
    try {
      await http.post('/kitchen', data);
      set({ isLoading: false });
      notification.success({
        message: 'Tạo mới thông tin bếp thành công'
      });
    } catch (error) {
      showError({ error, title: 'Tạo mới thông tin bếp thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  updateKitchenSetting: async (id: string, data: KitchenSettingPayload) => {
    set({ isLoading: true });
    try {
      await http.put(`/kitchen/${id}`, data);
      set({ isLoading: false });
      notification.success({
        message: 'Chỉnh sửa thông tin bếp thành công'
      });
    } catch (error) {
      showError({ error, title: 'Chỉnh sửa thông tin bếp thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  deleteKitchenSettings: async (ids: React.Key[]) => {
    set({ isLoading: true });
    try {
      await http.delete<React.Key[]>(`/kitchen`, { data: { ids } });
      set({ isLoading: false });
      notification.success({
        message: 'Xóa thông tin bếp thành công'
      });
    } catch (error) {
      showError({ error, title: 'Xóa thông tin bếp thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  getDetailKitchenSetting: async (id: string): Promise<KitchenDetailSetting> => {
    set({ isLoading: true });
    try {
      const response = await http.get<KitchenDetailSetting>(`/kitchen/${id}`);
      set({ detailKitchenSetting: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Lấy chi tiết thông tin bếp thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  clearDetailKitchenSetting: () => set({ detailKitchenSetting: null }),

  getlistPosStore: async () => {
    set({ loadingPosStore: true });
    try {
      const response = await http.get(`/store/1pos/store`);
      set({ listPosStore: response.data, loadingPosStore: false });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Lấy chi tiết thông tin cửa hàng thất bại' });
      set({ loadingPosStore: false });
      throw error;
    }
  }
}));

export default useStoreStore;
