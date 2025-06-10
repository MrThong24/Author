import http from "src/shared/utils/http";
import { create } from "zustand";
import { Params } from "src/types/params.type";
import { showError } from "src/shared/utils/error";
import { Employee } from "src/types/employee.type";

export interface FilterCustomer extends Params {
  search?: string;
}
interface CustomerStore {
  customer: Employee[];
  total: number;
  isLoading: boolean;
  fetchCustomer: (params?: FilterCustomer) => Promise<void>;
}

const useCustomerStore = create<CustomerStore>((set) => ({
  customer: [],
  total: 0,
  isLoading: false,

  fetchCustomer: async (params?: FilterCustomer) => {
    set({ isLoading: true });
    try {
      const response = await http.get("/user", { params });
      set({
        customer: response.data.data,
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

export default useCustomerStore;
