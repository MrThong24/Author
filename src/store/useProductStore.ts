import http from 'src/shared/utils/http';
import { Product, ProductPublic, Unit } from 'src/types/product.type';
import { create } from 'zustand';
import { notification } from 'antd';
import { uploadFileFn } from 'src/shared/utils/uploadFile';
import { RcFile } from 'antd/es/upload';
import { Params } from 'src/types/params.type';
import { ProductPayload } from 'src/validate/productSchema';
import { showError, showErrorMessage } from 'src/shared/utils/error';
import { downLoadFileFromBlob } from 'src/shared/utils/utils';

export interface FilterProduct extends Params {
  productCategoryId?: string;
  minPrice?: number;
  createdAt?: string;
  status?: string | string[];
}
export interface EditStatusProduct extends Params {
  status: string;
}
export interface EditStatusActiveProduct extends Params {
  active: string;
}
interface ProductStore {
  productsPublic: [];
  products: Product[];
  unit: Unit[];
  total: number;
  detailProduct: Product | null;
  isLoading: boolean;
  isImportLoading: boolean;
  setProducts: (products: Array<Product> | undefined) => void;
  getUnits: () => Promise<void>;
  fetchProducts: (params: FilterProduct, getOnly?: boolean) => Promise<void>;
  fetchProductsPublic: () => Promise<void>;
  updateProduct: (id: string, payload: ProductPayload, thumbnail: RcFile | string) => Promise<void>;
  updateStatusProduct: (id: string, payload: EditStatusProduct) => Promise<void>;
  updateProductVisibility: ({ ids, isActive }: { ids: React.Key[]; isActive: boolean }) => Promise<void>;
  deleteProducts: (ids: React.Key[]) => Promise<void>;
  createProduct: (payload: ProductPayload, thumbnail: RcFile) => Promise<void>;
  getDetailProduct: (id: string) => Promise<Product | undefined>;
  exportProductTemplate: (data: { isUpdate: boolean }, isWebview?: boolean) => Promise<void>;
  importProduct: (file: File, isUpdate: boolean) => Promise<void>;
  syncProductPos: () => Promise<void>;
}

