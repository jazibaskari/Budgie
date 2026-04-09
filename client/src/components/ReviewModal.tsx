import api from '../api/axiosConfig';
import { Check, X, AlertCircle } from 'lucide-react';

interface DraftTransaction {
  date: string;
  description: string;
  amount: number;
  merchant: string;
  category: string;
}

interface Props {
  drafts: DraftTransaction[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({ drafts, onClose, onSuccess }: Props) {
    const handleConfirm = async () => {
        try {
          await api.post('/api/transactions/confirm', { transactions: drafts });
          onSuccess();
        } catch (err) {
          console.error("Confirmation Error:", err);
          alert("Failed to save transactions. Please try again.");
        }
      };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-h)] flex items-center gap-2">
              <AlertCircle className="text-[var(--accent)]" /> Review AI Categorization
            </h2>
            <p className="text-sm text-[var(--text)]">Gemini has processed your file. Please confirm the details below.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase text-slate-400 font-bold border-b border-[var(--border)]">
                <th className="pb-3 px-2">Date</th>
                <th className="pb-3 px-2">Merchant</th>
                <th className="pb-3 px-2">Category</th>
                <th className="pb-3 px-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((d, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0 italic">
                  <td className="py-4 px-2 text-sm">{d.date}</td>
                  <td className="py-4 px-2 text-sm font-semibold">{d.merchant}</td>
                  <td className="py-4 px-2">
                    <span className="bg-[var(--accent-bg)] text-[var(--accent)] px-2 py-1 rounded-md text-xs font-bold border border-[var(--accent-border)]">
                      {d.category}
                    </span>
                  </td>
                  <td className={`py-4 px-2 text-sm text-right font-mono ${d.amount < 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {d.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-[var(--border)] bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-all">
            Cancel
          </button>
          <button onClick={handleConfirm} className="px-6 py-2 rounded-xl font-bold bg-[var(--accent)] text-white shadow-lg hover:brightness-110 flex items-center gap-2 transition-all">
            <Check size={18} /> Confirm & Save
          </button>
        </div>
      </div>
    </div>
  );
}