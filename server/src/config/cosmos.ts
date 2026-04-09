import { CosmosClient } from "@azure/cosmos";
import dotenv from 'dotenv';

dotenv.config();

const endpoint = process.env.COSMOS_ENDPOINT!;
const key = process.env.COSMOS_KEY!;

export const client = new CosmosClient({ endpoint, key });

export const initDatabase = async () => {
  try {
    const { database } = await client.databases.createIfNotExists({ id: "BudgieDB" });
    await database.containers.createIfNotExists({ id: "Users", partitionKey: "/id" });
    await database.containers.createIfNotExists({ id: "Transactions", partitionKey: "/userId" });
    console.log("✅ Cosmos DB Ready");
  } catch (error) {
    console.error("Cosmos DB Init Error:", error);
    throw error; 
  }
};