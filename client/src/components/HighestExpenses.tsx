import React, { useMemo } from 'react';
import { useFinance } from '../hooks/useFinance';
import { ALL_CATEGORIES } from '../utils/financeUtils';
import type { Transaction } from '../types/finance';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CustomTooltip = ({ active, payload, totalBudget }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (data.name === 'Spent') {
      return (
        <div className="bg-[#000] border border-[#333] p-3 rounded-xl text-xs text-white shadow-2xl">
          <span className="font-medium">Spent:</span> £{data.value.toFixed(2)} out of £{totalBudget.toFixed(2)}
        </div>
      );
    } else {
      return (
        <div className="bg-[#000] border border-[#333] p-3 rounded-xl text-xs text-white shadow-2xl">
          <span className="font-medium">Total Budget:</span> £{totalBudget.toFixed(2)}
        </div>
      );
    }
  }
  return null;
};

const HighestExpenses: React.FC = () => {
  const { transactions, budgets, currentMonth } = useFinance();

  const topExpenses = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    transactions.forEach((t: Transaction) => {
      const categoryLabel = ALL_CATEGORIES.find(
        c => c.value === t.category || c.label.toLowerCase() === t.category.toLowerCase()
      )?.label || t.category;

      if (!categoryTotals[categoryLabel]) {
        categoryTotals[categoryLabel] = 0;
      }
      categoryTotals[categoryLabel] += Math.abs(t.amount / 100);
    });

    return Object.entries(categoryTotals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); 
  }, [transactions]);

  const { totalSpent, totalBudget, isOverBudget } = useMemo(() => {
    const spent = transactions.reduce((sum, t) => sum + Math.abs(t.amount / 100), 0);
    const budget = Object.values(budgets || {}).reduce((sum, val) => sum + (Number(val) || 0), 0);
    return { 
      totalSpent: spent, 
      totalBudget: budget, 
      isOverBudget: spent > budget 
    };
  }, [transactions, budgets]);

  const pieData = useMemo(() => [
    { name: 'Spent', value: totalSpent },
    { name: 'Remaining', value: Math.max(0, totalBudget - totalSpent) }
  ], [totalSpent, totalBudget]);

  const displayMonth = currentMonth ? currentMonth.split(' ')[0] : '';

  return (
    <>
    
      <div className="bg-[#141414] border border-[#262626] rounded-xl p-6 shadow-xl flex flex-col flex-1">
      <h1 className="text-2xl font-medium">Highest Expenses</h1>
        <div className="flex-1 flex flex-col justify-between">
          
          <div className="flex flex-wrap gap-3">
            {topExpenses.map((expense, index) => (
              <div 
                key={expense.name} 
                className="flex items-center gap-2 bg-[#1a1a1a] border border-[#333] px-4 py-2 rounded-lg"
              >
                <span className="text-gray-500 text-[10px] font-medium">#{index + 1}</span>
                <span className="text-white text-xs font-medium">{expense.name}</span>
                <span className="text-emerald-500 text-xs font-bold">£{expense.amount.toFixed(2)}</span>
              </div>
            ))}
            {topExpenses.length === 0 && (
              <span className="text-gray-500 text-xs">No transactions recorded.</span>
            )}
          </div>

          <div className="flex flex-row items-center gap-8 border-t border-[#262626] mt-[20px] pt-4">
            <div className="w-[120px] h-[70px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="100%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={40}
                    outerRadius={55}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive={true}
                  >
                    <Cell fill={isOverBudget ? '#ef4444' : '#10b981'} />
                    <Cell fill="#262626" />
                  </Pie>
                  <Tooltip 
                    content={<CustomTooltip totalBudget={totalBudget} />} 
                    cursor={{fill: 'transparent'}} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                £{totalSpent.toFixed(0)}
              </span>
              <span className="text-[#bfc0c0] font-medium leading-[1.2] ml-2 text-sm">
                spent in <br /> {displayMonth}
              </span>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
};

export default HighestExpenses;