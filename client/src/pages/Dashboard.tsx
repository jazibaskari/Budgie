import { useState, useEffect } from 'react';
import { LogOut, Lock, RefreshCcw, PieChart, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useFinance } from '../hooks/useFinance'; 
import ReviewModal from '../components/ReviewModal';
import BudgetManager from '../components/BudgetManager';
import CategoryGrid from '../components/CategoryGrid';
import CategorisedMonthlySpend from '../components/CategorisedMonthlySpend';
import SpendingOverTime from '../components/SpendingOverTime';
import HighestExpenses from '../components/HighestExpenses';
import type { Transaction } from '../types/finance'; 
import api from '../api/axiosConfig';
import TextAnimation from "../components/AnimatedText";
import { ALL_CATEGORIES } from '../utils/financeUtils';
import TotalExpenses from '../components/TotalExpenses';
import Footer from '../components/Footer';
import { DUMMY_TRANSACTIONS } from '../utils/mockData';

const LockedSection = ({ title, message, id }: { title: string, message: string, id?: string }) => (
  <div id={id} className="flex flex-col items-center justify-center p-32 border-2 border-[#222] rounded-[40px] bg-[#0c0c0c] text-center mb-8">
    <div className="p-6 bg-emerald-500/5 rounded-full mb-6">
      <Lock size={48} className="text-emerald-500" strokeWidth={1}/>
    </div>
    <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
    <p className="text-gray-500 font-regular text-sm leading-relaxed max-w-md">{message}</p>
  </div>
);

