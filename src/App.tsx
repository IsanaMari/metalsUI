import { Route, Routes } from 'react-router-dom'

import { AnimatePresence } from 'framer-motion'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { ROUTES } from '@/constants/config'
import { ElementDetailPage } from '@/pages/ElementDetail'
import { TablePage } from '@/pages/Table'

export const App = () => (
  <div className="flex min-h-screen flex-col bg-background text-text-primary">
    <Header />
    <main className="flex-1">
      <AnimatePresence mode="wait">
        <Routes>
          <Route path={ROUTES.TABLE} element={<TablePage />} />
          <Route path={ROUTES.ELEMENT_DETAIL} element={<ElementDetailPage />} />
          <Route path="*" element={<TablePage />} />
        </Routes>
      </AnimatePresence>
    </main>
    <Footer />
  </div>
)
