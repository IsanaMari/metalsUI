import { useCallback, useEffect, useState } from 'react'

import type { LiFiStep as SDKLiFiStep } from '@lifi/types'
import { useAccount } from 'wagmi'

import { DEFAULT_FROM_TOKEN, getMetalToken } from '@/constants/metalTokens'
import { getQuote } from '@/services/lifi'
import type { LiFiQuoteResult } from '@/types'

const NATIVE_SENTINEL = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

interface UseMetalPriceReturn {
  quote: LiFiQuoteResult | null
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

const mapStepToQuote = (
  step: SDKLiFiStep & { estimate: NonNullable<SDKLiFiStep['estimate']> },
  fromChainId: number,
  fromTokenAddress: string,
  toChainId: number,
  toTokenAddress: string
): LiFiQuoteResult => ({
  routeId: step.id,
  fromChainId,
  toChainId,
  fromToken: fromTokenAddress,
  toToken: toTokenAddress,
  fromAmount: step.estimate.fromAmount,
  toAmount: step.estimate.toAmount,
  estimatedGas: step.estimate.gasCosts?.[0]?.amount ?? '0',
  executionDuration: step.estimate.executionDuration,
  steps: (step.includedSteps ?? []).map((s) => ({
    type: s.type === 'cross' ? 'cross' : s.type === 'protocol' ? 'protocol' : 'swap',
    tool: s.toolDetails?.name ?? s.tool,
    fromToken: s.action.fromToken.symbol,
    toToken: s.action.toToken.symbol,
    fromAmount: s.estimate?.fromAmount ?? '0',
    toAmount: s.estimate?.toAmount ?? '0',
  })),
  feeCosts: (step.estimate.feeCosts ?? []).map((fc) => ({
    name: fc.name,
    amount: fc.amount,
    token: fc.token.symbol,
    amountUSD: fc.amountUSD,
  })),
})

export const useMetalPrice = (
  elementSymbol: string,
  fromChainId: number,
  fromTokenAddress: string,
  amountIn: string
): UseMetalPriceReturn => {
  const { address, isConnected } = useAccount()
  const [quote, setQuote] = useState<LiFiQuoteResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const metalToken = getMetalToken(elementSymbol)

  const fetchQuote = useCallback(async () => {
    if (!isConnected || !address || !metalToken) return

    const isNative = fromTokenAddress.toLowerCase() === NATIVE_SENTINEL.toLowerCase()
    const decimals = isNative ? 18 : (DEFAULT_FROM_TOKEN[fromChainId]?.decimals ?? 6)

    setIsLoading(true)
    setIsError(false)

    try {
      // Convert human-readable amountIn to smallest unit
      const amountWei = BigInt(Math.round(parseFloat(amountIn) * 10 ** decimals)).toString()

      const result = await getQuote({
        fromChain: fromChainId,
        toChain: metalToken.chainId,
        fromToken: fromTokenAddress,
        toToken: metalToken.address,
        fromAmount: amountWei,
        fromAddress: address,
      })

      if (result.estimate) {
        setQuote(
          mapStepToQuote(
            result as SDKLiFiStep & { estimate: NonNullable<SDKLiFiStep['estimate']> },
            fromChainId,
            fromTokenAddress,
            metalToken.chainId,
            metalToken.address
          )
        )
      }
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, address, metalToken, fromChainId, fromTokenAddress, amountIn])

  useEffect(() => {
    if (!metalToken || !isConnected) return
    fetchQuote()
    const interval = setInterval(fetchQuote, 30_000)
    return () => clearInterval(interval)
  }, [metalToken, isConnected, fetchQuote])

  if (!metalToken) return { quote: null, isLoading: false, isError: false, refetch: () => {} }

  return { quote, isLoading, isError, refetch: fetchQuote }
}
