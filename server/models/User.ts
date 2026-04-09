export interface IUser {
  id: string;          
  googleId: string;    
  displayName: string;
  email: string;
  avatar?: string;
  budgets: Record<string, number>; 
  createdAt: string;
}