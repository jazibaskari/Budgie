import React, { useState, useRef } from 'react';
import { Save, X } from 'lucide-react';
import api from '../api/axiosConfig'; 
import { useFinance } from '../hooks/useFinance';

const DEFAULT_CATEGORIES = [
  "General", "Holidays", "Transport", "Shopping", 
  "Groceries", "Entertainment", "Bills", "Eating Out", "Cash", "Expenses"
];

interface BudgetManagerProps {
  onClose: () => void;
  onSaveSuccess: () => void; 
  onAlert: (title: string, message: string) => void;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ onClose, onSaveSuccess, onAlert}) => {
  const { budgets, fetchFinanceData, setBudgets } = useFinance();
  const [isSaving, setIsSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [localBudgets, setLocalBudgets] = useState<Record<string, number | string>>(() => {
    const initial: Record<string, string | number> = {};
    DEFAULT_CATEGORIES.forEach(cat => {
      initial[cat] = (budgets && budgets[cat] !== undefined) ? budgets[cat] : "";
    });
    return initial;
  });

  const handleUpdateBudget = (category: string, value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setLocalBudgets(prev => ({ ...prev, [category]: value }));
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      } else {
        e.currentTarget.blur();
      }
    }
  };

  const handleSave = async () => {
    const hasEmptyFields = Object.values(localBudgets).some(val => val === "");
    
    if (hasEmptyFields) {
      setShowErrors(true);
      onAlert('Missing Information', 'Please set a budget for all categories. Use 0 if you do not wish to set a limit.');
      return;
    }

    setIsSaving(true);
    setShowErrors(false);
    try {
      const payload: Record<string, number> = {};
      Object.entries(localBudgets).forEach(([cat, val]) => {
        payload[cat] = Number(val);
      });

      if (import.meta.env.VITE_DEMO_MODE === 'true') {
        setBudgets(payload);
        setTimeout(() => {
          onSaveSuccess();
          onClose();
        }, 500);
        return;
      }

      await api.post('/user/budgets', { budgets: payload }, { withCredentials: true });
      await fetchFinanceData();
      onSaveSuccess();
      onClose();
    } catch (err) {
      onAlert('Error', 'Failed to save budget settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#111111] border border-[#222] rounded-[32px] w-full max-w-4xl relative max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
      
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors z-10"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      <div className="p-8 md:p-10 pb-0">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Configure Budget</h2>
        <p className="text-gray-400 font-regular text-sm leading-relaxed max-w-md">
          Set your monthly spending limits for each category.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-8 md:p-10 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(localBudgets).map(([category, amount], index) => (
            <div key={category} className="bg-[#181818] border border-[#262626] p-4 rounded-2xl flex flex-col gap-2">
              <label className="text-sm font-bold text-white-300">{category}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">£</span>
                <input
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  enterKeyHint={index < Object.keys(localBudgets).length - 1 ? "next" : "done"}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  value={amount}
                  placeholder="0.00"
                  onChange={(e) => handleUpdateBudget(category, e.target.value)}
                  className={`w-full bg-[#0A0A0A] border rounded-xl py-3 pl-8 pr-4 text-white outline-none transition-all text-base ${
                    showErrors && amount === "" 
                      ? 'border-red-500/50 focus:border-red-500' 
                      : 'border-[#222] focus:border-emerald-500/50'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-[#161616] border-t border-[#222] flex justify-end gap-4">
        <button 
          onClick={handleSave} 
          disabled={isSaving} 
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-400 transition-all disabled:opacity-50"
        >
          <Save size={18} /> 
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
};

export default BudgetManager;