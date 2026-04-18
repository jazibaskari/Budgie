import { Router } from 'express';
import type { Response } from 'express';
import axios from 'axios';
import { getValidAccessToken } from '../middleware/monzoAuth.js';
import { getContainer } from '../config/cosmos.js';
import type { AuthRequest } from '../middleware/verifyToken.js';

const router = Router();
const userContainer = getContainer("Users");
const transContainer = getContainer("Transactions");
const REDIRECT_URI = 'http://localhost:5000/api/auth/monzo/callback';

router.get('/auth', (req: AuthRequest, res: Response) => {
  const googleId = req.user?.googleId;

  if (!googleId) {
    return res.redirect('http://localhost:5000/api/auth/google');
  }

  const state = Buffer.from(googleId).toString('base64');
  const authUrl = `https://auth.monzo.com/?client_id=${process.env.MONZO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&state=${state}`;
  res.redirect(authUrl);
});

router.get('/auth/monzo/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state) return res.status(400).send("Missing code/state");

  const googleId = Buffer.from(state as string, 'base64').toString('utf8').trim();

  try {
    const response = await axios.post('https://api.monzo.com/oauth2/token', new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.MONZO_CLIENT_ID!,
      client_secret: process.env.MONZO_CLIENT_SECRET!,
      redirect_uri: REDIRECT_URI,
      code: code as string,
    }).toString());

  
    const { resources } = await userContainer.items.query({
      query: "SELECT * FROM c WHERE c.googleId = @gid",
      parameters: [{ name: "@gid", value: googleId }]
    }).fetchAll();

    if (resources.length === 0) {
      console.error("CRITICAL - No document found for googleId:", googleId);
      return res.status(404).send("User not found.");
    }

    const user = resources[0];

    await userContainer.item(user.id, user.id).patch([{ 
      op: "add", 
      path: "/monzo", 
      value: { 
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_at: Date.now() + (response.data.expires_in * 1000)
      }
    }]);

    res.send(`
  <script>
    window.opener.postMessage("auth_success", "http://localhost:5174");
    window.close();
  </script>
`); 
  } catch (err: any) {
    console.error("Auth Callback Error:", err.message);
    res.status(500).send("Authentication failed");
  }
});

router.get('/transactions', async (req: AuthRequest, res: Response) => {
  const googleId = req.user?.googleId;
  if (!googleId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const token = await getValidAccessToken(googleId);
    if (!token) return res.status(401).json({ error: "NO_TOKEN" });

    const response = await axios.get('https://api.monzo.com/transactions', {
      headers: { Authorization: `Bearer ${token}` },
      params: { 
        account_id: process.env.MONZO_ACCOUNT_ID, 
        since: '2026-01-01T00:00:00Z', 
        limit: 100,
        "expand[]": "merchant" 
      }
    });
    
    res.json(response.data.transactions || []);
  } catch (err: any) {
    const monzoError = err.response?.data;
    console.error("Monzo API Error Details:", monzoError || err.message);
  
    if (monzoError?.code) {
      return res.status(400).json({ 
        error: "API_ERROR", 
        code: monzoError.code 
      });
    }
  
    res.status(400).json({ error: "API_ERROR" });
  }
});

router.post('/confirm', async (req: AuthRequest, res: Response) => {
  const googleId = req.user?.googleId;
  if (!googleId) return res.status(401).json({ error: "Unauthorized" });

  const { transactions } = req.body;

  try {
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    const savePromises = transactions.map((t: any) => {
      const transactionDocument = {
        ...t,
        userId: googleId,    
        month: currentMonth, 
        id: t.id || `local_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      };
      
      return transContainer.items.upsert(transactionDocument);
    });

    await Promise.all(savePromises);

    res.status(200).json({ 
      message: "Transactions confirmed and saved to Transactions container",
      count: transactions.length 
    });
  } catch (err: any) {
    console.error("Confirm Transaction Error:", err);
    res.status(500).json({ error: "Failed to save transactions to container" });
  }
});

export default router;

