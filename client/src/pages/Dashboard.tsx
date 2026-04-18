import { useState, useEffect } from 'react';
import { LogOut, LayoutDashboard, Lock, Settings, RefreshCcw, PieChart, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useFinance } from '../hooks/useFinance'; 
import ReviewModal from '../components/ReviewModal';
import BudgetManager from '../components/BudgetManager';
import CategoryGrid from '../components/CategoryGrid';
import CategorisedMonthlySpend from '../components/CategorisedMonthlySpend';
import SpendingOverTime from '../components/SpendingOverTime';
import HighestExpenses from '../components/HighestExpenses';
import type { Transaction } from '../types/finance'; 
import api from '../api/axiosConfig';
import { ALL_CATEGORIES } from '../utils/financeUtils';

const LockedSection = ({ title, message, id }: { title: string, message: string, id?: string }) => (
  <div id={id} className="flex flex-col items-center justify-center p-32 border-2 border-dashed border-[#222] rounded-[40px] bg-[#0c0c0c] text-center mb-8">
    <div className="p-6 bg-emerald-500/5 rounded-full mb-6">
      <Lock size={48} className="text-emerald-500/20" />
    </div>
    <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
    <p className="text-gray-500 font-regular text-sm leading-relaxed max-w-md">{message}</p>
  </div>
);

