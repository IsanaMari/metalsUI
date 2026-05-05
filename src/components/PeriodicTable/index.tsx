import { useMemo } from 'react'

import { motion } from 'framer-motion'

import { ElementCell } from '@/components/ElementCell'
import { CATEGORY_COLORS } from '@/constants/config'
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

// 57px site header + 97px page-header section + 62px controls bar = 216px
const GRID_HEIGHT = 'calc(100vh - 216px)'

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

  return (
    <div className="w-full">
      {/* ── Full-bleed responsive grid ── */}
      <motion.div
        variants={CONTAINER_VARIANTS}
        initial="hidden"
        animate="visible"
        style={{
          display: 'grid',
          width: '100%',
          height: GRID_HEIGHT,
          // 18 equal columns — fills 100% viewport width
          gridTemplateColumns: 'repeat(18, 1fr)',
          // 7 main rows | 6px spacer | 2 f-block rows (slightly shorter)
          gridTemplateRows: 'repeat(7, 1fr) 6px repeat(2, 0.8fr)',
          gap: '1px',
        }}
      >
        {/* Main table elements */}
        {mainElements.map((el) => (
          <motion.div
            key={el.symbol}
            variants={CELL_VARIANTS}
            style={{ gridColumn: el.group, gridRow: el.period }}
          >
            <ElementCell element={el} style={{ height: '100%', width: '100%' }} />
          </motion.div>
        ))}

        {/* Lanthanide placeholder in main grid (period 6 col 3) */}
        <FBlockPlaceholder label="57–71" style={{ gridColumn: 3, gridRow: 6 }} />

        {/* Actinide placeholder in main grid (period 7 col 3) */}
        <FBlockPlaceholder label="89–103" style={{ gridColumn: 3, gridRow: 7 }} />

        {/* Spacer row 8 — empty */}

        {/* Lanthanide row (row 9), columns 3-17 */}
        {lanthanides.map((el, i) => (
          <motion.div
            key={el.symbol}
            variants={CELL_VARIANTS}
            style={{ gridColumn: 3 + i, gridRow: 9 }}
          >
            <ElementCell element={el} style={{ height: '100%', width: '100%' }} compact />
          </motion.div>
        ))}

        {/* Actinide row (row 10), columns 3-17 */}
        {actinides.map((el, i) => (
          <motion.div
            key={el.symbol}
            variants={CELL_VARIANTS}
            style={{ gridColumn: 3 + i, gridRow: 10 }}
          >
            <ElementCell element={el} style={{ height: '100%', width: '100%' }} compact />
          </motion.div>
        ))}

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

const LEGEND_ITEMS: Array<{ label: string; cls: string }> = [
  { label: 'Alkali Metal', cls: CATEGORY_COLORS['alkali-metal'].split(' ')[0] },
  { label: 'Alkaline Earth', cls: CATEGORY_COLORS['alkaline-earth'].split(' ')[0] },
  { label: 'Transition Metal', cls: CATEGORY_COLORS['transition-metal'].split(' ')[0] },
  { label: 'Post-Transition', cls: CATEGORY_COLORS['post-transition'].split(' ')[0] },
  { label: 'Metalloid', cls: CATEGORY_COLORS['metalloid'].split(' ')[0] },
  { label: 'Non-Metal', cls: CATEGORY_COLORS['non-metal'].split(' ')[0] },
  { label: 'Halogen', cls: CATEGORY_COLORS['halogen'].split(' ')[0] },
  { label: 'Noble Gas', cls: CATEGORY_COLORS['noble-gas'].split(' ')[0] },
  { label: 'Lanthanide', cls: CATEGORY_COLORS['lanthanide'].split(' ')[0] },
  { label: 'Actinide', cls: CATEGORY_COLORS['actinide'].split(' ')[0] },
]

const Legend = () => (
  <div className="flex flex-wrap gap-2 justify-center px-4 py-3">
    {LEGEND_ITEMS.map(({ label, cls }) => (
      <div key={label} className="flex items-center gap-1.5">
        <div className={`h-3 w-3 rounded-sm ${cls}`} />
        <span className="font-mono text-[10px] text-text-muted">{label}</span>
      </div>
    ))}
  </div>
)
