import { useState } from 'react';
import { LogOut, LayoutDashboard, Lock } from 'lucide-react';
import { useFinance } from '../hooks/useFinance'; 
import FileUpload from '../components/FileUpload';
import ReviewModal from '../components/ReviewModal';
import BudgetManager from '../components/BudgetManager';
import CategoryGrid from '../components/CategoryGrid';
import CategorisedMonthlySpend from '../components/CategorisedMonthlySpend';
import type { Transaction } from '../types/finance'; 

interface DraftTransaction {
  date: string;
  description: string;
  amount: number;
  merchant: string;
  category: string;
}

export default function Dashboard() {
  const { transactions, budgets, currentMonth, isLoading, fetchFinanceData } = useFinance();
  const [drafts, setDrafts] = useState<DraftTransaction[] | null>(null);

  const hasBudgetsSet = Object.values(budgets).some(val => val > 0);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    const offset = 80; 
    const elementPosition = element?.getBoundingClientRect().top ?? 0;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
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
      <nav className="sticky top-0 z-50 w-full bg-app-bg/80 backdrop-blur-md border-b border-[#222]">
        <div className="max-w-[1126px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => scrollTo('home')} className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white transition-all">Home</button>
            <button onClick={() => scrollTo('budget-config')} className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white transition-all">Budget Configuration</button>
            {!hasBudgetsSet ? (
               <button onClick={() => scrollTo('dashboard-locked')} className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white transition-all">Metrics</button>
            ) : (
               <button onClick={() => scrollTo('metrics')} className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white transition-all">Metrics</button>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => window.location.href = 'http://localhost:5000/api/auth/logout'}
              className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-red-400 transition-all"
            >
              <LogOut size={16} /> Logout
            </button>
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-black text-black">JA</div>
          </div>
        </div>
      </nav>

      <main id="home" className="max-w-[1126px] mx-auto p-6 md:p-10 font-regular">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-[#222] pb-8">
          <div>
            <h1 className="text-3xl font-medium flex items-center gap-3">
              <LayoutDashboard size={32} className="text-emerald-500" />
              Welcome to Your Finances
            </h1>
            <p className="text-gray-500 mt-1">Managing expenditure for <span className="text-emerald-500 font-medium">{currentMonth}</span></p>
            <p className="text-gray-500 mt-1">Please start by entering your budget for each category this month. After you're done, simply save the configuration and hit 'Metrics' to track your current month's spending. Check out 'Getting Started' for an in-depth guide. Alternatively, click 'FAQs' for our most commonly asked questions.</p>
          </div>
        </header>

        <section id="budget-config" className="mb-12">
          <BudgetManager />
        </section>

        {hasBudgetsSet ? (
          <div id="metrics" className="animate-in fade-in duration-700">
                <h1 className="text-2xl font-medium">Your Metrics</h1>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 flex flex-col gap-4 mb-8">
                <h2 className="font-regular text-gray-500 text-sm mt-1">Categorised Monthly Budget</h2>
                <CategoryGrid />
              </div>
              <div className="lg:col-span-7 flex flex-col gap-4 mb-8">
                <h2 className="font-regular text-gray-500 text-sm mt-1">Categorised Monthly Spend</h2>
                <CategorisedMonthlySpend />
              </div>
            </div>

            <section className="bg-app-bg border border-[#222] rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-[#222] flex justify-between items-center bg-[#161616]">
                <h2 className="text-xl font-medium">This Month's Transactions</h2>
                <FileUpload onUploadSuccess={(data: DraftTransaction[]) => setDrafts(data)} />
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
                    {transactions.length > 0 ? (
                      transactions.map((t: Transaction) => (
                        <tr key={t._id} className="border-b border-[#222] hover:bg-[#161616] transition-all">
                          <td className="p-5 text-sm text-gray-500">{new Date(t.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                          <td className="p-5 text-sm font-medium text-white">{t.merchant}</td>
                          <td className="p-5 text-sm">
                            <span className="px-3 py-1 rounded-md bg-[#222] text-gray-300 text-[11px] font-medium border border-[#333]">{t.category}</span>
                          </td>
                          <td className="p-5 text-sm text-right font-medium font-medium text-white">£{Math.abs(t.amount).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-24 text-center text-gray-600 italic text-sm">No transactions found for {currentMonth}.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : (
          <div id="dashboard-locked" className="flex flex-col items-center justify-center p-32 border-2 border-dashed border-[#222] rounded-[40px] bg-[#0c0c0c] text-center">
            <div className="p-6 bg-emerald-500/5 rounded-full mb-6">
              <Lock size={48} className="text-emerald-500/20" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Dashboard Locked</h3>
            <p className="text-gray-500 font-regular text-sm leading-relaxed max-w-md">
              Please set your monthly budgets in the configuration section above to unlock your transaction tracking and analytics.
            </p>
          </div>
        )}
      </main>

      {drafts && (
        <ReviewModal 
          drafts={drafts} 
          onClose={() => setDrafts(null)} 
          onSuccess={() => { setDrafts(null); fetchFinanceData(); }} 
        />
      )}
    </>
  );
}