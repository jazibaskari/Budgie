import { Router } from 'express';
import type { Response } from 'express';
import axios from 'axios';
import type { AuthRequest } from '../middleware/verifyToken.js';
import { getContainer } from '../config/cosmos.js';

const router = Router();

router.get('/monzo/callback', async (req: AuthRequest, res: Response) => {
  const { code, state, error } = req.query;

  if (error || !code || !state) return res.send('<script>window.close();</script>');

  const identifier = Buffer.from(state as string, 'base64').toString('ascii');
  
  try {
    const container = getContainer('Users');


    const { resources } = await container.items.query({
      query: "SELECT * FROM c WHERE c.googleId = @gid",
      parameters: [{ name: "@gid", value: identifier }]
    }).fetchAll();

    if (resources.length === 0) {
      console.error("User document not found for identifier:", identifier);
      return res.send('<script>alert("User not found."); window.close();</script>');
    }

    const user = resources[0];

    const tokenResponse = await axios.post('https://api.monzo.com/oauth2/token', new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.MONZO_CLIENT_ID!,
      client_secret: process.env.MONZO_CLIENT_SECRET!,
      redirect_uri: 'http://localhost:5000/api/auth/monzo/callback',
      code: code as string,
    }).toString());


    const updatedUser = {
      ...user,
      monzo: {
        access_token: tokenResponse.data.access_token,
        refresh_token: tokenResponse.data.refresh_token,
        expires_at: Date.now() + (tokenResponse.data.expires_in * 1000)
      }
    };

    await container.item(user.id, user.id).replace(updatedUser);

    console.log("Token saved successfully for:", user.id);
    res.redirect('http://localhost:5174');
  } catch (err: any) {
    console.error("Exchange Failed:", err.response?.data || err.message);
    res.send('<script>alert("Authentication failed."); window.close();</script>');
  }
});

export default router;