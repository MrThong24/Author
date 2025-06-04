import { create } from 'zustand';

interface LayoutState {
  collapsed: boolean;
  drawerVisible: boolean;
  setCollapsed: (value: boolean) => void;
  toggleCollapsed: () => void;
  initializeCollapsed: () => void;
  setDrawerVisible: (value: boolean) => void;
  toggleDrawer: () => void;
}

const useLayoutStore = create<LayoutState>((set) => ({
  collapsed: false,
  drawerVisible: false,

  setCollapsed: (value: boolean) => {
    set({ collapsed: value });
    sessionStorage.setItem('sidebar_collapsed', value.toString());
  },

  toggleCollapsed: () => {
    set((state) => {
      const newValue = !state.collapsed;
      sessionStorage.setItem('sidebar_collapsed', newValue.toString());
      return { collapsed: newValue };
    });
  },

  setDrawerVisible: (value: boolean) => {
    set({ drawerVisible: value });
  },

  toggleDrawer: () => {
    set((state) => ({ drawerVisible: !state.drawerVisible }));
  },


  initializeCollapsed: () => {
    const stored = sessionStorage.getItem('sidebar_collapsed');
    if (stored !== null) {
      set({ collapsed: stored === 'true' });
    }
  }
}));

export default useLayoutStore;
