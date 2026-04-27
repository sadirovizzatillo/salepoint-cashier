import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion } from 'motion/react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Order, cancelOrder, markOrderPaid, reprintOrder } from '../api/orders';
import { useOrder } from '../hooks/useOrders';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { cn } from '../lib/utils';

const fmt = (v: string | number) =>
  Number(v).toLocaleString('ru-RU', { minimumFractionDigits: 0 });

/** +998973364647 → +998 (97) 336-46-47 */
function formatPhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const d = raw.replace(/\D/g, '');
  if (d.length < 12) return raw;
  return `+${d.slice(0, 3)} (${d.slice(3, 5)}) ${d.slice(5, 8)}-${d.slice(8, 10)}-${d.slice(10, 12)}`;
}

const STATUS_MAP: Record<Order['status'], { label: string; className: string }> = {
  paid:       { label: "To'langan",   className: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  confirmed:  { label: 'Tasdiqlangan', className: 'bg-blue-50 text-blue-600 border-blue-100' },
  pending:    { label: 'Kutilmoqda',   className: 'bg-amber-50 text-amber-600 border-amber-100' },
  refunded:   { label: 'Qaytarildi',   className: 'bg-purple-50 text-purple-600 border-purple-100' },
  cancelled:  { label: 'Bekor',        className: 'bg-red-50 text-red-500 border-red-100' },
};

function paymentMethod(order: Order) {
  const cash = Number(order.paidByCash);
  const card = Number(order.paidByCard);
  if (cash > 0 && card > 0) return 'Aralash';
  if (card > 0) return 'Karta';
  if (cash > 0) return 'Naqd';
  return 'Nasiya';
}

export const SalesHistoryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useOrder(id ?? null);
  const [actionPending, setActionPending] = useState<'mark-paid' | 'cancel' | 'print' | null>(null);

  if (isLoading || !order) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  const status = STATUS_MAP[order.status] ?? STATUS_MAP.pending;

  const subtotal       = Number(order.subtotal);
  const taxAmount      = Number(order.taxAmount);
  const discountAmount = Number(order.discountAmount);
  const paidByCash     = Number(order.paidByCash);
  const paidByCard     = Number(order.paidByCard);
  const notPaid        = Number(order.notPaid);
  const itemCount      = order.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  const discountLabel =
    order.discountType === 'percent' ? `−${order.discountValue}%` : 'Chegirma';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex-1 min-h-0 p-3 lg:p-4 overflow-y-auto"
    >
      {/* Back */}
      <Button
        variant="ghost"
        onClick={() => navigate('/history')}
        className="mb-4 gap-2 font-bold hover:bg-gray-100 rounded-xl text-sm"
      >
        <Icon icon="solar:arrow-left-linear" />
        Orqaga
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 xl:gap-6 max-w-6xl mx-auto">

        {/* ─── LEFT: Header + items + notes ─── */}
        <div className="lg:col-span-3 space-y-4 xl:space-y-6">

          {/* Header card */}
          <div className="bg-white p-6 xl:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Buyurtma</p>
                <h3 className="text-2xl xl:text-3xl font-black tracking-tight truncate">{order.orderNumber}</h3>
                <p className="text-sm text-gray-500 font-medium mt-2">
                  {new Date(order.createdAt).toLocaleString('uz-UZ', {
                    day: '2-digit', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
              <Badge variant="outline" className={cn('px-3 py-1.5 rounded-full font-bold text-xs whitespace-nowrap shrink-0', status.className)}>
                {status.label}
              </Badge>
            </div>

            {(order.customer || order.cashier) && (
              <>
                <Separator className="my-5 bg-gray-100" />
                <div className={cn('grid gap-4', order.customer && order.cashier ? 'grid-cols-2' : 'grid-cols-1')}>
                  {order.customer && (
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Mijoz</p>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-black text-xs shrink-0">
                          {order.customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">{order.customer.name}</p>
                          {formatPhone(order.customer.phone) && (
                            <p className="text-[11px] text-gray-400 font-medium truncate">
                              {formatPhone(order.customer.phone)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {order.cashier && (
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Kassir</p>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                          <Icon icon="solar:user-bold-duotone" className="text-base" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">{order.cashier.name}</p>
                          {order.cashier.email && (
                            <p className="text-[11px] text-gray-400 font-medium truncate">
                              {order.cashier.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Items card */}
          <div className="bg-white p-6 xl:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-black tracking-tight">Mahsulotlar</h4>
              <span className="text-xs font-bold text-gray-400">
                {order.items?.length ?? 0} tur · {itemCount} dona
              </span>
            </div>

            <div className="divide-y divide-gray-50">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-50 text-gray-500 font-black text-xs shrink-0">
                    ×{item.quantity}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                      {fmt(item.price)} UZS / dona
                    </p>
                  </div>
                  <p className="font-black text-sm shrink-0">{fmt(item.lineTotal)} UZS</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notes (optional) */}
          {order.notes && (
            <div className="bg-amber-50/50 p-5 xl:p-6 rounded-3xl border border-amber-100">
              <div className="flex items-start gap-3">
                <Icon icon="solar:document-text-bold-duotone" className="text-xl text-amber-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Izoh</p>
                  <p className="text-sm text-gray-700 font-medium leading-relaxed">{order.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT: Receipt + actions ─── */}
        <div className="lg:col-span-2 space-y-4 xl:space-y-6 lg:sticky lg:top-4 lg:self-start">

          {/* Totals card */}
          <div className="bg-white p-6 xl:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 font-medium">Oraliq summa</span>
                <span className="font-bold text-gray-700">{fmt(subtotal)} UZS</span>
              </div>

              {taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Soliq</span>
                  <span className="font-bold text-gray-700">{fmt(taxAmount)} UZS</span>
                </div>
              )}

              {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">{discountLabel}</span>
                  <span className="font-bold text-emerald-600">−{fmt(discountAmount)} UZS</span>
                </div>
              )}
            </div>

            <Separator className="my-4 bg-gray-100" />

            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Jami</span>
              <span className="text-3xl xl:text-4xl font-black tracking-tight">
                {fmt(order.total)}<span className="text-sm text-gray-400 ml-1.5">UZS</span>
              </span>
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="bg-black text-white p-6 xl:p-7 rounded-3xl shadow-xl shadow-black/10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">To'lov turi</p>
              <p className="text-xs font-black">{paymentMethod(order)}</p>
            </div>

            <div className="space-y-2.5">
              {paidByCash > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/60">
                    <Icon icon="solar:wad-of-money-bold-duotone" className="text-base" />
                    <span className="text-xs font-bold">Naqd</span>
                  </div>
                  <span className="font-black text-sm">{fmt(paidByCash)} UZS</span>
                </div>
              )}
              {paidByCard > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/60">
                    <Icon icon="solar:card-bold-duotone" className="text-base" />
                    <span className="text-xs font-bold">Karta</span>
                  </div>
                  <span className="font-black text-sm">{fmt(paidByCard)} UZS</span>
                </div>
              )}
              {notPaid > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-400">
                    <Icon icon="solar:clock-circle-bold-duotone" className="text-base" />
                    <span className="text-xs font-bold">Nasiya</span>
                  </div>
                  <span className="font-black text-sm text-red-400">{fmt(notPaid)} UZS</span>
                </div>
              )}
            </div>
          </div>

          {/* Secondary actions */}
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              variant="outline"
              disabled={actionPending !== null}
              onClick={async () => {
                setActionPending('print');
                try {
                  await reprintOrder(order.id);
                  toast.success('Chek yuborildi');
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : 'Chek chop etib bo\'lmadi');
                } finally {
                  setActionPending(null);
                }
              }}
              className="h-11 rounded-xl gap-2 font-bold border-gray-100 text-sm disabled:opacity-50"
            >
              {actionPending === 'print'
                ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                : <><Icon icon="solar:printer-bold-duotone" className="text-base" /> Chek</>
              }
            </Button>
            <Button variant="outline" className="h-11 rounded-xl gap-2 font-bold border-gray-100 text-sm">
              <Icon icon="solar:download-bold-duotone" className="text-base" />
              PDF
            </Button>
          </div>

          {/* Primary actions (confirmed only) */}
          {order.status === 'confirmed' && (
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                disabled={actionPending !== null}
                onClick={async () => {
                  setActionPending('mark-paid');
                  try {
                    await markOrderPaid(order.id);
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                    toast.success("Buyurtma to'langan deb belgilandi");
                    navigate('/history');
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : 'Xatolik yuz berdi');
                  } finally {
                    setActionPending(null);
                  }
                }}
                className="h-11 rounded-xl gap-2 font-bold bg-emerald-500 hover:bg-emerald-600 text-white text-sm disabled:opacity-50"
              >
                {actionPending === 'mark-paid'
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Icon icon="solar:check-circle-bold-duotone" className="text-base" /> To'landi</>
                }
              </Button>
              <Button
                disabled={actionPending !== null}
                onClick={async () => {
                  setActionPending('cancel');
                  try {
                    await cancelOrder(order.id);
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                    queryClient.invalidateQueries({ queryKey: ['products'] });
                    toast.success('Buyurtma bekor qilindi');
                    navigate('/history');
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : 'Xatolik yuz berdi');
                  } finally {
                    setActionPending(null);
                  }
                }}
                variant="outline"
                className="h-11 rounded-xl gap-2 font-bold border-red-200 text-red-500 hover:bg-red-50 text-sm disabled:opacity-50"
              >
                {actionPending === 'cancel'
                  ? <div className="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
                  : <><Icon icon="solar:close-circle-bold-duotone" className="text-base" /> Bekor</>
                }
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
