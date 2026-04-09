import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { LogOut, Table as TableIcon } from 'lucide-react'; 

interface Transaction {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category: string;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/api/transactions');
        setTransactions(res.data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-6 w-full">
      <header className="flex justify-between items-center mb-8">
        <div>
          {/* TableIcon is used here to satisfy the linter */}
          <h1 className="text-3xl font-bold text-[var(--text-h)] flex items-center gap-2">
            <TableIcon size={28} className="text-[var(--accent)]" />
            Financial History
          </h1>
          <p className="text-[var(--text)]">View and manage your AI-processed transactions.</p>
        </div>
        <button 
          onClick={() => window.location.href = 'http://localhost:5000/api/auth/logout'}
          className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} /> Logout
        </button>
      </header>

      <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 text-center text-[var(--text)] text-sm animate-pulse">
            Loading transactions...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[var(--border)]">
                  <th className="p-4 font-semibold text-sm text-[var(--text-h)]">Date</th>
                  <th className="p-4 font-semibold text-sm text-[var(--text-h)]">Merchant</th>
                  <th className="p-4 font-semibold text-sm text-[var(--text-h)]">Category</th>
                  <th className="p-4 font-semibold text-sm text-right text-[var(--text-h)]">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((t) => (
                    <tr key={t.id} className="border-b border-[var(--border)] hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-sm whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm font-medium text-[var(--text-h)]">
                        {t.merchant}
                      </td>
                      <td className="p-4 text-sm">
                        <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 text-xs font-semibold uppercase tracking-wider">
                          {t.category}
                        </span>
                      </td>
                      <td className={`p-4 text-sm text-right font-bold ${t.amount < 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {t.amount < 0 ? '-' : '+'}${Math.abs(t.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-slate-400 italic">
                      No transactions found. Try uploading a CSV!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}