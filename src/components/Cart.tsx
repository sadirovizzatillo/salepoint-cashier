import { useState } from 'react';
import { useStore } from '../store';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { cn } from '../lib/utils';
import { Product } from '../types';
import { ProductCounterModal } from './ProductCounterModal';

export const Cart = () => {
  const cart = useStore((state) => state.cart);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const setIsCheckoutModalOpen = useStore((state) => state.setIsCheckoutModalOpen);
  const printReceipt = useStore((state) => state.printReceipt);
  const setPrintReceipt = useStore((state) => state.setPrintReceipt);

  const [counterProduct, setCounterProduct] = useState<Product | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  // const tax = subtotal * 0.08;
  const total = subtotal;

  return (
    <aside className="w-full bg-white border-l border-gray-100 flex flex-col h-full min-h-0">

      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold">Savat</h2>
          <p className="text-[10px] text-gray-400 mt-0.5">Buyurtma #8492</p>
        </div>
        <span className="bg-gray-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-gray-600">
          {cart.length} ta
        </span>
      </div>

      {/* Items */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-3 py-2">
        <div className="flex flex-col gap-1">
          <AnimatePresence mode="popLayout">
            {cart.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center gap-3"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                  <Icon icon="solar:cart-large-minimalistic-bold-duotone" className="text-2xl text-gray-300" />
                </div>
                <p className="text-xs text-gray-400 font-medium">Savat bo'sh</p>
              </motion.div>
            ) : (
              cart.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 group cursor-pointer"
                  onClick={() => setCounterProduct(item)}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-9 h-9 rounded-lg object-contain bg-gray-100 mix-blend-multiply shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold truncate text-gray-800">{item.name}</p>
                    <p className="text-[10px] text-gray-400">{Math.round(item.price).toLocaleString('de-DE')} so'm</p>
                  </div>
                  {/* Qty */}
                  <span className="px-2 py-1 bg-gray-100 rounded-lg text-[11px] font-black text-black shrink-0">
                    {item.quantity}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}
                    className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-90 shrink-0"
                  >
                    <Icon icon="solar:trash-bin-trash-bold-duotone" className="text-sm" />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50/60 border-t border-gray-100 flex flex-col gap-2 shrink-0">
        {/* <div className="flex justify-between text-[11px] text-gray-500">
          <span>Subtotal</span>
          <span>{subtotal.toFixed(2)}</span>
        </div> */}
        {/* <div className="flex justify-between text-[11px] text-gray-500">
          <span>Tax (8%)</span>
          <span>{tax.toFixed(2)}</span>
        </div> */}
        <Separator className="bg-gray-200 my-0.5" />
        <div className="flex justify-between text-sm font-bold">
          <span>Total</span>
          <span>{total.toLocaleString('ru-RU')} UZS</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <button
            disabled={cart.length === 0}
            onClick={() => setPrintReceipt(!printReceipt)}
            className={cn(
              "h-9 w-9 shrink-0 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-40",
              printReceipt
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            )}
          >
            <Icon icon="solar:printer-bold-duotone" className="text-base" />
          </button>

          <Button
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutModalOpen(true)}
            className="flex-1 h-9 rounded-xl bg-black text-white font-bold hover:bg-gray-800 disabled:opacity-40 transition-all gap-2 text-xs"
          >
            To'lovga o'tish
            <Icon icon="solar:arrow-right-bold-duotone" className="text-sm" />
          </Button>
        </div>
      </div>
      <ProductCounterModal
        open={counterProduct !== null}
        product={counterProduct}
        onClose={() => setCounterProduct(null)}
      />
    </aside>
  );
};
