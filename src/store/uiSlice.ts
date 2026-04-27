import { StateCreator } from 'zustand';

export interface UiSlice {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  activeCategory: string;
  setActiveCategory: (category: string) => void;

  productView: 'grid' | 'list';
  setProductView: (view: 'grid' | 'list') => void;

  printReceipt: boolean;
  setPrintReceipt: (val: boolean) => void;
}

export const createUiSlice: StateCreator<any, [], [], UiSlice> = (set) => ({
  isSidebarOpen: false,
  setIsSidebarOpen: (open) => set({ isSidebarOpen: open }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  activeCategory: 'All',
  setActiveCategory: (category) => set({ activeCategory: category }),

  productView: 'grid',
  setProductView: (view) => set({ productView: view }),

  printReceipt: false,
  setPrintReceipt: (val) => set({ printReceipt: val }),
});
