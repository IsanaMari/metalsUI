import { create } from 'zustand'

import { CATEGORY_COLORS } from '@/constants/config'
import type { ElementCategory } from '@/types/element'

export type ActiveCategories = Record<string, boolean>

const ALL_ACTIVE: ActiveCategories = Object.fromEntries(
  Object.keys(CATEGORY_COLORS).map((cat) => [cat, true])
)

interface FilterState {
  searchQuery: string
  selectedCategory: ElementCategory | null
  activeCategories: ActiveCategories
}

interface FilterActions {
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: ElementCategory | null) => void
  clearFilters: () => void
  toggleCategory: (category: string) => void
}

type AppStore = FilterState & FilterActions

export const useStore = create<AppStore>((set) => ({
  searchQuery: '',
  selectedCategory: null,
  activeCategories: ALL_ACTIVE,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  clearFilters: () => set({ searchQuery: '', selectedCategory: null }),
  toggleCategory: (category) =>
    set((state) => ({
      activeCategories: {
        ...state.activeCategories,
        [category]: !state.activeCategories[category],
      },
    })),
}))
