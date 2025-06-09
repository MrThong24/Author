import http from "src/shared/utils/http";
import { create } from "zustand";
import { Params } from "src/types/params.type";
import { showError } from "src/shared/utils/error";
import { Employee } from "src/types/employee.type";

export interface FilterCategory extends Params {
  search?: string;
}
interface CategoryStore {
  category: Employee[];
  total: number;
  isLoading: boolean;
  fetchCategory: (params?: FilterCategory) => Promise<void>;
}

const useCategoryStore = create<CategoryStore>((set) => ({
  category: [],
  total: 0,
  isLoading: false,

  fetchCategory: async (params?: FilterCategory) => {
    set({ isLoading: true });
    try {
      const response = await http.get("/user", { params });
      set({
        category: response.data.data,
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

export default useCategoryStore;
