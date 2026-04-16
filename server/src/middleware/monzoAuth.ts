import axios from 'axios';
import { getContainer } from '../config/cosmos.js';

export const getValidAccessToken = async (googleId: string) => {
  const container = getContainer("Users");

  const { resources } = await container.items
    .query({
      query: "SELECT * FROM c WHERE c.googleId = @gid",
      parameters: [{ name: "@gid", value: googleId }]
    }).fetchAll();

  if (resources.length === 0) return null;
  const user = resources[0];
  
  if (!user?.monzo?.access_token) return null;

  const now = Date.now();
  const isExpired = now >= user.monzo.expires_at;

  if (isExpired && user.monzo.refresh_token) {
    console.log("Token expired, refreshing...");
    return await refreshAccessToken(user.id, googleId, user.monzo.refresh_token);
  }

  return user.monzo.access_token;
};

const refreshAccessToken = async (id: string, googleId: string, refreshToken: string) => {
  const container = getContainer("Users");
  
  try {
    const response = await axios.post('https://api.monzo.com/oauth2/token', new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.MONZO_CLIENT_ID!,
      client_secret: process.env.MONZO_CLIENT_SECRET!,
      refresh_token: refreshToken
    }).toString());

    const { access_token, refresh_token, expires_in } = response.data;
    
   
    await container.item(id, googleId).patch([{ 
      op: "replace", path: "/monzo", value: { 
        access_token, 
        refresh_token, 
        expires_at: Date.now() + (expires_in * 1000) 
      } 
    }]);

    return access_token;
  } catch (err) {
    console.error("Refresh failed:", err);
    return null;
  }
};