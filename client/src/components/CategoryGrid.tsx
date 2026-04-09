import React from 'react';
import { useFinance } from '../hooks/useFinance';
import { 
  Heart, 
  ShoppingCart, 
  Car, 
  Plane, 
  Zap, 
  Utensils, 
  Briefcase, 
  Gift, 
  HelpCircle 
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  "Charity": <Gift size={18} />,
  "Travel": <Plane size={18} />,
  "Transport": <Car size={18} />,
  "Personal Shopping": <Briefcase size={18} />,
  "Groceries": <ShoppingCart size={18} />,
  "Health & Beauty": <Heart size={18} />,
  "Utilities & Bills": <Zap size={18} />,
  "Food": <Utensils size={18} />,
};

const CategoryGrid: React.FC = () => {
  const { transactions, budgets } = useFinance();

  return (
    <div className="grid grid-cols-1 gap-4">
      {Object.entries(budgets).map(([category, limit]) => {

        const spent = transactions
          .filter(t => t.category === category)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
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
              <span className={`text-[10px] font-mono ${isOverBudget ? 'text-red-500' : 'text-gray-500'}`}>
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
                <span className="text-gray-500 uppercase font-bold tracking-tighter">Spent</span>
                <span className="text-white font-medium">£{spent.toFixed(2)}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-gray-500 uppercase font-bold tracking-tighter">
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