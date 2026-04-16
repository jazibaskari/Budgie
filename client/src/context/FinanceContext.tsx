import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig'; 
import { FinanceContext } from './FinanceContextCore';
import type { Transaction } from '../types/finance';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const fetchFinanceData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/user/finance-data');
      
      if (res.data) {

        setBudgets(res.data.budgets || {});
        setTransactions(res.data.transactions || []);
      }
    } catch (err) {
      console.error("Finance Context Fetch Error:", err.response?.data?.message || err.message);
      
      if (err.response?.status === 401) {
        console.warn("User session invalid or expired.");
      }
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