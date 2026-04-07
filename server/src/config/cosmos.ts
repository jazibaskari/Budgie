import { CosmosClient } from "@azure/cosmos";

const endpoint = process.env.COSMOS_ENDPOINT!;
const key = process.env.COSMOS_KEY!;
export const client = new CosmosClient({ endpoint, key });

export const getContainer = async () => {
  const { database } = await client.databases.createIfNotExists({ id: "BudgieDB" });
  const { container } = await database.containers.createIfNotExists({ id: "Transactions" });
  return container;
};