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
import { ALL_CATEGORIES } from '../utils/financeUtils';

const CategorisedMonthlySpend: React.FC = () => {
  const { transactions, budgets } = useFinance();

  const chartData = useMemo(() => {
    return ALL_CATEGORIES.map(({ value, label }) => {
      const spent = transactions
        .filter(t => t.category === value || t.category.toLowerCase() === label.toLowerCase())
        .reduce((sum, t) => sum + Math.abs(t.amount / 100), 0);

      const limit = Number((budgets && budgets[label]) || 0);
      const isOverBudget = limit > 0 && spent > limit;
      
      const remaining = isOverBudget ? 0 : (limit - spent);

      return {
        name: label,
        spent,
        remaining,
        isOverBudget
      };
    });
  }, [transactions, budgets]);

  return (
    <div className="bg-[#141414] border border-[#262626] rounded-xl p-6 h-[450px] shadow-xl">
      <div className="flex flex-col mb-6">
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
              formatter={(value: number, name: string) => [`£${value.toFixed(2)}`, name === 'spent' ? 'Spent' : 'Remaining']}
            />
            <Bar dataKey="spent" stackId="a" radius={[0, 0, 0, 0]} barSize={32}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`spent-${index}`} 
                  fill={entry.isOverBudget ? '#ef4444' : '#10b981'} 
                />
              ))}
            </Bar>
            <Bar dataKey="remaining" stackId="a" radius={[4, 4, 0, 0]} barSize={32} fill="#ffffff" fillOpacity={0.1} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#10b981] rounded"></div>
          <span className="text-[10px] text-gray-500 font-medium er">Spent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#ffffff] opacity-20 rounded"></div>
          <span className="text-[10px] text-gray-500 font-medium er">Remaining</span>
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