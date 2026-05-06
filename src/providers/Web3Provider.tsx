import { darkTheme, getDefaultConfig, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { arbitrum, mainnet, optimism, polygon } from 'wagmi/chains'

import { useTheme } from '@/hooks/useTheme'

// TODO: Replace with a real WalletConnect project ID from https://cloud.walletconnect.com
const config = getDefaultConfig({
  appName: 'Tokenized Elements',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [mainnet, polygon, arbitrum, optimism],
  ssr: true,
})

// Created outside the component so it is stable across renders.
// staleTime: 5 min cache for contract reads — avoids redundant RPC calls.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5 },
  },
})

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const { isDark } = useTheme()

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={isDark ? darkTheme() : lightTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
