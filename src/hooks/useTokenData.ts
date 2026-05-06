import { useCallback, useEffect, useState } from 'react'

import { formatEther, parseEther } from 'viem'
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

import { ERC20_ABI, MARKETPLACE_ABI } from '@/constants/abis'
import { isSupportedChain } from '@/constants/chains'
import { CONTRACT_ADDRESSES, URANIUM_TOKEN_ADDRESS, ZERO_ADDRESS } from '@/constants/contracts'
import { useConnect } from '@/hooks/useConnect'
import {
  fetchAllTokens,
  fetchTokenHolders,
  fetchTokenInfo,
  fetchTokenTransfers,
} from '@/services/etherlinkExplorer'
import type { TokenHolder, TokenInfo, TokenTransfer } from '@/types/token'

const isUserRejection = (err: unknown): boolean => {
  if (!err) return false
  const msg = ((err as Error).message ?? '').toLowerCase()
  // MetaMask / most wallets surface rejection as "user rejected" or error code 4001
  return (
    msg.includes('user rejected') ||
    msg.includes('user denied') ||
    (err as { cause?: { code?: number } }).cause?.code === 4001
  )
}

// ── Price read ────────────────────────────────────────────────────────────────

export const useElementTokenPrice = (symbol: string): number | undefined => {
  const { chainId, isConnected } = useConnect()
  const addresses = chainId !== undefined ? CONTRACT_ADDRESSES[chainId] : undefined
  const isPlaceholder = !addresses || addresses.marketplace === ZERO_ADDRESS

  const { data } = useReadContract({
    address: addresses?.marketplace,
    abi: MARKETPLACE_ABI,
    functionName: 'getPrice',
    args: [symbol],
    query: {
      // Only fetch when connected, on a supported chain, with a real contract address
      enabled: isConnected && !isPlaceholder && chainId !== undefined && isSupportedChain(chainId),
    },
  })

  if (isPlaceholder || data === undefined) return undefined
  return Number(formatEther(data as bigint))
}

// ── Balance read ──────────────────────────────────────────────────────────────

export const useElementTokenBalance = (userAddress: string): bigint | undefined => {
  const { chainId, isConnected } = useConnect()
  const addresses = chainId !== undefined ? CONTRACT_ADDRESSES[chainId] : undefined
  const isPlaceholder = !addresses || addresses.token === ZERO_ADDRESS

  const { data } = useReadContract({
    address: addresses?.token,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [userAddress as `0x${string}`],
    query: {
      enabled:
        isConnected &&
        !isPlaceholder &&
        !!userAddress &&
        chainId !== undefined &&
        isSupportedChain(chainId),
    },
  })

  return data as bigint | undefined
}

// ── Purchase write ────────────────────────────────────────────────────────────

export interface UsePurchaseElementReturn {
  purchase: (symbol: string, amount: number) => void
  isPending: boolean
  isSuccess: boolean
  isError: boolean
  isUserRejected: boolean
  error: Error | null
  txHash: string | undefined
}

export const usePurchaseElement = (): UsePurchaseElementReturn => {
  const { chainId, isConnected } = useConnect()

  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    isError: isWriteError,
    error: writeError,
    reset,
  } = useWriteContract()

  const {
    isLoading: isReceiptLoading,
    isSuccess: isMined,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  })

  const rawError = isWriteError ? writeError : isReceiptError ? receiptError : null
  const userRejected = isUserRejection(rawError)

  const purchase = useCallback(
    (symbol: string, amountGrams: number) => {
      if (!isConnected || chainId === undefined || !isSupportedChain(chainId)) return

      const addresses = CONTRACT_ADDRESSES[chainId]
      if (!addresses || addresses.marketplace === ZERO_ADDRESS) {
        // TODO: Contract not yet deployed on this network — wire up real addresses in contracts.ts
        return
      }

      reset()

      const amountWei = parseEther(amountGrams.toFixed(6) as `${number}`)

      writeContract({
        address: addresses.marketplace,
        abi: MARKETPLACE_ABI,
        functionName: 'buyElement',
        args: [symbol, amountWei],
      })
    },
    [chainId, isConnected, reset, writeContract]
  )

  return {
    purchase,
    isPending: isWritePending || isReceiptLoading,
    isSuccess: isMined,
    isError: (isWriteError || isReceiptError) && !userRejected,
    isUserRejected: userRejected,
    error: rawError && !userRejected ? (rawError as Error) : null,
    txHash: txHash as string | undefined,
  }
}

// ── Etherlink live data ───────────────────────────────────────────────────────

export const useTokenInfo = (address: string | undefined): TokenInfo | null => {
  const [data, setData] = useState<TokenInfo | null>(null)

  useEffect(() => {
    if (!address) return
    let cancelled = false
    const load = () =>
      fetchTokenInfo(address).then((d) => {
        if (!cancelled && d) setData(d)
      })
    load()
    const id = setInterval(load, 60_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [address])

  return data
}

export const useUraniumTokenData = (): TokenInfo | null => useTokenInfo(URANIUM_TOKEN_ADDRESS)

// Returns { symbol → address } for all ERC-20 tokens on Etherlink, always includes Uranium
export const useAllEtherlinkTokens = (): Record<string, string> => {
  const [tokens, setTokens] = useState<Record<string, string>>({
    U: URANIUM_TOKEN_ADDRESS,
  })

  useEffect(() => {
    fetchAllTokens().then((list) => {
      const map: Record<string, string> = { U: URANIUM_TOKEN_ADDRESS }
      list.forEach((t) => {
        if (t.symbol && t.address) map[t.symbol.toUpperCase()] = t.address
      })
      setTokens(map)
    })
  }, [])

  return tokens
}

export const useTokenTransfers = (address: string | undefined): TokenTransfer[] => {
  const [transfers, setTransfers] = useState<TokenTransfer[]>([])

  useEffect(() => {
    if (!address) return
    fetchTokenTransfers(address).then(setTransfers)
  }, [address])

  return transfers
}

export const useTokenHolders = (address: string | undefined): TokenHolder[] => {
  const [holders, setHolders] = useState<TokenHolder[]>([])

  useEffect(() => {
    if (!address) return
    fetchTokenHolders(address).then(setHolders)
  }, [address])

  return holders
}
