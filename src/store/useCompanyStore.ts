import { notification } from 'antd';
import { RcFile } from 'antd/es/upload';
import { showError } from 'src/shared/utils/error';
import http from 'src/shared/utils/http';
import { uploadFileFn } from 'src/shared/utils/uploadFile';
import { create } from 'zustand';
import { CompanyPayload } from 'src/validate/companySchema';
import { Company } from 'src/types/company.type';

interface CompanyStore {
  isLoading: boolean;
  detailCompany: Company | null;
  updateCompany: (payload: CompanyPayload, avatar: RcFile | string) => Promise<void>;
  getDetailCompany: () => Promise<Company>;
  posConnection: (payload: { posConnectionUrl: string }) => Promise<void>;
}

const useCompanyStore = create<CompanyStore>((set) => ({
  isLoading: false,
  detailCompany: null,

  updateCompany: async (data: CompanyPayload, thumbnail: RcFile | string) => {
    set({ isLoading: true });
    try {
      if (thumbnail && typeof thumbnail !== 'string') {
        const resFile = await uploadFileFn(thumbnail as RcFile);
        thumbnail = resFile.link;
      }
      await http.put(`/company/my`, { ...data, thumbnail });
      await useCompanyStore.getState().getDetailCompany();
      set({ isLoading: false });
      notification.success({
        message: 'Chỉnh sửa thông tin cửa hàng thành công'
      });
    } catch (error) {
      showError({ error, title: 'Chỉnh sửa thông tin cửa hàng thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  getDetailCompany: async (): Promise<Company> => {
    set({ isLoading: true });
    try {
      const response = await http.get<Company>(`/company/my`);
      set({ detailCompany: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Lấy chi tiết công ty thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  posConnection: async (data: { posConnectionUrl: string }) => {
    try {
      await http.post('/company/1pos/auth', data);
      notification.success({
        message: 'Kết nối thành công'
      });
    } catch (error) {
      showError({ error, title: 'Kết nối không thành công' });
      set({ isLoading: false });
      throw error;
    }
  }
}));

export default useCompanyStore;
