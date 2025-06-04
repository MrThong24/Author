import http from 'src/shared/utils/http';
import { create } from 'zustand';
import { showError } from 'src/shared/utils/error';
import { Params } from 'src/types/params.type';
import { Request, RequestCounts, RequestProduct } from 'src/types/request.type';
import { notification } from 'antd';
import { RequestStatus } from 'src/shared/common/enum';
import dayjs, { Dayjs } from 'dayjs';

export interface FilterRequest extends Params {
  zoneId?: string;
  tableId?: string;
  type?: string;
  startDate?: Dayjs | string;
  endDate?: Dayjs | string;
}

interface ConfirmRequestBody {
  status: RequestStatus.CONFIRMED | RequestStatus.REJECTED | RequestStatus.INPROGRESS;
  rejectReason?: string;
  requestProducts?: RequestProduct[];
}

interface PendingRequestCount {
  type: string;
  count: string;
}

interface RequestStore {
  // Active requests
  requests: Request[];
  total: number;
  isLoading: boolean;

  // History requests
  historyRequests: Request[];
  historyTotal: number;
  isHistoryLoading: boolean;

  // Completed requests
  completedRequests: Request[];
  completedTotal: number;
  isCompletedLoading: boolean;

  // Detail request
  detailRequest: Request | null;
  error: string | null;

  // Pending request count
  pendingRequestCounts: PendingRequestCount[];

  // History requests
  inprogressRequests: Request[];
  inprogressTotal: number;
  isInprogressLoading: boolean;

  // History requests canceled
  canceledRequests: Request[];
  canceledTotal: number;
  isCanceledLoading: boolean;

  // Methods
  fetchRequestInprogress: (params: FilterRequest) => Promise<{ data: Request[]; total: number } | null>;
  // Methods
  fetchRequests: (params: FilterRequest) => Promise<void>;
  fetchRequestHistory: (params: FilterRequest) => Promise<{ data: Request[]; total: number } | null>;
  fetchRequestCompleted: (params: FilterRequest) => Promise<{ data: Request[]; total: number } | null>;
  fetchRequestCanceled: (params: FilterRequest) => Promise<{ data: Request[]; total: number } | null>;
  getRequestDetail: (id: string | undefined) => Promise<void>;
  confirmOrRejectRequest: (id: string, data: ConfirmRequestBody) => Promise<void>;
  setRequests: (updater: Request[] | ((prev: Request[]) => Request[])) => void;
  setRequestInprogress: (updater: (prev: Request[], total?: number) => { data: Request[]; total: number }) => void;
  getRequestCounts: (sessionId: string, params: FilterRequest) => Promise<RequestCounts>;
  fetchPendingRequestCounts: () => Promise<PendingRequestCount[]>;
  clearDetailRequest: () => void;

  // Add new state and method
  requestCounts: { [key: string]: number };
  setRequestCounts: (
    updater: { [key: string]: number } | ((prev: { [key: string]: number }) => { [key: string]: number })
  ) => void;
}

