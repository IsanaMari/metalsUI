import { useAccount, useDisconnect } from 'wagmi'

export interface UseConnectReturn {
  isConnected: boolean
  address: string | undefined
  chainId: number | undefined
  status: 'connected' | 'disconnected' | 'connecting' | 'reconnecting'
  disconnect: () => void
}

export const useConnect = (): UseConnectReturn => {
  const { address, chainId, status, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  return { isConnected, address, chainId, status, disconnect }
}
