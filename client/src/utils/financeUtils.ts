export const MONZO_CATEGORIES = [
    "general", "eating_out", "expenses", "transport", "cash", 
    "bills", "entertainment", "shopping", "holidays", "groceries", "transfers"
  ];
  
  export const formatCategory = (str: string) => {
    if (!str) return 'General';
    
    return str
      .split(/[ _]/) 
      .filter(Boolean) 
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  export const ALL_CATEGORIES = MONZO_CATEGORIES.map(cat => ({
    value: cat,
    label: formatCategory(cat)
  }));