const sendXlsxToRNWebView = (xlsxBlob: Blob, filename: string = 'example.xlsx'): void => {
  // Chuyển blob thành base64
  const reader = new FileReader();
  reader.readAsDataURL(xlsxBlob);
  reader.onload = () => {
    const base64Data: string = reader.result as string;

    const message: { type: string; payload: { url: string; filename: string; mimeType: string } } = {
      type: 'DOWNLOAD_XLSX',
      payload: {
        url: base64Data,
        filename,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    };
    // Gửi qua window.ReactNativeWebView.postMessage
    window.ReactNativeWebView?.postMessage(JSON.stringify(message));
  };
  reader.onerror = (error) => {
    console.error('Error:', error);
  };
};

const useProductStore = create<ProductStore>((set) => ({
  productsPublic: [],
  products: [],
  unit: [],
  total: 0,
  detailProduct: null,
  isLoading: false,
  isImportLoading: false,

  setProducts: (product: Array<Product> | undefined) => {
    set({ products: product });
  },

  fetchProductsPublic: async () => {
    set({ isLoading: true });
    try {
      const response = await http.get('/public/product');
      set({ productsPublic: response.data, isLoading: false });
    } catch (error) {
      showErrorMessage({ error });
    }
  },

  fetchProducts: async (params: FilterProduct, getOnly?: boolean) => {
    if (!getOnly) {
      set({ isLoading: true });
    }
    try {
      const response = await http.get('/product', { params });
      if (!getOnly) {
        set({ products: response.data.data, isLoading: false, total: response.data.totalItems, detailProduct: null });
      }
      return response.data;
    } catch (error) {
      showError({ error, title: 'Lấy thông tin sản phẩm thất bại' });
      set({ isLoading: false });
    }
  },

  createProduct: async (data: ProductPayload, thumbnail: RcFile) => {
    set({ isLoading: true });
    try {
      const resFile = await uploadFileFn(thumbnail as RcFile);
      const response = await http.post('/product', { ...data, thumbnail: resFile.link });
      set({ isLoading: false, detailProduct: null });
      notification.success({
        message: 'Tạo mới sản phẩm thành công'
      });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Tạo mới sản phẩm thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  updateProduct: async (id: string, data: ProductPayload, thumbnail: RcFile | string) => {
    set({ isLoading: true });
    try {
      let resFile;
      if (thumbnail && typeof thumbnail !== 'string') {
        resFile = await uploadFileFn(thumbnail as RcFile);
        thumbnail = resFile.link;
      }
      const response = await http.put(`/product/${id}`, { ...data, thumbnail });
      set({ isLoading: false, detailProduct: null });
      notification.success({
        message: 'Cập nhật sản phẩm thành công'
      });

      return response.data;
    } catch (error) {
      showError({ error, title: 'Cập nhật sản phẩm thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  updateStatusProduct: async (id: string, data: EditStatusProduct) => {
    set({ isLoading: true });
    try {
      // Pass `data` directly without wrapping it inside an object
      const response = await http.put(`/product/status/${id}`, data);
      set({ isLoading: false, detailProduct: null });
      notification.success({
        message: 'Cập nhật trạng thái sản phẩm thành công'
      });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Cập nhật trạng thái sản phẩm thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },
  updateProductVisibility: async ({ ids, isActive }: { ids: React.Key[]; isActive: boolean }) => {
    set({ isLoading: true });
    try {
      // Pass `data` directly without wrapping it inside an object
      const response = await http.put(`/product/visibility`, { ids, isActive });
      set({ isLoading: false, detailProduct: null });
      notification.success({
        message: 'Cập nhật trạng thái sản phẩm thành công'
      });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Cập nhật trạng thái sản phẩm thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  getDetailProduct: async (id: string): Promise<Product | undefined> => {
    set({ isLoading: true });
    try {
      const response = await http.get<Product>(`/product/${id}`);
      set({ detailProduct: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Lấy chi tiết thông tin sản phẩm thất bại' });
      set({ isLoading: false });
    }
  },

  deleteProducts: async (ids: React.Key[]) => {
    set({ isLoading: true });
    try {
      await http.delete<React.Key[]>(`/product`, { data: { ids } });
      set({ isLoading: false });
      notification.success({
        message: 'Xóa sản phẩm thành công'
      });
    } catch (error) {
      showError({ error, title: 'Xóa sản phẩm thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  getUnits: async () => {
    set({ isLoading: true });
    try {
      const response = await http.get('/unit');
      set({ unit: response.data, isLoading: false });
    } catch (error) {
      showError({ error, title: 'Lấy thông tin thất bại' });
      set({ isLoading: false });
    }
  },

  exportProductTemplate: async (data: { isUpdate: boolean }, isWebview?: boolean) => {
    set({ isLoading: true });
    const { isUpdate } = data;

    try {
      const response = await http.post(`/product/export-template`, data, {
        responseType: 'blob'
      });
      if (isWebview) {
        sendXlsxToRNWebView(response.data, `bieu-mau-danh-sach-mon.xlsx`);
        return;
      } else {
        downLoadFileFromBlob(response.data, `bieu-mau-danh-sach-mon.xlsx`);
      }
      notification.success({
        message: 'Xuất template import sản phẩm thành công'
      });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Xuất template import sản phẩm thất bại' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  importProduct: async (file: File, isUpdate: boolean) => {
    set({ isImportLoading: true });
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (isUpdate) formData.append('isUpdate', String(isUpdate));
      const response = await http.post(`/product/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      set({ isImportLoading: false });
      notification.success({
        message: 'Import sản phẩm thành công'
      });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Import sản phẩm thất bại' });
      set({ isImportLoading: false });
      throw error;
    }
  },

  syncProductPos: async () => {
    set({ isLoading: true });
    try {
      const response = await http.post('/product/sync-product-1pos');
      set({ isLoading: false });
      notification.success({
        message: 'Đồng bộ thành công, vui lòng chờ trong giây lát'
      });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Đồng bộ thất bại' });
      set({ isLoading: false });
    }
  }
}));

export default useProductStore;
