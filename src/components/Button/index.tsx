import { forwardRef } from 'react'

import { motion } from 'framer-motion'

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-accent hover:bg-accent-hover text-slate-50 border border-accent/50 hover:border-accent shadow-lg shadow-accent/20',
  secondary:
    'bg-surface-2 hover:bg-border text-text-primary border border-border hover:border-accent/40',
  ghost:
    'bg-transparent hover:bg-surface-2 text-text-muted hover:text-text-primary border border-transparent hover:border-border',
  gold: 'bg-gold/10 hover:bg-gold/20 text-gold border border-gold/40 hover:border-gold/70 shadow-lg shadow-gold/10',
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      // motion.div wrapper avoids the onAnimationStart type conflict between
      // Framer Motion's AnimationDefinition and React's AnimationEvent
      <motion.div
        whileTap={{ scale: isDisabled ? 1 : 0.97 }}
        whileHover={{ scale: isDisabled ? 1 : 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        style={{ display: 'inline-flex' }}
        className={fullWidth ? 'w-full' : ''}
      >
        <button
          ref={ref}
          disabled={isDisabled}
          className={[
            'relative inline-flex w-full items-center justify-center gap-2 rounded-lg font-mono font-medium',
            'transition-colors duration-150 outline-none',
            'focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            VARIANT_CLASSES[variant],
            SIZE_CLASSES[size],
            className,
          ].join(' ')}
          {...rest}
        >
          {loading && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </span>
          )}
          <span className={loading ? 'invisible' : ''}>{children}</span>
        </button>
      </motion.div>
    )
  }
)

Button.displayName = 'Button'
