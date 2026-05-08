import { useCallback, useRef, useState } from 'react'

import type { Route, RouteExtended } from '@lifi/sdk'
import { useAccount } from 'wagmi'

import { getMetalToken } from '@/constants/metalTokens'
import { executeRoute, getRoutes } from '@/services/lifi'
import type { LiFiFeeCost, LiFiQuoteResult, LiFiStep, TradeState } from '@/types'

const INITIAL_STATE: TradeState = {
  status: 'idle',
  quote: null,
  txHash: undefined,
  error: null,
  currentStep: 0,
  totalSteps: 0,
}

const STALE_AFTER_MS = 60_000
const MAX_SLIPPAGE = 0.05
const DEFAULT_SLIPPAGE = 0.005

const loadStoredSlippage = (): number => {
  try {
    const stored = localStorage.getItem('trade-slippage')
    if (!stored) return DEFAULT_SLIPPAGE
    const parsed = parseFloat(stored)
    return Number.isFinite(parsed) ? Math.min(parsed, MAX_SLIPPAGE) : DEFAULT_SLIPPAGE
  } catch {
    return DEFAULT_SLIPPAGE
  }
}

const parseError = (err: unknown): string => {
  if (err instanceof Error) return err.message.slice(0, 120)
  if (typeof err === 'string') return err.slice(0, 120)
  return 'An unknown error occurred'
}

const mapRouteToQuote = (route: Route): LiFiQuoteResult => {
  const steps: LiFiStep[] = route.steps.flatMap((s) =>
    (s.includedSteps ?? []).map((sub) => ({
      type: sub.type === 'cross' ? 'cross' : sub.type === 'protocol' ? 'protocol' : 'swap',
      tool: sub.toolDetails?.name ?? sub.tool,
      fromToken: sub.action.fromToken.symbol,
      toToken: sub.action.toToken.symbol,
      fromAmount: sub.estimate?.fromAmount ?? '0',
      toAmount: sub.estimate?.toAmount ?? '0',
    }))
  )

  const feeCosts: LiFiFeeCost[] = route.steps.flatMap((s) =>
    (s.estimate?.feeCosts ?? []).map((fc) => ({
      name: fc.name,
      amount: fc.amount,
      token: fc.token.symbol,
      amountUSD: fc.amountUSD,
    }))
  )

  const executionDuration = route.steps.reduce(
    (sum, s) => sum + (s.estimate?.executionDuration ?? 0),
    0
  )

  return {
    routeId: route.id,
    fromChainId: route.fromChainId,
    toChainId: route.toChainId,
    fromToken: route.fromToken.address,
    toToken: route.toToken.address,
    fromAmount: route.fromAmount,
    toAmount: route.toAmount,
    estimatedGas: route.gasCostUSD ?? '0',
    executionDuration,
    // Fallback: route.steps are always LiFiStep (type='lifi'), so use 'swap' as default display type
    steps:
      steps.length > 0
        ? steps
        : route.steps.map((s) => ({
            type: 'swap' as const,
            tool: s.toolDetails?.name ?? s.tool,
            fromToken: s.action.fromToken.symbol,
            toToken: s.action.toToken.symbol,
            fromAmount: s.estimate?.fromAmount ?? '0',
            toAmount: s.estimate?.toAmount ?? '0',
          })),
    feeCosts,
  }
}

interface GetQuoteParams {
  fromChainId: number
  fromTokenAddress: string
  toSymbol: string
  amountIn: string
  slippage?: number
}

interface UseMetalTradeReturn {
  tradeState: TradeState
  slippage: number
  isHighSlippage: boolean
  getQuote: (params: GetQuoteParams) => Promise<void>
  executeTrade: () => Promise<void>
  updateSlippage: (value: number) => void
  reset: () => void
}

