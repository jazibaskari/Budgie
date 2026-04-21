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
    <div className="bg-[#141414] border border-[#262626] h-auto min-h-[200px] rounded-xl p-6 shadow-xl flex-1 justify-center">
      <h1 className="text-2xl font-medium mb-6">Highest Expenses</h1>
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-medium mb-2 text-white">Categories</h2>
          <p className="text-gray-300 font-regular text-sm md:text-md mb-4 leading-relaxed">
            You've spent the most on <span className="text-white font-regular">{topCategories[0]?.name}</span> this month. Try to identify potential savings opportunities here.
          </p>
          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-3">
            {topCategories.map((expense, index) => (
              <div 
                key={expense.name} 
                className="flex items-center gap-1.5 md:gap-2 bg-[#262626] border border-[#262626] px-3 py-2 md:px-3.5 md:py-2.5 rounded-xl md:rounded-2xl transition-colors hover:border-[#333]"
              >
                <span className="text-gray-500 text-xs md:text-sm font-medium shrink-0">#{index + 1}</span>
                <span className="text-white text-xs md:text-sm font-medium truncate flex-1 min-w-[40px]">{expense.name}</span>
                <span className="text-emerald-500 text-xs md:text-sm font-medium shrink-0">£{expense.amount.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2 text-white">Merchants</h2>
          <p className="text-gray-300 font-regular text-sm md:text-md mb-4 leading-relaxed">
            You've spent the most at <span className="text-white font-medium">{topMerchants[0]?.name}</span> this month. Are there better-value alternatives available with similar merchants?
          </p>
          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-3">
            {topMerchants.map((merchant, index) => (
              <div 
                key={merchant.name} 
                className="flex items-center gap-1.5 md:gap-2 bg-[#262626] border border-[#262626] px-3 py-2 md:px-3.5 md:py-2.5 rounded-xl md:rounded-2xl transition-colors hover:border-[#333]"
              >
                <span className="text-gray-500 text-xs md:text-sm font-medium shrink-0">#{index + 1}</span>
                <span className="text-white text-xs md:text-sm font-medium truncate flex-1 min-w-[40px]">{merchant.name}</span>
                <span className="text-emerald-500 text-xs md:text-sm font-medium shrink-0">£{merchant.amount.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HighestExpenses;