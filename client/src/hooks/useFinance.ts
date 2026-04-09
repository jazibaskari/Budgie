import { useContext } from 'react';
import { FinanceContext } from '../context/FinanceContextCore';

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};