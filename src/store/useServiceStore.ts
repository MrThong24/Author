import http from "src/shared/utils/http";
import { create } from "zustand";
import { Params } from "src/types/params.type";
import { showError } from "src/shared/utils/error";
import { Employee } from "src/types/employee.type";
import { Dayjs } from "dayjs";

export interface FilterService extends Params {
  search?: string;
  startDate?: Dayjs | string;
  endDate?: Dayjs | string;
  status?: string;
}
interface ServiceStore {
  service: Employee[];
  total: number;
  isLoading: boolean;
  fetchService: (params?: FilterService) => Promise<void>;
}

const useServiceStore = create<ServiceStore>((set) => ({
  service: [],
  total: 0,
  isLoading: false,

  fetchService: async (params?: FilterService) => {
    set({ isLoading: true });
    try {
      const response = await http.get("/user", { params });
      set({
        service: response.data.data,
        isLoading: false,
        total: response.data.totalItems,
      });
      return response.data;
    } catch (error) {
      showError({ error, title: "Lấy thông tin cơ sở dữ liệu thất bại" });
      set({ isLoading: false });
      throw error;
    }
  },
}));

export default useServiceStore;
