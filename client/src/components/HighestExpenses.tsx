import React, { useMemo } from 'react';
import { useFinance } from '../hooks/useFinance';
import { ALL_CATEGORIES } from '../utils/financeUtils';
import type { Transaction } from '../types/finance';
import { formatCategory } from '../utils/financeUtils';

interface HighestExpensesProps {
  showOnlyTotal?: boolean;
}

const HighestExpenses: React.FC<HighestExpensesProps> = ({ showOnlyTotal }) => {
  const { transactions } = useFinance();

  const topCategories = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    transactions.forEach((t: Transaction) => {
      const categoryLabel = ALL_CATEGORIES.find(c => c.value === t.category)?.label || t.category;
      categoryTotals[categoryLabel] = (categoryTotals[categoryLabel] || 0) + Math.abs(t.amount / 100);
    });
    return Object.entries(categoryTotals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4); 
  }, [transactions]);

  const topMerchants = useMemo(() => {
    const merchantTotals: Record<string, number> = {};
    
    transactions.forEach((t: Transaction) => {
      let displayName = "Unknown";

      if (t.category?.toLowerCase() === 'transfers' && t.counterparty?.name) {
        displayName = formatCategory(t.counterparty.name);
      } 
      else if (typeof t.merchant === 'object' && t.merchant !== null && t.merchant.name) {
        displayName = t.merchant.name;
      } 
      else if (t.description) {
        displayName = t.description;
      }
  
      merchantTotals[displayName] = (merchantTotals[displayName] || 0) + Math.abs(t.amount / 100);
    });
  
    return Object.entries(merchantTotals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
  }, [transactions]);

  return (
    <div className="bg-[#141414] border border-[#262626] h-[200px] rounded-xl p-6 shadow-xl flex-1 justify-center">
      <h1 className="text-2xl font-medium mb-6">Highest Expenses</h1>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-medium mb-4 text-white">Categories</h2>
          <div className="flex flex-wrap gap-2">
          <span className="text-gray-300 font-regular text-md mb-4 leading-relaxed">
          You've spent the most on <span className="text-white font-bold">{topCategories[0]?.name}</span> this month. Try to identify potential savings opportunities here.
        </span>
            {topCategories.map((expense, index) => (
              <div 
                key={expense.name} 
                className="flex items-center gap-2 bg-[#262626] border border-[#262626] mb-4 px-3.5 py-2.5 rounded-2xl transition-colors hover:border-[#333]"
              >
                <span className="text-gray-500 text-sm font-medium">#{index + 1}</span>
                <span className="text-white text-sm font-medium">{expense.name}</span>
                <span className="text-emerald-500 text-sm font-bold">£{expense.amount.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-3 text-white mb-4">Merchants</h2>
          <div className="flex flex-wrap gap-2">
          <span className="text-gray-300 font-regular text-md mb-4 leading-relaxed">
          You've spent the most at <span className="text-white font-bold">{topMerchants[0]?.name}</span> this month. Are there better-value alternatives available with similar merchants?
        </span>
            {topMerchants.map((merchant, index) => (
              <div 
                key={merchant.name} 
                className="flex items-center gap-2 bg-[#262626] border border-[#262626] px-3.5 py-2.5 rounded-2xl transition-colors hover:border-[#333]"
              >
                <span className="text-gray-500 text-sm font-medium">#{index + 1}</span>
                
                <span className="text-white text-sm font-medium truncate max-w-[100px]">{merchant.name}</span>
                <span className="text-emerald-500 text-sm font-bold">£{merchant.amount.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HighestExpenses;