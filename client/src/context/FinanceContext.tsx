import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig'; 
import { FinanceContext } from './FinanceContextCore';
import type { Transaction } from '../types/finance';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
 
  const fetchFinanceData = useCallback(async (options = { forceRefresh: true }) => {
    setIsLoading(true);
    try {
      const res = await api.get('/user/finance-data');
      if (res.data) {
        setBudgets(res.data.budgets || {});
        if (res.data.transactions) {
          setTransactions(res.data.transactions);
        }
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  return (
    <FinanceContext.Provider 
      value={{ 
        budgets, 
        transactions, 
        setBudgets, 
        setTransactions, 
        fetchFinanceData, 
        currentMonth, 
        isLoading 
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};