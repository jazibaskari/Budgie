export interface Transaction {
    _id: string;
    merchant: string;
    amount: number;
    category: string;
    created: string;
    month: string;
    description: string;
  }
  
  export interface FinanceContextType {
    budgets: Record<string, number>;
    transactions: Transaction[];
    setBudgets: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    // fetchFinanceData: () => Promise<void>;
    currentMonth: string;
    isLoading: boolean;
    fetchFinanceData: (options?: { forceRefresh: boolean }) => Promise<void>;
  }