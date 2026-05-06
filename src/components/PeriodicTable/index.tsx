import { useMemo } from 'react'

import { motion } from 'framer-motion'

import { ElementCell } from '@/components/ElementCell'
import { CATEGORY_COLORS, CATEGORY_SWATCH } from '@/constants/config'
import { useAllEtherlinkTokens } from '@/hooks/useTokenData'
import { useStore } from '@/store/useStore'
import type { ElementCategory } from '@/types/element'
import type { ChemicalElement } from '@/types/element'

interface PeriodicTableProps {
  elements: ChemicalElement[]
}

interface PlaceholderProps {
  label: string
  style: React.CSSProperties
}

const FBlockPlaceholder = ({ label, style }: PlaceholderProps) => (
  <div
    style={style}
    className="flex items-center justify-center rounded border border-dashed border-text-muted/20 bg-surface-2/30 font-mono text-text-muted/50 cursor-default overflow-hidden"
  >
    <span style={{ fontSize: 'clamp(0.35rem, 0.7vw, 0.65rem)' }}>{label}</span>
  </div>
)

const CONTAINER_VARIANTS = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.004, delayChildren: 0.05 },
  },
}

const CELL_VARIANTS = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
}

export const PeriodicTable = ({ elements }: PeriodicTableProps) => {
  const { mainElements, lanthanides, actinides } = useMemo(() => {
    const main = elements
      .filter((el) => el.group > 0)
      .sort((a, b) => a.atomicNumber - b.atomicNumber)

    const lans = elements
      .filter((el) => el.group === 0 && el.period === 6)
      .sort((a, b) => a.atomicNumber - b.atomicNumber)

    const acts = elements
      .filter((el) => el.group === 0 && el.period === 7)
      .sort((a, b) => a.atomicNumber - b.atomicNumber)

    return { mainElements: main, lanthanides: lans, actinides: acts }
  }, [elements])

  const { activeCategories } = useStore()
  const liveTokens = useAllEtherlinkTokens()

  return (
    <div className="w-full overflow-visible">
      {/* ── Full-bleed responsive grid ── */}
      <motion.div
        variants={CONTAINER_VARIANTS}
        initial="hidden"
        animate="visible"
        style={{
          display: 'grid',
          width: '100%',
          // 18 equal columns — fills 100% viewport width
          gridTemplateColumns: 'repeat(18, 1fr)',
          // 7 main rows | 6px spacer | 2 f-block rows — content-sized with a floor
          gridTemplateRows: 'repeat(7, minmax(44px, auto)) 6px repeat(2, minmax(36px, auto))',
          gap: '1px',
        }}
      >
        {/* Main table elements */}
        {mainElements.map((el) => {
          const isActive = activeCategories[el.category] !== false
          return (
            <div
              key={el.symbol}
              style={{
                gridColumn: el.group,
                gridRow: el.period,
                opacity: isActive ? 1 : 0.15,
                pointerEvents: isActive ? undefined : 'none',
                transition: 'opacity 250ms ease',
              }}
            >
              <motion.div variants={CELL_VARIANTS} style={{ height: '100%', width: '100%' }}>
                <ElementCell
                  element={el}
                  style={{ height: '100%', width: '100%' }}
                  isLive={!!liveTokens[el.symbol.toUpperCase()]}
                />
              </motion.div>
            </div>
          )
        })}

        {/* Lanthanide placeholder in main grid (period 6 col 3) */}
        <FBlockPlaceholder label="57–71" style={{ gridColumn: 3, gridRow: 6 }} />

        {/* Actinide placeholder in main grid (period 7 col 3) */}
        <FBlockPlaceholder label="89–103" style={{ gridColumn: 3, gridRow: 7 }} />

        {/* Spacer row 8 — empty */}

        {/* Lanthanide row (row 9), columns 3-17 */}
        {lanthanides.map((el, i) => {
          const isActive = activeCategories[el.category] !== false
          return (
            <div
              key={el.symbol}
              style={{
                gridColumn: 3 + i,
                gridRow: 9,
                opacity: isActive ? 1 : 0.15,
                pointerEvents: isActive ? undefined : 'none',
                transition: 'opacity 250ms ease',
              }}
            >
              <motion.div variants={CELL_VARIANTS} style={{ height: '100%', width: '100%' }}>
                <ElementCell
                  element={el}
                  style={{ height: '100%', width: '100%' }}
                  compact
                  isLive={!!liveTokens[el.symbol.toUpperCase()]}
                />
              </motion.div>
            </div>
          )
        })}

        {/* Actinide row (row 10), columns 3-17 */}
        {actinides.map((el, i) => {
          const isActive = activeCategories[el.category] !== false
          return (
            <div
              key={el.symbol}
              style={{
                gridColumn: 3 + i,
                gridRow: 10,
                opacity: isActive ? 1 : 0.15,
                pointerEvents: isActive ? undefined : 'none',
                transition: 'opacity 250ms ease',
              }}
            >
              <motion.div variants={CELL_VARIANTS} style={{ height: '100%', width: '100%' }}>
                <ElementCell
                  element={el}
                  style={{ height: '100%', width: '100%' }}
                  compact
                  isLive={!!liveTokens[el.symbol.toUpperCase()]}
                />
              </motion.div>
            </div>
          )
        })}

        {/* F-block row labels */}
        <div
          style={{ gridColumn: '1 / span 2', gridRow: 9 }}
          className="flex items-center justify-end pr-1 overflow-hidden"
        >
          <span
            className="font-mono text-pink-600/70 dark:text-pink-400/60 text-right leading-tight"
            style={{ fontSize: 'clamp(0.3rem, 0.55vw, 0.55rem)' }}
          >
            Lantha&shy;nides
          </span>
        </div>
        <div
          style={{ gridColumn: '1 / span 2', gridRow: 10 }}
          className="flex items-center justify-end pr-1 overflow-hidden"
        >
          <span
            className="font-mono text-indigo-600/70 dark:text-indigo-400/60 text-right leading-tight"
            style={{ fontSize: 'clamp(0.3rem, 0.55vw, 0.55rem)' }}
          >
            Acti&shy;nides
          </span>
        </div>
      </motion.div>

      {/* Legend */}
      <Legend />
    </div>
  )
}

