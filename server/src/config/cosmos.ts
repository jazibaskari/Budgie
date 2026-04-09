import { CosmosClient } from "@azure/cosmos";
import dotenv from 'dotenv';

dotenv.config();

const endpoint = process.env.COSMOS_ENDPOINT!;
const key = process.env.COSMOS_KEY!;

if (!endpoint || !key) {
  console.error("MISSING COSMOS CREDENTIALS IN .ENV");
}

export const client = new CosmosClient({ endpoint, key });

export const initDatabase = async () => {
  try {
    console.log("Creating Database 'BudgieDB' if it doesn't exist...");
    const { database } = await client.databases.createIfNotExists({ id: "BudgieDB" });
    
    console.log("Creating 'Users' container...");
    await database.containers.createIfNotExists({ id: "Users", partitionKey: "/id" });
    
    console.log("Creating 'Transactions' container...");
    await database.containers.createIfNotExists({ id: "Transactions", partitionKey: "/userId" });

    console.log("Azure Cosmos DB: Connected and Containers ready.");
  } catch (error) {
    console.error("Cosmos DB Init Error:", error);
    throw error; 
  }
};