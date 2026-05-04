import type { ElementCategory } from '@/types/element';

export const CATEGORY_COLORS: Record<ElementCategory, string> = {
  'alkali-metal':
    'bg-red-100/80 border-red-400/50 text-red-700 hover:border-red-500/70 dark:bg-red-900/50 dark:border-red-600/40 dark:text-red-300 dark:hover:border-red-400/70',
  'alkaline-earth':
    'bg-orange-100/80 border-orange-400/50 text-orange-700 hover:border-orange-500/70 dark:bg-orange-900/50 dark:border-orange-600/40 dark:text-orange-300 dark:hover:border-orange-400/70',
  'transition-metal':
    'bg-blue-100/80 border-blue-400/50 text-blue-700 hover:border-blue-500/70 dark:bg-blue-900/50 dark:border-blue-600/40 dark:text-blue-300 dark:hover:border-blue-400/70',
  'post-transition':
    'bg-cyan-100/80 border-cyan-400/50 text-cyan-700 hover:border-cyan-500/70 dark:bg-cyan-900/50 dark:border-cyan-600/40 dark:text-cyan-300 dark:hover:border-cyan-400/70',
  'metalloid':
    'bg-teal-100/80 border-teal-400/50 text-teal-700 hover:border-teal-500/70 dark:bg-teal-900/50 dark:border-teal-600/40 dark:text-teal-300 dark:hover:border-teal-400/70',
  'non-metal':
    'bg-yellow-100/80 border-yellow-400/50 text-yellow-700 hover:border-yellow-500/70 dark:bg-yellow-900/50 dark:border-yellow-600/40 dark:text-yellow-300 dark:hover:border-yellow-400/70',
  'halogen':
    'bg-lime-100/80 border-lime-400/50 text-lime-700 hover:border-lime-500/70 dark:bg-lime-900/50 dark:border-lime-600/40 dark:text-lime-300 dark:hover:border-lime-400/70',
  'noble-gas':
    'bg-purple-100/80 border-purple-400/50 text-purple-700 hover:border-purple-500/70 dark:bg-purple-900/50 dark:border-purple-600/40 dark:text-purple-300 dark:hover:border-purple-400/70',
  'lanthanide':
    'bg-pink-100/80 border-pink-400/50 text-pink-700 hover:border-pink-500/70 dark:bg-pink-900/50 dark:border-pink-600/40 dark:text-pink-300 dark:hover:border-pink-400/70',
  'actinide':
    'bg-indigo-100/80 border-indigo-400/50 text-indigo-700 hover:border-indigo-500/70 dark:bg-indigo-900/50 dark:border-indigo-600/40 dark:text-indigo-300 dark:hover:border-indigo-400/70',
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
