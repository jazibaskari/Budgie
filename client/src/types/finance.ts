export interface Transaction {
  _id: string;
  id?: string; 
  merchant: string | {
      name: string;
      logo?: string;
      emoji?: string;
      id: string;
  };
  amount: number;
  category: string;
  created: string;
  month: string;
  description: string;
  counterparty?: {
    name?: string;
  };
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