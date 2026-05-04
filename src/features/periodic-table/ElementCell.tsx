import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import type { ChemicalElement } from '@/types';
import { CATEGORY_COLORS, ROUTES } from '@/constants/config';

interface ElementCellProps {
  element: ChemicalElement;
  style?: React.CSSProperties;
  compact?: boolean;
}

const formatPrice = (price: number): string => {
  if (price >= 1000) return `$${(price / 1000).toFixed(1)}k`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.001) return `$${price.toFixed(3)}`;
  return `$${price.toFixed(4)}`;
};

export const ElementCell = ({ element, style, compact = false }: ElementCellProps) => {
  const navigate = useNavigate();
  const isListed = element.pricePerGram > 0;
  const colorClass = CATEGORY_COLORS[element.category];

  return (
    <motion.button
      style={style}
      onClick={() => navigate(ROUTES.elementDetail(element.symbol))}
      whileHover={isListed ? { scale: 1.08, zIndex: 10 } : { scale: 1.04, zIndex: 5 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className={[
        'relative flex flex-col items-center justify-center rounded border text-center',
        'transition-colors duration-150 outline-none',
        'focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
        compact ? 'p-0.5 gap-0 h-full w-full' : 'p-1 gap-0',
        colorClass,
        isListed
          ? 'opacity-100 cursor-pointer'
          : 'opacity-40 cursor-pointer hover:opacity-60',
      ].join(' ')}
      title={`${element.name} (${element.symbol}) — ${isListed ? formatPrice(element.pricePerGram) + '/g' : 'Not listed'}`}
      aria-label={`${element.name}`}
    >
      {/* Atomic number */}
      <span
        className={[
          'font-mono leading-none text-current opacity-70',
          compact ? 'text-[6px]' : 'text-[8px]',
        ].join(' ')}
      >
        {element.atomicNumber}
      </span>

      {/* Symbol */}
      <span
        className={[
          'font-mono font-bold leading-none text-current',
          compact ? 'text-[10px]' : 'text-sm',
        ].join(' ')}
      >
        {element.symbol}
      </span>

      {/* Name */}
      {!compact && (
        <span className="max-w-full truncate font-mono text-[7px] leading-none text-current opacity-70">
          {element.name}
        </span>
      )}

      {/* Price or lock */}
      {!compact && (
        <span className="flex items-center gap-0.5 font-mono leading-none text-current">
          {isListed ? (
            <span className="text-[7px] text-gold/90">{formatPrice(element.pricePerGram)}</span>
          ) : (
            <Lock size={6} className="opacity-50" />
          )}
        </span>
      )}
    </motion.button>
  );
};
