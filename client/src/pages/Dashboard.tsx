import { useEffect, useState, useCallback } from 'react';
import api from '../api/axiosConfig';
import { LogOut, Table as TableIcon } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import ReviewModal from '../components/ReviewModal';

interface Transaction {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category: string;
}

interface DraftTransaction {
  date: string;
  description: string;
  amount: number;
  merchant: string;
  category: string;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<DraftTransaction[] | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.error("Fetch History Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="p-6 w-full max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-h)] flex items-center gap-2">
            <TableIcon size={28} className="text-[var(--accent)]" />
            Financial History
          </h1>
          <p className="text-[var(--text)]">View and manage your AI-processed transactions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <FileUpload onUploadSuccess={(data: DraftTransaction[]) => setDrafts(data)} />
          
          <button 
            onClick={() => window.location.href = 'http://localhost:5000/api/auth/logout'}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <div className="bg-white border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 text-center text-[var(--text)] text-sm animate-pulse">
            Fetching your records...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[var(--border)]">
                  <th className="p-5 font-semibold text-xs uppercase tracking-wider text-slate-500">Date</th>
                  <th className="p-5 font-semibold text-xs uppercase tracking-wider text-slate-500">Merchant</th>
                  <th className="p-5 font-semibold text-xs uppercase tracking-wider text-slate-500">Category</th>
                  <th className="p-5 font-semibold text-xs uppercase tracking-wider text-slate-500 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((t) => (
                    <tr key={t.id} className="border-b border-[var(--border)] hover:bg-slate-50 transition-colors">
                      <td className="p-5 text-sm whitespace-nowrap text-slate-600">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className="p-5 text-sm font-bold text-[var(--text-h)]">
                        {t.merchant}
                      </td>
                      <td className="p-5 text-sm">
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                          {t.category}
                        </span>
                      </td>
                      <td className={`p-5 text-sm text-right font-mono font-bold ${t.amount < 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {t.amount < 0 ? '-' : '+'}${Math.abs(t.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-20 text-center text-slate-400 italic">
                      No records found. Upload a CSV to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {drafts && (
        <ReviewModal 
          drafts={drafts} 
          onClose={() => setDrafts(null)} 
          onSuccess={() => {
            setDrafts(null);
            fetchHistory();
          }} 
        />
      )}
    </div>
  );
}