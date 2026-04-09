import { Router } from 'express';
import type { Response, RequestHandler } from 'express';
import { client } from '../config/cosmos.js';
import auth from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = Router();
const userContainer = client.database("BudgieDB").container("Users");
const transContainer = client.database("BudgieDB").container("Transactions");

router.get('/finance-data', auth, (async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user as any;

    if (!user || !user.id) {
      return res.status(401).json({ message: "Unauthorized: No user session found" });
    }

    const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const { resources: transactions } = await transContainer.items
      .query({
        query: "SELECT * FROM c WHERE c.userId = @uid AND c.month = @month",
        parameters: [
          { name: "@uid", value: String(user.id) },
          { name: "@month", value: month }
        ]
      })
      .fetchAll();

    res.json({ 
      budgets: user.budgets || {}, 
      transactions: transactions || [] 
    });
  } catch (err: any) {
    console.error("Finance Data Error:", err.message);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
}) as RequestHandler);

router.post('/update-budgets', auth, (async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user as any;
    const { budgets } = req.body;

    if (!user || !user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updatedUser = { 
      ...user, 
      budgets: budgets || {} 
    };

    await userContainer.item(String(user.id), String(user.id)).replace(updatedUser);

    res.json(updatedUser.budgets);
  } catch (err: any) {
    console.error("Update Budgets Error:", err.message);
    res.status(500).json({ error: "Failed to update budgets" });
  }
}) as RequestHandler);

export default router;