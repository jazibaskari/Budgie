import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axiosConfig';
import { X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

// The raw Monzo categories
const MONZO_CATEGORIES = [
  "general", "eating_out", "expenses", "transport", "cash", 
  "bills", "entertainment", "shopping", "holidays", "groceries"
];

// Helper: Converts 'eating_out' to 'Eating Out'
const formatCategory = (str: string) => {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Create the dropdown list: { original: 'eating_out', display: 'Eating Out' }
const ALL_CATEGORIES = MONZO_CATEGORIES.map(cat => ({
  value: cat,
  label: formatCategory(cat)
}));

interface ReviewModalProps {
  transactions: any[];
  onClose: () => void;
  onConfirm: (finalData: any[]) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ transactions, onClose, onConfirm }) => {
  const [items, setItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const processedTransactions = useMemo(() => {
    return [...transactions]
      .filter(t => {
        if (t.category === 'Declined' || t.decline_reason) return false;
        const isTransfer = t.category?.toLowerCase() === 'transfers';
        if (isTransfer && t.amount > 0) return false;
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.created || a.createdAt || a.date || 0).getTime();
        const dateB = new Date(b.created || b.createdAt || b.date || 0).getTime();
        return dateB - dateA;
      });
  }, [transactions]);

  useEffect(() => {
    setItems(processedTransactions);
    setCurrentPage(0);
  }, [processedTransactions]);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginatedItems = items.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  const updateCategory = (pageIdx: number, cat: string) => {
    const actualIdx = currentPage * ITEMS_PER_PAGE + pageIdx;
    const newItems = [...items];
    newItems[actualIdx].category = cat;
    setItems(newItems);
  };

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      await api.post('/transactions/confirm', { transactions: items });
      onConfirm(items);
    } catch (err) {
      console.error("Confirm Error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-[#111] border border-[#222] w-full max-w-4xl max-h-[80vh] rounded-[32px] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-[#222] flex justify-between items-center bg-[#161616]">
          <h2 className="text-xl font-medium text-white">Review Transactions</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20}/></button>
        </div>

        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-[#1A1A1A] text-[#666] text-[10px] sticky top-0 z-10">
              <tr>
                <th className="p-5">Merchant</th>
                <th className="p-5">Category</th>
                <th className="p-5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((t, idx) => (
                <tr key={idx} className="border-b border-[#222]">
                  <td className="p-5 text-sm text-white">{t.merchant?.name || t.description || t.merchant || "Unknown"}</td>
                  <td className="p-5">
                    <div className="relative">
                      <select 
                        value={t.category || "general"} 
                        onChange={(e) => updateCategory(idx, e.target.value)}
                        className="appearance-none bg-[#222] border border-[#333] text-emerald-500 text-[11px] px-3 py-1 rounded-lg w-full outline-none"
                      >
                        {ALL_CATEGORIES.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-2 text-emerald-500 pointer-events-none"/>
                    </div>
                  </td>
                  <td className="p-5 text-right text-white text-sm">£{(Math.abs(t.amount) / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length > ITEMS_PER_PAGE && (
          <div className="px-6 py-4 border-t border-[#222] flex justify-center items-center gap-4 bg-[#161616]">
            <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} className="p-2 text-white hover:text-emerald-500 disabled:opacity-20"><ChevronLeft size={24} /></button>
            <span className="text-xs text-gray-400 font-bold">PAGE {currentPage + 1} OF {totalPages}</span>
            <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} className="p-2 text-white hover:text-emerald-500 disabled:opacity-20"><ChevronRight size={24} /></button>
          </div>
        )}

        <div className="p-6 bg-[#161616] border-t border-[#222] flex justify-end gap-4">
          <button onClick={onClose} className="text-gray-400 text-sm">Cancel</button>
          <button onClick={handleConfirm} disabled={isSaving} className="bg-emerald-500 text-black px-8 py-3 rounded-xl font-black text-sm hover:bg-emerald-400 disabled:opacity-50">
            {isSaving ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;