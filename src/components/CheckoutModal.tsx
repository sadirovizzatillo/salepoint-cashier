import { useState, useEffect, lazy, Suspense } from 'react';
import { Icon } from '@iconify/react';
import { useStore } from '../store';
import { useCustomers } from '../hooks/useCustomers';
import {
  Dialog,
  DialogContent,
} from './ui/dialog';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { NumberPad } from './NumberPad';
import { createOrder } from '../api/orders';
import { printOrderReceipt } from '../lib/printReceipt';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const fmt = (v: number) => v.toLocaleString('ru-RU', { minimumFractionDigits: 0 });

const Lottie = lazy(() => import('lottie-react'));
import successAnimation from '../assets/animations/success.json';
import printAnimation from '../assets/animations/print.json';

type PaymentView = 'selection' | 'cash' | 'card' | 'debt';

export const CheckoutModal = () => {
  const {
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    cart,
    cashSplit, setCashSplit,
    cardSplit, setCardSplit,
    debtSplit, setDebtSplit,
    selectedCustomerForDebt, setSelectedCustomerForDebt,
    selectedCustomerIdForDebt, setSelectedCustomerIdForDebt,
    confirmPayment,
    paymentSuccess,
    printReceipt,
    shiftId,
  } = useStore();

  const queryClient = useQueryClient();
  const [view, setView] = useState<PaymentView>('selection');
  const [tempAmount, setTempAmount] = useState('');
  const [search, setSearch] = useState('');
  const [maxAmount, setMaxAmount] = useState(0);
  const [isPending, setIsPending] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalEntered =
    (parseFloat(cashSplit) || 0) +
    (parseFloat(cardSplit) || 0) +
    (parseFloat(debtSplit) || 0);
  const remaining = Math.max(0, total - totalEntered);
  const paid = Math.abs(total - totalEntered) < 0.01;

  // Reset to selection each time modal opens
  useEffect(() => {
    if (isCheckoutModalOpen) {
      setView('selection');
      setTempAmount('');
      setSearch('');
    }
  }, [isCheckoutModalOpen]);

  /* ── numpad input ── */
  const handlePad = (val: string) => {
    if (val === 'BACKSPACE') {
      setTempAmount((p) => p.slice(0, -1));
      return;
    }
    setTempAmount((p) => {
      if (p.includes('.')) {
        if (val !== '.' && p.substring(p.indexOf('.')).length <= 2) {
          const next = p + val;
          return parseFloat(next) > maxAmount ? p : next;
        }
        return p;
      }
      if (!p && val === '.') return p;
      if (p === '0' && val === '0') return p;
      const next = p + val;
      return parseFloat(next) > maxAmount ? p : next;
    });
  };

  const confirmAmount = () => {
    const amt = parseFloat(tempAmount) || 0;
    if (view === 'cash') setCashSplit(amt > 0 ? amt.toFixed(2) : '');
    if (view === 'card') setCardSplit(amt > 0 ? amt.toFixed(2) : '');
    setView('selection');
    setTempAmount('');
  };

  const openNumpad = (type: 'cash' | 'card') => {
    // Max = total minus whatever the *other* two splits cover
    const otherSplits =
      type === 'cash'
        ? (parseFloat(cardSplit) || 0) + (parseFloat(debtSplit) || 0)
        : (parseFloat(cashSplit) || 0) + (parseFloat(debtSplit) || 0);
    setMaxAmount(Math.max(0, total - otherSplits));
    setTempAmount(type === 'cash' ? cashSplit : cardSplit);
    setView(type);
  };

  const selectCustomer = (id: string, name: string) => {
    setSelectedCustomerIdForDebt(id);
    setSelectedCustomerForDebt(name);
    setDebtSplit(remaining.toFixed(2));
    setView('selection');
    setSearch('');
  };

  const cashCardTotal = (parseFloat(cashSplit) || 0) + (parseFloat(cardSplit) || 0);
  const isPartialPayment = cashCardTotal < total;

  const handleConfirmPayment = async () => {
    // Partial payment requires a customer — redirect to customer selector
    if (isPartialPayment && !selectedCustomerIdForDebt) {
      setView('debt');
      return;
    }

    setIsPending(true);
    try {
      const order = await createOrder(
        {
          items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
          paidByCash: parseFloat(cashSplit) || 0,
          paidByCard: parseFloat(cardSplit) || 0,
          ...(selectedCustomerIdForDebt ? { customerId: selectedCustomerIdForDebt } : {}),
          ...(shiftId ? { shiftId } : {}),
        },
        printReceipt,
      );
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (printReceipt && order) {
        // Defer slightly so the success animation has a chance to render before the print dialog opens
        setTimeout(() => printOrderReceipt(order), 250);
      }
      confirmPayment();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Xatolik yuz berdi';
      if (/insufficient stock/i.test(message)) {
        toast.error(message);
        queryClient.invalidateQueries({ queryKey: ['products'] });
      } else if (/customerid is required/i.test(message)) {
        setView('debt');
        toast.error("Nasiya uchun mijoz tanlash kerak");
      } else if (/is inactive/i.test(message)) {
        toast.error("Mahsulot mavjud emas, savatdan olib tashlang");
      } else if (/payment amount exceeds/i.test(message)) {
        toast.error("To'lov summasi jami miqdordan ko'p");
      } else {
        toast.error(message);
      }
    } finally {
      setIsPending(false);
    }
  };

  const isConfirmDisabled = isPending || cart.length === 0;

  const { data: customersData, isLoading: customersLoading } = useCustomers(search || undefined);

  /* ── slide direction per view ── */
  const slideIn = { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 } };

  return (
    <Dialog open={isCheckoutModalOpen} onOpenChange={setIsCheckoutModalOpen}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'w-full max-w-[calc(100%-1.5rem)] sm:max-w-[420px]',
          'border-none ring-0 shadow-2xl p-0 gap-0',
          'rounded-3xl overflow-hidden',
          'flex flex-col h-[580px]'
        )}
      >
        <AnimatePresence mode="wait">

          {/* ── SUCCESS ── */}
          {paymentSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 px-8 text-center bg-white gap-3 flex-1"
            >
              <Suspense fallback={null}>
                <Lottie
                  animationData={printReceipt ? printAnimation : successAnimation}
                  loop={false}
                  style={{ width: 140, height: 140 }}
                />
              </Suspense>
              <p className="text-xl font-black text-gray-900">To'lov qabul qilindi!</p>
              <p className="text-xs text-gray-400 font-medium">
                {printReceipt ? 'Chek chop etilmoqda...' : 'Savat tozalanmoqda...'}
              </p>
            </motion.div>

          ) : (
            <motion.div key="modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col flex-1 min-h-0">

              {/* ── DARK HEADER ── */}
              <div className="bg-[#0A0A0A] text-white px-6 pt-6 pb-5 shrink-0">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-0.5">
                      {view === 'selection' ? "To'lov tafsilotlari" : view === 'cash' ? 'Naqd pul' : view === 'card' ? 'Karta' : 'Nasiya'}
                    </p>
                    <p className="text-2xl font-black tracking-tight">{fmt(total)} UZS</p>
                  </div>
                  <button
                    onClick={() => view === 'selection' ? setIsCheckoutModalOpen(false) : setView('selection')}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                  >
                    <Icon icon={view === 'selection' ? 'solar:close-bold' : 'solar:arrow-left-bold'} className="text-sm" />
                  </button>
                </div>

                {/* Progress bar — only on selection */}
                {view === 'selection' && (
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-2">
                      <span className="text-white/40">Kiritildi</span>
                      <span className={paid ? 'text-green-400' : 'text-orange-400'}>
                        {paid ? "To'liq to'landi" : `${fmt(remaining)} UZS qoldi`}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500', paid ? 'bg-green-400' : 'bg-orange-400')}
                        style={{ width: `${Math.min(100, (totalEntered / (total || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ── BODY ── */}
              <div className="bg-white flex-1 min-h-0 relative overflow-hidden">
                <AnimatePresence mode="wait">

                  {/* SELECTION VIEW */}
                  {view === 'selection' && (
                    <motion.div key="selection" {...slideIn} transition={{ duration: 0.18 }} className="absolute inset-0 overflow-y-auto p-5 flex flex-col gap-3">

                      {/* Payment method cards */}
                      <div className="grid grid-cols-2 gap-3">

                        {/* Cash */}
                        <button
                          onClick={() => openNumpad('cash')}
                          className={cn(
                            'flex flex-col items-start gap-3 p-4 rounded-2xl border-2 transition-all hover:shadow-md active:scale-[0.98]',
                            parseFloat(cashSplit) > 0
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                          )}
                        >
                          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', parseFloat(cashSplit) > 0 ? 'bg-emerald-500' : 'bg-white')}>
                            <Icon icon="solar:wallet-bold-duotone" className={cn('text-xl', parseFloat(cashSplit) > 0 ? 'text-white' : 'text-gray-400')} />
                          </div>
                          <div className="text-left">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Naqd</p>
                            <p className={cn('text-lg font-black', parseFloat(cashSplit) > 0 ? 'text-emerald-600' : 'text-gray-300')}>
                              {fmt(parseFloat(cashSplit || '0'))}
                            </p>
                          </div>
                        </button>

                        {/* Card */}
                        <button
                          onClick={() => openNumpad('card')}
                          className={cn(
                            'flex flex-col items-start gap-3 p-4 rounded-2xl border-2 transition-all hover:shadow-md active:scale-[0.98]',
                            parseFloat(cardSplit) > 0
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                          )}
                        >
                          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', parseFloat(cardSplit) > 0 ? 'bg-blue-500' : 'bg-white')}>
                            <Icon icon="solar:card-2-bold-duotone" className={cn('text-xl', parseFloat(cardSplit) > 0 ? 'text-white' : 'text-gray-400')} />
                          </div>
                          <div className="text-left">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Karta</p>
                            <p className={cn('text-lg font-black', parseFloat(cardSplit) > 0 ? 'text-blue-600' : 'text-gray-300')}>
                              {fmt(parseFloat(cardSplit || '0'))}
                            </p>
                          </div>
                        </button>
                      </div>

                      {/* Debt — full width */}
                      <button
                        onClick={() => setView('debt')}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-2xl border-2 transition-all hover:shadow-md active:scale-[0.99] text-left',
                          parseFloat(debtSplit) > 0
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                        )}
                      >
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', parseFloat(debtSplit) > 0 ? 'bg-purple-500' : 'bg-white')}>
                          <Icon icon="solar:hand-money-bold-duotone" className={cn('text-xl', parseFloat(debtSplit) > 0 ? 'text-white' : 'text-gray-400')} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nasiya</p>
                          <p className={cn('text-sm font-black', parseFloat(debtSplit) > 0 ? 'text-purple-600' : 'text-gray-300')}>
                            {selectedCustomerForDebt
                              ? `${selectedCustomerForDebt} · ${fmt(parseFloat(debtSplit))} UZS`
                              : 'Mijoz tanlang'}
                          </p>
                        </div>
                        <Icon icon="solar:alt-arrow-right-bold" className="text-gray-300 shrink-0" />
                      </button>

                      {/* Confirm */}
                      <button
                        disabled={isConfirmDisabled}
                        onClick={handleConfirmPayment}
                        className="mt-1 w-full h-12 rounded-2xl bg-black text-white text-sm font-bold hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        {isPending
                          ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : isPartialPayment && !selectedCustomerIdForDebt
                            ? "Mijoz tanlash kerak →"
                            : isPartialPayment
                              ? "Nasiya bilan tasdiqlash"
                              : "To'lovni tasdiqlash"}
                      </button>
                    </motion.div>
                  )}

                  {/* NUMPAD VIEW (cash or card) */}
                  {(view === 'cash' || view === 'card') && (
                    <motion.div key={view} {...slideIn} transition={{ duration: 0.18 }} className="absolute inset-0 overflow-y-auto p-5 flex flex-col gap-4">

                      {/* Amount display */}
                      <div className={cn(
                        'rounded-2xl px-5 py-4 flex items-center justify-between',
                        view === 'cash' ? 'bg-emerald-50' : 'bg-blue-50'
                      )}>
                        <p className={cn('text-[10px] font-bold uppercase tracking-wider', view === 'cash' ? 'text-emerald-500' : 'text-blue-500')}>
                          {view === 'cash' ? 'Naqd miqdori' : 'Karta miqdori'}
                        </p>
                        <p className={cn('text-3xl font-black tabular-nums', view === 'cash' ? 'text-emerald-600' : 'text-blue-600')}>
                          {fmt(parseFloat(tempAmount) || 0)}
                        </p>
                      </div>

                      {/* Numpad */}
                      <NumberPad onType={handlePad} />

                      {/* To'liq to'lash */}
                      <button
                        onClick={() => setTempAmount(maxAmount.toFixed(2))}
                        className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-all active:scale-[0.98]"
                      >
                        To'liq to'lash · {fmt(maxAmount)} UZS
                      </button>

                      {/* Confirm */}
                      <button
                        onClick={confirmAmount}
                        className="w-full h-12 rounded-2xl bg-black text-white text-sm font-bold hover:bg-gray-800 transition-all active:scale-[0.98]"
                      >
                        Tasdiqlash
                      </button>
                    </motion.div>
                  )}

                  {/* DEBT / CUSTOMER VIEW */}
                  {view === 'debt' && (
                    <motion.div key="debt" {...slideIn} transition={{ duration: 0.18 }} className="absolute inset-0 overflow-y-auto p-5 flex flex-col gap-4">

                      {/* Search */}
                      <div className="relative">
                        <Icon icon="solar:magnifer-bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Mijozni qidiring..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
                        />
                      </div>

                      {/* Customer list */}
                      <div className="flex flex-col gap-2 max-h-72 overflow-y-auto no-scrollbar">
                        {customersLoading ? (
                          <div className="py-10 flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                          </div>
                        ) : !customersData?.data?.length ? (
                          <div className="py-10 flex flex-col items-center gap-2 text-center">
                            <Icon icon="solar:user-block-bold-duotone" className="text-3xl text-gray-200" />
                            <p className="text-xs text-gray-400 font-medium">Mijoz topilmadi</p>
                          </div>
                        ) : (
                          customersData.data.map((customer) => (
                            <button
                              key={customer.id}
                              onClick={() => selectCustomer(customer.id, customer.name)}
                              className={cn(
                                'flex items-center gap-3 p-3 rounded-xl border transition-all text-left hover:shadow-sm active:scale-[0.99]',
                                selectedCustomerForDebt === customer.name
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-100 hover:border-gray-300'
                              )}
                            >
                              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-black text-gray-500 shrink-0">
                                {customer.name[0].toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-800 truncate">{customer.name}</p>
                                <p className="text-[10px] text-gray-400 font-medium">{customer.phone ?? ''}</p>
                              </div>
                              {selectedCustomerForDebt === customer.name && (
                                <Icon icon="solar:check-circle-bold" className="text-purple-500 text-lg shrink-0" />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
