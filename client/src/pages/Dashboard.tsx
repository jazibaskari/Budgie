import { useState } from 'react';
import { LogOut, LayoutDashboard, Lock, Settings } from 'lucide-react';
import { useFinance } from '../hooks/useFinance'; 
import ReviewModal from '../components/ReviewModal';
import BudgetManager from '../components/BudgetManager';
import CategoryGrid from '../components/CategoryGrid';
import CategorisedMonthlySpend from '../components/CategorisedMonthlySpend';
import type { Transaction } from '../types/finance'; 

const LockedSection = ({ title, message, id }: { title: string, message: string, id?: string }) => (
  <div id={id} className="flex flex-col items-center justify-center p-32 border-2 border-dashed border-[#222] rounded-[40px] bg-[#0c0c0c] text-center mb-8">
    <div className="p-6 bg-emerald-500/5 rounded-full mb-6">
      <Lock size={48} className="text-emerald-500/20" />
    </div>
    <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
    <p className="text-gray-500 font-regular text-sm leading-relaxed max-w-md">
      {message}
    </p>
  </div>
);

export default function Dashboard() {
  const { transactions, budgets, currentMonth, isLoading, fetchFinanceData } = useFinance();
  const [drafts, setDrafts] = useState<any[] | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [accountId, setAccountId] = useState('');
  
  const monzoDataFetched = transactions.length > 0;
  const hasBudgetsSet = Object.values(budgets).some(val => Number(val) > 0);

  const handleSaveSettings = async () => {
    try {
      const response = await fetch('/api/settings/save-monzo-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, accountId }),
      });
      
      if (response.ok) {
        setIsSettingsOpen(false);
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (e) {
      console.error(e);
      alert('Error connecting to server');
    }
  };

  const handleMonzoFetchSuccess = (data: any[]) => {
    setDrafts(null); 
    setTimeout(() => {
      setDrafts(data);
    }, 10);
  };
  
  const onConfirmSuccess = () => {
    setDrafts(null); 
    fetchFinanceData(); 
  };

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    const offset = 80; 
    const elementPosition = element?.getBoundingClientRect().top ?? 0;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-app-bg">
        <svg className="w-10 h-10 animate-spin fill-emerald-500" viewBox="0 0 100 101" fill="none">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
        </svg>
      </div>
    );
  }

  return (
    <>
      <nav className={`sticky top-0 z-50 w-full bg-app-bg/80 backdrop-blur-md border-b border-[#222] transition-all duration-300 ${drafts ? 'blur-sm brightness-50' : ''}`}>
        <div className="max-w-[1126px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => scrollTo('home')} className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white transition-all">Home</button>
            <button onClick={() => scrollTo('budget-config')} className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white transition-all">Budget Configuration</button>
            <button onClick={() => scrollTo('transactions')} className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white transition-all">Transactions</button>
            <button onClick={() => scrollTo(hasBudgetsSet && monzoDataFetched ? 'metrics' : 'dashboard-locked')} className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white transition-all">Metrics</button>
          </div>
          
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition-all">
              <Settings size={16} />
            </button>
            <button onClick={() => window.location.href = 'http://localhost:5000/api/auth/logout'} className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-red-400 transition-all">
              <LogOut size={16} /> Logout
            </button>
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-black text-black">JA</div>
          </div>
        </div>
      </nav>
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-[#161616] border border-[#222] p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-medium mb-6">Monzo Configuration</h2>
            <input 
              placeholder="Access Token" 
              className="w-full bg-[#1A1A1A] border border-[#222] p-3 rounded-lg text-sm mb-4 text-white" 
              onChange={(e) => setAccessToken(e.target.value)} 
            />
            <input 
              placeholder="Account ID" 
              className="w-full bg-[#1A1A1A] border border-[#222] p-3 rounded-lg text-sm mb-6 text-white" 
              onChange={(e) => setAccountId(e.target.value)} 
            />
            <div className="flex gap-4">
              <button onClick={() => setIsSettingsOpen(false)} className="flex-1 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
              <button onClick={handleSaveSettings} className="flex-1 py-2 bg-emerald-500 text-black text-sm font-medium rounded-lg hover:bg-emerald-400 transition-all">Save Config</button>
            </div>
          </div>
        </div>
      )}
      <main id="home" className={`max-w-[1126px] mx-auto p-6 md:p-10 font-regular transition-all duration-300 ${drafts ? 'blur-md brightness-50' : ''}`}>
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-[#222] pb-8">
          <div>
            <h1 className="text-3xl font-medium flex items-center gap-3">
              <LayoutDashboard size={32} className="text-emerald-500" />
              Welcome to Your Finances
            </h1>
            <p className="text-gray-500 mt-1">Managing expenditure for <span className="text-emerald-500 font-medium">{currentMonth}</span></p>
          </div>
        </header>

        <section id="budget-config" className="mb-12">
          <BudgetManager onMonzoFetch={handleMonzoFetchSuccess} />
        </section>

        {!hasBudgetsSet ? (
          <LockedSection 
            id="dashboard-locked"
            title="Dashboard Locked" 
            message="Please set your monthly budgets in the configuration section above to unlock your transaction tracking and analytics." 
          />
        ) : !monzoDataFetched ? (
          <div id="data-locked" className="animate-in fade-in duration-700">
            <LockedSection 
              id="transactions"
              title="Monthly Transactions Locked" 
              message="Your budgets are set! Now, save your configuration to fetch your latest Monzo transactions and unlock your tracking." 
            />
            <LockedSection 
              id="metrics"
              title="Metrics Locked" 
              message="Financial analytics will become available once your Monzo transactions have been fetched and confirmed." 
            />
          </div>
        ) : (
          <div className="animate-in fade-in duration-700">
            <section id="transactions" className="bg-app-bg border border-[#222] rounded-3xl overflow-hidden shadow-2xl mb-8">
              <div className="p-6 border-b border-[#222] flex justify-between items-center bg-[#161616]">
                <h2 className="text-xl font-medium">This Month's Transactions</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
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
                      <tr key={t._id} className="border-b border-[#222] hover:bg-[#161616] transition-all">
                        <td className="p-5 text-sm text-gray-500">{new Date(t.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                        <td className="p-5 text-sm font-medium text-white">{t.merchant 
    ? (typeof t.merchant === 'object' && t.merchant !== null ? t.merchant.name : t.merchant) 
    : "Unknown Merchant"}</td>
                        <td className="p-5 text-sm">
                          <span className="px-3 py-1 rounded-md bg-[#222] text-gray-300 text-[11px] font-medium border border-[#333]">{t.category}</span>
                        </td>
                        <td className="p-5 text-sm text-right font-medium text-white">£{Math.abs(t.amount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div id="metrics" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 flex flex-col gap-4 mb-8">
                <h1 className="text-2xl font-medium">Categorised Monthly Budget</h1>
                <CategoryGrid />
              </div>
              <div className="lg:col-span-7 flex flex-col gap-4 mb-8">
                <h1 className="text-2xl font-medium">Categorised Monthly Spend</h1>
                <CategorisedMonthlySpend />
              </div>
            </div>
          </div>
        )}
      </main>
      {drafts && (
        <ReviewModal 
          key={JSON.stringify(drafts)}
          transactions={drafts} 
          onClose={() => setDrafts(null)} 
          onConfirm={() => {
            onConfirmSuccess();
          }}  
        />
      )}
    </>
  );
}