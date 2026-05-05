import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AnimatePresence, motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'

import { Button, Card, Input } from '@/components'
import { PeriodicTable } from '@/components/PeriodicTable'
import { CATEGORY_COLORS, CATEGORY_LABELS, ROUTES } from '@/constants/config'
import { ELEMENTS } from '@/constants/elements'
import { useStore } from '@/store/useStore'
import type { ElementCategory } from '@/types/element'

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as ElementCategory[]

const formatPrice = (price: number): string => {
  if (price <= 0) return 'Not listed'
  if (price >= 1000) return `$${(price / 1000).toFixed(1)}k/g`
  if (price >= 1) return `$${price.toFixed(2)}/g`
  return `$${price.toFixed(4)}/g`
}

export const TablePage = () => {
  const navigate = useNavigate()
  const { searchQuery, selectedCategory, setSearchQuery, setSelectedCategory, clearFilters } =
    useStore()
  const [showFilters, setShowFilters] = useState(false)

  const filteredElements = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return ELEMENTS.filter((el) => {
      const matchesSearch =
        !q ||
        el.name.toLowerCase().includes(q) ||
        el.symbol.toLowerCase().includes(q) ||
        String(el.atomicNumber).includes(q)
      const matchesCategory = !selectedCategory || el.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  const hasFilters = !!searchQuery || !!selectedCategory

  return (
    <div>
      {/* Page header */}
      <div className="border-b border-border bg-surface/50 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-screen-2xl">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-2xl font-bold text-text-primary sm:text-3xl"
          >
            Elements Marketplace
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-1 font-mono text-sm text-text-muted"
          >
            {ELEMENTS.filter((e) => e.pricePerGram > 0).length} elements listed · {ELEMENTS.length}{' '}
            total in the periodic table
          </motion.p>
        </div>
      </div>

      {/* Controls */}
      <div className="sticky top-[57px] z-30 border-b border-border bg-background/95 backdrop-blur-sm px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-screen-2xl flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-xs">
            <Input
              placeholder="Search element, symbol or number…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefix={<Search size={14} />}
              suffix={
                searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-text-muted hover:text-text-primary"
                  >
                    <X size={12} />
                  </button>
                ) : null
              }
            />
          </div>

          <Button
            variant={showFilters ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal size={13} />
            Filters {selectedCategory ? '(1)' : ''}
          </Button>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X size={12} />
              Clear
            </Button>
          )}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mx-auto max-w-screen-2xl flex flex-wrap gap-2 pt-3">
                {ALL_CATEGORIES.map((cat) => {
                  const colorBase = CATEGORY_COLORS[cat].split(' ')[0]
                  const isSelected = selectedCategory === cat
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(isSelected ? null : cat)}
                      className={[
                        'rounded-full border px-3 py-1 font-mono text-xs transition-all duration-150',
                        isSelected
                          ? `${colorBase} border-current opacity-100`
                          : 'border-border text-text-muted hover:border-accent/40 hover:text-text-primary opacity-70 hover:opacity-100',
                      ].join(' ')}
                    >
                      {CATEGORY_LABELS[cat]}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop: periodic table — hidden on mobile, full-bleed */}
      <div className="hidden md:block">
        {hasFilters ? (
          <p className="font-mono text-xs text-text-muted px-6 pt-4 pb-2">
            Showing {filteredElements.length} element{filteredElements.length !== 1 ? 's' : ''} ·{' '}
            <button className="text-accent hover:underline" onClick={clearFilters}>
              Clear filters to see full table
            </button>
          </p>
        ) : null}
        <PeriodicTable elements={hasFilters ? filteredElements : ELEMENTS} />
      </div>

      {/* Mobile: card list — always visible on small screens */}
      <div className="md:hidden px-4 py-4">
        <p className="font-mono text-xs text-text-muted mb-4">
          {filteredElements.length} element{filteredElements.length !== 1 ? 's' : ''}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredElements.map((el, i) => (
              <motion.div
                key={el.symbol}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
              >
                <Card
                  hoverable
                  onClick={() => navigate(ROUTES.elementDetail(el.symbol))}
                  className={[
                    'flex flex-col items-center gap-1 py-4 text-center',
                    el.pricePerGram === 0 ? 'opacity-50' : '',
                  ].join(' ')}
                >
                  <span className="font-mono text-xs text-text-muted">{el.atomicNumber}</span>
                  <span
                    className={[
                      'font-mono text-2xl font-bold',
                      CATEGORY_COLORS[el.category].split(' ')[2],
                    ].join(' ')}
                  >
                    {el.symbol}
                  </span>
                  <span className="font-mono text-xs text-text-muted truncate max-w-full px-1">
                    {el.name}
                  </span>
                  <span className="font-mono text-xs text-gold">
                    {formatPrice(el.pricePerGram)}
                  </span>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {filteredElements.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-mono text-text-muted">No elements match your search.</p>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-3">
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
