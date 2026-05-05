import { Link, Navigate, useParams } from 'react-router-dom'

import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

import { ElementDetails } from '@/components/ElementDetails'
import { PurchasePanel } from '@/components/PurchasePanel'
import { ROUTES } from '@/constants/config'
import { useElement } from '@/hooks/useElement'

const PAGE_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
}

export const ElementDetailPage = () => {
  const { symbol } = useParams<{ symbol: string }>()
  const element = useElement(symbol)

  if (!element) {
    return <Navigate to={ROUTES.TABLE} replace />
  }

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
          <PurchasePanel element={element} />
        </div>
      </div>
    </motion.div>
  )
}