export const useMetalTrade = (): UseMetalTradeReturn => {
  const { address, isConnected } = useAccount()
  const [tradeState, setTradeState] = useState<TradeState>(INITIAL_STATE)
  const [slippage, setSlippage] = useState<number>(loadStoredSlippage)

  const routeRef = useRef<Route | null>(null)
  const quoteTimestampRef = useRef<number | null>(null)

  const isHighSlippage = slippage > 0.01

  const updateSlippage = useCallback((value: number) => {
    const clamped = Math.min(Math.max(value, 0), MAX_SLIPPAGE)
    setSlippage(clamped)
    try {
      localStorage.setItem('trade-slippage', clamped.toString())
    } catch {
      // localStorage may be unavailable in some environments
    }
  }, [])

  const getQuote = useCallback(
    async ({
      fromChainId,
      fromTokenAddress,
      toSymbol,
      amountIn,
      slippage: overrideSlippage,
    }: GetQuoteParams) => {
      const metalToken = getMetalToken(toSymbol)
      if (!metalToken || !isConnected || !address) return

      setTradeState((prev) => ({ ...prev, status: 'quoting', error: null }))

      try {
        const effectiveSlippage = overrideSlippage ?? slippage
        const { routes } = await getRoutes({
          fromChainId,
          fromTokenAddress,
          toChainId: metalToken.chainId,
          toTokenAddress: metalToken.address,
          fromAmount: amountIn,
          fromAddress: address,
          options: {
            slippage: effectiveSlippage,
            order: 'CHEAPEST',
          },
        })

        if (!routes || routes.length === 0) {
          setTradeState((prev) => ({
            ...prev,
            status: 'error',
            error: 'No routes found for this trade',
          }))
          return
        }

        // Sort by toAmount descending — best output first
        const sorted = [...routes].sort((a, b) =>
          BigInt(b.toAmount) > BigInt(a.toAmount) ? 1 : -1
        )
        const bestRoute = sorted[0]

        routeRef.current = bestRoute
        quoteTimestampRef.current = Date.now()

        setTradeState((prev) => ({
          ...prev,
          status: 'ready',
          quote: mapRouteToQuote(bestRoute),
          error: null,
        }))
      } catch (err) {
        setTradeState((prev) => ({
          ...prev,
          status: 'error',
          error: parseError(err),
        }))
      }
    },
    [isConnected, address, slippage]
  )

  const executeTrade = useCallback(async () => {
    if (!isConnected || !address) {
      setTradeState((prev) => ({ ...prev, status: 'error', error: 'Wallet not connected' }))
      return
    }
    if (!routeRef.current || !quoteTimestampRef.current) {
      setTradeState((prev) => ({ ...prev, status: 'error', error: 'No active quote' }))
      return
    }
    if (Date.now() - quoteTimestampRef.current > STALE_AFTER_MS) {
      setTradeState((prev) => ({
        ...prev,
        status: 'error',
        error: 'Quote expired. Please refresh.',
      }))
      return
    }

    setTradeState((prev) => ({ ...prev, status: 'approving', error: null, txHash: undefined }))

    try {
      await executeRoute(routeRef.current, {
        updateRouteHook: (updatedRoute: RouteExtended) => {
          const steps = updatedRoute.steps
          const totalSteps = steps.length

          const activeIdx = steps.findIndex(
            (s) => s.execution?.status === 'ACTION_REQUIRED' || s.execution?.status === 'PENDING'
          )

          if (activeIdx >= 0) {
            const activeStep = steps[activeIdx]
            const stepType = activeStep.includedSteps?.find((s) => s.type === 'cross')
              ? 'bridging'
              : 'swapping'

            const processes = activeStep.execution?.process ?? []
            const txHash = [...processes].reverse().find((p) => p.txHash)?.txHash

            setTradeState((prev) => ({
              ...prev,
              status: stepType,
              currentStep: activeIdx + 1,
              totalSteps,
              txHash: txHash ?? prev.txHash,
            }))
          }

          const allDone = steps.every((s) => s.execution?.status === 'DONE')
          if (allDone) {
            const lastStep = steps[steps.length - 1]
            const processes = lastStep.execution?.process ?? []
            const txHash = [...processes].reverse().find((p) => p.txHash)?.txHash
            setTradeState((prev) => ({
              ...prev,
              status: 'success',
              txHash: txHash ?? prev.txHash,
            }))
          }
        },
      })
    } catch (err: unknown) {
      const errObj = err as { code?: number | string; message?: string }
      if (errObj?.code === 4001 || errObj?.code === 'ACTION_REQUIRED') {
        setTradeState((prev) => ({
          ...prev,
          status: 'rejected',
          error: 'Transaction cancelled',
        }))
      } else {
        setTradeState((prev) => ({
          ...prev,
          status: 'error',
          error: parseError(err),
        }))
      }
    }
  }, [isConnected, address])

  const reset = useCallback(() => {
    routeRef.current = null
    quoteTimestampRef.current = null
    setTradeState(INITIAL_STATE)
  }, [])

  return { tradeState, slippage, isHighSlippage, getQuote, executeTrade, updateSlippage, reset }
}
