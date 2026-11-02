import { create } from 'zustand';

interface UIState {
  collapsed: boolean;
  openKeys: string[];
  mobileOpen: boolean;
  toggleCollapsed: () => void;
  toggleOpenKey: (key: string) => void;
  setMobileOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  collapsed: true,
  openKeys: [],
  mobileOpen: false,
  toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
  toggleOpenKey: (key) =>
    set((state) => ({
      openKeys: state.openKeys.includes(key)
        ? state.openKeys.filter((k) => k !== key)
        : [...state.openKeys, key],
    })),
  setMobileOpen: (open) => set({ mobileOpen: open }),
}));