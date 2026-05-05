import { create } from 'zustand'

import type { ElementCategory } from '@/types/element'

interface FilterState {
  searchQuery: string
  selectedCategory: ElementCategory | null
}

interface FilterActions {
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: ElementCategory | null) => void
  clearFilters: () => void
}

type AppStore = FilterState & FilterActions

export const useStore = create<AppStore>((set) => ({
  searchQuery: '',
  selectedCategory: null,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  clearFilters: () => set({ searchQuery: '', selectedCategory: null }),
}))
