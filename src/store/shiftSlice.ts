import { StateCreator } from 'zustand';
import type { Shift } from '../api/shifts';

export interface ShiftSlice {
  shiftId: string | null;
  setShiftId: (id: string | null) => void;
  activeShift: Shift | null;
  setActiveShift: (shift: Shift | null) => void;
}

export const createShiftSlice: StateCreator<any, [], [], ShiftSlice> = (set) => ({
  shiftId: null,
  setShiftId: (id) => set({ shiftId: id }),
  activeShift: null,
  setActiveShift: (shift) => set({ activeShift: shift }),
});
