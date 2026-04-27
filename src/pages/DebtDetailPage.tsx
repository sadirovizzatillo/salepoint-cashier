import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion } from 'motion/react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { repayDebt } from '../api/debts';
import { useDebt } from '../hooks/useDebts';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { cn } from '../lib/utils';

const fmt = (v: number) =>
  v.toLocaleString('ru-RU', { minimumFractionDigits: 0 });

const STATUS_MAP = {
  pending: { label: 'Kutilmoqda', className: 'bg-amber-50 text-amber-600 border-amber-100' },
  partial: { label: 'Qisman',     className: 'bg-blue-50 text-blue-600 border-blue-100' },
  paid:    { label: "To'langan",  className: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
} as const;

export const DebtDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: debt, isLoading } = useDebt(id ?? null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleRepay = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !id) return;
    setIsPending(true);
    try {
      await repayDebt(id, { amount: amt, ...(note.trim() ? { note: note.trim() } : {}) });
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success("To'lov qabul qilindi");
      navigate('/debts');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setIsPending(false);
    }
  };

  if (isLoading || !debt) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  const status = STATUS_MAP[debt.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-1 min-h-0 p-3 lg:p-4 overflow-y-auto"
    >
      <Button
        variant="ghost"
        onClick={() => navigate('/debts')}
        className="mb-4 gap-2 font-bold hover:bg-gray-100 rounded-xl text-sm"
      >
        <Icon icon="solar:arrow-left-linear" />
        Orqaga qaytish
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-8">

        {/* Left: summary + repayment history */}
        <div className="lg:col-span-2 space-y-4 xl:space-y-6">

          <div className="bg-white p-5 xl:p-8 rounded-[28px] xl:rounded-[40px] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                  Buyurtma
                </p>
                <h3 className="text-xl xl:text-2xl font-black tracking-tight">
                  {debt.order?.orderNumber ?? '—'}
                </h3>
                <p className="text-gray-400 font-bold text-sm mt-1">
                  {new Date(debt.createdAt).toLocaleString('uz-UZ')}
                </p>
              </div>
              <Badge variant="outline" className={cn('px-3 py-1 rounded-full font-bold', status.className)}>
                {status.label}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-gray-50 rounded-2xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Jami qarz</p>
                <p className="text-lg font-black">{fmt(debt.totalDebt)} UZS</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mb-1">To'landi</p>
                <p className="text-lg font-black text-emerald-600">{fmt(debt.paidAmount)} UZS</p>
              </div>
              <div className="bg-red-50 rounded-2xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">Qoldi</p>
                <p className="text-lg font-black text-red-500">{fmt(debt.remainingAmount)} UZS</p>
              </div>
            </div>
          </div>

          {debt.repayments.length > 0 && (
            <div className="bg-white p-5 xl:p-8 rounded-[28px] xl:rounded-[40px] border border-gray-100 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                To'lovlar tarixi
              </p>
              <div className="flex flex-col gap-2">
                {debt.repayments.map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{fmt(r.amount)} UZS</p>
                      {r.note && <p className="text-[11px] text-gray-400 mt-0.5">{r.note}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-gray-400">
                        {new Date(r.createdAt).toLocaleString('uz-UZ')}
                      </p>
                      <p className="text-[11px] font-bold text-gray-500">{r.cashier.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: customer info + repayment form */}
        <div className="space-y-4 xl:space-y-6">

          <div className="bg-black text-white p-5 xl:p-8 rounded-[28px] xl:rounded-[40px] shadow-2xl shadow-black/20">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-4">Mijoz</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-black text-lg">
                {debt.customer.name[0].toUpperCase()}
              </div>
              <p className="text-lg font-black">{debt.customer.name}</p>
            </div>
            <Separator className="bg-white/10 mb-4" />
            <div className="space-y-2 text-sm opacity-60 font-bold">
              <div className="flex justify-between">
                <span>Kassir</span>
                <span>{debt.cashier.name}</span>
              </div>
            </div>
          </div>

          {debt.status !== 'paid' && (
            <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">To'lov qabul qilish</p>

              <div>
                <label className="text-[11px] font-bold text-gray-500 mb-1 block">Miqdor (UZS)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    max={debt.remainingAmount}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={fmt(debt.remainingAmount)}
                    className="flex-1 h-10 px-3 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setAmount(String(debt.remainingAmount))}
                    className="h-10 px-3 rounded-xl bg-gray-100 text-xs font-bold hover:bg-gray-200 transition-all whitespace-nowrap"
                  >
                    To'liq
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 mb-1 block">Izoh (ixtiyoriy)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Masalan: naqd pul..."
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
                />
              </div>

              <Button
                disabled={isPending || !amount || parseFloat(amount) <= 0}
                onClick={handleRepay}
                className="w-full h-11 rounded-2xl bg-black text-white font-bold text-sm hover:bg-gray-800 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {isPending
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Icon icon="solar:check-circle-bold-duotone" className="text-base" /> Tasdiqlash</>
                }
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
