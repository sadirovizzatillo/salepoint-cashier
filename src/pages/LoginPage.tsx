import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ChevronLeft, Store } from 'lucide-react';
import { toast } from 'sonner';
import { login, selectShop } from '../api/auth';
import type { Shop } from '../api/auth';
import { motion, AnimatePresence } from 'motion/react';

interface LoginPageProps {
  onLogin: () => void;
}

interface CredentialsFormProps {
  onSuccess: (preAuthToken: string, shops: Shop[]) => void;
  onDone: () => void;
}

/* ── Step 1: credentials ── */
const CredentialsForm: React.FC<CredentialsFormProps> = ({ onSuccess, onDone }) => {
  const navigate = useNavigate();
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (result.type === 'tokens') {
        // SUPER_ADMIN or single-shop cashier — tokens already stored in api/auth.ts
        if (result.message) toast.info(result.message);
        onDone();
        navigate('/');
      } else {
        onSuccess(result.preAuthToken, result.shops);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      key="credentials"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-7">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1.5">Xush kelibsiz!</h1>
        <p className="text-sm text-gray-500">Tizimga kirish uchun ma'lumotlarni kiriting.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block" htmlFor="email">
            Email
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
              <User size={16} />
            </div>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-gray-50 focus:bg-white text-sm text-gray-900 placeholder:text-gray-400"
              placeholder="Email manzilingizni kiriting"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block" htmlFor="password">
            Parol
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
              <Lock size={16} />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-gray-50 focus:bg-white text-sm text-gray-900 placeholder:text-gray-400"
              placeholder="Parolingizni kiriting"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium">
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white py-3.5 px-6 rounded-xl font-bold hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group mt-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Kirish</span>
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}

interface ShopPickerProps {
  preAuthToken: string;
  shops: Shop[];
  onBack: () => void;
  onDone: () => void;
}

/* ── Step 2: shop picker ── */
const ShopPicker: React.FC<ShopPickerProps> = ({ preAuthToken, shops, onBack, onDone }) => {
  const navigate = useNavigate();
  const [loadingShopId, setLoadingShopId] = useState<string | null>(null);
  const [error, setError]                 = useState('');

  const handleSelect = async (shopId: string) => {
    setError('');
    setLoadingShopId(shopId);
    try {
      await selectShop(preAuthToken, shopId);
      onDone();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
      setLoadingShopId(null);
    }
  };

  return (
    <motion.div
      key="shopPicker"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors mb-6"
      >
        <ChevronLeft size={14} />
        Orqaga
      </button>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1.5">Do'konni tanlang</h1>
        <p className="text-sm text-gray-500">Davom etish uchun do'koningizni tanlang.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium mb-4">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-2.5">
        {shops.map((shop) => {
          const isLoading   = loadingShopId === shop.id;
          const isSuspended = shop.subscriptionStatus === 'SUSPENDED' || shop.subscriptionStatus === 'EXPIRED';

          return (
            <button
              key={shop.id}
              onClick={() => !isSuspended && handleSelect(shop.id)}
              disabled={!!loadingShopId || isSuspended}
              className={[
                'w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border text-left transition-all',
                isSuspended
                  ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 bg-white hover:border-black hover:shadow-sm active:scale-[0.98] cursor-pointer',
                loadingShopId && !isLoading ? 'opacity-50 pointer-events-none' : '',
              ].join(' ')}
            >
              {/* Logo or fallback icon */}
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                {shop.logoUrl ? (
                  <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Store size={18} className="text-gray-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{shop.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {shop.roles.join(', ')}
                  {isSuspended && <span className="ml-2 text-red-400">• Obuna tugagan</span>}
                </p>
              </div>

              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin shrink-0" />
              ) : (
                !isSuspended && <ArrowRight size={16} className="text-gray-300 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ── Root ── */
export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [step, setStep]               = useState<'credentials' | 'shopPicker'>('credentials');
  // preAuthToken is intentionally kept in React state (not localStorage) — expires in 5 min
  const [preAuthToken, setPreAuthToken] = useState('');
  const [shops, setShops]             = useState<Shop[]>([]);

  const handlePreAuth = (token: string, shopList: Shop[]) => {
    setPreAuthToken(token);
    setShops(shopList);
    setStep('shopPicker');
  };

  const handleBack = () => {
    setPreAuthToken('');
    setShops([]);
    setStep('credentials');
  };

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row font-sans">

      {/* ── Mobile top banner (hidden on lg) ── */}
      <div className="relative lg:hidden h-48 sm:h-56 overflow-hidden shrink-0">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
          alt="Modern Office"
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70 flex flex-col items-center justify-center gap-3">
          <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <LogIn className="w-5 h-5 text-black" />
          </div>
          <div className="text-center">
            <h2 className="text-white text-xl font-black tracking-tight">Prime Lighting</h2>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-0.5">POS System</p>
          </div>
        </div>
      </div>

      {/* ── Desktop left panel (hidden below lg) ── */}
      <div className="hidden lg:flex lg:w-[65%] xl:w-[70%] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000"
          alt="Modern Office"
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 to-black/10 flex flex-col justify-end p-12 xl:p-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-4xl xl:text-5xl font-bold text-white mb-3 tracking-tight leading-tight">
              Prime Lighting <br />
              <span className="text-white/70">POS System</span>
            </h2>
            <p className="text-gray-300 text-base xl:text-lg max-w-md leading-relaxed">
              Streamline your retail operations with our powerful and intuitive point of sale solution.
            </p>
          </motion.div>

          <div className="mt-10 flex gap-8">
            <div className="text-white">
              <p className="text-2xl xl:text-3xl font-bold">2.4k+</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">Active Users</p>
            </div>
            <div className="text-white">
              <p className="text-2xl xl:text-3xl font-bold">99.9%</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className="flex-1 lg:w-[35%] xl:w-[30%] bg-white flex flex-col min-h-0">
        <div className="flex-1 flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-10 lg:px-10 xl:px-14 overflow-y-auto">
          <div className="w-full max-w-sm mx-auto lg:mx-0">

            {/* Logo — desktop only */}
            <div className="hidden lg:flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <LogIn className="text-white w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900 leading-none">Prime Lighting</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">POS System</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 'credentials' ? (
                <CredentialsForm
                  key="credentials"
                  onSuccess={handlePreAuth}
                  onDone={onLogin}
                />
              ) : (
                <ShopPicker
                  key="shopPicker"
                  preAuthToken={preAuthToken}
                  shops={shops}
                  onBack={handleBack}
                  onDone={onLogin}
                />
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Footer */}
        <div className="py-4 text-center shrink-0">
          <p className="text-[10px] text-gray-300 uppercase tracking-widest font-medium">
            Prime Lighting POS v2.4.0
          </p>
        </div>
      </div>

    </div>
  );
};
