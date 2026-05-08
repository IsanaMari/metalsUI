import { useNavigate } from 'react-router-dom'

import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'

import { CATEGORY_COLORS, ROUTES } from '@/constants/config'
import type { ChemicalElement } from '@/types/element'

interface ElementCellProps {
  element: ChemicalElement
  style?: React.CSSProperties
  compact?: boolean
  isLive?: boolean
  liveTooltip?: string
}

const formatPrice = (price: number): string => {
  if (price >= 1000) return `$${(price / 1000).toFixed(1)}k`
  if (price >= 1) return `$${price.toFixed(2)}`
  if (price >= 0.001) return `$${price.toFixed(3)}`
  return `$${price.toFixed(4)}`
}

export const ElementCell = ({
  element,
  style,
  compact = false,
  isLive = false,
  liveTooltip,
}: ElementCellProps) => {
  const navigate = useNavigate()
  const isListed = element.pricePerGram > 0
  const colorClass = CATEGORY_COLORS[element.category]

  return (
    <motion.button
      style={{
        ...style,
        padding: 'clamp(2px, 0.4vw, 6px)',
      }}
      onClick={() => navigate(ROUTES.elementDetail(element.symbol))}
      whileHover={isListed ? { scale: 1.08, zIndex: 10 } : { scale: 1.04, zIndex: 5 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className={[
        'relative flex w-full h-full flex-col items-center rounded border text-center overflow-hidden',
        compact ? 'justify-evenly' : 'justify-between',
        'transition-colors duration-150 outline-none',
        'focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
        colorClass,
        isListed ? 'opacity-100 cursor-pointer' : 'opacity-40 cursor-pointer hover:opacity-60',
      ].join(' ')}
      title={`${element.name} (${element.symbol}) — ${isListed ? formatPrice(element.pricePerGram) + '/g' : 'Not listed'}`}
      aria-label={`${element.name}`}
    >
      {/* LIVE badge — top-right corner */}
      {isLive && (
        <span
          className="absolute top-0.5 right-0.5 flex items-center gap-0.5 rounded-sm bg-green-500/20 px-0.5 leading-none"
          style={{ fontSize: 'clamp(0.25rem, 0.45vw, 0.4rem)' }}
          title={liveTooltip}
        >
          <span className="h-1 w-1 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono font-bold text-green-400 uppercase">Live</span>
        </span>
      )}

      {/* Atomic number — top */}
      <span
        className="font-mono leading-none text-current opacity-70 self-start"
        style={{ fontSize: 'clamp(0.4rem, 0.8vw, 0.75rem)' }}
      >
        {element.atomicNumber}
      </span>

      {/* Symbol — centre */}
      <span
        className="font-mono font-bold leading-none text-current"
        style={{ fontSize: 'clamp(0.7rem, 1.8vw, 1.5rem)' }}
      >
        {element.symbol}
      </span>

      {/* Name + price — bottom (non-compact only) */}
      {!compact && (
        <div className="flex w-full flex-col items-center overflow-hidden">
          <span
            className="max-w-full truncate font-mono leading-none text-current opacity-70"
            style={{ fontSize: 'clamp(0.3rem, 0.7vw, 0.6rem)' }}
          >
            {element.name}
          </span>
          <span
            className="flex items-center gap-0.5 font-mono leading-none text-current"
            style={{ fontSize: 'clamp(0.3rem, 0.6vw, 0.55rem)' }}
          >
            {isListed ? (
              <span className="text-gold/90">{formatPrice(element.pricePerGram)}</span>
            ) : (
              <Lock size={6} className="opacity-50" />
            )}
          </span>
        </div>
      )}
    </motion.button>
  )
}
