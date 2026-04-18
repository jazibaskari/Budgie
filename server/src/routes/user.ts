import { Router } from 'express';
import type { Response, RequestHandler } from 'express';
import { getContainer } from '../config/cosmos.js';
import { verifyToken as auth } from '../middleware/verifyToken.js';
import type { AuthRequest } from '../middleware/verifyToken.js';

const router = Router();
const userContainer = getContainer("Users");
const transContainer = getContainer("Transactions");

router.get('/finance-data', auth, (async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user as any;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const { resources: transactions } = await transContainer.items
      .query({
        query: "SELECT * FROM c WHERE c.userId = @gid AND c.month = @month",
        parameters: [
          { name: "@gid", value: user.googleId }, 
          { name: "@month", value: month }
        ]
      })
      .fetchAll();

    res.json({ 
      budgets: user.budgets || {}, 
      transactions: transactions || [] 
    });
  } catch (err: any) {
    console.error("Finance Data Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
}) as RequestHandler);

router.post('/update-budgets', auth, (async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user as any;
    if (!user.googleId) {
      console.error("CRITICAL: User object is missing googleId partition key");
      return res.status(400).json({ error: "Invalid user data" });
    }
    const { budgets } = req.body;

    if (!user || !user.id || !user.googleId) {
      return res.status(401).json({ message: "Unauthorized or missing user data" });
    }

    const updatedUser = { 
      ...user, 
      budgets: budgets || {} 
    };

    await userContainer.items.upsert(updatedUser);

    res.json(updatedUser.budgets);
  } catch (err: any) {
    console.error("Update Budgets Error:", err.message);
    res.status(500).json({ error: "Failed to update budgets" });
  }
}) as RequestHandler);
export default router;