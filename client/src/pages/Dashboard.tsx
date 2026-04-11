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
      <div className="fixed inset-0 flex items-center justify-center bg-[#0A0A0A]">
      <div role="status">
        <svg aria-hidden="true" className="w-10 h-10 text-neutral-800 animate-spin fill-emerald-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 md:p-10 font-medium">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-[#1A1A1A] pb-8">
        <div>
          <h1 className="text-3xl font-medium flex items-center gap-3">
            <LayoutDashboard size={32} className="text-emerald-500" />
            Welcome to Your Finances
          </h1>
          <p className="font-regular text-gray-500 mt-1">Managing expenditure for <span className="text-emerald-500 font-medium">{currentMonth}</span></p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.location.href = 'http://localhost:5000/api/auth/logout'}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all border border-[#222]"
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
              <h2 className="text-[10px] font-black tracking-[0.2em] text-gray-500">Categorised Monthly Budget</h2>
              <CategoryGrid />
            </div>
            
            <div className="lg:col-span-7 flex flex-col gap-4">
               <h2 className="text-[10px] font-black tracking-[0.2em] text-gray-500">Categorised Monthly Spend</h2>
               <CategorisedMonthlySpend />
            </div>
          </div>

          <section className="bg-[#111] border border-[#222] rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#222] flex justify-between items-center bg-[#161616]">
              <h2 className="text-xl font-medium">This Month's Transactions</h2>
              <FileUpload onUploadSuccess={(data: DraftTransaction[]) => setDrafts(data)} />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1A1A1A] text-[#666]">
                    <th className="p-5 font-medium text-[10px] ">Date</th>
                    <th className="p-5 font-medium text-[10px] ">Merchant</th>
                    <th className="p-5 font-medium text-[10px] ">Category</th>
                    <th className="p-5 font-medium text-[10px]  text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? (
                    transactions.map((t: Transaction) => (
                      <tr key={t._id} className="border-b border-[#222] hover:bg-[#161616] transition-all">
                        <td className="p-5 text-sm text-gray-500">
                          {new Date(t.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="p-5 text-sm font-medium text-white">
                          {t.merchant}
                        </td>
                        <td className="p-5 text-sm">
                          <span className="px-3 py-1 rounded-md bg-[#222] text-gray-300 text-[11px] font-medium border border-[#333]">
                            {t.category}
                          </span>
                        </td>
                        <td className="p-5 text-sm text-right font-mono font-medium text-white">
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
          <h3 className="text-xl font-medium text-white mb-2">Dashboard Locked</h3>
          <p className="text-gray-500 font-regular max-w-md text-sm leading-relaxed">
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