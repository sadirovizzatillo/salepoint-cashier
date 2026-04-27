import { useState, useEffect } from 'react';
import { Product } from '../types';
import { useStore } from '../store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { NumberPad } from './NumberPad';

interface Props {
  open: boolean;
  product: Product | null;
  onClose: () => void;
}

export const ProductCounterModal = ({ open, product, onClose }: Props) => {
  const cart = useStore((state) => state.cart);
  const addToCart = useStore((state) => state.addToCart);
  const setQuantity = useStore((state) => state.setQuantity);
  const [counter, setCounter] = useState('1');

  // Pre-fill with current cart quantity when the modal opens
  useEffect(() => {
    if (open && product) {
      const existing = cart.find((item) => item.id === product.id);
      setCounter(existing ? existing.quantity.toString() : '1');
    }
  }, [open, product]);

  // null stock → product never received → 0 available
  const maxQty = product?.stock != null ? product.stock.quantityAvailable : 0;

  const addChar = (val: string) => {
    if (val === 'BACKSPACE') {
      setCounter((c) => (c.length ? c.slice(0, -1) : c));
      return;
    }
    setCounter((c) => {
      if (c.includes('.')) {
        if (val !== '.' && c.substring(c.indexOf('.')).length <= 2) return c + val;
        return c;
      }
      if (!c && val === '.') return c;
      if (c === '0' && val === '0') return c;
      const next = c + val;
      return parseFloat(next) > maxQty ? c : next;
    });
  };

  const subtract = () => {
    const cur = parseFloat(counter);
    setCounter(counter.length && cur > 1 ? (cur - 1).toString() : '1');
  };

  const add = () => {
    const cur = parseFloat(counter) || 0;
    if (cur >= maxQty) return;
    setCounter((cur + 1).toString());
  };

  const confirm = () => {
    const qty = parseFloat(counter);
    if (!counter.length || qty <= 0 || !product || qty > maxQty) return;

    const inCart = cart.find((item) => item.id === product.id);
    if (inCart) {
      setQuantity(product.id, qty);
    } else {
      addToCart(product);       // adds with qty = 1
      setQuantity(product.id, qty); // immediately set the entered qty
    }
    onClose();
  };

  // Physical keyboard support while open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.code.startsWith('Digit') || e.key === '.') addChar(e.key);
      else if (e.keyCode === 8) addChar('BACKSPACE');
      else if (e.keyCode === 13) confirm();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, counter, product, cart]);

  const qty = parseFloat(counter) || 0;
  const isValid = counter.length > 0 && qty > 0 && qty <= maxQty;
  const isAtMax = qty >= maxQty;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[300px] border-none ring-0 shadow-2xl p-0 gap-0 overflow-hidden rounded-2xl"
      >
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-gray-100">
          <DialogTitle className="text-sm font-bold text-gray-800 leading-snug">
            {product?.name ?? '—'}
          </DialogTitle>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-[11px] text-gray-400">Miqdorni kiriting</p>
            {product?.stock != null && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                product.stock.quantityAvailable <= product.stock.reorderPoint
                  ? 'bg-red-50 text-red-500'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                Mavjud: {product.stock.quantityAvailable} ta
              </span>
            )}
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="p-4 flex flex-col gap-3">
          {/* Amount display bar */}
          <div className="flex items-center gap-2 bg-[#1151ef] rounded-xl px-3 py-2.5">
            <button
              onClick={subtract}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-400 hover:bg-orange-500 text-white font-black text-xl leading-none transition-all active:scale-90 select-none"
            >
              −
            </button>
            <span className="flex-1 text-center text-white font-black text-xl tabular-nums tracking-tight">
              {counter || '__'}
            </span>
            <button
              onClick={add}
              disabled={isAtMax}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-400 hover:bg-green-500 disabled:opacity-40 text-white font-black text-xl leading-none transition-all active:scale-90 select-none"
            >
              +
            </button>
          </div>

          {/* Virtual numpad */}
          <NumberPad onType={addChar} />
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-10 rounded-xl text-xs font-bold"
          >
            Bekor qilish
          </Button>
          <Button
            disabled={!isValid}
            onClick={confirm}
            className="flex-1 h-10 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 disabled:opacity-40"
          >
            Davom etish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
