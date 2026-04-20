import React, { useEffect } from 'react';
import { useFinance } from '../hooks/useFinance';
import { 
  ShoppingCart, 
  Car, 
  Plane,  
  Utensils, 
  HelpCircle , 
  Clapperboard,
  ReceiptText, 
  Banknote,
  Handbag,
  LayoutDashboard,
  RefreshCcw
} from 'lucide-react';
import { ALL_CATEGORIES } from '../utils/financeUtils';

const ICON_MAP: Record<string, React.ReactNode> = {
  "General": <LayoutDashboard size={18} />,
  "Holidays": <Plane size={18} />,
  "Transport": <Car size={18} />,
  "Shopping": <Handbag size={18} />,
  "Groceries": <ShoppingCart size={18} />,
  "Entertainment": <Clapperboard size={18} />,
  "Bills": <ReceiptText size={18} />,
  "Eating Out": <Utensils size={18} />,
  "Cash": <Banknote size={18} />,
  "Expenses": <Utensils size={18} />,
  "Transfers": <RefreshCcw size={18} />,

};

const CategoryGrid: React.FC = () => {
  const { transactions, budgets } = useFinance();

  useEffect(() => {
    console.log("CategoryGrid received transactions:", transactions);
    console.log("Budget keys:", Object.keys(budgets || {}));
  }, [transactions, budgets]);

  return (
    <div className="grid grid-cols-1 gap-4">
      {ALL_CATEGORIES.map((cat) => {
        const category = cat.label;
        const limit = Number((budgets && budgets[category]) || 0);

        const spent = transactions
          .filter(t => t.category === cat.value || t.category.toLowerCase() === category.toLowerCase()) 
          .reduce((sum, t) => sum + Math.abs(t.amount / 100), 0);
        
        const percent = limit > 0 ? (spent / limit) * 100 : 0;
        const remaining = limit - spent;
        const isOverBudget = remaining < 0;

        return (
          <div 
            key={category} 
            className="bg-[#141414] border border-[#262626] rounded-xl p-4 hover:bg-[#1a1a1a] transition-all group"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <div className="text-gray-500 group-hover:text-emerald-500 transition-colors">
                  {ICON_MAP[category] || <HelpCircle size={18} />}
                </div>
                <span className="text-sm font-medium text-white">{category}</span>
              </div>
              <span className={`text-[10px] font-medium ${isOverBudget ? 'text-red-500' : 'text-gray-500'}`}>
                {percent.toFixed(0)}%
              </span>
            </div>
            
            <div className="w-full bg-[#262626] h-1.5 rounded-full mb-4 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  isOverBudget ? 'bg-red-500' : 'bg-emerald-600'
                }`} 
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex flex-col">
                <span className="text-gray-500 font-medium er">Spent</span>
                <span className="text-white font-medium">£{spent.toFixed(2)}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-gray-500 font-medium er">
                  {isOverBudget ? 'Over' : 'Left'}
                </span>
                <span className={`font-medium ${isOverBudget ? 'text-red-400' : 'text-emerald-500'}`}>
                  £{Math.abs(remaining).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryGrid;