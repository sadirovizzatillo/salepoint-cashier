import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import { useStore } from '../store';
import { Icon } from '@iconify/react';
import { Input } from './ui/input';

const fmt = (v: number) => v.toLocaleString('ru-RU', { minimumFractionDigits: 0 });

const ROUTE_LABELS: Record<string, string> = {
  '/':          'Kassa',
  '/history':   "Sotuvlar tarixi",
  '/customers': "Mijozlar",
  '/debts':     "Qarzdorlik ro'yxati",
};

export const Header = () => {
  const { pathname } = useLocation();
  const searchQuery      = useStore((state) => state.searchQuery);
  const setSearchQuery   = useStore((state) => state.setSearchQuery);
  const setIsSidebarOpen = useStore((state) => state.setIsSidebarOpen);
  const activeShift      = useStore((state) => state.activeShift);

  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [layoutName, setLayoutName]     = useState<'default' | 'shift'>('default');
  const keyboardRef                     = useRef<any>(null);
  const keyboardWrapperRef              = useRef<HTMLDivElement>(null);
  const inputRef                        = useRef<HTMLInputElement>(null);

  const cashBalance = activeShift
    ? Number(activeShift.openingFloat ?? 0) + Number(activeShift.cashSales ?? 0)
    : null;

  const totalSales = activeShift ? Number(activeShift.totalSales ?? 0) : null;

  useEffect(() => {
    if (!keyboardOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setKeyboardOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [keyboardOpen]);

  const handleFocus = () => {
    setKeyboardOpen(true);
    keyboardRef.current?.setInput(searchQuery, 'search');
  };

  const handleBlur = (e: React.FocusEvent) => {
    const next = e.relatedTarget as Node | null;
    if (next && keyboardWrapperRef.current?.contains(next)) return;
    setKeyboardOpen(false);
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    keyboardRef.current?.setInput(value, 'search');
  };

  const handleKeyboardChange = (input: string) => {
    setSearchQuery(input);
  };

  const handleKeyboardKeyPress = (button: string) => {
    if (button === '{shift}' || button === '{lock}') {
      setLayoutName((prev) => (prev === 'default' ? 'shift' : 'default'));
    } else if (button === '{enter}') {
      setKeyboardOpen(false);
      inputRef.current?.blur();
    } else if (button === '{clear}') {
      setSearchQuery('');
      keyboardRef.current?.setInput('', 'search');
    }
  };

  return (
    <header className="h-14 px-4 flex items-center justify-between bg-white border-b border-gray-100 shrink-0 gap-4">
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Icon icon="solar:hamburger-menu-bold-duotone" className="text-xl text-gray-700" />
        </button>
        <h1 className="text-sm font-bold tracking-tight text-gray-900">
          {ROUTE_LABELS[pathname] ?? 'Kassa'}
        </h1>
      </div>

      {/* Shift balance chips */}
      {cashBalance !== null && (
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5">
            <Icon icon="solar:wallet-money-bold-duotone" className="text-sm text-gray-400 shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Kassa</span>
              <span className="text-xs font-black tabular-nums text-gray-800">{fmt(cashBalance)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5">
            <Icon icon="solar:graph-up-bold-duotone" className="text-sm text-emerald-500 shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Savdo</span>
              <span className="text-xs font-black tabular-nums text-emerald-600">{fmt(totalSales!)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="relative w-44 sm:w-56 lg:w-64 xl:w-80">
        <Icon
          icon="solar:magnifer-linear"
          className={`absolute left-3 top-1/2 -translate-y-1/2 text-base transition-colors ${
            keyboardOpen ? 'text-black' : 'text-gray-400'
          }`}
        />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Qidirish..."
          className={`w-full pl-9 pr-9 h-8 border-none rounded-lg focus-visible:ring-black font-medium text-xs transition-colors ${
            keyboardOpen ? 'bg-white ring-2 ring-black/10' : 'bg-gray-50'
          }`}
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {searchQuery && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              handleInputChange('');
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Qidiruvni tozalash"
          >
            <Icon icon="solar:close-circle-bold" className="text-sm" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {keyboardOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onMouseDown={() => {
                setKeyboardOpen(false);
                inputRef.current?.blur();
              }}
              className="fixed inset-0 z-[90] bg-black/10 backdrop-blur-[1px]"
            />
            <motion.div
              ref={keyboardWrapperRef}
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 right-0 bottom-0 z-[100] bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-12px_40px_-8px_rgba(0,0,0,0.25)] px-3 sm:px-6 pt-3 pb-4 search-keyboard"
            >
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between px-1 mb-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <Icon icon="solar:magnifer-bold-duotone" className="text-sm text-gray-500" />
                    Qidirish
                    {searchQuery && (
                      <span className="ml-1 px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 normal-case tracking-normal max-w-[180px] truncate">
                        {searchQuery}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setKeyboardOpen(false);
                      inputRef.current?.blur();
                    }}
                    className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                    aria-label="Klaviaturani yopish"
                  >
                    <Icon icon="solar:close-square-linear" className="text-base" />
                  </button>
                </div>
                <Keyboard
                  keyboardRef={(r) => (keyboardRef.current = r)}
                  inputName="search"
                  layoutName={layoutName}
                  onChange={handleKeyboardChange}
                  onKeyPress={handleKeyboardKeyPress}
                  layout={{
                    default: [
                      '1 2 3 4 5 6 7 8 9 0',
                      'q w e r t y u i o p',
                      'a s d f g h j k l',
                      '{shift} z x c v b n m {bksp}',
                      '{clear} {space} {enter}',
                    ],
                    shift: [
                      '! @ # $ % ^ & * ( )',
                      'Q W E R T Y U I O P',
                      'A S D F G H J K L',
                      '{shift} Z X C V B N M {bksp}',
                      '{clear} {space} {enter}',
                    ],
                  }}
                  display={{
                    '{bksp}':  '⌫',
                    '{shift}': '⇧',
                    '{space}': 'space',
                    '{enter}': '↵ Tayyor',
                    '{clear}': 'Tozalash',
                  }}
                  buttonTheme={[
                    { class: 'hg-action-key', buttons: '{bksp} {shift} {space} {clear}' },
                    { class: 'hg-enter-key',  buttons: '{enter}' },
                  ]}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
