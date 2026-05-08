export type { CartItem, ChemicalElement, ElementCategory, UseConnectReturn } from './element'
export type { TokenHolder, TokenInfo, TokenListItem, TokenTransfer } from './token'

export interface MetalTokenMapping {
  symbol: string
  tokenName: string
  tokenSymbol: string
  address: `0x${string}`
  chainId: number
  decimals: number
  logoURI: string
}

export interface LiFiQuoteResult {
  routeId: string
  fromChainId: number
  toChainId: number
  fromToken: string
  toToken: string
  fromAmount: string
  toAmount: string
  estimatedGas: string
  executionDuration: number
  steps: LiFiStep[]
  feeCosts: LiFiFeeCost[]
}

export interface LiFiStep {
  type: 'swap' | 'cross' | 'protocol'
  tool: string
  fromToken: string
  toToken: string
  fromAmount: string
  toAmount: string
}

export interface LiFiFeeCost {
  name: string
  amount: string
  token: string
  amountUSD: string
}

export type RouteExecutionStatus =
  | 'idle'
  | 'quoting'
  | 'ready'
  | 'approving'
  | 'swapping'
  | 'bridging'
  | 'success'
  | 'error'
  | 'rejected'

export interface TradeState {
  status: RouteExecutionStatus
  quote: LiFiQuoteResult | null
  txHash: string | undefined
  error: string | null
  currentStep: number
  totalSteps: number
}
