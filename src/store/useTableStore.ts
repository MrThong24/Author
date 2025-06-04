import { Table, TableToPrint } from 'src/types/table.type';
import http from 'src/shared/utils/http';
import { create } from 'zustand';
import { notification } from 'antd';
import { Params } from 'src/types/params.type';
import { TablePayload } from 'src/validate/tableSchema';
import { showError } from 'src/shared/utils/error';
import { downLoadFileFromBlob } from 'src/shared/utils/utils';

export interface FilterTables extends Params {
  status?: string | string[] | null;
  zoneId?: string | null;
  userIds?: string[] | null;
  zoneInput?: string; // New property for zone search input
}
interface TableStore {
  tables: Table[];
  setTables: (updater: Table[] | ((prev: Table[]) => Table[])) => void;
  total: number;
  tableDetails: Table | null;
  setTableDetails: (table: Table | null) => void;
  isLoading: boolean;
  isGetTableDataToPrintLoading: boolean;
  fetchTables: (params?: FilterTables) => Promise<void>;
  updateTable: (id: string, payload: TablePayload) => Promise<void>;
  createTable: (payload: TablePayload) => Promise<void>;
  getTableDetails: (id: string) => Promise<Table | undefined>;
  deleteTables: (ids: React.Key[]) => Promise<void>;
  exportTableToPrint: (ids: React.Key[], clientUrl: string) => Promise<void>;
  getTableDataToPrint: (ids: React.Key[], clientUrl: string) => Promise<TableToPrint[]>;
}

const useTableStore = create<TableStore>((set) => ({
  tables: [],
  total: 0,
  tableDetails: null,
  isLoading: false,
  isGetTableDataToPrintLoading: false,

  setTables: (updater) =>
    set((state) => ({
      tables: typeof updater === 'function' ? updater(state.tables) : updater
    })),

  setTableDetails: (table: Table | null) => {
    set({ tableDetails: table });
  },

  fetchTables: async (params?: FilterTables) => {
    set({ isLoading: true });
    try {
      const response = await http.get('/table', { params });
      set({ tables: response.data.data, isLoading: false, total: response.data.totalItems });
    } catch (error) {
      showError({ error, title: 'Lấy thông tin bàn thất bại' });
      set({ isLoading: false });
    }
  },

  createTable: async (data: TablePayload) => {
    set({ isLoading: true });
    try {
      const response = await http.post('/table', data);
      await useTableStore.getState().fetchTables();
      set({ isLoading: false });
      notification.success({
        message: 'Tạo mới bàn thành công'
      });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Tạo mới bàn thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  updateTable: async (id: string, data: TablePayload) => {
    set({ isLoading: true });
    try {
      const response = await http.put(`/table/${id}`, data);
      await useTableStore.getState().fetchTables();
      set({ isLoading: false });
      notification.success({
        message: 'Cập nhật bàn thành công'
      });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Cập nhật bàn thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  getTableDetails: async (id: string): Promise<Table | undefined> => {
    set({ isLoading: true });
    try {
      const response = await http.get<Table>(`/table/${id}`);
      set({ tableDetails: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Lấy thông tin bàn thất bại' });
      set({ isLoading: false });
    }
  },

  deleteTables: async (ids: React.Key[]) => {
    set({ isLoading: true });
    try {
      await http.delete<React.Key[]>(`/table`, { data: { ids } });
      await useTableStore.getState().fetchTables();
      set({ isLoading: false, tableDetails: null });
      notification.success({
        message: 'Xóa bàn thành công'
      });
    } catch (error) {
      showError({ error, title: 'Xóa bàn thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  exportTableToPrint: async (ids: React.Key[], clientUrl: string) => {
    set({ isLoading: true });
    try {
      const response = await http.post(
        `/table/export-to-print`,
        { ids, clientUrl },
        {
          responseType: 'blob'
        }
      );
      downLoadFileFromBlob(response.data, 'table-qr-code.xlsx');
      set({ isLoading: false });
      notification.success({
        message: 'Xuất bàn thành công'
      });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Xuất bàn thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },
  getTableDataToPrint: async (ids: React.Key[], clientUrl: string) => {
    set({ isLoading: true });
    try {
      const response = await http.post(`/table/data-to-print`, { ids, clientUrl });
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      showError({ error, title: 'In bàn thất bại' });
      set({ isLoading: false });
      throw error;
    }
  }
}));

export default useTableStore;
