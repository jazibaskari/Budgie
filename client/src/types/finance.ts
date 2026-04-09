export interface Transaction {
    _id: string;
    merchant: string;
    amount: number;
    category: string;
    date: string;
    month: string;
  }
  
  export interface FinanceContextType {
    budgets: Record<string, number>;
    transactions: Transaction[];
    setBudgets: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    fetchFinanceData: () => Promise<void>;
    currentMonth: string;
    isLoading: boolean;
  }