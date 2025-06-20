import http from "src/shared/utils/http";
import { create } from "zustand";
import { Params } from "src/types/params.type";
import { showError } from "src/shared/utils/error";
import { Employee } from "src/types/employee.type";

export interface FilterEmployee extends Params {
  search?: string;
}
interface EmployeeStore {
  groupEmployees: Employee[];
  total: number;
  isLoading: boolean;
  fetchGroupEmployees: (params?: FilterEmployee) => Promise<void>;
}

const useSubsystemStore = create<EmployeeStore>((set) => ({
  groupEmployees: [],
  total: 0,
  isLoading: false,

  fetchGroupEmployees: async (params?: FilterEmployee) => {
    set({ isLoading: true });
    try {
      const response = await http.get("/user", { params });
      set({
        groupEmployees: response.data.data,
        isLoading: false,
        total: response.data.totalItems,
      });
      return response.data;
    } catch (error) {
      showError({ error, title: "Lấy thông tin nhân viên thất bại" });
      set({ isLoading: false });
      throw error;
    }
  },
}));

export default useSubsystemStore;
