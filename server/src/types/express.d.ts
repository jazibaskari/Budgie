import { Express } from 'express-serve-static-core';

declare global {
  namespace Express {
    interface User extends IUSer {
      id: string; 
      monzoAccessToken?: string;
      monzoAccountId?: string;
    }
  }
}