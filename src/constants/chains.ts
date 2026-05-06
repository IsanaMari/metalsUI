export const SUPPORTED_CHAIN_IDS = [1, 137, 42161, 10] as const

export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number]

export const isSupportedChain = (chainId: number): boolean =>
  (SUPPORTED_CHAIN_IDS as readonly number[]).includes(chainId)
