import http from "src/shared/utils/http";
import { create } from "zustand";
import { Params } from "src/types/params.type";
import { showError } from "src/shared/utils/error";
import { Employee } from "src/types/employee.type";
import { Dayjs } from "dayjs";

export interface FilterGroupEmployee extends Params {
  search?: string;
  startDate?: Dayjs | string;
  endDate?: Dayjs | string;
}
interface GroupEmployeeStore {
  groupEmployees: Employee[];
  total: number;
  isLoading: boolean;
  detailGroupEmployee: Employee | null;
  fetchGroupEmployees: (
    params?: FilterGroupEmployee,
    getOnly?: boolean
  ) => Promise<void>;
}

const useGroupEmployeeStore = create<GroupEmployeeStore>((set) => ({
  groupEmployees: [],
  unit: [],
  total: 0,
  detailGroupEmployee: null,
  isLoading: false,

  fetchGroupEmployees: async (params?: FilterGroupEmployee) => {
    set({ isLoading: true });
    try {
      const response = await http.get("/user", { params });
      set({
        groupEmployees: response.data.data,
        isLoading: false,
        total: response.data.totalItems,
        detailGroupEmployee: null,
      });
      return response.data;
    } catch (error) {
      showError({ error, title: "Lấy thông tin nhân viên thất bại" });
      set({ isLoading: false });
      throw error;
    }
  },
}));

export default useGroupEmployeeStore;
