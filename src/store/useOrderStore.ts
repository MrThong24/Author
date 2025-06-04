import http from 'src/shared/utils/http';
import { create } from 'zustand';
import { Params } from 'src/types/params.type';
import { showError } from 'src/shared/utils/error';
import {
  CreateOrderPayload,
  Order,
  OrderEInvoice,
  PayOrderPayload,
  QrCodePaymentPayload,
  UpdateOrderPayload,
  UpdateSaleDisCountOrderPayload
} from 'src/types/order.type';
import { notification } from 'antd';
import { Dayjs } from 'dayjs';
import { EInvoiceOrderPayload } from 'src/validate/orderSchema';

export interface FilterOrder extends Params {
  search?: string;
  status?: string;
  zoneId?: string;
  tableId?: string;
  startDate?: Dayjs | string;
  endDate?: Dayjs | string;
  isHasRemainingRequest?: boolean;
}
interface OrderStore {
  orders: Order[];
  detailOrder: Order | null;
  orderEInvoice: OrderEInvoice | null;
  qrCode: string | null;
  total: number;
  isLoading: boolean;
  isLoadingOrderEInvoicePdf: boolean;
  loadingCreateOrder: boolean;
  idRequest: string | null;
  setDetailOrder: (order: Order | null) => void;
  setIdRequest: (id: string) => Promise<void>;
  createOrder: (data: CreateOrderPayload, fromTable?: boolean) => Promise<Order>;
  updateOrder: (id: string, data: UpdateOrderPayload) => Promise<Order>;
  updateSaleDiscountOrder: (id: string, data: UpdateSaleDisCountOrderPayload) => Promise<Order>;
  payOrder: (orderId: string | undefined, data: PayOrderPayload) => Promise<Order>;
  fetchOrders: (params: FilterOrder, getOnly?: boolean) => Promise<void>;
  getDetailOrder: (id: string | undefined) => Promise<Order>;
  deleteOrder: (id: string | undefined) => Promise<void>;
  generateQRCodePayment: (id: string, data: QrCodePaymentPayload) => Promise<string>;
  checkRemainingOrderRequest: (id: string | undefined) => Promise<boolean>;
  createOrderEInvoice: (id: string, data: EInvoiceOrderPayload) => Promise<OrderEInvoice>;
  deleteOrderEInvoice: (id: string) => Promise<void>;
  getOrderEInvoicePdf: (id: string) => Promise<string>;
  previewOrderEInvoice: (id: string, data: EInvoiceOrderPayload) => Promise<string>;
}

