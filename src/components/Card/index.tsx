import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
  onClick?: () => void
}

export const Card = ({ children, className = '', hoverable = false, onClick }: CardProps) => {
  if (hoverable) {
    return (
      <motion.div
        onClick={onClick}
        whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(124, 58, 237, 0.15)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={[
          'rounded-xl border border-border bg-surface p-4 cursor-pointer',
          className,
        ].join(' ')}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={[
        'rounded-xl border border-border bg-surface p-4',
        onClick ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}
