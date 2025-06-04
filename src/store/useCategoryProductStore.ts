import http from 'src/shared/utils/http';
import { create } from 'zustand';
import { notification } from 'antd';
import { showError } from 'src/shared/utils/error';
import { ProductCategory } from 'src/types/categoryProduct.type';
import { CategoryPayload } from 'src/validate/categoryProductSchema';

interface ProductCategoryStore {
  categoryProduct: ProductCategory[];
  isLoading: boolean;
  fetchCategoryProduct: () => Promise<void>;
  createCategoryProduct: (payload: CategoryPayload) => Promise<void>;
  deleteCategoryProduct: (ids: Array<string>) => Promise<void>;
  updateCategoryProduct: (id: string, payload: CategoryPayload) => Promise<void>;
}

const useCategoryProductStore = create<ProductCategoryStore>((set) => ({
  categoryProduct: [],
  isLoading: false,

  fetchCategoryProduct: async () => {
    set({ isLoading: true });
    try {
      const response = await http.get('/product-category');
      set({ categoryProduct: response.data, isLoading: false });
    } catch (error) {
    showError({ error, title: 'Lấy thông tin khu vực thất bại' }); set({ isLoading: false });
    }
  },

  createCategoryProduct: async (data: CategoryPayload) => {
    set({ isLoading: true });
    try {
      const response = await http.post('/product-category', data);
      await useCategoryProductStore.getState().fetchCategoryProduct();
      set({ isLoading: false });
      notification.success({
        message: 'Tạo mới danh mục thành công'
      });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Tạo mới danh mục thất bại' });
      set({ isLoading: false });
    }
  },

  deleteCategoryProduct: async (ids: Array<string>) => {
    set({ isLoading: true });
    try {
      const response = await http.delete('/product-category', { data: { ids } });
      await useCategoryProductStore.getState().fetchCategoryProduct();
      set({ isLoading: false });
      notification.success({
        message: 'Xoá danh mục thành công'
      });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Xoá danh mục thất bại' });
      set({ isLoading: false });
    }
  },

  updateCategoryProduct: async (id: string, payload: CategoryPayload) => {
    set({ isLoading: true });
    try {
      const response = await http.put(`/product-category/${id}`, payload);
      await useCategoryProductStore.getState().fetchCategoryProduct();
      set({ isLoading: false });
      notification.success({
        message: 'Chỉnh sửa danh mục thành công'
      });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Chỉnh sửa danh mục thất bại' });
      set({ isLoading: false });
    }
  }
  
}));

export default useCategoryProductStore;