export default function Dashboard() {
  const { transactions, budgets, currentMonth, isLoading, setTransactions } = useFinance();
  const displayMonth = currentMonth ? currentMonth.split(' ')[0] : '';
  const [drafts, setDrafts] = useState<any[] | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false); 
  const [userName, setUserName] = useState('');
  const [alert, setAlert] = useState<{ type: 'error' | 'success', title: string, message: string, isAuthError?: boolean } | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const monzoDataFetched = transactions.length > 0;
  const hasBudgetsSet = budgets && Object.values(budgets).some(val => Number(val) > 0);
  const isFullyUnlocked = monzoDataFetched && hasBudgetsSet;

  const handleBudgetSaveSuccess = () => {
    setAlert({ 
      type: 'success', 
      title: 'Budget Saved', 
      message: 'Budget configuration saved successfully.' 
    });
  };

  useEffect(() => {
    console.log("Is Demo Mode active?", import.meta.env.VITE_DEMO_MODE);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [transactions]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (import.meta.env.VITE_DEMO_MODE === 'true') {
        setUserName('Alissa');
        console.log(import.meta.env.VITE_DEMO_MODE)
        return;
      }

      try {
        const response = await api.get('/user/profile', { withCredentials: true });
        const userData = response.data?.user || response.data;
        const fullName = userData?.name || userData?.displayName || userData?.givenName || userData?.firstName || userData?.email;

        if (fullName) {
          const firstName = fullName.split(' ')[0];
          setUserName(firstName);
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };

    fetchUserProfile();

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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const syncMonzoData = async () => {
    if (isSyncing) return;

    if (isAuthorized) {
      setAlert({ 
        type: 'success', 
        title: 'Up to Date', 
        message: 'Monzo Synced successfully. You have no new transactions to review.' 
      });
      return;
    }
 
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      setIsSyncing(true);
      setTimeout(() => {
        setIsAuthorized(true); 
        setDrafts(DUMMY_TRANSACTIONS);
        setAlert(null);
        setIsSyncing(false);
      }, 1200); 
      return;
    }

    setIsSyncing(true);
    try {
      const monzoResponse = await api.get('/monzo/transactions');
      
      const processed = monzoResponse.data
        .filter((t: any) => {
          if (t.category === 'Declined' || t.decline_reason) return false;
          const isTransfer = t.category?.toLowerCase() === 'transfers';
          return !(isTransfer && t.amount > 0);
        })
        .map((t: any) => ({
          ...t,
          category: t.category || 'Food'
        }));
      
      setIsAuthorized(true); 

      if (processed.length === 0) {
        setDrafts(null);
        setAlert({ 
          type: 'success', 
          title: 'Up to Date', 
          message: 'Monzo Synced successfully. You have no new transactions to review.' 
        });
      } else {
        setDrafts(processed);
        setAlert(null); 
      }
      
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 403 || status === 400) {
        setIsAuthorized(false); 
        setAlert({
          type: 'error',
          title: 'Approval Required',
          message: 'Please check your Monzo app and approve the request.',
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

    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      setAlert({ type: 'success', title: 'Demo Mode', message: 'Transactions processed locally.' });
      return;
    }

    try {
      await api.post('/monzo/confirm', { transactions: confirmedData });
      setAlert({ type: 'success', title: 'Transactions Saved', message: 'Reviewed and saved successfully.' });
    } catch (err) { console.error(err); }
  };

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);

  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  if (isLoading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-app-bg">
      <svg className="w-10 h-10 animate-spin fill-emerald-500" viewBox="0 0 100 101" fill="none">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
      </svg>
    </div>
  );

  const isAnyModalOpen = !!drafts || isBudgetModalOpen;

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
          <div className="flex items-center gap-10">
            <button 
              onClick={() => scrollToSection('home')}
              className="text-white font-bold text-lg hover:text-white transition-colors"
            >
              Budgy
            </button>
            {isFullyUnlocked && (
              <div className="hidden md:flex items-center gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
                <button 
                  onClick={() => scrollToSection('transactions')}
                  className="text-xs font-bold text-gray-400 hover:text-white transition-colors"
                >
                  Overview
                </button>
                <button 
                  onClick={() => scrollToSection('metrics')}
                  className="text-xs font-bold text-gray-400 hover:text-white transition-colors"
                >
                  Insights
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
          <button 
  onClick={() => {
    localStorage.clear(); 
    
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      window.location.href = window.location.origin; 
    } else {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      window.location.href = `${backendUrl}/auth/logout`;
    }
  }} 
  className="text-xs font-medium text-gray-400 hover:text-red-400 transition-all flex items-center gap-2"
>
  <LogOut size={16} /> Logout
</button>
          </div>
        </div>
      </nav>

      <main id="home" className={`max-w-[1126px] mx-auto p-6 md:p-10 transition-all duration-300 ${isAnyModalOpen ? 'blur-md brightness-50' : ''}`}>
        <header className="mb-12 pb-8">
          <div className="flex flex-row items-stretch gap-[20px]">
            <div className="flex-none max-w-2xl flex flex-col">
              <TextAnimation duration={0.8}>
                <h1 className="text-5xl font-bold text-white leading-none">
                  {userName ? `Welcome, ${userName}` : 'Your Dashboard'}
                </h1>
              </TextAnimation>
              <TextAnimation duration={1.1} >
                <p className="text-gray-300 font- text-4xl mb-2">
                  <span className="text-emerald-500">{currentMonth}</span>
                </p> 
              </TextAnimation>
              <p className="text-gray-300 font-regular text-md mb-4 pt-6 leading-relaxed">
                Simply click <span className="text-white font-bold">'Sync Monzo'</span> and authenticate with Monzo via <span className="text-white font-bold">e-mail</span>, then your <span className="text-white font-bold">mobile device</span>. In the background, your most recent transactions will be synced to your dashboard. Next, hit <span className="text-white font-bold">'Configure Budget'</span> to set your budget for this month. Complete the aforementioned steps to unlock your dashboard metrics, easily monitor your spending habits with the resulting inights, and filter your data however you'd like.
              </p>
              <div className="flex gap-4 mt-auto">
                <button onClick={syncMonzoData} disabled={isSyncing} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-400 transition-all">
                  {isSyncing ? <RefreshCcw size={16} className="animate-spin" /> : (isAuthorized ? <CheckCircle size={16} /> : <RefreshCcw size={16} />)}
                  {isSyncing ? 'Syncing...' : (isAuthorized ? 'Monzo Synced' : 'Sync Monzo')}
                </button>
                <button onClick={() => setIsBudgetModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-[#161616] border border-[#222] text-white rounded-xl text-sm font-medium hover:bg-[#222] transition-all">
                  <PieChart size={16} />
                  Configure Budget
                </button>
              </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 items-stretch">
              <div className="lg:col-span-5 bg-[#141414] border border-[#262626] rounded-3xl shadow-xl flex flex-col overflow-hidden">
                <TotalExpenses />
              </div>

              <section id="transactions" className="lg:col-span-7 bg-app-bg border border-[#222] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between min-h-[600px]">
  <div>
    <div className="p-6 border-b border-[#222] bg-[#161616]">
      <h1 className="text-2xl font-medium">{displayMonth}'s Transactions</h1>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left table-fixed">
        <thead>
          <tr className="bg-[#1A1A1A] text-white">
            <th className="p-5 font-regular text-sm w-[120px]">Date</th>
            <th className="p-5 font-regular text-sm">Merchant</th>
            <th className="p-5 font-regular text-sm w-[140px]">Category</th>
            <th className="p-5 font-regular text-sm text-right w-[100px]">Amount</th>
          </tr>
        </thead>
        <tbody>
          {currentTransactions.map((t: Transaction) => (
            <tr key={t._id} className="border-b border-[#222] hover:bg-[#161616] h-[72px]">
              <td className="p-5 text-sm text-gray-500 font-regular truncate">
                {new Date(t.created).toLocaleDateString('en-GB')}
              </td>
              <td className="p-5 text-sm font-regular text-white truncate">
                {(typeof t.merchant === 'object' && t.merchant?.name) || t.description}
              </td>
              <td className="p-5 text-sm">
                <span className="px-3 py-1 rounded-lg py-1.5 bg-[#222] text-white text-sm font-regular whitespace-nowrap">
                  {ALL_CATEGORIES.find(c => c.value === t.category)?.label || t.category}
                </span>
              </td>
              <td className="p-5 text-sm text-right font-regular text-white">
                £{(Math.abs(t.amount) / 100).toFixed(2)}
              </td>
            </tr>
          ))}
          {Array.from({ length: Math.max(0, itemsPerPage - currentTransactions.length) }).map((_, i) => (
            <tr key={`empty-${i}`} className="h-[72px] border-b border-[#222]/10">
              <td colSpan={4}>&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

  <div className="flex items-center justify-between border-t border-[#222] px-4 py-3 sm:px-6 mt-auto bg-[#0c0c0c]">
    <div className="flex flex-1 justify-between sm:hidden">
      <button 
        onClick={handlePreviousPage} 
        disabled={currentPage === 1} 
        className="relative inline-flex items-center rounded-md border border-[#333] bg-[#161616] px-4 py-2 text-sm font-medium text-gray-200 hover:bg-[#222] disabled:opacity-50"
      >
        Previous
      </button>
      <button 
        onClick={handleNextPage} 
        disabled={currentPage === totalPages || totalPages === 0} 
        className="relative ml-3 inline-flex items-center rounded-md border border-[#333] bg-[#161616] px-4 py-2 text-sm font-medium text-gray-200 hover:bg-[#222] disabled:opacity-50"
      >
        Next
      </button>
    </div>
    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-gray-400">
          Showing <span className="font-medium text-white">{transactions.length > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="font-medium text-white">{Math.min(indexOfLastItem, transactions.length)}</span> of <span className="font-medium text-white">{transactions.length}</span> results
        </p>
      </div>
      <div>
        <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-sm">
          <button 
            onClick={handlePreviousPage} 
            disabled={currentPage === 1} 
            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 hover:bg-[#161616] focus:z-20 focus:outline-offset-0 disabled:opacity-50 border border-[#222]"
          >
            <span className="sr-only">Previous</span>
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="size-5">
              <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
            </svg>
          </button>
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-500 border border-[#222] bg-app-bg focus:outline-offset-0">...</span>
            ) : (
              <button 
                key={`page-${page}`} 
                onClick={() => setCurrentPage(page as number)} 
                aria-current={currentPage === page ? "page" : undefined} 
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${currentPage === page ? 'z-10 bg-emerald-500/50 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500' : 'text-gray-300 hover:bg-[#161616] border border-[#222] hidden md:inline-flex'}`}
              >
                {page}
              </button>
            )
          ))}
          <button 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages || totalPages === 0} 
            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 hover:bg-[#161616] focus:z-20 focus:outline-offset-0 disabled:opacity-50 border border-[#222]"
          >
            <span className="sr-only">Next</span>
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="size-5">
              <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
</section>
            </div>
            <div id="metrics" className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
              <div className="lg:col-span-5"><CategoryGrid /></div>
              <div className="lg:col-span-7 flex flex-col gap-8">
                <HighestExpenses showOnlyTotal={true}/>
                <CategorisedMonthlySpend />
                <SpendingOverTime />
              </div>
            </div>
          </div>
        )}
      </main>

      <div className={isAnyModalOpen ? 'blur-md brightness-50 transition-all' : ''}>
        <Footer />
      </div>

      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="w-full max-w-4xl">
            <BudgetManager key={JSON.stringify(budgets)} onClose={() => setIsBudgetModalOpen(false)} onSaveSuccess={handleBudgetSaveSuccess} onAlert={( title, message) => setAlert({ type: 'error', title, message })} />
          </div>
        </div>
      )}

      {drafts && (
        <ReviewModal key={JSON.stringify(drafts)} transactions={drafts} onClose={() => setDrafts(null)} onConfirm={onConfirmSuccess} />
      )}
    </>
  );
}