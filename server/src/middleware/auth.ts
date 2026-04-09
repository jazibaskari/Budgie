import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload extends jwt.JwtPayload {
  user: {
    id: string;
  };
}


export interface AuthRequest extends Request {
  user?: any; 
}

const auth = (req: Request, res: Response, next: NextFunction) => {

  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  const authHeader = req.header('Authorization');
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    token = req.header('x-auth-token');
  }

  if (!token) {
    return res.status(401).json({ message: 'Authorization denied. Please log in.' });
  }

  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'budgie_bird_secret'
    ) as TokenPayload;

    (req as AuthRequest).user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default auth;