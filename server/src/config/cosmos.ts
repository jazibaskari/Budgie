import { CosmosClient, Container } from "@azure/cosmos";
import dotenv from 'dotenv';
dotenv.config();

export const client = new CosmosClient({ 
  endpoint: process.env.COSMOS_ENDPOINT!, 
  key: process.env.COSMOS_KEY! 
});

export const database = client.database("BudgieDB");

export const getContainer = (containerId: string): Container => {
  return database.container(containerId);
};

export const initDatabase = async () => {
  const containers = [
    { id: "Transactions", partitionKey: { paths: ["/userId"] } },
    { id: "monzo-auth", partitionKey: { paths: ["/id"] } },
    { id: "Users", partitionKey: { paths: ["/id"] } },
    { id: "Sessions", partitionKey: { paths: ["/id"] } } 
  ];

  for (const c of containers) {
    await database.containers.createIfNotExists(c);
    console.log(`Container verified/created: ${c.id}`);
  }
  console.log('Database fully initialised.');
};