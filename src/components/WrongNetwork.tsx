import { AlertTriangle } from 'lucide-react'
import { useSwitchChain } from 'wagmi'

import { Button } from '@/components'
import { isSupportedChain } from '@/constants/chains'
import { useConnect } from '@/hooks/useConnect'

export const WrongNetwork = () => {
  const { isConnected, chainId } = useConnect()
  const { switchChain } = useSwitchChain()

  if (!isConnected || chainId === undefined || isSupportedChain(chainId)) return null

  return (
    <div
      className="sticky top-[57px] z-20 flex items-center justify-between gap-4 border-b px-4 py-2.5 sm:px-6"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'color-mix(in srgb, var(--color-background) 90%, transparent)',
      }}
    >
      <div
        className="flex items-center gap-2 font-mono text-xs"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <AlertTriangle size={14} />
        Please switch to a supported network
      </div>
      <Button variant="secondary" size="sm" onClick={() => switchChain({ chainId: 1 })}>
        Switch Network
      </Button>
    </div>
  )
}
