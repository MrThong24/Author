import http from "src/shared/utils/http";
import { create } from "zustand";
import { Params } from "src/types/params.type";
import { showError } from "src/shared/utils/error";
import { Employee } from "src/types/employee.type";

export interface FilterDatabase extends Params {
  search?: string;
}
interface DatabaseStore {
  database: Employee[];
  total: number;
  isLoading: boolean;
  fetchDatabase: (params?: FilterDatabase) => Promise<void>;
}

const useDatabaseStore = create<DatabaseStore>((set) => ({
  database: [],
  total: 0,
  isLoading: false,

  fetchDatabase: async (params?: FilterDatabase) => {
    set({ isLoading: true });
    try {
      const response = await http.get("/user", { params });
      set({
        database: response.data.data,
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

export default useDatabaseStore;
