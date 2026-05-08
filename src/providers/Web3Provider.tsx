import { useEffect } from 'react'

import { darkTheme, getDefaultConfig, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useConnectorClient, useSwitchChain, WagmiProvider } from 'wagmi'
import { arbitrum, mainnet, optimism, polygon } from 'wagmi/chains'

import { etherlink } from '@/constants/chains'
import { useTheme } from '@/hooks/useTheme'

// TODO: Get a free projectId at https://cloud.walletconnect.com — replace the fallback value
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? 'demo-project-id-replace-me'

const config = getDefaultConfig({
  appName: 'Tokenized Elements',
  projectId,
  chains: [etherlink, mainnet, polygon, arbitrum, optimism],
  ssr: true,
})

// Created outside the component so it is stable across renders.
// staleTime: 5 min cache for contract reads — avoids redundant RPC calls.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5 },
  },
})

// Bridges the wagmi wallet client into LI.FI's global injection points.
// Must live inside WagmiProvider (needs wagmi hooks) but outside RainbowKit.
const WalletClientSync = () => {
  const { data: walletClient } = useConnectorClient()
  const { switchChainAsync } = useSwitchChain()

  useEffect(() => {
    if (walletClient) {
      ;(window as any).__lifiWalletClient = walletClient
    }
    ;(window as any).__lifiSwitchChain = async (chainId: number) => {
      await switchChainAsync({ chainId })
    }
  }, [walletClient, switchChainAsync])

  return null
}

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const { isDark } = useTheme()

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletClientSync />
        <RainbowKitProvider theme={isDark ? darkTheme() : lightTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
