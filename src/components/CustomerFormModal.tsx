import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Customer } from '../types';
import { useCreateCustomer, useUpdateCustomer } from '../hooks/useCustomers';
import { toast } from 'sonner';
import { PhoneInput } from './ui/PhoneInput';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { cn } from '../lib/utils';

interface Props {
  open: boolean;
  customer: Customer | null; // null = create mode, Customer = edit mode
  onClose: () => void;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

const EMPTY: FormState = { name: '', email: '', phone: '', notes: '' };

export const CustomerFormModal = ({ open, customer, onClose }: Props) => {
  const [form, setForm] = useState<FormState>(EMPTY);
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const isEdit = !!customer;
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Pre-fill on edit, reset on create
  useEffect(() => {
    if (open) {
      setForm(
        customer
          ? {
              name:  customer.name,
              email: customer.email  ?? '',
              phone: customer.phone  ?? '',
              notes: customer.notes  ?? '',
            }
          : EMPTY
      );
      createMutation.reset();
      updateMutation.reset();
    }
  }, [open, customer]);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dto = {
      name:  form.name.trim(),
      ...(form.email.trim() && { email: form.email.trim() }),
      ...(form.phone.trim() && { phone: form.phone.trim() }),
      ...(form.notes.trim() && { notes: form.notes.trim() }),
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: customer!.id, dto });
        toast.success('Mijoz yangilandi');
      } else {
        await createMutation.mutateAsync(dto);
        toast.success('Yangi mijoz qo\'shildi');
      }
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[420px] border-none ring-0 shadow-2xl p-0 gap-0 overflow-hidden rounded-2xl"
      >
        {/* Header */}
        <div className="bg-[#0A0A0A] px-5 py-4 flex items-center justify-between">
          <DialogHeader>
            <DialogTitle className="text-white text-sm font-bold">
              {isEdit ? 'Mijozni tahrirlash' : 'Yangi mijoz'}
            </DialogTitle>
          </DialogHeader>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <Icon icon="solar:close-bold" className="text-sm" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">

          <Field label="Ism *" icon="solar:user-bold">
            <input
              required
              value={form.name}
              onChange={set('name')}
              placeholder="To'liq ism"
              className={inputCls}
            />
          </Field>

          <Field label="Telefon" icon="solar:phone-bold">
            <PhoneInput
              value={form.phone}
              onChange={(raw) => setForm((p) => ({ ...p, phone: raw }))}
            />
          </Field>

          <Field label="Izoh" icon="solar:notes-bold">
            <textarea
              value={form.notes}
              onChange={set('notes')}
              placeholder="VIP mijoz, maxsus eslatma..."
              rows={2}
              className={cn(inputCls, 'resize-none')}
            />
          </Field>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isPending || !form.name.trim()}
              className="flex-1 h-10 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isEdit ? 'Saqlash' : 'Qo\'shish'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/* ── helpers ── */
const inputCls =
  'w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all placeholder:text-gray-300';

const Field = ({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
      <Icon icon={icon} className="text-xs" />
      {label}
    </label>
    {children}
  </div>
);
