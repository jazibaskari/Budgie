import { createContext } from 'react';
import type { FinanceContextType } from '../types/finance';

export const FinanceContext = createContext<FinanceContextType | undefined>(undefined);