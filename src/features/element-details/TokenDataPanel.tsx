import { useEffect, useState } from 'react'

import {
  ArrowRight,
  Check,
  Clock,
  Copy,
  DollarSign,
  ExternalLink,
  Layers,
  RefreshCw,
  Route,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { useAccount } from 'wagmi'

import { CHAIN_EXPLORERS, CHAIN_NAMES, DEFAULT_FROM_TOKEN } from '@/constants/metalTokens'
import type { LiFiQuoteResult, MetalTokenMapping } from '@/types'
import type { ChemicalElement } from '@/types/element'
import type { TokenInfo } from '@/types/token'

import styles from './TokenDataPanel.module.scss'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const LIFI_URL = 'https://li.fi'

const CHAIN_DOT_COLOR: Record<number, string> = {
  1: 'bg-blue-500',
  137: 'bg-violet-600',
  42161: 'bg-cyan-500',
  42793: 'bg-purple-500',
  10: 'bg-red-500',
}

// ── Formatting helpers ────────────────────────────────────────────────────────

const fmt = {
  supply: (raw: string, decimals: number): string => {
    try {
      const n = Number(BigInt(raw)) / 10 ** decimals
      if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
      if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
      if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`
      return n.toFixed(2)
    } catch {
      return '—'
    }
  },

  usd: (n: number | null): string => {
    if (n === null) return '—'
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
    if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`
    return `$${n.toFixed(2)}`
  },

  duration: (seconds: number): string => {
    if (seconds < 60) return `~${seconds}s`
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return s > 0 ? `~${m}m ${s}s` : `~${m}m`
  },

  token: (raw: string, decimals: number): string => {
    try {
      const n = Number(BigInt(raw)) / 10 ** decimals
      if (n < 0.0001) return n.toExponential(4)
      if (n < 1) return n.toFixed(6)
      if (n < 1_000) return n.toFixed(4)
      return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
    } catch {
      return '—'
    }
  },

  price: (n: number): string =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 }),
}

// ── Sub-components ────────────────────────────────────────────────────────────

const SkeletonTile = () => (
  <div className="rounded-lg border border-border bg-surface-2 p-3">
    <div className={`${styles.skeleton} h-3 w-16 mb-2`} />
    <div className={`${styles.skeleton} h-5 w-24`} />
  </div>
)

interface StatTileProps {
  icon: React.ElementType
  label: string
  value: string
}

const StatTile = ({ icon: Icon, label, value }: StatTileProps) => (
  <div
    className={`${styles.statTile} flex items-start gap-2.5 rounded-lg border border-border bg-surface-2 p-3`}
  >
    <div className="mt-0.5 flex-shrink-0 rounded-md bg-surface p-1.5">
      <Icon size={12} className="text-accent" />
    </div>
    <div className="min-w-0">
      <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">{label}</p>
      <p className="font-mono text-sm font-semibold text-text-primary truncate" title={value}>
        {value}
      </p>
    </div>
  </div>
)

interface MarketItemProps {
  label: string
  value: string
}

const MarketItem = ({ label, value }: MarketItemProps) => (
  <div className={styles.marketItem}>
    <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted mb-0.5">{label}</p>
    <p className="font-mono text-xs font-semibold text-text-primary">{value}</p>
  </div>
)

const SkeletonMarket = () => (
  <div className="flex gap-6">
    {[80, 64, 96, 72].map((w) => (
      <div key={w}>
        <div className={`${styles.skeleton} h-2.5 mb-1.5`} style={{ width: w }} />
        <div className={`${styles.skeleton} h-4`} style={{ width: w + 16 }} />
      </div>
    ))}
  </div>
)

interface StepBadgeProps {
  type: 'swap' | 'cross' | 'protocol'
}

