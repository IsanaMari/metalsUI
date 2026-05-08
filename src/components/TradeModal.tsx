import { useCallback, useEffect, useState } from 'react'

import { useConnectModal } from '@rainbow-me/rainbowkit'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
  XCircle,
} from 'lucide-react'
import { useAccount } from 'wagmi'

import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import {
  CHAIN_EXPLORERS,
  CHAIN_NAMES,
  DEFAULT_FROM_TOKEN,
  getMetalToken,
  LOW_LIQUIDITY_METALS,
} from '@/constants/metalTokens'
import { useMetalTrade } from '@/hooks/useMetalTrade'
import type { ChemicalElement } from '@/types/element'

interface TradeModalProps {
  isOpen: boolean
  onClose: () => void
  element: ChemicalElement
}

const SLIPPAGE_PRESETS = [0.003, 0.005, 0.01] as const

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `~${seconds}s`
  const mins = Math.ceil(seconds / 60)
  return `~${mins} min`
}

const formatTokenAmount = (raw: string, decimals: number): string => {
  try {
    const n = Number(BigInt(raw)) / 10 ** decimals
    if (n < 0.0001) return n.toExponential(4)
    if (n < 1) return n.toFixed(6)
    if (n < 1000) return n.toFixed(4)
    return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
  } catch {
    return '—'
  }
}

const truncateTx = (hash: string) =>
  hash.length > 14 ? `${hash.slice(0, 8)}…${hash.slice(-6)}` : hash

type StepDisplayStatus = 'pending' | 'active' | 'complete'

const getStepStatus = (idx: number, currentStep: number, isSuccess: boolean): StepDisplayStatus => {
  if (isSuccess || idx < currentStep - 1) return 'complete'
  if (idx === currentStep - 1) return 'active'
  return 'pending'
}

const StepDot = ({ status }: { status: StepDisplayStatus }) => {
  const base = 'h-2 w-2 rounded-full flex-shrink-0'
  if (status === 'complete') return <span className={`${base} bg-green-400`} />
  if (status === 'active') return <span className={`${base} bg-accent animate-pulse`} />
  return <span className={`${base} bg-border`} />
}

