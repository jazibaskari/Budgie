import React, { useState, useEffect } from 'react';
import { Save, Trash2, AlertCircle, CheckCircle, X, AlertTriangle } from 'lucide-react';
import api from '../api/axiosConfig'; 
import { useFinance } from '../hooks/useFinance';

const DEFAULT_CATEGORIES = [
  "Charity", "Travel", "Transport", "Personal Shopping", 
  "Groceries", "Health & Beauty", "Utilities & Bills", "Food"
];

const BudgetManager: React.FC = () => {
  const { budgets, fetchFinanceData } = useFinance();
  const [isSaving, setIsSaving] = useState(false);
  const [localBudgets, setLocalBudgets] = useState<Record<string, number | string>>({});

  const [alert, setAlert] = useState<{ type: 'error' | 'success', title: string, message: string } | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (budgets && Object.keys(budgets).length > 0) {
      setLocalBudgets(budgets);
    } else {
      const initial: Record<string, string> = {};
      DEFAULT_CATEGORIES.forEach(cat => { initial[cat] = ""; });
      setLocalBudgets(initial);
    }
  }, [budgets]);

  const handleUpdateBudget = (category: string, value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setLocalBudgets(prev => ({ ...prev, [category]: value }));
    }
  };

  const handleSave = async () => {
    const hasEmptyFields = Object.values(localBudgets).some(v => v === "" || v === null);

    if (hasEmptyFields) {
      setShowErrors(true);
      setAlert({
        type: 'error',
        title: 'Attention needed',
        message: 'Some budget fields are empty. Please add limits for all categories before saving your configuration.'
      });
      return;
    }

    setIsSaving(true);
    try {
      const sanitizedBudgets = Object.fromEntries(
        Object.entries(localBudgets).map(([k, v]) => [k, Number(v)])
      );

      await api.post('/user/update-budgets', { budgets: sanitizedBudgets });
      await fetchFinanceData();
      
      setShowErrors(false);
      setAlert({
        type: 'success',
        title: 'Budgets saved',
        message: 'Your monthly spending configuration has been updated successfully.'
      });
      
      setTimeout(() => setAlert(null), 5000);
    } catch {
      setAlert({
        type: 'error',
        title: 'Server Error',
        message: 'We encountered an issue saving your data. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    setIsSaving(true);
    try {
      await api.post('/user/update-budgets', { budgets: {} });
      await fetchFinanceData();
      setShowErrors(false);
      setAlert({
        type: 'success',
        title: 'Budgets Reset',
        message: 'All budget configurations have been cleared.'
      });
      setTimeout(() => setAlert(null), 3000);
    } catch {
      setAlert({
        type: 'error',
        title: 'Reset Failed',
        message: 'Could not clear budgets from the server.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-[32px] p-8 shadow-2xl">
      {alert && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" 
            onClick={() => setAlert(null)} 
          />
          
          <div className="relative w-full max-w-xl shadow-2xl animate-in zoom-in-95 slide-in-from-top-4 duration-300">
            <div className={`rounded-xl border p-4 ${
              alert.type === 'error' 
                ? 'bg-red-50 dark:bg-[#1a0a0a] border-red-500/50' 
                : 'bg-emerald-50 dark:bg-[#0a1a11] border-emerald-500/50'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {alert.type === 'error' ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  )}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    alert.type === 'error' ? 'text-red-800 dark:text-red-200' : 'text-emerald-800 dark:text-emerald-200'
                  }`}>
                    {alert.title}
                  </h3>
                  <div className={`mt-2 text-sm ${
                    alert.type === 'error' ? 'text-red-700 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300'
                  }`}>
                    <p className='font-regular'>{alert.message}</p>
                  </div>
                  <div className="mt-4">
                  </div>
                </div>
                <div className="ml-auto pl-3">
                  <button onClick={() => setAlert(null)} className="text-gray-400 hover:text-gray-500">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[120] overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div 
              className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in duration-300" 
              onClick={() => setShowDeleteModal(false)} 
            />
            
            <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-[#181818] text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-[#262626]">
              <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-base font-regular leading-6 text-gray-900 dark:text-white">Reset budget configuration</h3>
                    <div className="mt-2">
                      <p className="text-sm font-regular text-gray-500 dark:text-gray-400">
                        Are you sure you want to clear all your monthly budgets? This action cannot be undone and will reset all categories to zero.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-[#111111] px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-500 sm:w-auto transition-all"
                  onClick={confirmDelete}
                >
                  Reset Budgets
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-xl bg-white dark:bg-transparent px-5 py-2.5 text-sm font-medium text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-[#333] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] sm:mt-0 sm:w-auto transition-all"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-medium text-white flex items-center gap-3">
            Budget Configuration
          </h2>
          <p className="font-regular text-gray-500 text-sm mt-1">Set your monthly spending limits.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all border border-[#222]"
          >
            <Trash2 size={18} /> Reset
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-900/20"
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(localBudgets).map(([category, amount]) => (
          <div key={category} className="bg-[#181818] border border-[#262626] p-4 rounded-2xl flex flex-col gap-2">
            <label className="text-sm font-regular text-gray-500">
              {category}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-regular">£</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                placeholder="0.00"
                onChange={(e) => handleUpdateBudget(category, e.target.value)}
                className={`w-full bg-[#0A0A0A] border rounded-xl py-3 pl-8 pr-4 text-white font-regular focus:border-emerald-500 outline-none transition-all
                  ${showErrors && amount === "" 
                    ? 'border-red-500/60 ring-1 ring-red-500/20' 
                    : 'border-[#333]'
                  }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetManager;