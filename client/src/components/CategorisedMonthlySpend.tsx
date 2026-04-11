import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  Cell
} from 'recharts';
import { useFinance } from '../hooks/useFinance';

const CategorisedMonthlySpend: React.FC = () => {
  const { transactions, budgets } = useFinance();

  const chartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    Object.keys(budgets).forEach(cat => {
      categoryTotals[cat] = 0;
    });

    transactions.forEach(t => {
      if (t.category in categoryTotals) {
        categoryTotals[t.category] += Math.abs(t.amount);
      }
    });

    return Object.entries(categoryTotals).map(([name, amount]) => ({
      name,
      amount,

      limit: budgets[name] || 0,
      isOverBudget: budgets[name] ? amount > budgets[name] : false
    }));
  }, [transactions, budgets]);

  return (
    <div className="bg-[#141414] border border-[#262626] rounded-xl p-6 h-[450px] shadow-xl">
      <div className="flex flex-col mb-6">
        <h3 className="text-white text-sm font-medium  opacity-80">
          Categorised Monthly Spend
        </h3>
        <p className="text-xs text-gray-500 mt-1">Total expenditure vs. Category limits</p>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#262626" 
              vertical={false} 
            />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#666', fontSize: 10 }}
              interval={0}
              angle={-25}
              textAnchor="end"
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#666', fontSize: 10 }} 
            />
            <Tooltip 
              cursor={{ fill: '#1a1a1a' }}
              contentStyle={{ 
                backgroundColor: '#000', 
                border: '1px solid #333', 
                borderRadius: '8px',
                fontSize: '12px'
              }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: number) => [`£${value.toFixed(2)}`, 'Spent']}
            />
            <Bar 
              dataKey="amount" 
              radius={[4, 4, 0, 0]} 
              barSize={32}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isOverBudget ? '#ef4444' : '#d1d5db'} 
                  fillOpacity={entry.amount === 0 ? 0.1 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#d1d5db] rounded"></div>
          <span className="text-[10px] text-gray-500 font-medium er">Under Budget</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#ef4444] rounded"></div>
          <span className="text-[10px] text-gray-500 font-medium er">Over Budget</span>
        </div>
      </div>
    </div>
  );
};

export default CategorisedMonthlySpend;