export const TradeModal = ({ isOpen, onClose, element }: TradeModalProps) => {
  const { address, isConnected, chainId } = useAccount()
  const { openConnectModal } = useConnectModal()

  const { tradeState, slippage, getQuote, executeTrade, updateSlippage, reset } = useMetalTrade()

  const [customSlippage, setCustomSlippage] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const metalToken = getMetalToken(element.symbol)
  const effectiveChainId = chainId ?? 1
  const fromToken = DEFAULT_FROM_TOKEN[effectiveChainId]
  const fromTokenAddress = fromToken?.address ?? DEFAULT_FROM_TOKEN[1].address
  const fromTokenSymbol = fromToken?.symbol ?? 'USDC'
  const fromTokenDecimals = fromToken?.decimals ?? 6

  const isLowLiquidity = LOW_LIQUIDITY_METALS.has(element.symbol)
  const isRareEarth = element.category === 'lanthanide' || element.category === 'actinide'
  const showLiquidityNote = isLowLiquidity || isRareEarth

  const chainName = CHAIN_NAMES[effectiveChainId] ?? 'Unknown'
  const toChainName = metalToken ? (CHAIN_NAMES[metalToken.chainId] ?? 'Unknown') : ''

  const handleFetchQuote = useCallback(async () => {
    if (!metalToken || !isConnected || !address) return
    // Default: 100 USDC worth as reference amount (10^8 for 6 decimals)
    const refAmount = (100n * 10n ** BigInt(fromTokenDecimals)).toString()
    await getQuote({
      fromChainId: effectiveChainId,
      fromTokenAddress,
      toSymbol: element.symbol,
      amountIn: refAmount,
    })
  }, [
    metalToken,
    isConnected,
    address,
    effectiveChainId,
    fromTokenAddress,
    fromTokenDecimals,
    element.symbol,
    getQuote,
  ])

  // Auto-fetch quote when modal opens with connected wallet
  useEffect(() => {
    if (isOpen && isConnected && metalToken) {
      handleFetchQuote()
    }
    if (!isOpen) {
      reset()
      setCustomSlippage('')
      setShowCustom(false)
    }
  }, [isOpen, isConnected]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSlippagePreset = (value: number) => {
    updateSlippage(value)
    setShowCustom(false)
    setCustomSlippage('')
  }

  const handleCustomSlippage = (raw: string) => {
    setCustomSlippage(raw)
    const parsed = parseFloat(raw) / 100
    if (Number.isFinite(parsed) && parsed > 0 && parsed <= 0.05) {
      updateSlippage(parsed)
    }
  }

  const { status, quote, txHash, error, currentStep, totalSteps } = tradeState

  const isIdle = status === 'idle'
  const isQuoting = status === 'quoting'
  const isReady = status === 'ready'
  const isApproving = status === 'approving'
  const isSwapping = status === 'swapping'
  const isBridging = status === 'bridging'
  const isSuccess = status === 'success'
  const isError = status === 'error'
  const isRejected = status === 'rejected'
  const isWorking = isApproving || isSwapping || isBridging

  const fromAmountFormatted = quote ? formatTokenAmount(quote.fromAmount, fromTokenDecimals) : '100'
  const toAmountFormatted =
    quote && metalToken ? formatTokenAmount(quote.toAmount, metalToken.decimals) : '—'
  const totalFeesUSD = quote
    ? quote.feeCosts.reduce((sum, fc) => sum + parseFloat(fc.amountUSD || '0'), 0).toFixed(2)
    : '—'

  const explorerBase =
    txHash && metalToken ? (CHAIN_EXPLORERS[metalToken.chainId] ?? 'https://etherscan.io') : null

  if (!metalToken) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      {/* Header */}
      <div className="mb-5 pr-6">
        <h2 className="font-mono text-lg font-semibold text-text-primary">
          Buy {element.name} ({element.symbol})
        </h2>
        <p className="font-mono text-xs text-text-muted mt-0.5">
          {metalToken.tokenName} · {metalToken.tokenSymbol} · {toChainName}
        </p>
      </div>

      {/* Two-column layout on md+, stacked on mobile */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* ── Left Panel — Quote Details ── */}
        <div className="flex flex-col gap-4">
          {/* Quote rows */}
          <div className="rounded-xl border border-border bg-surface-2 p-4 space-y-3">
            <div className="flex justify-between">
              <span className="font-mono text-xs text-text-muted">You Pay</span>
              <span className="font-mono text-xs font-semibold text-text-primary">
                {fromAmountFormatted} {fromTokenSymbol}
                <span className="ml-1 text-text-muted/60 font-normal">({chainName})</span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-xs text-text-muted">You Receive</span>
              <span className="font-mono text-xs font-semibold text-text-primary">
                {toAmountFormatted} {metalToken.tokenSymbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-xs text-text-muted">Estimated Time</span>
              <span className="font-mono text-xs font-semibold text-text-primary">
                {quote ? formatDuration(quote.executionDuration) : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-xs text-text-muted">Network Fees</span>
              <span className="font-mono text-xs font-semibold text-text-primary">
                {totalFeesUSD !== '—' ? `$${totalFeesUSD}` : '—'}
              </span>
            </div>
          </div>

          {/* Slippage selector */}
          <div className="rounded-xl border border-border bg-surface-2 p-4">
            <p className="font-mono text-xs text-text-muted mb-2">Slippage Tolerance</p>
            <div className="flex gap-2 flex-wrap">
              {SLIPPAGE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleSlippagePreset(preset)}
                  className={[
                    'rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors',
                    Math.abs(slippage - preset) < 0.0001 && !showCustom
                      ? 'border-accent/60 bg-accent/10 text-accent'
                      : 'border-border text-text-muted hover:border-accent/40 hover:text-text-primary',
                  ].join(' ')}
                >
                  {(preset * 100).toFixed(1)}%
                </button>
              ))}
              <button
                onClick={() => setShowCustom(true)}
                className={[
                  'rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors',
                  showCustom
                    ? 'border-accent/60 bg-accent/10 text-accent'
                    : 'border-border text-text-muted hover:border-accent/40 hover:text-text-primary',
                ].join(' ')}
              >
                Custom
              </button>
            </div>

            {showCustom && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={customSlippage}
                  onChange={(e) => handleCustomSlippage(e.target.value)}
                  placeholder="0.5"
                  className="w-24 rounded-lg border border-border bg-surface px-2 py-1 font-mono text-xs text-text-primary outline-none focus:border-accent/60"
                />
                <span className="font-mono text-xs text-text-muted">%</span>
              </div>
            )}

            {slippage > 0.05 && (
              <p className="mt-2 font-mono text-[10px] text-amber-500">
                High slippage increases risk of loss
              </p>
            )}
          </div>

          {/* Low-liquidity note */}
          {showLiquidityNote && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
              <AlertTriangle size={12} className="mt-0.5 shrink-0 text-amber-500" />
              <p className="font-mono text-[10px] text-amber-600 dark:text-amber-400 leading-relaxed">
                High slippage may be required for low-liquidity assets
              </p>
            </div>
          )}
        </div>

        {/* ── Right Panel — Execution ── */}
        <div className="flex flex-col gap-4">
          {/* Step progress indicator */}
          {quote && quote.steps.length > 0 && (
            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <p className="font-mono text-xs text-text-muted mb-3">Route</p>
              <div className="flex items-center gap-1">
                {quote.steps.map((step, idx) => {
                  const stepStatus = getStepStatus(idx, currentStep, isSuccess)
                  return (
                    <div key={idx} className="flex items-center gap-1 min-w-0">
                      {idx > 0 && (
                        <ArrowRight size={10} className="flex-shrink-0 text-text-muted/40" />
                      )}
                      <div className="flex flex-col items-center gap-1">
                        <StepDot status={stepStatus} />
                        <span
                          className={[
                            'font-mono leading-none truncate max-w-[56px]',
                            'transition-colors duration-200',
                            stepStatus === 'active'
                              ? 'text-accent'
                              : stepStatus === 'complete'
                                ? 'text-green-400'
                                : 'text-text-muted/60',
                          ].join(' ')}
                          style={{ fontSize: '0.6rem' }}
                          title={step.tool}
                        >
                          {step.tool}
                        </span>
                        <span
                          className="font-mono text-text-muted/40 leading-none"
                          style={{ fontSize: '0.55rem' }}
                        >
                          {step.type}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Status feedback */}
          {(isError || isRejected) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={[
                'flex items-start gap-2 rounded-lg border px-4 py-3',
                isRejected
                  ? 'border-border bg-surface-2 text-text-muted'
                  : 'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400',
              ].join(' ')}
            >
              <XCircle size={14} className="mt-0.5 shrink-0" />
              <span className="font-mono text-xs">
                {isRejected ? 'Transaction cancelled' : error}
              </span>
            </motion.div>
          )}

          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-green-600 dark:text-green-400"
            >
              <CheckCircle2 size={14} />
              <span className="font-mono text-xs">Purchase complete!</span>
            </motion.div>
          )}

          {/* CTA Button */}
          <div className="flex flex-col gap-2">
            {!isConnected ? (
              <Button variant="primary" size="lg" fullWidth onClick={openConnectModal}>
                Connect Wallet
              </Button>
            ) : isIdle ? (
              <Button variant="primary" size="lg" fullWidth onClick={handleFetchQuote}>
                Get Quote
              </Button>
            ) : isQuoting ? (
              <Button variant="secondary" size="lg" fullWidth disabled>
                <Loader2 size={14} className="animate-spin" />
                Fetching best route…
              </Button>
            ) : isReady ? (
              <>
                <Button variant="gold" size="lg" fullWidth onClick={() => void executeTrade()}>
                  Confirm Purchase
                </Button>
                <button
                  onClick={handleFetchQuote}
                  className="flex items-center justify-center gap-1 font-mono text-[10px] text-text-muted hover:text-text-primary transition-colors"
                >
                  <RefreshCw size={10} />
                  Refresh quote
                </button>
              </>
            ) : isApproving ? (
              <Button variant="secondary" size="lg" fullWidth disabled>
                <Loader2 size={14} className="animate-spin" />
                Approving token…
              </Button>
            ) : isSwapping ? (
              <Button variant="secondary" size="lg" fullWidth disabled>
                <Loader2 size={14} className="animate-spin" />
                Swapping…
              </Button>
            ) : isBridging ? (
              <Button variant="secondary" size="lg" fullWidth disabled>
                <Loader2 size={14} className="animate-spin" />
                Bridging to {toChainName}…
              </Button>
            ) : isSuccess ? (
              <>
                <Button variant="secondary" size="lg" fullWidth disabled>
                  <CheckCircle2 size={14} />
                  Purchase Complete
                </Button>
                {txHash && explorerBase && (
                  <a
                    href={`${explorerBase}/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 font-mono text-xs text-accent hover:underline"
                  >
                    {truncateTx(txHash)}
                    <ExternalLink size={10} />
                  </a>
                )}
              </>
            ) : isError ? (
              <Button variant="primary" size="lg" fullWidth onClick={handleFetchQuote}>
                Try Again
              </Button>
            ) : isRejected ? (
              <Button variant="ghost" size="lg" fullWidth onClick={handleFetchQuote}>
                Get New Quote
              </Button>
            ) : null}
          </div>

          {/* Progress hint for active steps */}
          {isWorking && totalSteps > 0 && (
            <p className="font-mono text-center text-[10px] text-text-muted animate-pulse">
              Step {currentStep} of {totalSteps}
            </p>
          )}
        </div>
      </div>
    </Modal>
  )
}
