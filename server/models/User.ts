export interface IUser {
  id: string;          
  googleId: string;    
  displayName: string;
  email: string;
  avatar?: string;
  budgets: Record<string, number>; 
  createdAt: string;
  monzo?: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    updated_at: string;
  };
}