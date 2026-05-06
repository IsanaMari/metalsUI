import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'

import { App } from './App'
import { ThemeProvider } from './hooks/useTheme'
import { Web3Provider } from './providers/Web3Provider'

import '@rainbow-me/rainbowkit/styles.css'
import './index.css'
import './styles/index.scss'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

// ThemeProvider must wrap Web3Provider because Web3Provider reads isDark
// to pass the correct RainbowKit theme (darkTheme / lightTheme).
createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <Web3Provider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Web3Provider>
    </ThemeProvider>
  </StrictMode>
)