export default function Dashboard() {
  const { transactions, budgets, currentMonth, isLoading, fetchFinanceData, setTransactions } = useFinance();
  const [drafts, setDrafts] = useState<any[] | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false); 
  const [alert, setAlert] = useState<{ type: 'error' | 'success', title: string, message: string, isAuthError?: boolean } | null>(null);
  
  const monzoDataFetched = transactions.length > 0;
  const hasBudgetsSet = budgets && Object.values(budgets).some(val => Number(val) > 0);

  useEffect(() => {
    const pendingAuth = localStorage.getItem('pending_monzo_auth');

    const fromMonzo = document.referrer.includes('monzo.com') || window.location.search.includes('code=');
  
    if (fromMonzo || pendingAuth === 'true') {
      localStorage.removeItem('pending_monzo_auth');
      
      setAlert({
        type: 'error',
        title: 'Action Required',
        message: 'Authenticating with Monzo... Please check your mobile app to approve.',
        isAuthError: true
      });
  
      syncMonzoData();
    }
  }, []);

  const restartAuth = () => {
    localStorage.setItem('pending_monzo_auth', 'true');
    window.location.href = 'http://localhost:5000/api/monzo/auth';
  };

  const syncMonzoData = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const monzoResponse = await api.get('/monzo/transactions');
      const processed = monzoResponse.data.map((t: any) => ({
        ...t,
        category: t.decline_reason ? 'Declined' : (t.category || 'Food')
      }));
      setDrafts(processed);
      setAlert(null); 
      setIsAuthorized(true); 
    } catch (err: any) {
      const monzoCode = err.response?.data?.code;
      const status = err.response?.status;
  
      if (status === 403 || status === 400 || monzoCode?.includes('permissions')) {
        setIsAuthorized(false); 
        setAlert({
          type: 'error',
          title: 'Approval Required',
          message: 'Please check your Monzo app and approve the request. Once approved, click "Try Again".',
          isAuthError: true
        });
      } else if (status === 401) {
        restartAuth();
      } else {
        setAlert({ type: 'error', title: 'Sync Failed', message: 'Could not fetch transactions.' });
      }
    } finally { 
      setIsSyncing(false); 
    }
  };
  
  const onConfirmSuccess = async (confirmedData: Transaction[]) => {
    setDrafts(null); 
    setTransactions(confirmedData);
    try {
      await api.post('/monzo/confirm', { transactions: confirmedData });
      setAlert({ type: 'success', title: 'Transactions Saved', message: 'Reviewed and saved successfully.' });
    } catch (err) { console.error(err); }
  };

  if (isLoading) return <div className="fixed inset-0 flex items-center justify-center bg-app-bg text-emerald-500">Loading...</div>;

  const isAnyModalOpen = !!drafts || isSettingsOpen || isBudgetModalOpen;

  return (
    <>
      {alert && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setAlert(null)} />
          <div className="relative w-full max-w-xl animate-in zoom-in-95 duration-200">
            <div className={`rounded-xl border p-5 ${alert.type === 'error' ? 'bg-[#1a0a0a] border-red-500/50' : 'bg-[#0a1a11] border-emerald-500/50'}`}>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  {alert.type === 'error' ? <AlertCircle className="h-5 w-5 text-red-500" /> : <CheckCircle className="h-5 w-5 text-emerald-500" />}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className={`text-sm font-medium ${alert.type === 'error' ? 'text-red-200' : 'text-emerald-200'}`}>{alert.title}</h3>
                  <p className={`mt-2 text-sm ${alert.type === 'error' ? 'text-red-300' : 'text-emerald-300'}`}>{alert.message}</p>
                  {alert.isAuthError && (
                    <div className="mt-4 flex gap-3">
                      <button onClick={syncMonzoData} className="text-xs font-bold px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg">Try Again</button>
                      <button onClick={restartAuth} className="text-xs font-bold px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg border border-white/10">Restart Auth</button>
                    </div>
                  )}
                </div>
                <button onClick={() => setAlert(null)} className="ml-auto text-gray-400 hover:text-gray-500"><X className="h-5 w-5" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className={`sticky top-0 z-50 w-full bg-app-bg/80 backdrop-blur-md border-b border-[#222] transition-all duration-300 ${isAnyModalOpen ? 'blur-sm brightness-50' : ''}`}>
        <div className="max-w-[1126px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">Budgy</h2>
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSettingsOpen(true)} className="text-gray-400 hover:text-white"><Settings size={16} /></button>
            <button onClick={() => window.location.href = 'http://localhost:5000/api/auth/logout'} className="text-xs font-medium text-gray-400 hover:text-red-400 transition-all flex items-center gap-2"><LogOut size={16} /> Logout</button>
          </div>
        </div>
      </nav>

      <main className={`max-w-[1126px] mx-auto p-6 md:p-10 transition-all duration-300 ${isAnyModalOpen ? 'blur-md brightness-50' : ''}`}>
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-[#222] pb-8">
          <div>
            <h1 className="text-3xl font-medium flex items-center gap-3"><LayoutDashboard size={32} className="text-emerald-500" />Welcome, Jaz</h1>
            <p className="text-gray-500 mt-1 mb-6">Budget for <span className="text-emerald-500 font-medium">{currentMonth}</span></p>
            <div className="flex gap-4">
              <button onClick={syncMonzoData} disabled={isSyncing} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-black rounded-xl text-sm font-bold hover:bg-emerald-400 transition-all">
                {isSyncing ? <RefreshCcw size={16} className="animate-spin" /> : (isAuthorized ? <CheckCircle size={16} /> : <RefreshCcw size={16} />)}
                {isSyncing ? 'Syncing...' : (isAuthorized ? 'Monzo Synced' : 'Sync Monzo')}
              </button>
              <button onClick={() => setIsBudgetModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-[#161616] border border-[#222] text-white rounded-xl text-sm font-medium">
                <PieChart size={16} />Configure Budget
              </button>
            </div>
          </div>
        </header>

        {!hasBudgetsSet ? (
          <LockedSection title="Dashboard Locked" message="Please set your monthly budgets to unlock tracking." />
        ) : !monzoDataFetched ? (
          <div className="animate-in fade-in duration-700">
            <LockedSection id="transactions" title="Transactions Locked" message="Sync your Monzo account to fetch latest data." />
            <LockedSection id="metrics" title="Metrics Locked" message="Analytics will unlock after sync." />
          </div>
        ) : (
          <div className="animate-in fade-in duration-700">
            <section id="transactions" className="bg-app-bg border border-[#222] rounded-3xl overflow-hidden shadow-2xl mb-8">
              <div className="p-6 border-b border-[#222] bg-[#161616]"><h2 className="text-xl font-medium">This Month's Transactions</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#1A1A1A] text-[#666]">
                      <th className="p-5 font-medium text-[10px]">Date</th>
                      <th className="p-5 font-medium text-[10px]">Merchant</th>
                      <th className="p-5 font-medium text-[10px]">Category</th>
                      <th className="p-5 font-medium text-[10px] text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t: Transaction) => (
                      <tr key={t._id} className="border-b border-[#222] hover:bg-[#161616]">
                        <td className="p-5 text-sm text-gray-500">{new Date(t.created).toLocaleDateString()}</td>
                        <td className="p-5 text-sm font-medium text-white">{(typeof t.merchant === 'object' && t.merchant?.name) || t.description}</td>
                        <td className="p-5 text-sm">
                          <span className="px-3 py-1 rounded-md bg-[#222] text-gray-300 text-[11px] border border-[#333]">
                            {ALL_CATEGORIES.find(c => c.value === t.category)?.label || t.category}
                          </span>
                        </td>
                        <td className="p-5 text-sm text-right font-medium text-white">£{(Math.abs(t.amount) / 100).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <div id="metrics" className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
              <div className="lg:col-span-5"><CategoryGrid /></div>
              <div className="lg:col-span-7 flex flex-col gap-8">
                <CategorisedMonthlySpend />
                <SpendingOverTime />
                <HighestExpenses />
              </div>
            </div>
          </div>
        )}
      </main>

      {isBudgetModalOpen && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
    <div className="w-full max-w-4xl">
      <BudgetManager 
        key={JSON.stringify(budgets)} 
        onClose={() => setIsBudgetModalOpen(false)} 
      />
    </div>
  </div>
)}

      {drafts && (
        <ReviewModal 
          key={JSON.stringify(drafts)}
          transactions={drafts} 
          onClose={() => setDrafts(null)} 
          onConfirm={onConfirmSuccess}  
        />
      )}
    </>
  );
}