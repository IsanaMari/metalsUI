import { defineChain } from 'viem'

export const etherlink = defineChain({
  id: 42793,
  name: 'Etherlink',
  nativeCurrency: { name: 'Tez', symbol: 'XTZ', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://node.mainnet.etherlink.com'] },
  },
  blockExplorers: {
    default: { name: 'Etherlink Explorer', url: 'https://explorer.etherlink.com' },
  },
})

export const SUPPORTED_CHAIN_IDS = [42793, 1, 137, 42161, 10] as const

export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number]

export const isSupportedChain = (chainId: number): boolean =>
  (SUPPORTED_CHAIN_IDS as readonly number[]).includes(chainId)
