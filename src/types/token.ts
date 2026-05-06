export interface TokenInfo {
  address: string
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  holders: number
  priceUsd: number | null
  volume24h: number | null
  marketCap: number | null
}

export interface TokenTransfer {
  txHash: string
  from: string
  to: string
  amount: string
  timestamp: string
}

export interface TokenHolder {
  address: string
  amount: string
  percentage: number
  rank: number
}

export interface TokenListItem {
  address: string
  symbol: string
  name: string
  decimals: number
  totalSupply: string
}
