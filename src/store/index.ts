import { create } from 'zustand';
import { CartSlice,     createCartSlice     } from './cartSlice';
import { UiSlice,       createUiSlice       } from './uiSlice';
import { CheckoutSlice, createCheckoutSlice } from './checkoutSlice';
import { ShiftSlice,    createShiftSlice    } from './shiftSlice';

export type StoreState = CartSlice & UiSlice & CheckoutSlice & ShiftSlice;

export const useStore = create<StoreState>((...args) => ({
  ...createCartSlice(...args),
  ...createUiSlice(...args),
  ...createCheckoutSlice(...args),
  ...createShiftSlice(...args),
}));
