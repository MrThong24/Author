import http from "src/shared/utils/http";
import { create } from "zustand";
import { notification } from "antd";
import { Params } from "src/types/params.type";
import { showError } from "src/shared/utils/error";
import { Employee, PosUser } from "src/types/employee.type";
import useAuthStore from "./authStore";
import {
  EmployeePayload,
  EmployeePayloadWithOutPassword,
} from "src/validate/employeeSchema";

export interface FilterEmployee extends Params {
  search?: string;
}
interface EmployeeStore {
  groupEmployees: Employee[];
  total: number;
  isLoading: boolean;
  detailGroupEmployee: Employee | null;
  fetchGroupEmployees: (
    params?: FilterEmployee,
    getOnly?: boolean
  ) => Promise<void>;
  createGroupEmployee: (
    payload: EmployeePayload | EmployeePayloadWithOutPassword
  ) => Promise<void>;
  updateGroupEmployee: (
    id: string,
    payload: EmployeePayload | EmployeePayloadWithOutPassword
  ) => Promise<void>;
  getDetailGroupEmployee: (id: string) => Promise<Employee>;
  deleteGroupEmployees: (ids: React.Key[]) => Promise<void>;
}

const useGroupEmployeeStore = create<EmployeeStore>((set) => ({
  groupEmployees: [],
  unit: [],
  total: 0,
  detailGroupEmployee: null,
  isLoading: false,

  fetchGroupEmployees: async (params?: FilterEmployee) => {
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

  deleteGroupEmployees: async (ids: React.Key[]) => {
    set({ isLoading: true });
    try {
      await http.delete<React.Key[]>(`/user`, { data: { ids } });
      set({ isLoading: false });
      notification.success({
        message: "Xóa nhân viên thành công",
      });
    } catch (error) {
      showError({ error, title: "Xóa nhân viên thất bại" });
      set({ isLoading: false });
      throw error;
    }
  },

  createGroupEmployee: async (
    data: EmployeePayload | EmployeePayloadWithOutPassword
  ) => {
    set({ isLoading: true });
    try {
      const response = await http.post("/user", data);
      set({ isLoading: false, detailGroupEmployee: null });
      notification.success({
        message: "Tạo mới nhân viên thành công",
      });
      return response.data;
    } catch (error) {
      showError({ error, title: "Tạo mới nhân viên thất bại" });
      set({ isLoading: false });
      throw error;
    }
  },

  updateGroupEmployee: async (
    id: string,
    payload: EmployeePayload | EmployeePayloadWithOutPassword
  ) => {
    set({ isLoading: true });
    try {
      const response = await http.put(`/user/${id}`, payload);
      set({ isLoading: false, detailGroupEmployee: null });
      await useAuthStore.getState().getCurrentUser();
      notification.success({
        message: "Chỉnh sửa nhân viên thành công",
      });
      return response.data;
    } catch (error) {
      showError({ error, title: "Chỉnh sửa nhân viên thất bại" });
      set({ isLoading: false });
      throw error;
    }
  },

  getDetailGroupEmployee: async (id: string): Promise<Employee> => {
    set({ isLoading: true });
    try {
      const response = await http.get<Employee>(`/user/${id}`);
      set({ detailGroupEmployee: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      showError({ error, title: "Lấy chi tiết nhân viên thất bại" });
      set({ isLoading: false });
      throw error;
    }
  },
}));

export default useGroupEmployeeStore;
