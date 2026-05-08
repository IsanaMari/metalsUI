import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, ShoppingCart, Users, Zap } from 'lucide-react'
import { formatEther } from 'viem'
import { useAccount } from 'wagmi'

import { Button } from '@/components/Button'
import { ElementDetails } from '@/components/ElementDetails'
import { PurchasePanel } from '@/components/PurchasePanel'
import { TradeModal } from '@/components/TradeModal'
import { ROUTES } from '@/constants/config'
import { DEFAULT_FROM_TOKEN, getMetalToken } from '@/constants/metalTokens'
import { TokenDataPanel } from '@/features/element-details/TokenDataPanel'
import { useElement } from '@/hooks/useElement'
import { useMetalPrice } from '@/hooks/useMetalPrice'
import {
  useAllEtherlinkTokens,
  useTokenHolders,
  useTokenInfo,
  useTokenTransfers,
} from '@/hooks/useTokenData'

const EXPLORER = 'https://explorer.etherlink.com'

const PAGE_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
}

const truncateAddr = (addr: string) =>
  addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr

const truncateTx = (hash: string) =>
  hash.length > 14 ? `${hash.slice(0, 8)}…${hash.slice(-6)}` : hash

const formatSupply = (raw: string, decimals: number): string => {
  try {
    const n = Number(BigInt(raw)) / Math.pow(10, decimals)
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
    if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`
    return n.toFixed(2)
  } catch {
    return '—'
  }
}

const formatAmount = (raw: string): string => {
  try {
    const n = Number(formatEther(BigInt(raw)))
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
    if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`
    return n.toFixed(4)
  } catch {
    return raw.slice(0, 8)
  }
}

