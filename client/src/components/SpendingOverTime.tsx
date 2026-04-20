import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { useFinance } from '../hooks/useFinance';
import type { Transaction } from '../types/finance';

const SpendingOverTime: React.FC = () => {
  const { transactions } = useFinance();

  const chartData = useMemo(() => {
    const dailyTotals: Record<string, { dateObj: Date, total: number }> = {};

    transactions.forEach((t: Transaction) => {
      if (!t.created) return;

      const date = new Date(t.created);
      const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      
      if (!dailyTotals[dateStr]) {
        dailyTotals[dateStr] = { dateObj: date, total: 0 };
      }
      
      dailyTotals[dateStr].total += Math.abs(t.amount / 100);
    });

    return Object.values(dailyTotals)
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
      .map(item => ({
        date: item.dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        amount: item.total
      }));
  }, [transactions]);

  return (
    <>
 
    <div className="bg-[#141414] border border-[#262626] rounded-xl p-6 h-[440px] shadow-xl flex flex-col">
    <h1 className="text-2xl font-medium">Spending Over Time</h1>
      <div className="flex flex-col mb-6">
      </div>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#666', fontSize: 10 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#666', fontSize: 10 }} 
            />
            <Tooltip 
              cursor={{ stroke: '#333', strokeWidth: 1 }}
              contentStyle={{ 
                backgroundColor: '#000', 
                border: '1px solid #333', 
                borderRadius: '8px', 
                fontSize: '12px' 
              }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: number) => [`£${value.toFixed(2)}`, 'Spent']}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#10b981" 
              strokeWidth={2} 
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} 
              activeDot={{ r: 6, fill: '#10b981', stroke: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
    </>
  );
};

export default SpendingOverTime;