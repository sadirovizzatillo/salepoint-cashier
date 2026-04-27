import { StateCreator } from 'zustand';
import { toast } from 'sonner';

export interface CheckoutSlice {
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;

  paymentSuccess: boolean;

  cashSplit: string;
  setCashSplit: (val: string) => void;

  cardSplit: string;
  setCardSplit: (val: string) => void;

  debtSplit: string;
  setDebtSplit: (val: string) => void;

  selectedCustomerForDebt: string;
  setSelectedCustomerForDebt: (val: string) => void;
  selectedCustomerIdForDebt: string;
  setSelectedCustomerIdForDebt: (val: string) => void;

  confirmPayment: () => void;
}

const resetCheckout = {
  cashSplit: '',
  cardSplit: '',
  debtSplit: '',
  selectedCustomerForDebt: '',
  selectedCustomerIdForDebt: '',
};

export const createCheckoutSlice: StateCreator<any, [], [], CheckoutSlice> = (set) => ({
  isCheckoutModalOpen: false,
  setIsCheckoutModalOpen: (open) =>
    set({ isCheckoutModalOpen: open, paymentSuccess: false, ...resetCheckout }),

  paymentSuccess: false,

  ...resetCheckout,
  setCashSplit: (val) => set({ cashSplit: val }),
  setCardSplit: (val) => set({ cardSplit: val }),
  setDebtSplit: (val) => set({ debtSplit: val }),
  setSelectedCustomerForDebt: (val) => set({ selectedCustomerForDebt: val }),
  setSelectedCustomerIdForDebt: (val) => set({ selectedCustomerIdForDebt: val }),

  confirmPayment: () => {
    set({ paymentSuccess: true });
    toast.success("To'lov muvaffaqiyatli amalga oshirildi!", {
      description: "Savat tozalandi.",
      duration: 3000,
    });
    setTimeout(() => {
      set({
        paymentSuccess: false,
        isCheckoutModalOpen: false,
        cart: [],
        ...resetCheckout,
      });
    }, 2000);
  },
});