const useRequestStore = create<RequestStore>((set) => ({
  // Active requests state
  requests: [],
  total: 0,
  isLoading: false,

  // History requests state
  historyRequests: [],
  historyTotal: 0,
  isHistoryLoading: false,

  // Completed requests state
  completedRequests: [],
  completedTotal: 0,
  isCompletedLoading: false,

  // History requests state
  inprogressRequests: [],
  inprogressTotal: 0,
  isInprogressLoading: false,

  // History requests state
  canceledRequests: [],
  canceledTotal: 0,
  isCanceledLoading: false,

  // Detail request state
  detailRequest: null,
  error: null,

  // Pending request count state
  pendingRequestCounts: [],

  requestCounts: {},
  clearDetailRequest: () => {
    set({ detailRequest: null });
  },

  setRequestCounts: (updater) =>
    set((state) => ({
      requestCounts: typeof updater === 'function' ? updater(state.requestCounts) : updater
    })),

  setRequests: (updater) =>
    set((state) => {
      const newRequests = typeof updater === 'function' ? updater(state.requests) : updater;
      return {
        requests: newRequests,
        total: state.total + 1
      };
    }),

  setRequestInprogress: (updater) =>
    set((state) => {
      const updated = updater(state.inprogressRequests, state.total);
      return {
        inprogressRequests: updated.data,
        inprogressTotal: updated.total
      };
    }),

  fetchRequests: async (params: FilterRequest) => {
    set({ isLoading: true, error: null });
    try {
      const { page, limit, ...filterParams } = params;
      const response = await http.get('/request', {
        params: {
          ...filterParams,
          startDate: dayjs().startOf('day'),
          endDate: dayjs().endOf('day')
        }
      });
      set({
        requests: response.data.data,
        total: response.data.totalItems,
        isLoading: false
      });
    } catch (error) {
      showError({ error, title: 'Lấy thông tin yêu cầu thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  getRequestDetail: async (id: string | undefined) => {
    set({ isLoading: true, error: null });
    try {
      const response = await http.get(`/request/${id}`);
      set({
        detailRequest: response.data,
        isLoading: false
      });
    } catch (error) {
      showError({ error, title: 'Lấy thông tin chi tiết thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  confirmOrRejectRequest: async (id: string, data: ConfirmRequestBody) => {
    set({ isLoading: true, error: null });
    try {
      await http.put(`/request/confirm/${id}`, data);
      set({ isLoading: false });
      notification.success({
        message:
          data?.status === RequestStatus.CONFIRMED || data?.status === RequestStatus.INPROGRESS
            ? 'Xác nhận yêu cầu thành công'
            : 'Hủy yêu cầu thành công'
      });
    } catch (error) {
      showError({ error, title: 'Cập nhật trạng thái yêu cầu thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  fetchRequestHistory: async (params: FilterRequest) => {
    set({ isHistoryLoading: true, error: null });
    try {
      const response = await http.get('/request/history', { params });
      set({
        historyRequests: response.data.data,
        historyTotal: response.data.totalItems,
        isHistoryLoading: false
      });
      return {
        data: response.data.data,
        total: response.data.totalItems
      };
    } catch (error) {
      showError({ error, title: 'Lấy yêu cầu hoàn thành thất bại' });
      set({ isHistoryLoading: false });
      return null;
    }
  },

  fetchRequestCompleted: async (params: FilterRequest) => {
    set({ isCompletedLoading: true, error: null });
    try {
      const response = await http.get('/request/completed', {
        params: {
          ...params,
          startDate: dayjs().startOf('day'),
          endDate: dayjs().endOf('day')
        }
      });
      set({
        completedRequests: response.data.data,
        completedTotal: response.data.totalItems,
        isCompletedLoading: false
      });
      return {
        data: response.data.data,
        total: response.data.totalItems
      };
    } catch (error) {
      showError({ error, title: 'Lấy yêu cầu hoàn thành thất bại' });
      set({ isCompletedLoading: false });
      return null;
    }
  },

  fetchRequestInprogress: async (params: FilterRequest) => {
    set({ isInprogressLoading: true, error: null });
    try {
      const { page, limit, ...filterParams } = params;
      const response = await http.get('/request/in-progress', {
        params: {
          ...filterParams,
          startDate: dayjs().startOf('day'),
          endDate: dayjs().endOf('day')
        }
      });
      set({
        inprogressRequests: response.data.data,
        inprogressTotal: response.data.totalItems,
        isInprogressLoading: false
      });
      return {
        data: response.data.data,
        total: response.data.totalItems
      };
    } catch (error) {
      showError({ error, title: 'Lấy lịch sử yêu cầu thất bại' });
      set({ isInprogressLoading: false });
      return null;
    }
  },

  fetchRequestCanceled: async (params: FilterRequest) => {
    set({ isCanceledLoading: true, error: null });
    try {
      const response = await http.get('/request/canceled', {
        params: {
          ...params,
          startDate: dayjs().startOf('day'),
          endDate: dayjs().endOf('day')
        }
      });
      set({
        canceledRequests: response.data.data,
        canceledTotal: response.data.totalItems,
        isCanceledLoading: false
      });
      return {
        data: response.data.data,
        total: response.data.totalItems
      };
    } catch (error) {
      showError({ error, title: 'Lấy lịch sử yêu cầu thất bại' });
      set({ isCanceledLoading: false });
      return null;
    }
  },

  getRequestCounts: async (sessionId: string, params: FilterRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await http.get(`/request/count/${sessionId}`, { params });
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Lấy thông tin yêu cầu thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  fetchPendingRequestCounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const params = {
        startDate: dayjs().startOf('day'),
        endDate: dayjs().endOf('day')
      };
      const response = await http.get('/request/pending-request/count', { params });
      set({
        pendingRequestCounts: response.data,
        isLoading: false
      });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Lấy số lượng yêu cầu chờ thất bại' });
      set({ isLoading: false });
      throw error;
    }
  }
}));

export default useRequestStore;
