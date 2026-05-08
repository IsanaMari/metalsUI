import type { MetalTokenMapping } from '@/types'

export const METAL_TOKEN_MAP: Record<string, MetalTokenMapping> = {
  Au: {
    symbol: 'Au',
    tokenName: 'PAX Gold',
    tokenSymbol: 'PAXG',
    address: '0x45804880De22913dAFE09f4980848ECE6EcbAf78',
    chainId: 1,
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/9519/small/paxg.PNG',
  },
  U: {
    symbol: 'U',
    tokenName: 'Uranium Token',
    tokenSymbol: 'U3O8',
    address: '0x79052Ab3C166D4899a1e0DD033aC3b379AF0B1fD',
    chainId: 42793,
    decimals: 18,
    logoURI: '',
  },
  Ag: {
    symbol: 'Ag',
    tokenName: 'Kinesis Silver',
    tokenSymbol: 'KAG',
    address: '0x0000000000000000000000000000000000000000',
    chainId: 42161,
    decimals: 18,
    logoURI: '',
  },
  // Extend with more metals as contracts are deployed
}

export const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  137: 'Polygon',
  42161: 'Arbitrum',
  42793: 'Etherlink',
  10: 'Optimism',
}

export const CHAIN_EXPLORERS: Record<number, string> = {
  1: 'https://etherscan.io',
  137: 'https://polygonscan.com',
  42161: 'https://arbiscan.io',
  42793: 'https://explorer.etherlink.com',
  10: 'https://optimistic.etherscan.io',
}

// Default fromToken per chain for price discovery
export const DEFAULT_FROM_TOKEN: Record<
  number,
  { address: `0x${string}`; decimals: number; symbol: string }
> = {
  1: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, symbol: 'USDC' },
  137: { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6, symbol: 'USDC' },
  42161: { address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', decimals: 6, symbol: 'USDC' },
  42793: {
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    decimals: 18,
    symbol: 'XTZ',
  },
}

// Symbols with low DEX liquidity — suggest higher slippage
export const LOW_LIQUIDITY_METALS = new Set(['U'])

export const getSupportedMetalSymbols = (): string[] => Object.keys(METAL_TOKEN_MAP)

export const getMetalToken = (symbol: string): MetalTokenMapping | null =>
  METAL_TOKEN_MAP[symbol] ?? null
