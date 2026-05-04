import type { ElementCategory } from '@/types';

export const CATEGORY_COLORS: Record<ElementCategory, string> = {
  'alkali-metal':    'bg-red-900/50 border-red-600/40 text-red-300 hover:border-red-400/70',
  'alkaline-earth':  'bg-orange-900/50 border-orange-600/40 text-orange-300 hover:border-orange-400/70',
  'transition-metal':'bg-blue-900/50 border-blue-600/40 text-blue-300 hover:border-blue-400/70',
  'post-transition': 'bg-cyan-900/50 border-cyan-600/40 text-cyan-300 hover:border-cyan-400/70',
  'metalloid':       'bg-teal-900/50 border-teal-600/40 text-teal-300 hover:border-teal-400/70',
  'non-metal':       'bg-yellow-900/50 border-yellow-600/40 text-yellow-300 hover:border-yellow-400/70',
  'halogen':         'bg-lime-900/50 border-lime-600/40 text-lime-300 hover:border-lime-400/70',
  'noble-gas':       'bg-purple-900/50 border-purple-600/40 text-purple-300 hover:border-purple-400/70',
  'lanthanide':      'bg-pink-900/50 border-pink-600/40 text-pink-300 hover:border-pink-400/70',
  'actinide':        'bg-indigo-900/50 border-indigo-600/40 text-indigo-300 hover:border-indigo-400/70',
};

export const CATEGORY_SWATCH: Record<ElementCategory, string> = {
  'alkali-metal':    '#7f1d1d',
  'alkaline-earth':  '#7c2d12',
  'transition-metal':'#1e3a5f',
  'post-transition': '#164e4e',
  'metalloid':       '#0d3d3d',
  'non-metal':       '#713f12',
  'halogen':         '#1a3a0a',
  'noble-gas':       '#4a1d96',
  'lanthanide':      '#831843',
  'actinide':        '#1e1b4b',
};

export const CATEGORY_LABELS: Record<ElementCategory, string> = {
  'alkali-metal':    'Alkali Metal',
  'alkaline-earth':  'Alkaline Earth Metal',
  'transition-metal':'Transition Metal',
  'post-transition': 'Post-Transition Metal',
  'metalloid':       'Metalloid',
  'non-metal':       'Non-Metal',
  'halogen':         'Halogen',
  'noble-gas':       'Noble Gas',
  'lanthanide':      'Lanthanide',
  'actinide':        'Actinide',
};

export const ROUTES = {
  TABLE: '/',
  ELEMENT_DETAIL: '/element/:symbol',
  elementDetail: (symbol: string) => `/element/${symbol}`,
} as const;

export const MOCK_WALLET_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e2e5c62A6';

export const MIN_QUANTITY = '0.001';
export const MAX_QUANTITY = '1000';
export const QUANTITY_STEP = '0.001';