export const ElementDetailPage = () => {
  const { symbol } = useParams<{ symbol: string }>()
  const element = useElement(symbol)
  const [isTradeModalOpen, setTradeModalOpen] = useState(false)

  // Wallet context — used for price hook and TokenDataPanel
  const { chainId } = useAccount()
  const effectiveChainId = chainId ?? 1
  const fromToken = DEFAULT_FROM_TOKEN[effectiveChainId]
  const fromTokenAddress = fromToken?.address ?? DEFAULT_FROM_TOKEN[1].address

  // LI.FI price quote — lifted from LivePrice sub-component
  const { quote, isLoading: isLoadingQuote } = useMetalPrice(
    element?.symbol ?? '',
    effectiveChainId,
    fromTokenAddress,
    '100'
  )

  const liveTokens = useAllEtherlinkTokens()
  const tokenAddress = element ? liveTokens[element.symbol.toUpperCase()] : undefined

  const tokenInfo = useTokenInfo(tokenAddress)
  const transfers = useTokenTransfers(tokenAddress)
  const holders = useTokenHolders(tokenAddress)

  if (!element) {
    return <Navigate to={ROUTES.TABLE} replace />
  }

  const hasLiveData = !!tokenAddress
  const metalTokenMapping = getMetalToken(element.symbol)
  const hasLifiSupport = !!metalTokenMapping
  const isLoadingToken = !!tokenAddress && !tokenInfo

  return (
    <motion.div
      variants={PAGE_VARIANTS}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6"
    >
      {/* Back link */}
      <Link
        to={ROUTES.TABLE}
        className="mb-6 inline-flex items-center gap-1.5 font-mono text-sm text-text-muted transition-colors hover:text-text-primary group"
      >
        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
        Back to Marketplace
      </Link>

      {/* Two-column layout on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left — element stats */}
        <ElementDetails element={element} />

        {/* Right — purchase panel */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {hasLifiSupport ? (
            <div className="flex flex-col gap-4">
              {/* Token data panel — above the buy button */}
              <TokenDataPanel
                element={element}
                metalToken={metalTokenMapping}
                quote={quote}
                tokenInfo={tokenInfo}
                isLoadingQuote={isLoadingQuote}
                isLoadingToken={isLoadingToken}
              />

              {/* Buy button */}
              <div className="rounded-xl border border-border bg-surface p-5 flex flex-col gap-3">
                <p className="font-mono text-xs uppercase tracking-wider text-text-muted">
                  Purchase via LI.FI
                </p>
                <Button variant="gold" size="lg" fullWidth onClick={() => setTradeModalOpen(true)}>
                  <ShoppingCart size={16} />
                  Buy with Any Token
                </Button>
              </div>
            </div>
          ) : (
            <PurchasePanel element={element} />
          )}
        </div>
      </div>

      {/* LI.FI Trade Modal */}
      {hasLifiSupport && (
        <TradeModal
          isOpen={isTradeModalOpen}
          onClose={() => setTradeModalOpen(false)}
          element={element}
        />
      )}

      {/* Live on-chain data — only shown when a matching token exists */}
      {hasLiveData && (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Live Data Panel */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <Zap size={14} className="text-accent" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-text-muted">
                Live Token Data
              </span>
              <span className="ml-auto flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="font-mono text-[10px] text-green-400">LIVE</span>
              </span>
            </div>

            {tokenInfo ? (
              <dl className="space-y-2.5">
                {[
                  [
                    'Total Supply',
                    formatSupply(tokenInfo.totalSupply, tokenInfo.decimals) +
                      ' ' +
                      tokenInfo.symbol,
                  ],
                  ['Holders', tokenInfo.holders.toLocaleString()],
                  [
                    'Price (USD)',
                    tokenInfo.priceUsd !== null
                      ? `$${tokenInfo.priceUsd.toLocaleString('en-US', { minimumFractionDigits: 4 })}`
                      : '—',
                  ],
                  [
                    'Market Cap',
                    tokenInfo.marketCap !== null
                      ? `$${tokenInfo.marketCap.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                      : '—',
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <dt className="font-mono text-xs text-text-muted">{label}</dt>
                    <dd className="font-mono text-xs font-semibold text-text-primary">{value}</dd>
                  </div>
                ))}
                <div className="pt-1 border-t border-border">
                  <a
                    href={`${EXPLORER}/token/${tokenAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[10px] text-accent hover:underline"
                  >
                    View on Etherlink Explorer
                    <ExternalLink size={10} />
                  </a>
                </div>
              </dl>
            ) : (
              <p className="font-mono text-xs text-text-muted animate-pulse">Loading…</p>
            )}
          </div>

          {/* Recent Transfers Panel */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <ArrowLeft size={14} className="text-accent rotate-[135deg]" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-text-muted">
                Recent Transfers
              </span>
            </div>

            {transfers.length > 0 ? (
              <div className="space-y-2">
                {transfers.map((tx, i) => (
                  <div key={i} className="flex flex-col gap-0.5 rounded-lg bg-surface-2 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-text-muted">
                        {truncateAddr(tx.from)} → {truncateAddr(tx.to)}
                      </span>
                      <a
                        href={`${EXPLORER}/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[10px] text-accent hover:underline"
                        title={tx.txHash}
                      >
                        {truncateTx(tx.txHash)}
                        <ExternalLink size={8} className="inline ml-0.5" />
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-text-muted/60">
                        {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : ''}
                      </span>
                      <span className="font-mono text-[10px] font-semibold text-text-primary">
                        {formatAmount(tx.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-mono text-xs text-text-muted animate-pulse">Loading…</p>
            )}
          </div>

          {/* Top Holders Panel */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users size={14} className="text-accent" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-text-muted">
                Top Holders
              </span>
            </div>

            {holders.length > 0 ? (
              <div className="space-y-2.5">
                {holders.map((holder) => (
                  <div key={holder.rank} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-text-muted/60 w-4 text-right">
                          #{holder.rank}
                        </span>
                        <a
                          href={`${EXPLORER}/address/${holder.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[10px] text-accent hover:underline"
                        >
                          {truncateAddr(holder.address)}
                        </a>
                      </div>
                      <span className="font-mono text-[10px] text-text-muted">
                        {holder.percentage.toFixed(2)}%
                      </span>
                    </div>
                    {/* Percentage bar */}
                    <div className="h-1 w-full rounded-full bg-surface-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent/60"
                        style={{ width: `${Math.min(holder.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-mono text-xs text-text-muted animate-pulse">Loading…</p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
