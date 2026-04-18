export interface ITransaction {
    id: string;
    userId: string;    
    date: string;      
    description: string;
    amount: number;
    category: string;
    month: string;    
    createdAt: string;
    merchant: string | {
        name: string;
        logo?: string;
        emoji?: string;
        id: string;
    }; 
    status: 'pending' | 'verified'; 
}