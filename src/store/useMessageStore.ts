import { create } from 'zustand';
import http from 'src/shared/utils/http';

interface Message {
  id: string;
  createdAt: string;
  content: string;
  type: 'CUSTOMER' | 'STORE';
}

interface MessageState {
  messages: Message[];
  modalMessage: boolean;
  fetchMessages: () => Promise<void>;
  openModal: () => void;
  closeModal: () => void;
  addMessage: (message: Message) => void; // Add this function
}

export const useMessageStore = create<MessageState>((set) => ({
  messages: [],
  modalMessage: false,
  
  fetchMessages: async () => {
    try {
      const response = await http.get('public/message');
      set({ messages: response.data || []});
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  },
  addMessage: (message: Message) => set((state) => ({ 
    messages: [...state.messages, message],
  })),
  openModal: () => set({ modalMessage: true }),
  closeModal: () => set({ modalMessage: false }),
}));
