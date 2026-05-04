import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ChemicalElement } from '@/types';
import { CATEGORY_COLORS } from '@/constants/config';
import { ElementCell } from './ElementCell';

interface PeriodicTableProps {
  elements: ChemicalElement[];
}

// Placeholder cell for lanthanide / actinide series in the main grid
interface PlaceholderProps {
  label: string;
  style: React.CSSProperties;
}

const FBlockPlaceholder = ({ label, style }: PlaceholderProps) => (
  <div
    style={style}
    className="flex items-center justify-center rounded border border-dashed border-text-muted/20 bg-surface-2/30 text-[8px] font-mono text-text-muted/50 cursor-default"
  >
    {label}
  </div>
);

const CONTAINER_VARIANTS = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.004, delayChildren: 0.05 },
  },
};

const CELL_VARIANTS = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
};

export const PeriodicTable = ({ elements }: PeriodicTableProps) => {
  const { mainElements, lanthanides, actinides } = useMemo(() => {
    const main = elements
      .filter((el) => el.group > 0)
      .sort((a, b) => a.atomicNumber - b.atomicNumber);

    const lans = elements
      .filter((el) => el.group === 0 && el.period === 6)
      .sort((a, b) => a.atomicNumber - b.atomicNumber);

    const acts = elements
      .filter((el) => el.group === 0 && el.period === 7)
      .sort((a, b) => a.atomicNumber - b.atomicNumber);

    return { mainElements: main, lanthanides: lans, actinides: acts };
  }, [elements]);

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="inline-block min-w-max px-2">
        {/* ── Main table grid: 18 cols × rows 1-7, then spacer (8), f-block (9-10) ── */}
        <motion.div
          variants={CONTAINER_VARIANTS}
          initial="hidden"
          animate="visible"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(18, 62px)',
            gridTemplateRows: 'repeat(7, 70px) 16px repeat(2, 60px)',
            gap: '3px',
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

          {/* Lanthanide placeholder in main grid */}
          <FBlockPlaceholder
            label="57–71"
            style={{ gridColumn: 3, gridRow: 6 }}
          />

          {/* Actinide placeholder in main grid */}
          <FBlockPlaceholder
            label="89–103"
            style={{ gridColumn: 3, gridRow: 7 }}
          />

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
            className="flex items-center justify-end pr-1"
          >
            <span className="text-[9px] font-mono text-pink-600/70 dark:text-pink-400/60 text-right leading-tight">
              Lantha&shy;nides
            </span>
          </div>
          <div
            style={{ gridColumn: '1 / span 2', gridRow: 10 }}
            className="flex items-center justify-end pr-1"
          >
            <span className="text-[9px] font-mono text-indigo-600/70 dark:text-indigo-400/60 text-right leading-tight">
              Acti&shy;nides
            </span>
          </div>
        </motion.div>

        {/* Legend */}
        <Legend />
      </div>
    </div>
  );
};

const LEGEND_ITEMS: Array<{ label: string; cls: string }> = [
  { label: 'Alkali Metal',       cls: CATEGORY_COLORS['alkali-metal'].split(' ')[0] },
  { label: 'Alkaline Earth',     cls: CATEGORY_COLORS['alkaline-earth'].split(' ')[0] },
  { label: 'Transition Metal',   cls: CATEGORY_COLORS['transition-metal'].split(' ')[0] },
  { label: 'Post-Transition',    cls: CATEGORY_COLORS['post-transition'].split(' ')[0] },
  { label: 'Metalloid',          cls: CATEGORY_COLORS['metalloid'].split(' ')[0] },
  { label: 'Non-Metal',          cls: CATEGORY_COLORS['non-metal'].split(' ')[0] },
  { label: 'Halogen',            cls: CATEGORY_COLORS['halogen'].split(' ')[0] },
  { label: 'Noble Gas',          cls: CATEGORY_COLORS['noble-gas'].split(' ')[0] },
  { label: 'Lanthanide',         cls: CATEGORY_COLORS['lanthanide'].split(' ')[0] },
  { label: 'Actinide',           cls: CATEGORY_COLORS['actinide'].split(' ')[0] },
];

const Legend = () => (
  <div className="mt-6 flex flex-wrap gap-2 justify-center">
    {LEGEND_ITEMS.map(({ label, cls }) => (
      <div key={label} className="flex items-center gap-1.5">
        <div className={`h-3 w-3 rounded-sm ${cls}`} />
        <span className="font-mono text-[10px] text-text-muted">{label}</span>
      </div>
    ))}
  </div>
);
