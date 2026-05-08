import { createConfig, EVM, executeRoute, getQuote, getRoutes, getStatus } from '@lifi/sdk'

createConfig({
  integrator: 'tokenized-elements-marketplace',
  providers: [
    EVM({
      getWalletClient: async () => {
        return (window as any).__lifiWalletClient
      },
      switchChain: async (chainId: number) => {
        return (window as any).__lifiSwitchChain(chainId)
      },
    }),
  ],
})

export { executeRoute, getQuote, getRoutes, getStatus }
