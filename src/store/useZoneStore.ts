import { Zone } from 'src/types/table.type';
import http from 'src/shared/utils/http';
import { create } from 'zustand';
import { notification } from 'antd';
import { Params } from 'src/types/params.type';
import { ZonePayload } from 'src/validate/zoneSchema';
import { showError } from 'src/shared/utils/error';

export interface FilterZones extends Params {
  status?: string | string[];
}
interface ZoneStore {
  zones: Zone[];
  isLoading: boolean;
  fetchZones: (params?: FilterZones) => Promise<void>;
  updateZone: (id: string, payload: ZonePayload) => Promise<void>;
  createZone: (payload: ZonePayload) => Promise<void>;
  deleteZones: (ids: Array<string>) => Promise<void>;
}

const useZoneStore = create<ZoneStore>((set) => ({
  zones: [],
  isLoading: false,

  fetchZones: async (params?: FilterZones) => {
    set({ isLoading: true });
    try {
      const response = await http.get('/zone', { params });
      set({ zones: response.data, isLoading: false });
    } catch (error) {
      showError({ error, title: 'Lấy thông tin khu vực thất bại' });
      set({ isLoading: false });
    }
  },

  createZone: async (data: ZonePayload) => {
    set({ isLoading: true });
    try {
      const response = await http.post('/zone', data);
      await useZoneStore.getState().fetchZones();
      set({ isLoading: false });
      notification.success({
        message: 'Tạo mới khu vực thành công'
      });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Tạo mới khu vực thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  updateZone: async (id: string, data: ZonePayload) => {
    set({ isLoading: true });
    try {
      const response = await http.put(`/zone/${id}`, data);
      await useZoneStore.getState().fetchZones();
      set({ isLoading: false });
      notification.success({
        message: 'Cập nhật khu vực thành công'
      });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Cập nhật khu vực thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  deleteZones: async (ids: Array<string>) => {
    set({ isLoading: true });
    try {
      await http.delete<Array<string>>(`/zone`, { data: { ids } });
      await useZoneStore.getState().fetchZones();
      set({ isLoading: false });
      notification.success({
        message: 'Xóa khu vực thành công'
      });
    } catch (error) {
      showError({ error, title: 'Xóa khu vực thất bại' });
      set({ isLoading: false });
      throw error;
    }
  }
}));

export default useZoneStore;
