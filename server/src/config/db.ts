import { CosmosClient } from "@azure/cosmos";
import dotenv from 'dotenv';
dotenv.config();

const endpoint = process.env.COSMOS_ENDPOINT!;
const key = process.env.COSMOS_KEY!;

export const client = new CosmosClient({ 
  endpoint, 
  key,
  connectionPolicy: { requestTimeout: 10000 }
});
export const database = client.database("BudgieDB");