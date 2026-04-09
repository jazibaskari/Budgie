export interface Transaction {
    id: string;          
    userId: string;  
    date: string;       
    description: string;
    amount: number;      
    category: string;  
    merchant: string;    
    bankSource: string;  
    isVerified: boolean;
  }