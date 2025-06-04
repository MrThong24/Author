import { notification } from "antd";
import {
  clearLS,
  URL_CHANGE_PASSWORD,
  URL_CHOOSE_KITCHEN,
  URL_CHOOSE_STORE,
  URL_CURRENT_USER,
  URL_LOGIN,
} from "src/shared/utils/auth";
import { showError } from "src/shared/utils/error";
import http from "src/shared/utils/http";
import {
  ChooseStorePayLoad,
  ChooseStoreResponse,
  LoginPayLoad,
  LoginResponse,
} from "src/types/auth.type";
import { User } from "src/types/user.type";

import { create } from "zustand";
import useStoreStore from "./useStoreStore";
import useRequestStore from "./useRequestStore";
import useRequestProductStore from "./useRequestProductStore";
import {
  ChangePasswordPayload,
  ChangePasswordPayloadWithOutConfirmNewPassword,
} from "src/validate/changePasswordSchema";

interface AuthStore {
  currentUser: User | null;
  isLoading: boolean;
  login: (payload: LoginPayLoad) => Promise<LoginResponse | undefined>;
  chooseStore: (
    payload: ChooseStorePayLoad
  ) => Promise<ChooseStoreResponse | undefined>;
  getCurrentUser: () => Promise<User | undefined>;
  changePassword: (
    payload:
      | ChangePasswordPayload
      | ChangePasswordPayloadWithOutConfirmNewPassword
  ) => Promise<void>;
  chooseKitchen: (data: any) => Promise<void>;
}

export type ChooseKitchenPayload = {
  kitchenId: string;
};

const useAuthStore = create<AuthStore>((set) => ({
  currentUser: null,
  isLoading: false,

  login: async (data: LoginPayLoad): Promise<LoginResponse | undefined> => {
    set({ isLoading: true });
    try {
      const response = await http.post<LoginResponse>(URL_LOGIN, data);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      showError({ error, title: "Đăng nhập thất bại" });
      set({ isLoading: false });
      throw error;
    }
  },

  chooseStore: async (
    data: ChooseStorePayLoad
  ): Promise<ChooseStoreResponse | undefined> => {
    set({ isLoading: true });
    try {
      const response = await http.post(URL_CHOOSE_STORE, data);
      useStoreStore.getState().setEInvoiceConfig(null);
      useRequestStore.getState().setRequestCounts({});
      await useRequestStore.getState().fetchPendingRequestCounts();
      await useRequestProductStore.getState().fetchRequestProductCounts();
      set({ currentUser: response.data, isLoading: false });
      useRequestStore.getState().setRequestCounts({});
      await useRequestStore.getState().fetchPendingRequestCounts();
      await useRequestProductStore.getState().fetchRequestProductCounts();
      // Reset request counts after choosing store
      return response.data;
    } catch (error) {
      showError({ error, title: "Đăng nhập thất bại" });
      set({ isLoading: false });
      throw error;
    }
  },

  getCurrentUser: async (): Promise<User | undefined> => {
    set({ isLoading: true });
    try {
      const response = await http.get(URL_CURRENT_USER);
      set({ currentUser: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      showError({
        error,
        title: "Lỗi xác thực",
        message: "Không có quyền truy cập!",
      });
      set({ isLoading: false });
      clearLS();
    }
  },

  changePassword: async (
    data: ChooseStorePayLoad | ChangePasswordPayloadWithOutConfirmNewPassword
  ) => {
    set({ isLoading: true });
    try {
      const response = await http.post(URL_CHANGE_PASSWORD, data);
      notification.success({
        message: "Đổi mật khẩu thành công",
      });
      set({ isLoading: false });
      clearLS();
      window.location.reload();
      return response.data;
    } catch (error) {
      showError({ error, title: "Đổi mật khẩu thất bại" });
      set({ isLoading: false });
      throw error;
    }
  },

  chooseKitchen: async (data: ChooseKitchenPayload) => {
    set({ isLoading: true });
    try {
      const response = await http.post(URL_CHOOSE_KITCHEN, data);
      set({ isLoading: false });
      await useAuthStore.getState().getCurrentUser();
      return response.data;
    } catch (error) {
      showError({ error, title: "Chọn bếp thất bại" });
      set({ isLoading: false });
      throw error;
    }
  },
}));

export default useAuthStore;
