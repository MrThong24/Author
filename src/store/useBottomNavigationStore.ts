import { create } from 'zustand';

interface BottomNavigationState {
  isHidden: boolean;
  hideNavigation: () => void;
  showNavigation: () => void;
  toggleNavigation: () => void;
}

const useBottomNavigationStore = create<BottomNavigationState>((set) => ({
  isHidden: false, 
  hideNavigation: () => set({ isHidden: true }),
  showNavigation: () => set({ isHidden: false }),
  toggleNavigation: () => set((state) => ({ isHidden: !state.isHidden })),
}));

export default useBottomNavigationStore;
