import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/axiosConfig';
import { X, ChevronDown, Save } from 'lucide-react';
import { ALL_CATEGORIES } from '../utils/financeUtils';

const ITEMS_PER_PAGE = 10;

interface ReviewModalProps {
  transactions: any[];
  onClose: () => void;
  onConfirm: (finalData: any[]) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ transactions, onClose, onConfirm }) => {
  const [items, setItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  const [openDropdownIdx, setOpenDropdownIdx] = useState<number | null>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalStyle; };
  }, []);

  const processedTransactions = useMemo(() => {
    return [...transactions]
      .filter(t => {
        if (t.category === 'Declined' || t.decline_reason) return false;
        const isTransfer = t.category?.toLowerCase() === 'transfers';
        return !(isTransfer && t.amount > 0);
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

  const toggleDropdown = (idx: number) => {
    const rect = triggerRefs.current[idx]?.getBoundingClientRect();
    if (rect) {
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
      setOpenDropdownIdx(openDropdownIdx === idx ? null : idx);
    }
  };

  useEffect(() => {
    const handleClose = () => setOpenDropdownIdx(null);
    if (openDropdownIdx !== null) {
      window.addEventListener('click', handleClose);
      scrollContainerRef.current?.addEventListener('scroll', handleClose);
    }
    return () => {
      window.removeEventListener('click', handleClose);
      scrollContainerRef.current?.removeEventListener('scroll', handleClose);
    };
  }, [openDropdownIdx]);

  const updateCategory = (pageIdx: number, cat: string) => {
    const actualIdx = currentPage * ITEMS_PER_PAGE + pageIdx;
    const newItems = [...items];
    newItems[actualIdx].category = cat;
    setItems(newItems);
    setOpenDropdownIdx(null);
  };

  const handleConfirm = async () => {
    setIsSaving(true);
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 800));
      onConfirm(items); 
      setIsSaving(false);
      return;
    }
    try {
      await api.post('/monzo/confirm', { transactions: items });
      onConfirm(items); 
    } catch (err) {
      console.error("Confirm Error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatCategoryLabel = (val: string) => {
    const cat = ALL_CATEGORIES.find(c => c.value === val);
    if (cat) return cat.label;
    return val ? val.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "General";
  };

  const paginatedItems = items.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-[#111] border border-[#222] w-full max-w-4xl max-h-[80vh] rounded-[32px] overflow-hidden flex flex-col shadow-2xl">
      <div className="p-6 border-b border-[#222] flex justify-between items-center bg-[#161616]">
  <div>
  <h2 className="text-2xl font-medium text-white">Review Transactions</h2>
    <p className="text-gray-500 font-regular text-sm leading-relaxed max-w-md">
      Review your latest transactions.
    </p>
  </div>
  <button onClick={onClose} className="text-gray-500 hover:text-white">
    <X size={20}/>
  </button>
</div>

        <div ref={scrollContainerRef} className="overflow-y-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-[#1A1A1A] text-white text-sm sticky top-0 z-10">
              <tr>
                <th className="p-5 font-regular text-sm">Merchant</th>
                <th className="p-5 font-regular text-sm">Category</th>
                <th className="p-5 font-regular text-sm">Amount</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((t, idx) => (
                <tr key={idx} className="border-b border-[#222]">
                  <td className="p-5 text-sm text-white">
  {t.category?.toLowerCase() === 'transfers' && t.counterparty?.name 
    ? t.counterparty.name 
    : (t.merchant?.name || t.description || "Unknown")}
</td>
                  <td className="p-5">
                    <div className="relative">
                      <button
                        ref={(el) => { triggerRefs.current[idx] = el; }}
                        onClick={(e) => { e.stopPropagation(); toggleDropdown(idx); }}
                        className={`inline-flex items-center justify-between w-full text-white bg-[#1a1a1a] border ${openDropdownIdx === idx ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-[#333]'} hover:bg-[#222] rounded-xl text-sm px-4 py-2.5 transition-all outline-none`}
                        type="button"
                      >
                        <span>{formatCategoryLabel(t.category)}</span>
                        <ChevronDown size={16} className={`ms-2 text-emerald-500 transition-transform ${openDropdownIdx === idx ? 'rotate-180' : ''}`} />
                      </button>

                      {openDropdownIdx === idx && createPortal(
                        <div 
                          style={{ position: 'absolute', top: coords.top + 6, left: coords.left, width: coords.width, zIndex: 9999 }}
                          className="bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-100"
                        >
                          <ul className="p-1.5 max-h-60 overflow-y-auto">
                            {ALL_CATEGORIES.map((c) => (
                              <li key={c.value}>
                                <button
                                  onClick={() => updateCategory(idx, c.value)}
                                  className="w-full text-left p-2.5 text-sm text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-500 rounded-lg transition-colors"
                                >
                                  {c.label}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>,
                        document.body
                      )}
                    </div>
                  </td>
                  <td className="p-5 text-right text-white text-sm">£{(Math.abs(t.amount) / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-[#161616] border-t border-[#222] flex justify-end gap-4">
                <button onClick={handleConfirm} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-400 transition-all">
                <Save size={18} /> {isSaving ? 'Saving...' : 'Confirm'}
                </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;