const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  total: 0,
  detailOrder: null,
  orderEInvoice: null,
  qrCode: null,
  isLoading: false,
  loadingCreateOrder: false,
  isLoadingOrderEInvoicePdf: false,
  idRequest: '',
  setDetailOrder: (order: Order | null) => {
    set({ detailOrder: order });
  },
  setIdRequest: async (id: string) => {
    set({ idRequest: id });
  },

  createOrder: async (data: CreateOrderPayload, fromTable) => {
    set({ loadingCreateOrder: true });
    try {
      const response = await http.post(`/order?from-table=${fromTable}`, data);
      set({ loadingCreateOrder: false, detailOrder: null });
      notification.success({
        message: response?.data?.id
          ? 'Tạo mới đơn hàng thành công'
          : fromTable
            ? 'Đóng phiên thành công'
            : 'Hủy yêu cầu thanh toán thành công'
      });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Tạo mới đơn hàng thất bại' });
      set({ loadingCreateOrder: false });
      throw error;
    }
  },

  updateOrder: async (id: string, data: UpdateOrderPayload) => {
    set({ isLoading: true });
    try {
      const response = await http.put(`/order/${id}`, data);
      set({ isLoading: false, detailOrder: null });
      notification.success({
        message: 'Cập nhật đơn hàng thành công'
      });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Cập nhật đơn hàng thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  updateSaleDiscountOrder: async (id: string, data: UpdateSaleDisCountOrderPayload) => {
    try {
      const response = await http.put(`/order/discount/${id}`, data);
      return response.data;
    } catch (error) {
      showError({ error, title: 'Cập nhật giảm trừ hóa đơn bán hàng đơn hàng thất bại' });
      throw error;
    }
  },

  payOrder: async (orderId: string | undefined, data: PayOrderPayload) => {
    set({ isLoading: true });
    try {
      const response = await http.put(`/order/payment/${orderId}`, data);
      set({ isLoading: false, detailOrder: null });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Thanh toán đơn hàng thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  fetchOrders: async (params: FilterOrder, getOnly?: boolean) => {
    if (!getOnly) {
      set({ isLoading: true });
    }
    try {
      const response = await http.get('/order', { params });
      if (!getOnly) {
        set({
          orders: response.data.data,
          isLoading: false,
          total: response.data.totalItems,
          detailOrder: null
        });
      }
      return response.data;
    } catch (error) {
      showError({ error, title: 'Lấy thông tin đơn hàng thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  getDetailOrder: async (id: string | undefined): Promise<Order> => {
    set({ isLoading: true });
    try {
      const response = await http.get<Order>(`/order/${id}`);
      set({ detailOrder: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Lấy chi tiết đơn hàng thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  checkRemainingOrderRequest: async (id: string | undefined): Promise<boolean> => {
    try {
      const response = await http.get<boolean>(`/order/check-remaining-request/${id}`);
      return response.data;
    } catch (error) {
      showError({ error, title: 'Kiểm tra đơn hàng thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  generateQRCodePayment: async (id: string, data: QrCodePaymentPayload): Promise<string> => {
    set({ isLoading: true });
    try {
      const response = await http.post(`/qr-code-payment/${id}`, data);
      set({ qrCode: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Lấy mã QR thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  deleteOrder: async (id: string | undefined): Promise<void> => {
    set({ isLoading: true });
    try {
      await http.delete<Order>(`/order/${id}`);
      set({ detailOrder: null, isLoading: false });
      notification.success({
        message: 'Xóa đơn hàng thành công'
      });
    } catch (error) {
      showError({ error, title: 'Xóa đơn hàng thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  createOrderEInvoice: async (id: string, data: EInvoiceOrderPayload): Promise<OrderEInvoice> => {
    set({ isLoading: true });
    try {
      const response = await http.post(`/order-e-invoice/${id}`, data);
      set({ isLoading: false });
      notification.success({
        message: 'Tạo hóa đơn điện tử thành công'
      });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Tạo hóa đơn điện tử thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  deleteOrderEInvoice: async (id: string): Promise<void> => {
    set({ isLoading: true });
    try {
      await http.delete<OrderEInvoice>(`/order-e-invoice/${id}`);
      notification.success({
        message: 'Xóa hóa đơn điện tử thành công'
      });
      await useOrderStore.getState().getDetailOrder(id);
      set({ isLoading: false });
    } catch (error) {
      showError({ error, title: 'Xóa hóa đơn điện tử thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },

  getOrderEInvoicePdf: async (id: string): Promise<any> => {
    set({ isLoadingOrderEInvoicePdf: true });
    try {
      const response = await http.get(`/order-e-invoice/view/${id}`);
      const byteCharacters = atob(response.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      set({ isLoadingOrderEInvoicePdf: false });
      return url;
    } catch (error) {
      showError({ error, title: 'Lấy hóa đơn điện tử thất bại' });
      set({ isLoadingOrderEInvoicePdf: false });
      throw error;
    }
  },

  previewOrderEInvoice: async (id: string, data: EInvoiceOrderPayload): Promise<string> => {
    set({ isLoadingOrderEInvoicePdf: true });
    try {
      const response = await http.post(`/order-e-invoice/preview/${id}`, data);
      const byteCharacters = atob(response.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      set({ isLoadingOrderEInvoicePdf: false });
      return url;
    } catch (error) {
      showError({ error, title: 'Xem hóa đơn điện tử thất bại' });
      set({ isLoadingOrderEInvoicePdf: false });
      throw error;
    }
  }
}));

export default useOrderStore;