const StepBadge = ({ type }: StepBadgeProps) => {
  const cls =
    type === 'cross'
      ? styles.badgeCross
      : type === 'protocol'
        ? styles.badgeProtocol
        : styles.badgeSwap
  return (
    <span className={`${cls} font-mono text-[9px] font-bold uppercase`}>
      {type === 'cross' ? 'BRIDGE' : type.toUpperCase()}
    </span>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface TokenDataPanelProps {
  element: ChemicalElement
  metalToken: MetalTokenMapping | null
  quote: LiFiQuoteResult | null
  tokenInfo: TokenInfo | null
  isLoadingQuote: boolean
  isLoadingToken: boolean
}

export const TokenDataPanel = ({
  element,
  metalToken,
  quote,
  tokenInfo,
  isLoadingQuote,
  isLoadingToken,
}: TokenDataPanelProps) => {
  const { chainId } = useAccount()
  const effectiveChainId = chainId ?? 1
  const fromTokenDecimals = DEFAULT_FROM_TOKEN[effectiveChainId]?.decimals ?? 6

  const [copied, setCopied] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [secondsAgo, setSecondsAgo] = useState(0)

  // Reset on fresh quote
  useEffect(() => {
    if (quote && !isLoadingQuote) {
      setCountdown(30)
      setSecondsAgo(0)
    }
  }, [quote, isLoadingQuote])

  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1))
      setSecondsAgo((s) => s + 1)
    }, 1000)
    return () => clearInterval(tick)
  }, [])

  const handleCopy = async () => {
    if (!metalToken) return
    try {
      await navigator.clipboard.writeText(metalToken.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  if (!metalToken) return null

  // ── Computed quote values ─────────────────────────────────────────────────

  let pricePerToken: number | null = null
  let toAmountFmt = '—'
  let totalFeesFmt = '—'
  let routeVia: string | null = null
  let stepCount = 0

  if (quote) {
    try {
      const fromUSD = Number(BigInt(quote.fromAmount)) / 10 ** fromTokenDecimals
      const toTokens = Number(BigInt(quote.toAmount)) / 10 ** metalToken.decimals
      if (toTokens > 0) pricePerToken = fromUSD / toTokens
      toAmountFmt = `${fmt.token(quote.toAmount, metalToken.decimals)} ${metalToken.tokenSymbol}`
      const totalFees = quote.feeCosts.reduce((s, fc) => s + parseFloat(fc.amountUSD || '0'), 0)
      totalFeesFmt = `~$${totalFees.toFixed(2)}`
      stepCount = quote.steps.length
      routeVia = stepCount > 0 ? quote.steps.map((s) => s.tool).join(' → ') : null
    } catch {
      // ignore computation errors
    }
  }

  // ── Derived identity values ───────────────────────────────────────────────

  const chainName = CHAIN_NAMES[metalToken.chainId] ?? 'Unknown'
  const explorerUrl = CHAIN_EXPLORERS[metalToken.chainId] ?? 'https://etherscan.io'
  const addrFull = metalToken.address
  const addrShort = `${addrFull.slice(0, 6)}…${addrFull.slice(-4)}`
  const addrMed = `${addrFull.slice(0, 10)}…${addrFull.slice(-8)}`
  const isVerified = addrFull.toLowerCase() !== ZERO_ADDRESS

  return (
    <div className="rounded-xl border border-border bg-surface p-5 space-y-5">
      {/* ── Section 1: Token Identity ────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Logo or symbol badge */}
        {metalToken.logoURI ? (
          <img
            src={metalToken.logoURI}
            alt={metalToken.tokenSymbol}
            className="h-8 w-8 rounded-full border border-border object-cover flex-shrink-0"
          />
        ) : (
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border bg-surface-2">
            <span className="font-mono text-xs font-bold text-text-muted">{element.symbol}</span>
          </div>
        )}

        {/* Name + symbol */}
        <div className="flex flex-col leading-tight min-w-0">
          <span className="font-mono text-sm font-semibold text-text-primary truncate">
            {metalToken.tokenName}
          </span>
          <span className="font-mono text-[10px] text-text-muted">{metalToken.tokenSymbol}</span>
        </div>

        {/* Chain badge */}
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2 py-0.5">
          <span
            className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${CHAIN_DOT_COLOR[metalToken.chainId] ?? 'bg-text-muted'}`}
          />
          <span className="font-mono text-[10px] text-text-muted">{chainName}</span>
        </span>

        {/* Verified badge */}
        {isVerified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5">
            <ShieldCheck size={10} className="text-green-400" />
            <span className="font-mono text-[10px] text-green-400">Verified</span>
          </span>
        )}

        {/* Contract address + copy + explorer link */}
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2 py-1 font-mono text-[10px] text-text-muted ml-auto">
          <span className={styles.addressShort}>{addrShort}</span>
          <span className={styles.addressFull}>{addrMed}</span>
          <button
            onClick={() => void handleCopy()}
            className="ml-0.5 rounded p-0.5 transition-colors hover:text-text-primary"
            title="Copy address"
            aria-label="Copy contract address"
          >
            {copied ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
          </button>
          <a
            href={`${explorerUrl}/token/${addrFull}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-0.5 transition-colors hover:text-accent"
            title="View on explorer"
            aria-label="View on block explorer"
          >
            <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* ── Section 2: Live Price Cards ──────────────────────────────────── */}
      {(isLoadingQuote || quote) && (
        <div className={styles.statGrid}>
          {isLoadingQuote ? (
            <>
              <SkeletonTile />
              <SkeletonTile />
              <SkeletonTile />
              <SkeletonTile />
              <SkeletonTile />
              <SkeletonTile />
            </>
          ) : quote ? (
            <>
              <StatTile
                icon={DollarSign}
                label="Current Price"
                value={pricePerToken !== null ? `$${fmt.price(pricePerToken)}` : '—'}
              />
              <StatTile icon={Layers} label="You Receive" value={toAmountFmt} />
              <StatTile icon={Zap} label="Network Fee" value={totalFeesFmt} />
              <StatTile
                icon={Clock}
                label="Est. Time"
                value={fmt.duration(quote.executionDuration)}
              />
              <StatTile icon={Route} label="Best Route Via" value={routeVia ?? '—'} />
              <StatTile
                icon={ArrowRight}
                label="Route Steps"
                value={stepCount > 0 ? `${stepCount}-step route` : '—'}
              />
            </>
          ) : null}
        </div>
      )}

      {/* ── Section 3: Route Steps Visualization ────────────────────────── */}
      {quote && quote.steps.length > 0 && (
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Route
          </p>
          <div className={`${styles.routeScroll} flex items-center gap-2`}>
            {quote.steps.map((step, idx) => (
              <div key={idx} className={`${styles.routeStep} flex items-center gap-2`}>
                {idx > 0 && <ArrowRight size={10} className="flex-shrink-0 text-text-muted/40" />}

                {/* Step card */}
                <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-surface-2 px-3 py-2 min-w-[96px]">
                  {/* from → to token symbols */}
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[10px] font-semibold text-text-primary">
                      {step.fromToken}
                    </span>
                    <ArrowRight size={8} className="text-text-muted/40" />
                    <span className="font-mono text-[10px] font-semibold text-text-primary">
                      {step.toToken}
                    </span>
                  </div>

                  {/* Tool name */}
                  <span
                    className="max-w-[120px] truncate font-mono text-[9px] text-text-muted"
                    title={step.tool}
                  >
                    {step.tool}
                  </span>

                  {/* Type badge */}
                  <StepBadge type={step.type} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Section 4: Market Data ───────────────────────────────────────── */}
      {(isLoadingToken || tokenInfo) && (
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Market Data
          </p>
          {isLoadingToken ? (
            <SkeletonMarket />
          ) : tokenInfo ? (
            <div className={styles.marketRow}>
              <MarketItem
                label="Total Supply"
                value={fmt.supply(tokenInfo.totalSupply, tokenInfo.decimals)}
              />
              <MarketItem label="Holders" value={tokenInfo.holders.toLocaleString('en-US')} />
              <MarketItem label="Market Cap" value={fmt.usd(tokenInfo.marketCap)} />
              <MarketItem label="24h Volume" value={fmt.usd(tokenInfo.volume24h)} />
            </div>
          ) : null}
        </div>
      )}

      {/* ── Section 5: Data Freshness ────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono text-[10px] text-text-muted">
            Prices update every 30s
            {countdown > 0 && ` · Next in ${countdown}s`}
          </span>
          {quote && secondsAgo > 0 && (
            <span className="font-mono text-[10px] text-text-muted/50">
              · Updated {secondsAgo}s ago
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 font-mono text-[10px] text-text-muted">
          {isLoadingQuote && <RefreshCw size={9} className="animate-spin" />}
          <span>Powered by</span>
          <a
            href={LIFI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            LI.FI
            <ExternalLink size={8} className="inline ml-0.5 align-baseline" />
          </a>
        </div>
      </div>
    </div>
  )
}
