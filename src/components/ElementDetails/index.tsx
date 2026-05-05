import { motion } from 'framer-motion'
import { Atom, FileText, Grid, Hash, Tag, Weight } from 'lucide-react'

import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/constants/config'
import type { ChemicalElement } from '@/types/element'

interface ElementDetailsProps {
  element: ChemicalElement
}

const STAT_VARIANTS = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.07, type: 'spring', stiffness: 280, damping: 22 },
  }),
}

interface StatRowProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  index: number
}

const StatRow = ({ icon, label, value, index }: StatRowProps) => (
  <motion.div
    custom={index}
    variants={STAT_VARIANTS}
    initial="hidden"
    animate="visible"
    className="flex items-start gap-3 rounded-lg border border-border bg-surface-2/50 px-4 py-3"
  >
    <span className="mt-0.5 shrink-0 text-accent/70">{icon}</span>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-text-muted uppercase tracking-wider mb-0.5">{label}</p>
      <p className="font-mono text-sm font-medium text-text-primary break-all">{value}</p>
    </div>
  </motion.div>
)

export const ElementDetails = ({ element }: ElementDetailsProps) => {
  const categoryColorClass = CATEGORY_COLORS[element.category]
  const categoryLabel = CATEGORY_LABELS[element.category]

  return (
    <div className="flex flex-col gap-4">
      {/* Hero symbol block */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 250, damping: 22 }}
        className={[
          'flex flex-col items-center justify-center rounded-2xl border py-10 gap-1',
          categoryColorClass
            .split(' ')
            .filter((c) => !c.startsWith('hover:'))
            .join(' '),
        ].join(' ')}
      >
        <span className="font-mono text-xs text-current opacity-60">{element.atomicNumber}</span>
        <span className="font-mono text-7xl font-bold leading-none text-current">
          {element.symbol}
        </span>
        <span className="font-mono text-lg text-current opacity-80">{element.name}</span>
        <span
          className={[
            'mt-2 rounded-full border px-3 py-0.5 font-mono text-xs',
            categoryColorClass.split(' ').slice(0, 3).join(' '),
          ].join(' ')}
        >
          {categoryLabel}
        </span>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <StatRow
          index={0}
          icon={<Hash size={15} />}
          label="Atomic Number"
          value={element.atomicNumber}
        />
        <StatRow
          index={1}
          icon={<Weight size={15} />}
          label="Atomic Mass"
          value={`${element.atomicMass} u`}
        />
        <StatRow
          index={2}
          icon={<Grid size={15} />}
          label="Period / Group"
          value={
            element.group === 0
              ? `Period ${element.period} — f-block`
              : `Period ${element.period}, Group ${element.group}`
          }
        />
        <StatRow index={3} icon={<Tag size={15} />} label="Category" value={categoryLabel} />
        <StatRow index={4} icon={<Atom size={15} />} label="Symbol" value={element.symbol} />
      </div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="rounded-xl border border-border bg-surface-2/50 p-4"
      >
        <div className="mb-2 flex items-center gap-2 text-text-muted">
          <FileText size={14} />
          <span className="font-mono text-xs uppercase tracking-wider">Overview</span>
        </div>
        <p className="font-mono text-sm leading-relaxed text-text-primary/90">
          {element.description || 'No description available for this element.'}
        </p>
      </motion.div>
    </div>
  )
}
