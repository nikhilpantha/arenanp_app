import { create } from 'zustand';

interface UiState {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  clearSearch: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  clearSearch: () => set({ searchQuery: '' }),
}));
