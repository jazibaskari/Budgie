import React, { useState, useEffect } from 'react';
import { Save, PieChart, Trash2 } from 'lucide-react';
import api from '../api/axiosConfig'; 
import { useFinance } from '../hooks/useFinance';

const DEFAULT_CATEGORIES = [
  "Charity", "Travel", "Transport", "Personal Shopping", 
  "Groceries", "Health & Beauty", "Utilities & Bills", "Food"
];

const BudgetManager: React.FC = () => {
  const { budgets, fetchFinanceData } = useFinance();
  const [isSaving, setIsSaving] = useState(false);
  const [localBudgets, setLocalBudgets] = useState<Record<string, number>>({});

  useEffect(() => {
    if (budgets && Object.keys(budgets).length > 0) {
      setLocalBudgets(budgets);
    } else {
      const initial: Record<string, number> = {};
      DEFAULT_CATEGORIES.forEach(cat => {
        initial[cat] = 0;
      });
      setLocalBudgets(initial);
    }
  }, [budgets]);

  const handleUpdateBudget = (category: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setLocalBudgets(prev => ({
      ...prev,
      [category]: numValue
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.post('/user/update-budgets', { budgets: localBudgets });
      await fetchFinanceData();
      alert('Monthly budgets updated successfully!');
    } catch (error) {
      console.error("Budget Save Error:", error);
      alert(`Error: ${error.response?.status === 404 ? "Route not found." : "Failed to save"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure? This will clear all budgets and lock the dashboard.")) return;
    
    setIsSaving(true);
    try {
      await api.post('/user/update-budgets', { budgets: {} });
      await fetchFinanceData();
    } catch (error) {
      console.error("Budget Delete Error:", error);
      alert("Failed to clear budgets.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-[32px] p-8 shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <PieChart className="text-emerald-500" size={24} />
            Budget Configuration
          </h2>
          <p className="text-gray-500 text-sm mt-1">Set your monthly spending limits.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* NEW: Delete Button */}
          <button
            onClick={handleDelete}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all border border-[#222] disabled:opacity-50"
          >
            <Trash2 size={18} />
            Reset
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-50"
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(localBudgets).map(([category, amount]) => (
          <div key={category} className="bg-[#181818] border border-[#262626] p-4 rounded-2xl flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              {category}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono">£</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => handleUpdateBudget(category, e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl py-3 pl-8 pr-4 text-white font-mono focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetManager;