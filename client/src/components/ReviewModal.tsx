import React, { useState } from 'react';
import api from '../api/axiosConfig';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

interface DraftTransaction {
  date: string;
  description: string;
  amount: number;
  merchant: string;
  category: string;
}

interface ReviewModalProps {
  drafts: DraftTransaction[];
  onClose: () => void;
  onSuccess: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ drafts, onClose, onSuccess }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsSaving(true);
    setError(null);
    try {

      await api.post('/transactions/confirm', {
        transactions: drafts,
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
      });
      
      onSuccess();
    } catch (err) {
      console.error('Confirmation Error:', err);
      setError(err.response?.data?.error || 'Failed to save transactions.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#111] border border-[#222] w-full max-w-4xl max-h-[80vh] rounded-[32px] overflow-hidden flex flex-col shadow-2xl">
        
        <div className="p-6 border-b border-[#222] flex justify-between items-center bg-[#161616]">
          <div>
            <h2 className="text-xl font-medium text-white flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" size={20} />
              Review AI Extraction
            </h2>
            <p className="text-xs text-gray-500 mt-1  font-medium">
              Verify {drafts.length} Transactions
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#222] rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 bg-black">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#1A1A1A] text-[#666] z-10">
              <tr>
                <th className="p-5 font-medium text-[10px] ">Merchant</th>
                <th className="p-5 font-medium text-[10px] ">Category</th>
                <th className="p-5 font-medium text-[10px]  text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((t, idx) => (
                <tr key={idx} className="border-b border-[#111] hover:bg-[#161616]/50 transition-all">
                  <td className="p-5">
                    <div className="text-sm font-medium text-white">{t.merchant}</div>
                    <div className="text-[10px] text-gray-600 font-mono mt-1">{t.date}</div>
                  </td>
                  <td className="p-5">
                    <span className="px-3 py-1 rounded-md bg-[#222] text-emerald-500 text-[11px] font-medium border border-emerald-500/10">
                      {t.category}
                    </span>
                  </td>
                  <td className="p-5 text-right font-mono font-medium text-white">
                    £{Math.abs(t.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-[#222] bg-[#161616] flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs font-medium mb-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          
          <div className="flex justify-end gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-3 text-sm font-medium text-gray-400 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm}
              disabled={isSaving}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-900 disabled:text-emerald-500 text-black font-black text-sm rounded-xl transition-all flex items-center gap-2"
            >
              {isSaving ? 'SAVING TO COSMOS...' : 'CONFIRM & SAVE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;