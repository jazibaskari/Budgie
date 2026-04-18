import React, { useState, useEffect } from 'react';
import { Save, Trash2, AlertCircle, CheckCircle, X, AlertTriangle } from 'lucide-react';
import api from '../api/axiosConfig'; 
import { useFinance } from '../hooks/useFinance';

const DEFAULT_CATEGORIES = [
  "General", "Holidays", "Transport", "Shopping", 
  "Groceries", "Entertainment", "Bills", "Eating Out", "Cash", "Expenses"
];

interface BudgetManagerProps {
  onMonzoFetch: (data) => void; 
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ onMonzoFetch }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { budgets, fetchFinanceData } = useFinance();
  const [isSaving, setIsSaving] = useState(false);
  const [localBudgets, setLocalBudgets] = useState<Record<string, number | string>>({});
  const [alert, setAlert] = useState<{ type: 'error' | 'success', title: string, message: string } | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'http://localhost:5000') return;
      if (event.data === "auth_success") {
        console.log("Auth success received");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    const initial: Record<string, string | number> = {};
    DEFAULT_CATEGORIES.forEach(cat => {
      initial[cat] = (budgets && budgets[cat] !== undefined) ? budgets[cat] : "";
    });
    setLocalBudgets(initial);
  }, [budgets]);

  const syncMonzoData = async (): Promise<{
    success: boolean;
    alert?: { type: 'error' | 'success'; title: string; message: string };
  }> => {
    if (isSyncing) {
      console.log("BLOCKED duplicate sync");
      return { success: false };
    }
  
    setIsSyncing(true);
  
    try {
      const monzoResponse = await api.get('/monzo/transactions');
  
      const processed = monzoResponse.data.map((t) => ({
        ...t,
        category: t.decline_reason ? 'Declined' : (t.category || 'Food')
      }));
  
      onMonzoFetch(processed);
  
      return { success: true };
  
    } catch (err) {
      const errorData = err.response?.data;
      const monzoCode = errorData?.code;
  
      console.log("monzoCode:", monzoCode);
  
      if (monzoCode?.includes('insufficient_permissions')) {
        return {
          success: false,
          alert: {
            type: 'error',
            title: 'Approval Required',
            message: 'Please check your Monzo app and approve the request on your phone.'
          }
        };
      }
  
      if (monzoCode === 'forbidden.verification_required' || err.response?.status === 401) {
        window.location.href = 'http://localhost:5000/api/monzo/auth';
        return { success: false };
      }
  
      return {
        success: false,
        alert: {
          type: 'error',
          title: 'Sync Error',
          message: 'Could not fetch transactions.'
        }
      };
    } finally {
      setIsSyncing(false);
    }
  };

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
        message: 'Please fill all budget fields.' 
      });
      return;
    }
  
    setIsSaving(true);
  
    try {
      const sanitizedBudgets = Object.fromEntries(
        Object.entries(localBudgets).map(([k, v]) => [k, Number(v)])
      );

      await api.post('/user/update-budgets', { budgets: sanitizedBudgets });
  
      const syncResult = await syncMonzoData();
  
      if (!syncResult.success) {
        setAlert(syncResult.alert);
        setIsSaving(false);
        return;
      }
 
      await fetchFinanceData();
  
      setAlert({
        type: 'success',
        title: 'Success',
        message: 'Budgets saved successfully.'
      });
  
    } catch {
      setAlert({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not update budgets.'
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
      setAlert({ type: 'success', title: 'Budgets Reset', message: 'Configuration cleared.' });
      setTimeout(() => setAlert(null), 3000);
    } catch {
      setAlert({ type: 'error', title: 'Reset Failed', message: 'Could not clear budgets.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-[32px] p-8 shadow-2xl">
      {alert && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setAlert(null)} />
          <div className="relative w-full max-w-xl">
            <div className={`rounded-xl border p-4 ${alert.type === 'error' ? 'bg-red-50 dark:bg-[#1a0a0a] border-red-500/50' : 'bg-emerald-50 dark:bg-[#0a1a11] border-emerald-500/50'}`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {alert.type === 'error' ? <AlertCircle className="h-5 w-5 text-red-500" /> : <CheckCircle className="h-5 w-5 text-emerald-500" />}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${alert.type === 'error' ? 'text-red-800 dark:text-red-200' : 'text-emerald-800 dark:text-emerald-200'}`}>{alert.title}</h3>
                  <div className={`mt-2 text-sm ${alert.type === 'error' ? 'text-red-700 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
                    <p className='font-regular'>{alert.message}</p>
                  </div>
                </div>
                <div className="ml-auto pl-3">
                  <button onClick={() => setAlert(null)} className="text-gray-400 hover:text-gray-500"><X className="h-5 w-5" /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[120] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowDeleteModal(false)} />
            <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-[#181818] text-left shadow-xl border border-gray-200 dark:border-[#262626] sm:w-full sm:max-w-lg">
              <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-base font-regular text-gray-900 dark:text-white">Reset budget configuration</h3>
                    <div className="mt-2"><p className="text-sm text-gray-500 dark:text-gray-400">Clear all monthly budgets?</p></div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-[#111111] px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
                <button type="button" className="inline-flex w-full justify-center rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-500 sm:w-auto" onClick={confirmDelete}>Reset</button>
                <button type="button" className="mt-3 inline-flex w-full justify-center rounded-xl bg-white dark:bg-transparent px-5 py-2.5 text-sm font-medium text-gray-900 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-[#333] sm:mt-0 sm:w-auto" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-medium text-white">Budget Configuration</h2>
          <p className="font-regular text-gray-500 text-sm mt-1">Set your monthly spending limits.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowDeleteModal(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm text-gray-400 border border-[#222] hover:text-red-400 transition-all">
            <Trash2 size={18} /> Reset
          </button>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg">
            <Save size={18} /> {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                className={`w-full bg-[#0A0A0A] border rounded-xl py-3 pl-8 pr-4 text-white outline-none focus:border-emerald-500 transition-all ${showErrors && amount === "" ? 'border-red-500/60' : 'border-[#333]'}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetManager;