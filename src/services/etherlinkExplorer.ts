import type { TokenHolder, TokenInfo, TokenListItem, TokenTransfer } from '@/types/token'

const BASE = 'https://explorer.etherlink.com/api/v2'
const TIMEOUT_MS = 10_000

async function fetchWithTimeout<T>(url: string): Promise<T | null> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  } finally {
    clearTimeout(id)
  }
}

export async function fetchTokenInfo(address: string): Promise<TokenInfo | null> {
  const data = await fetchWithTimeout<Record<string, unknown>>(`${BASE}/tokens/${address}`)
  if (!data) return null
  return {
    address,
    name: String(data.name ?? ''),
    symbol: String(data.symbol ?? ''),
    decimals: Number(data.decimals ?? 18),
    totalSupply: String(data.total_supply ?? '0'),
    holders: Number(data.holders_count ?? 0),
    priceUsd: data.exchange_rate ? Number(data.exchange_rate) : null,
    volume24h: null,
    marketCap: data.circulating_market_cap ? Number(data.circulating_market_cap) : null,
  }
}

export async function fetchAllTokens(): Promise<TokenListItem[]> {
  const data = await fetchWithTimeout<{ items: Record<string, unknown>[] }>(
    `${BASE}/tokens?type=ERC-20`
  )
  if (!data?.items) return []
  return data.items.map((item) => ({
    address: String((item.address as Record<string, unknown>)?.hash ?? item.address ?? ''),
    symbol: String(item.symbol ?? ''),
    name: String(item.name ?? ''),
    decimals: Number(item.decimals ?? 18),
    totalSupply: String(item.total_supply ?? '0'),
  }))
}

export async function fetchTokenTransfers(address: string): Promise<TokenTransfer[]> {
  const data = await fetchWithTimeout<{ items: Record<string, unknown>[] }>(
    `${BASE}/tokens/${address}/transfers?limit=10`
  )
  if (!data?.items) return []
  return data.items.map((item) => {
    const from = item.from as Record<string, unknown>
    const to = item.to as Record<string, unknown>
    const total = item.total as Record<string, unknown>
    return {
      txHash: String(item.tx_hash ?? ''),
      from: String(from?.hash ?? ''),
      to: String(to?.hash ?? ''),
      amount: String(total?.value ?? '0'),
      timestamp: String(item.timestamp ?? ''),
    }
  })
}

export async function fetchTokenHolders(address: string): Promise<TokenHolder[]> {
  const data = await fetchWithTimeout<{ items: Record<string, unknown>[] }>(
    `${BASE}/tokens/${address}/holders?limit=10`
  )
  if (!data?.items) return []
  return data.items.map((item, i) => {
    const addr = item.address as Record<string, unknown>
    return {
      address: String(addr?.hash ?? ''),
      amount: String(item.value ?? '0'),
      percentage: Number(item.percentage ?? 0),
      rank: i + 1,
    }
  })
}
