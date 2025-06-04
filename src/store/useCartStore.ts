import i18n from 'src/i18n/locales';
import { RequestType } from 'src/shared/common/enum';
import { showErrorMessage } from 'src/shared/utils/error';
import http from 'src/shared/utils/http';
import { Product } from 'src/types/product.type';
import { RequestBody } from 'src/types/request.type';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CartItem {
  product: Product;
  quantity: number;
}

interface StaffRequest {
  problems: string[];
  description: string;
}

interface CartStore {
  cart: CartItem[];
  cartNote: string;
  staffRequest: StaffRequest;
  isLoading?: boolean;
  isSessionExpired: boolean;
  editCartNote: (note: string) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  editProductNote: (productId: string, note: string) => void;
  setStaffRequestProblems: (problems: string[]) => void;
  setStaffRequestDescription: (description: string) => void;
  resetStaffRequest: () => void;
  clearCart: () => void;
  submitRequest: (type: string) => Promise<void>;
  cancelOrder: (orderId: string | null) => Promise<void>;
  removeOutOfStockProducts: (outOfStockIds: string[]) => void;
  setSessionExpired: (isExpired: boolean) => void;
}

const useCartStore = create(
  persist<CartStore>(
    (set, get) => ({
      cart: [],
      cartNote: '',
      staffRequest: { problems: [], description: '' },
      isSessionExpired: false, //
      addToCart: (product) => {
        const cart = get().cart;
        const existingItem = cart.find((item) => item.product.id === product.id);

        if (existingItem) {
          set({
            cart: cart.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
          });
        } else {
          set({
            cart: [...cart, { product, quantity: 1 }]
          });
        }
      },

      editCartNote: (note) => set({ cartNote: note }),

      removeFromCart: (productId) => {
        set({
          cart: get().cart.filter((item) => item.product.id !== productId)
        });
      },

      increaseQuantity: (productId) => {
        set({
          cart: get().cart.map((item) =>
            item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item
          )
        });
      },

      decreaseQuantity: (productId) => {
        set({
          cart: get()
            .cart.filter((item) => (item.product.id === productId ? item.quantity > 1 : true))
            .map((item) => (item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
        });
      },

      editProductNote: (productId, note) => {
        set({
          cart: get().cart.map((item) =>
            item.product.id === productId ? { ...item, product: { ...item.product, note } } : item
          )
        });
      },

      setStaffRequestProblems: (problems) => {
        set((state) => ({
          staffRequest: { ...state.staffRequest, problems }
        }));
      },

      setStaffRequestDescription: (description) => {
        set((state) => ({
          staffRequest: { ...state.staffRequest, description }
        }));
      },

      resetStaffRequest: () => {
        set({ staffRequest: { problems: [], description: '' } });
      },
      clearCart: () => {
        set({ cart: [], cartNote: '' });
      },
      submitRequest: async (type: string) => {
        set({ isLoading: true });
        const { cart, cartNote, staffRequest } = get();
        const problems =
          type === RequestType.STAFF ? staffRequest.problems.map((problem) => i18n.t(`${problem}`, { lng: 'vi' })) : '';
        const requestBody: RequestBody = {
          type: type,
          problems,
          note: type === RequestType.STAFF ? staffRequest.description : cartNote,
          requestProducts:
            type === RequestType.ORDER
              ? cart.map((item) => ({
                  id: item.product.id,
                  productId: item.product.id,
                  productName: item.product.name,
                  quantity: item.quantity,
                  price: item.product.price,
                  note: item.product.note || null,
                  unit: item.product.unit,
                  //KO NHAN
                  completedQuantity: 0,
                  servedQuantity: 0,
                  status: 'pending',
                  type: 'order'
                }))
              : undefined
        };
        try {
          await http.post('/public/request', requestBody);
          if (type === RequestType.ORDER) {
            set({ cart: [], cartNote: '', isLoading: false });
          } else {
            set({ staffRequest: { problems: [], description: '' }, isLoading: false });
          }
        } catch (error) {
          console.error('Error submitting request:', error);
          if (type === RequestType.PAYMENT) {
            showErrorMessage({ error });
          }
          set({ isLoading: false });
          throw error;
        }
      },
      setSessionExpired: (isExpired) => {
        set({ isSessionExpired: isExpired });
      },
      cancelOrder: async (orderId: string | null) => {
        set({ isLoading: true });
        try {
          await http.put(`/public/request/customer/cancel/${orderId}`);
          set({ isLoading: false });
        } catch (error) {
          console.error('Error canceling order:', error);
          set({ isLoading: false });
          throw error;
        }
      },
      removeOutOfStockProducts: (outOfStockIds: string[]) => {
        set({
          cart: get().cart.filter((item) => !outOfStockIds.includes(item.product.id))
        });
      }
    }),

    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);

export default useCartStore;
