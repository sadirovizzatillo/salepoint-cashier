import { Icon } from '@iconify/react';

interface NumberPadProps {
  onType: (val: string) => void;
}

const BUTTONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'BACKSPACE'];

export const NumberPad = ({ onType }: NumberPadProps) => (
  <div className="grid grid-cols-3 gap-2">
    {BUTTONS.map((btn) => (
      <button
        key={btn}
        onClick={() => onType(btn)}
        className="h-12 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-95 transition-all font-bold text-gray-700 text-sm select-none"
      >
        {btn === 'BACKSPACE'
          ? <Icon icon="solar:backspace-bold-duotone" className="text-lg text-gray-500" />
          : btn}
      </button>
    ))}
  </div>
);