const LEGEND_ITEMS: Array<{
  label: string
  category: ElementCategory
  cls: string
  color: string
}> = [
  {
    label: 'Alkali Metal',
    category: 'alkali-metal',
    cls: CATEGORY_COLORS['alkali-metal'].split(' ')[0],
    color: CATEGORY_SWATCH['alkali-metal'],
  },
  {
    label: 'Alkaline Earth',
    category: 'alkaline-earth',
    cls: CATEGORY_COLORS['alkaline-earth'].split(' ')[0],
    color: CATEGORY_SWATCH['alkaline-earth'],
  },
  {
    label: 'Transition Metal',
    category: 'transition-metal',
    cls: CATEGORY_COLORS['transition-metal'].split(' ')[0],
    color: CATEGORY_SWATCH['transition-metal'],
  },
  {
    label: 'Post-Transition',
    category: 'post-transition',
    cls: CATEGORY_COLORS['post-transition'].split(' ')[0],
    color: CATEGORY_SWATCH['post-transition'],
  },
  {
    label: 'Metalloid',
    category: 'metalloid',
    cls: CATEGORY_COLORS['metalloid'].split(' ')[0],
    color: CATEGORY_SWATCH['metalloid'],
  },
  {
    label: 'Non-Metal',
    category: 'non-metal',
    cls: CATEGORY_COLORS['non-metal'].split(' ')[0],
    color: CATEGORY_SWATCH['non-metal'],
  },
  {
    label: 'Halogen',
    category: 'halogen',
    cls: CATEGORY_COLORS['halogen'].split(' ')[0],
    color: CATEGORY_SWATCH['halogen'],
  },
  {
    label: 'Noble Gas',
    category: 'noble-gas',
    cls: CATEGORY_COLORS['noble-gas'].split(' ')[0],
    color: CATEGORY_SWATCH['noble-gas'],
  },
  {
    label: 'Lanthanide',
    category: 'lanthanide',
    cls: CATEGORY_COLORS['lanthanide'].split(' ')[0],
    color: CATEGORY_SWATCH['lanthanide'],
  },
  {
    label: 'Actinide',
    category: 'actinide',
    cls: CATEGORY_COLORS['actinide'].split(' ')[0],
    color: CATEGORY_SWATCH['actinide'],
  },
]

const Legend = () => {
  const { activeCategories, toggleCategory } = useStore()

  return (
    <div className="flex flex-wrap gap-2 justify-center px-4 py-3">
      {LEGEND_ITEMS.map(({ label, cls, category, color }) => (
        <label key={label} className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            className="legend-checkbox"
            style={{ '--checkbox-color': color } as React.CSSProperties}
            checked={activeCategories[category] !== false}
            onChange={() => toggleCategory(category)}
          />
          <div className={`h-3 w-3 rounded-sm ${cls}`} />
          <span className="font-mono text-[10px] text-text-muted">{label}</span>
        </label>
      ))}
    </div>
  )
}
