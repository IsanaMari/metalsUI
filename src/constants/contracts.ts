type ContractAddresses = Record<number, { marketplace: `0x${string}`; token: `0x${string}` }>

// TODO: Replace zero addresses with deployed contract addresses for each network
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const

export const CONTRACT_ADDRESSES: ContractAddresses = {
  1: { marketplace: ZERO_ADDRESS, token: ZERO_ADDRESS }, // TODO: Ethereum Mainnet
  137: { marketplace: ZERO_ADDRESS, token: ZERO_ADDRESS }, // TODO: Polygon
  42161: { marketplace: ZERO_ADDRESS, token: ZERO_ADDRESS }, // TODO: Arbitrum One
  10: { marketplace: ZERO_ADDRESS, token: ZERO_ADDRESS }, // TODO: Optimism
}
