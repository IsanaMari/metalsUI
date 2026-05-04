import { useState, useCallback } from 'react';
import Decimal from 'decimal.js';
import { motion } from 'framer-motion';
import { ShoppingCart, Wallet, TrendingUp, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import type { ChemicalElement } from '@/types';
import { useConnect } from '@/hooks/useConnect';
import { Button, Input } from '@/components';
import { MAX_QUANTITY, MIN_QUANTITY, QUANTITY_STEP } from '@/constants/config';

interface PurchasePanelProps {
  element: ChemicalElement;
}

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_EVEN });

const computeTotal = (price: number, qty: string): string => {
  try {
    const d = new Decimal(qty);
    if (d.isNaN() || d.lte(0)) return '0.00';
    return new Decimal(price).mul(d).toFixed(2);
  } catch {
    return '0.00';
  }
};

const PANEL_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 22, delay: 0.1 },
  },
};

export const PurchasePanel = ({ element }: PurchasePanelProps) => {
  const { isConnected, connect } = useConnect();
  const [quantity, setQuantity] = useState('1');
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const isListed = element.pricePerGram > 0;
  const total = computeTotal(element.pricePerGram, quantity);

  const quantityError = (() => {
    const n = parseFloat(quantity);
    if (isNaN(n)) return 'Enter a valid number';
    if (n < parseFloat(MIN_QUANTITY)) return `Minimum is ${MIN_QUANTITY} g`;
    if (n > parseFloat(MAX_QUANTITY)) return `Maximum is ${MAX_QUANTITY} g`;
    return undefined;
  })();

  const handleBuy = useCallback(() => {
    if (!isConnected || quantityError || !isListed) return;
    // Placeholder — swap for on-chain tx
    setPurchaseSuccess(true);
    setTimeout(() => setPurchaseSuccess(false), 3000);
  }, [isConnected, quantityError, isListed]);

  return (
    <motion.div
      variants={PANEL_VARIANTS}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-4"
    >
      {/* Price header */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="font-mono text-xs uppercase tracking-wider text-text-muted mb-1">
          Token Price
        </p>
        {isListed ? (
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-gold">
              ${element.pricePerGram.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </span>
            <span className="font-mono text-sm text-text-muted">/ gram</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-text-muted">
            <Lock size={16} />
            <span className="font-mono text-lg">Not Listed</span>
          </div>
        )}

        {isListed && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-green-400/80">
            <TrendingUp size={12} />
            <span className="font-mono">Live market data · Updated every block</span>
          </div>
        )}
      </div>

      {isListed ? (
        <>
          {/* Quantity input */}
          <div className="rounded-xl border border-border bg-surface p-5 flex flex-col gap-4">
            <Input
              label="Quantity (grams)"
              type="number"
              value={quantity}
              min={MIN_QUANTITY}
              max={MAX_QUANTITY}
              step={QUANTITY_STEP}
              onChange={(e) => setQuantity(e.target.value)}
              suffix="g"
              error={quantityError}
              hint={`Min ${MIN_QUANTITY} g — Max ${MAX_QUANTITY} g`}
            />

            {/* Total */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-4 py-3">
              <span className="font-mono text-sm text-text-muted">Total</span>
              <span className="font-mono text-xl font-bold text-text-primary">
                ${Number(total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Order breakdown */}
            <div className="space-y-1.5">
              {[
                ['Subtotal', `$${total}`],
                ['Gas (est.)', '~$2.40'],
                ['Protocol fee (0.3%)', `$${new Decimal(total || '0').mul('0.003').toFixed(2)}`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between font-mono text-xs text-text-muted">
                  <span>{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {!isConnected ? (
              <>
                <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-400">
                  <AlertCircle size={14} />
                  <span className="font-mono text-xs">Connect your wallet to purchase</span>
                </div>
                <Button variant="primary" size="lg" fullWidth onClick={connect}>
                  <Wallet size={16} />
                  Connect Wallet
                </Button>
              </>
            ) : (
              <>
                {purchaseSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-400"
                  >
                    <CheckCircle2 size={14} />
                    <span className="font-mono text-xs">
                      Order submitted! {quantity}g of {element.symbol} for ${total}
                    </span>
                  </motion.div>
                )}
                <Button
                  variant="gold"
                  size="lg"
                  fullWidth
                  disabled={!!quantityError || !isConnected}
                  onClick={handleBuy}
                >
                  <ShoppingCart size={16} />
                  Buy Now — ${Number(total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Button>
              </>
            )}
          </div>

          {/* Disclaimer */}
          <p className="text-center font-mono text-[10px] text-text-muted/60 leading-relaxed">
            This is a simulated marketplace. No real transactions occur.
            <br />
            Prices are indicative only.
          </p>
        </>
      ) : (
        /* Not listed state */
        <div className="rounded-xl border border-dashed border-border bg-surface/50 p-8 text-center">
          <Lock size={32} className="mx-auto mb-3 text-text-muted/40" />
          <p className="font-mono text-sm font-medium text-text-muted mb-1">
            Not Yet Tokenized
          </p>
          <p className="font-mono text-xs text-text-muted/60 leading-relaxed">
            {element.name} is not currently available on the marketplace.
            Submit a governance proposal to list this element.
          </p>
          <Button variant="secondary" size="sm" className="mt-4 mx-auto">
            Submit Listing Request
          </Button>
        </div>
      )}
    </motion.div>
  );
};
