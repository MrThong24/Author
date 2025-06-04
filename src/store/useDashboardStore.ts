import { showError } from 'src/shared/utils/error';
import http from 'src/shared/utils/http';
import { create } from 'zustand';
import { Params } from 'src/types/params.type';
import { Dayjs } from 'dayjs';
import { DashboardData, DashboardRevenueTrackingData } from 'src/types/dashboard.type';

export interface DashboardRequest extends Params {
  startDate?: Dayjs | string;
  endDate?: Dayjs | string;
}

interface DashboardInfo {
  isLoading: boolean;
  dashboard: DashboardData | null;
  dashboardRevenueTracking: DashboardRevenueTrackingData| null;
  getDashboardInfo: (params: DashboardRequest) => Promise<void>;
  getDashboardRevenueTracking: (params: DashboardRequest) => Promise<void>;
}

const useDashboardStore = create<DashboardInfo>((set) => ({
  isLoading: false,
  dashboard: null,
  dashboardRevenueTracking:null,

  getDashboardInfo: async (params: DashboardRequest) => {
    set({ isLoading: true });
    try {
      const response = await http.get('/dashboard', { params });
      set({ dashboard: response.data, isLoading: false });
    } catch (error) {
      showError({ error, title: 'Lấy thông tin thất bại' });
      set({ isLoading: false });
    }
  },
  getDashboardRevenueTracking: async (params: DashboardRequest) => {
    set({ isLoading: true });
    try {
      const response = await http.get('/dashboard/revenue', { params });
      set({ dashboardRevenueTracking: response.data, isLoading: false });
    } catch (error) {
      showError({ error, title: 'Lấy thông tin thất bại' });
      set({ isLoading: false });
    }
  }
}));

export default useDashboardStore;
