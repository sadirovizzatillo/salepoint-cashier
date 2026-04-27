import { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { cn } from './lib/utils';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CheckoutModal } from './components/CheckoutModal';
import { ShiftModal } from './components/ShiftModal';
import { LoginPage } from './pages/LoginPage';
import { tokens, refreshTokens } from './api/client';
import { getActiveShift } from './api/shifts';

const KassaPage              = lazy(() => import('./pages/KassaPage').then((m) => ({ default: m.KassaPage })));
const SalesHistoryPage       = lazy(() => import('./pages/SalesHistoryPage').then((m) => ({ default: m.SalesHistoryPage })));
const SalesHistoryDetailPage = lazy(() => import('./pages/SalesHistoryDetailPage').then((m) => ({ default: m.SalesHistoryDetailPage })));
const CustomersPage          = lazy(() => import('./pages/CustomersPage').then((m) => ({ default: m.CustomersPage })));
const DebtsPage              = lazy(() => import('./pages/DebtsPage').then((m) => ({ default: m.DebtsPage })));
const DebtDetailPage         = lazy(() => import('./pages/DebtDetailPage').then((m) => ({ default: m.DebtDetailPage })));

/* ── Main app shell (only renders when shift is open) ── */
const AppShell = ({ onLogout }: { onLogout: () => void }) => {
  const isSidebarOpen    = useStore((state) => state.isSidebarOpen);
  const setIsSidebarOpen = useStore((state) => state.setIsSidebarOpen);

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans overflow-hidden relative">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div className={cn(
        "fixed left-0 top-0 h-full z-50 transition-transform duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar onLogout={onLogout} />
      </div>
      <main className="flex-1 flex flex-col overflow-hidden min-h-0 min-w-0">
        <Header />
        <Suspense fallback={null}>
          <Routes>
            <Route path="/"            element={<KassaPage />} />
            <Route path="/history"     element={<SalesHistoryPage />} />
            <Route path="/history/:id" element={<SalesHistoryDetailPage />} />
            <Route path="/customers"   element={<CustomersPage />} />
            <Route path="/debts"       element={<DebtsPage />} />
            <Route path="/debts/:id"   element={<DebtDetailPage />} />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <CheckoutModal />
    </div>
  );
};

const Spinner = () => (
  <div className="min-h-dvh flex items-center justify-center bg-[#F8F9FA]">
    <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
  </div>
);

/* ── Root ── */
export default function App() {
  const setShiftId     = useStore((state) => state.setShiftId);
  const shiftId        = useStore((state) => state.shiftId);
  const setActiveShift = useStore((state) => state.setActiveShift);
  const paymentSuccess = useStore((state) => state.paymentSuccess);

  const [isAuthenticated, setIsAuthenticated] = useState(() => !!tokens.access);
  const [isBooting,       setIsBooting]       = useState(() => !tokens.access && !!tokens.refresh);
  const [shiftChecking,   setShiftChecking]   = useState(false);

  /* Silent token refresh on boot */
  useEffect(() => {
    if (!tokens.access && tokens.refresh) {
      refreshTokens()
        .then(() => setIsAuthenticated(true))
        .catch(() => setIsAuthenticated(false))
        .finally(() => setIsBooting(false));
    }
  }, []);

  /* Check active shift whenever we become authenticated */
  useEffect(() => {
    if (!isAuthenticated) return;
    setShiftChecking(true);
    getActiveShift()
      .then((shift) => {
        if (shift?.id) { setShiftId(shift.id); setActiveShift(shift); }
        // else: no active shift → ShiftModal will appear
      })
      .catch((err) => {
        console.error('[shift check]', err);
        // Don't block — ShiftModal's getOrOpenShift will re-check on submit
      })
      .finally(() => setShiftChecking(false));
  }, [isAuthenticated]);

  /* Refresh shift balance after each successful payment */
  useEffect(() => {
    if (!paymentSuccess) return;
    getActiveShift().then((shift) => { if (shift) setActiveShift(shift); }).catch(() => {});
  }, [paymentSuccess]);

  if (isBooting || shiftChecking) return <Spinner />;

  const handleLogin  = () => setIsAuthenticated(true);
  const handleLogout = () => { setIsAuthenticated(false); setShiftId(null); setActiveShift(null); };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/" replace />
            : <LoginPage onLogin={handleLogin} />
        }
      />
      <Route
        path="*"
        element={
          !isAuthenticated
            ? <Navigate to="/login" replace />
            : !shiftId
              ? <ShiftModal onShiftOpened={() => {}} />
              : <AppShell onLogout={handleLogout} />
        }
      />
    </Routes>
  );
}
