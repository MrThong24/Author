import http from "src/shared/utils/http";
import { create } from "zustand";
import { Params } from "src/types/params.type";
import { showError } from "src/shared/utils/error";
import { Employee } from "src/types/employee.type";

export interface FilterContract extends Params {
  search?: string;
}
interface ContractStore {
  contract: Employee[];
  total: number;
  isLoading: boolean;
  fetchContract: (params?: FilterContract) => Promise<void>;
}

const useContractStore = create<ContractStore>((set) => ({
  contract: [],
  total: 0,
  isLoading: false,

  fetchContract: async (params?: FilterContract) => {
    set({ isLoading: true });
    try {
      const response = await http.get("/user", { params });
      set({
        contract: response.data.data,
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

export default useContractStore;
