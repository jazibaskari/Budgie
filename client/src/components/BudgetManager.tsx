import React, { useState } from 'react';
import { Save, AlertCircle, X } from 'lucide-react';
import api from '../api/axiosConfig'; 
import { useFinance } from '../hooks/useFinance';

const DEFAULT_CATEGORIES = [
  "General", "Holidays", "Transport", "Shopping", 
  "Groceries", "Entertainment", "Bills", "Eating Out", "Cash", "Expenses"
];

interface BudgetManagerProps {
  onClose: () => void;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ onClose }) => {
  const { budgets, fetchFinanceData } = useFinance();
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'error' | 'success', title: string, message: string } | null>(null);
  const [showErrors, setShowErrors] = useState(false);

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
  
  const handleSave = async () => {
    const hasEmptyFields = Object.values(localBudgets).some(v => v === "" || v === null);
    if (hasEmptyFields) {
      setShowErrors(true);
      setAlert({ type: 'error', title: 'Attention needed', message: 'Please fill all budget fields.' });
      return;
    }
  
    setIsSaving(true);
    try {
      const sanitizedBudgets = Object.fromEntries(
        Object.entries(localBudgets).map(([k, v]) => [k, Number(v)])
      );
      await api.post('/user/update-budgets', { budgets: sanitizedBudgets });
      await fetchFinanceData();
      onClose();
    } catch {
      setAlert({ type: 'error', title: 'Save Failed', message: 'Could not update budgets.' });
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-[32px] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
      <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white">
        <X size={24} />
      </button>

      {alert && (
        <div className="mb-6 p-4 rounded-xl border bg-[#1a0a0a] border-red-500/50 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div className="text-left">
            <h3 className="text-sm font-medium text-red-200">{alert.title}</h3>
            <p className="text-xs text-red-300">{alert.message}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8 pr-8">
        <div>
          <h2 className="text-2xl font-medium text-white">Budget Configuration</h2>
          <p className="text-gray-500 text-sm mt-1">Set your monthly spending limits.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving} 
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-50"
        >
          <Save size={18} /> {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(localBudgets).map(([category, amount]) => (
          <div key={category} className="bg-[#181818] border border-[#262626] p-4 rounded-2xl flex flex-col gap-2">
            <label className="text-sm font-regular text-gray-500">{category}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">£</span>
              <input
                type="text"
                value={amount}
                placeholder="0.00"
                onChange={(e) => handleUpdateBudget(category, e.target.value)}
                className={`w-full bg-[#0A0A0A] border rounded-xl py-3 pl-8 pr-4 text-white outline-none focus:border-emerald-500 transition-all ${showErrors && (amount === "" || amount === null) ? 'border-red-500/60' : 'border-[#333]'}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetManager;