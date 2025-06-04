import { create } from 'zustand';
import http from 'src/shared/utils/http';
import { CustomerPayload } from 'src/validate/customerSchema';
import { showError, showErrorMessage } from 'src/shared/utils/error';
import { HistoryOrder } from 'src/types/cart.type';
import { getCustomerInfo } from 'src/shared/utils/auth';
import { ChangeLanguagePayload, CustomerInfo, Customers, PickExistCustomerId } from 'src/types/customer.type';
import useCartStore from './useCartStore';
import { Params } from 'src/types/params.type';
import { Store } from 'src/types/store.type';
import { RequestProductStatus } from 'src/shared/common/enum';
import { AxiosError, AxiosResponse } from 'axios';

export interface FilterCustomer extends Params {}

interface CustomerStore {
  isLoading: boolean;
  error: string | null;
  customers: Customers[];
  total: number;
  customerHistory: HistoryOrder[];
  customerHistoryQuantity: number;
  store: Store | null;
  createCustomer: (id: string, payload: CustomerPayload | PickExistCustomerId) => Promise<void>;
  fetchCustomers: (params: FilterCustomer, getOnly?: boolean) => Promise<void>;
  fetchCustomerHistory: () => Promise<void>;
  getStoreByTableId: (tableId: string) => Promise<Store>;
  changeLanguage: (data: ChangeLanguagePayload) => Promise<AxiosResponse<any>>;
}
const inforUser = getCustomerInfo() as CustomerInfo;

export const useCustomerStore = create<CustomerStore>((set) => ({
  isLoading: false,
  error: null,
  total: 0,
  customers: [],
  customerHistory: [],
  customerHistoryQuantity: 0,
  store: null,

  createCustomer: async (id, payload: CustomerPayload | PickExistCustomerId) => {
    set({ isLoading: true, error: null });
    try {
      await http.post(`customer/start-order/${id}`, payload);
      const cartStore = useCartStore.getState();
      cartStore.setSessionExpired(false);
      if (id !== inforUser?.tableId) {
        cartStore.clearCart();
        localStorage.removeItem('cart-storage');
      }
      if (!('customerId' in payload && payload.customerId)) {
        set({ isLoading: true });
      }
    } catch (error) {
      if ((error as AxiosError)?.response?.status === 409) throw error;
      showErrorMessage({ error });
    } finally {
      set({ isLoading: false });
    }
  },
  fetchCustomerHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await http.get('public/request/customer/history');
      let totalQuantity = 0;

      response.data.forEach((order: HistoryOrder) => {
        order.requestProducts.forEach((product) => {
          if (
            product.status === RequestProductStatus.COMPLETED ||
            product.status === RequestProductStatus.INPROGRESS ||
            product.status === RequestProductStatus.PENDING
          ) {
            totalQuantity += product.quantity;
          }
        });
      });
      set({
        customerHistory: response.data,
        customerHistoryQuantity: totalQuantity
      });
    } catch (error) {
      showErrorMessage({ error });
    } finally {
      set({ isLoading: false });
    }
  },
  fetchCustomers: async (params: FilterCustomer, getOnly?: boolean) => {
    if (!getOnly) {
      set({ isLoading: true });
    }
    try {
      const response = await http.get('/customer', { params });
      if (!getOnly) {
        set({ customers: response.data.data, isLoading: false, total: response.data.totalItems });
      }
      return response.data;
    } catch (error) {
      showError({ error, title: 'Lấy thông tin khách hàng thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  getStoreByTableId: async (tableId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await http.get('public/table/store/' + tableId);
      set({ store: response.data });
      return response.data;
    } catch (error) {
      showErrorMessage({ error });
    } finally {
      set({ isLoading: false });
    }
  },

  changeLanguage: async (data: ChangeLanguagePayload) => {
    set({ isLoading: true });
    try {
      return await http.post('/customer/change-language', data);
    } catch (error) {
      showError({ error, title: 'Lỗi trong quá trình thay đổi ngôn ngữ' });
      throw error;
    }
  }
}));
