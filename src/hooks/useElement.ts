import { ELEMENTS_BY_SYMBOL } from '@/constants/elements';
import type { ChemicalElement } from '@/types/element';

export const useElement = (symbol: string | undefined): ChemicalElement | undefined => {
  if (!symbol) return undefined;
  return ELEMENTS_BY_SYMBOL.get(symbol.toUpperCase());
};
