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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-emerald-500 animate-pulse font-mono tracking-widest uppercase text-sm">
          Loading Financial Data...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 md:p-10 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-[#1A1A1A] pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <LayoutDashboard size={32} className="text-emerald-500" />
            Welcome to Your Finances
          </h1>
          <p className="text-gray-500 mt-1">Managing expenditure for <span className="text-emerald-500 font-medium">{currentMonth}</span></p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.location.href = 'http://localhost:5000/api/auth/logout'}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all border border-[#222]"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <section className="mb-12">
        <BudgetManager />
      </section>

      {hasBudgetsSet ? (
        <div className="space-y-12 animate-in fade-in duration-700">
          

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Categorised Monthly Budget</h2>
              <CategoryGrid />
            </div>
            
            <div className="lg:col-span-7 flex flex-col gap-4">
               <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Categorised Monthly Spend</h2>
               <CategorisedMonthlySpend />
            </div>
          </div>

          <section className="bg-[#111] border border-[#222] rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#222] flex justify-between items-center bg-[#161616]">
              <h2 className="text-xl font-bold">This Month's Transactions</h2>
              <FileUpload onUploadSuccess={(data: DraftTransaction[]) => setDrafts(data)} />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1A1A1A] text-[#666]">
                    <th className="p-5 font-bold text-[10px] uppercase tracking-widest">Date</th>
                    <th className="p-5 font-bold text-[10px] uppercase tracking-widest">Merchant</th>
                    <th className="p-5 font-bold text-[10px] uppercase tracking-widest">Category</th>
                    <th className="p-5 font-bold text-[10px] uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? (
                    transactions.map((t: Transaction) => (
                      <tr key={t._id} className="border-b border-[#222] hover:bg-[#161616] transition-all">
                        <td className="p-5 text-sm text-gray-500">
                          {new Date(t.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="p-5 text-sm font-bold text-white">
                          {t.merchant}
                        </td>
                        <td className="p-5 text-sm">
                          <span className="px-3 py-1 rounded-md bg-[#222] text-gray-300 text-[11px] font-bold border border-[#333]">
                            {t.category}
                          </span>
                        </td>
                        <td className="p-5 text-sm text-right font-mono font-bold text-white">
                          £{Math.abs(t.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-24 text-center text-gray-600 italic text-sm">
                        No transactions found for {currentMonth}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : (

        <div className="flex flex-col items-center justify-center p-32 border-2 border-dashed border-[#222] rounded-[40px] bg-[#0c0c0c] text-center">
          <div className="p-6 bg-emerald-500/5 rounded-full mb-6">
            <Lock size={48} className="text-emerald-500/20" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Dashboard Locked</h3>
          <p className="text-gray-500 max-w-sm text-sm leading-relaxed">
            Please set your monthly budgets in the configuration section above to unlock your transaction tracking and analytics.
          </p>
        </div>
      )}

      {drafts && (
        <ReviewModal 
          drafts={drafts} 
          onClose={() => setDrafts(null)} 
          onSuccess={() => {
            setDrafts(null);
            fetchFinanceData(); 
          }} 
        />
      )}
    </div>
  );
}