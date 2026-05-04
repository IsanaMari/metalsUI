export type ElementCategory =
  | 'alkali-metal'
  | 'alkaline-earth'
  | 'transition-metal'
  | 'post-transition'
  | 'metalloid'
  | 'non-metal'
  | 'halogen'
  | 'noble-gas'
  | 'lanthanide'
  | 'actinide';

export interface ChemicalElement {
  atomicNumber: number;
  symbol: string;
  name: string;
  atomicMass: string; // string to avoid floating-point errors
  pricePerGram: number; // 0 means not yet tokenized/listed
  category: ElementCategory;
  description: string;
  period: number;
  group: number; // 0 for f-block elements (lanthanides/actinides in bottom rows)
}

export interface CartItem {
  element: ChemicalElement;
  quantity: string;
}

export interface UseConnectReturn {
  isConnected: boolean;
  address: string | null;
  connect: () => void;
  disconnect: () => void;
}
