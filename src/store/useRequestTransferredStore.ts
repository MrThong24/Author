import http from 'src/shared/utils/http';
import { create } from 'zustand';
import { showError } from 'src/shared/utils/error';
import { Params } from 'src/types/params.type';
import { RequestProductRemade, RequestTransferred } from 'src/types/requestTransferred.type';
import { notification } from 'antd';

export interface FilterRequestTransferred extends Params {
  zoneId?: string;
  tableId?: string;
}

interface EditRequestTransferredRemade {
  quantity: number;
  reasonRemade: string;
}

interface RequestProductItem {
  servedQuantity: number;
  id: string;
}

interface UpdateRequestTransferredServeData {
  requestProductItems: RequestProductItem[];
}

interface RequestTransferredStore {
  requestsTransferred: RequestTransferred[];
  productRemade: RequestProductRemade[];
  total: number;
  isLoading: boolean;
  detailRequestTransferred?: RequestTransferred | null;
  error: string | null;
  fetchRequestTransferred: (params: FilterRequestTransferred) => Promise<void>;
  fetchRequestTransferredHistory: (params: FilterRequestTransferred) => Promise<void>;
  setRequestTransferred: (
    updater: RequestTransferred[] | ((prev: RequestTransferred[]) => RequestTransferred[])
  ) => void;
  getDetailRequestTransferred: (id: string) => Promise<RequestTransferred | undefined>;
  updateRequestTransferredRemade: (id: string, payload: EditRequestTransferredRemade) => Promise<void>;
  updateRequestTransferredServe: (id: string, payload: UpdateRequestTransferredServeData) => Promise<void>;
}

const useRequestTransferredStore = create<RequestTransferredStore>((set) => ({
  requestsTransferred: [],
  productRemade: [],
  total: 0,
  isLoading: false,
  error: null,

  setRequestTransferred: (updater) =>
    set((state) => {
      const newRequests =
        typeof updater === 'function' ? updater(state.requestsTransferred) : updater;
      return {
        requestsTransferred: newRequests,
        total: newRequests.length,
      };
    }),

  fetchRequestTransferred: async (params: FilterRequestTransferred) => {
    set({ isLoading: true, error: null });
    try {
      const response = await http.get('/request/transferred', { params });
      set({
        requestsTransferred: response.data.data,
        total: response.data.totalItems,
        isLoading: false,
      });
    } catch (error) {
      showError({ error, title: 'Lấy thông tin yêu cầu thất bại' });
      set({ isLoading: false, error: 'Lấy thông tin yêu cầu thất bại' });
      throw error;
    }
  },

  fetchRequestTransferredHistory: async (params: FilterRequestTransferred) => {
    set({ isLoading: true, error: null });
    try {
      const response = await http.get('/request-product/remade', { params });
      set({
        productRemade: response.data.data,
        total: response.data.totalItems,
        isLoading: false,
      });
    } catch (error) {
      showError({ error, title: 'Lấy lịch sử yêu cầu thất bại' });
      set({ isLoading: false, error: 'Lấy lịch sử yêu cầu thất bại' });
      throw error;
    }
  },

  getDetailRequestTransferred: async (id: string): Promise<RequestTransferred | undefined> => {
    set({ isLoading: true });
    try {
      const response = await http.get<RequestTransferred>(`/request/transferred/${id}`);
      set({ detailRequestTransferred: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Lấy chi tiết thông gọi món thất bại' });
      set({ isLoading: false, error: 'Lấy chi tiết thông gọi món thất bại' });
      return undefined; // ✅ Trả về `undefined` thay vì lỗi
    }
  },

  updateRequestTransferredRemade: async (id: string, data: EditRequestTransferredRemade) => {
    set({ isLoading: true });
    try {
      const response = await http.put(`/request-product/remade/${id}`, data);
      set({ isLoading: false });
      notification.success({
        message: response?.data?.message || 'Xác nhận yêu cầu làm lại món thành công',
      });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Xác nhận yêu cầu làm lại món thất bại' });
      set({ isLoading: false, error: 'Xác nhận yêu cầu làm lại món thất bại' });
      throw error;
    }
  },

  updateRequestTransferredServe: async (id: string, data: UpdateRequestTransferredServeData) => {
    set({ isLoading: true });
    try {
      const response = await http.put(`/request-product/serve/${id}`, data);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Xác nhận phục vụ món thất bại' });
      set({ isLoading: false, error: 'Xác nhận phục vụ món thất bại' });
      throw error;
    }
  },
}));

export default useRequestTransferredStore;
