import { create } from 'zustand';
import type { UseConnectReturn } from '@/types/element';
import { MOCK_WALLET_ADDRESS } from '@/constants/config';

// Internal Zustand store — private to this module. Swap the internals for
// wagmi's useAccount/useConnect without touching any consuming component.
interface WalletStore {
  isConnected: boolean;
  address: string | null;
  connect: () => void;
  disconnect: () => void;
}

const useWalletStore = create<WalletStore>((set) => ({
  isConnected: false,
  address: null,
  connect: () =>
    set({ isConnected: true, address: MOCK_WALLET_ADDRESS }),
  disconnect: () =>
    set({ isConnected: false, address: null }),
}));

export const useConnect = (): UseConnectReturn => useWalletStore();
