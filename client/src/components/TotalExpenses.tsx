import React, { useMemo } from 'react';
import { useFinance } from '../hooks/useFinance';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#000] border border-[#333] p-3 rounded-xl text-xs text-white shadow-2xl">
        <span className="font-medium">{data.name}:</span> £{data.value.toFixed(2)}
      </div>
    );
  }
  return null;
};

const TotalExpenses: React.FC = () => {
  const { transactions, budgets, currentMonth } = useFinance();

  const { totalSpent, totalBudget, isOverBudget } = useMemo(() => {
    const spent = transactions.reduce((sum, t) => sum + Math.abs(t.amount / 100), 0);
    const budget = Object.values(budgets || {}).reduce((sum, val) => sum + (Number(val) || 0), 0);
    return { totalSpent: spent, totalBudget: budget, isOverBudget: spent > budget };
  }, [transactions, budgets]);

  const pieData = useMemo(() => [
    { name: 'Spent', value: totalSpent },
    { name: 'Remaining', value: Math.max(0, totalBudget - totalSpent) }
  ], [totalSpent, totalBudget]);

  const displayMonth = currentMonth ? currentMonth.split(' ')[0] : '';

  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-6 border-b border-[#222] bg-[#161616]">
        <h1 className="text-2xl font-medium text-left">{displayMonth}'s Outgoings</h1>
      </div>
      <div className="flex flex-col items-center justify-start flex-1 p-20 text-center">
        <div className="mt-2 mb-0">
          <span className="text-white text-8xl font-regular leading-none">
            £{totalSpent.toFixed(0)}
          </span>
        </div>
        <div className="w-full h-[160px] md:h-[200px] -mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="80%"
                startAngle={180}
                endAngle={0}
                innerRadius="85%" 
                outerRadius="115%"
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                <Cell fill={isOverBudget ? '#ef4444' : '#10b981'} />
                <Cell fill="#262626" />
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full mt-6">
          <p className="text-gray-400 text-sm leading-relaxed max-w-[280px] mx-auto">
            You've spent £{totalSpent.toFixed(0)} so far in <span className="text-white font-bold">{displayMonth}</span>. 
            That's {isOverBudget ? 'over' : 'within'} your total budget of <span className="text-white font-bold">£{totalBudget.toFixed(0)}</span>  for this month. 
          </p>
        </div>
      </div>
    </div>
  );
};

export default TotalExpenses;