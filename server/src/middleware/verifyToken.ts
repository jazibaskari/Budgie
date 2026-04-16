import type { Request, Response, NextFunction } from 'express';


export interface AuthRequest extends Request {
  user?: any; 
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  console.log("verifyToken failed. Is authenticated?", req.isAuthenticated());
  return res.status(401).json({ message: "Unauthorized or missing user data" });
};