import type { Transaction } from '../types/finance';

export const DUMMY_TRANSACTIONS: Transaction[] = [
  {
    _id: "demo_1",
    created: new Date().toISOString(),
    description: "Sainsburys",
    amount: -4500, 
    category: "transfers",
    month: "April 2026",
    counterparty: { name: "Landlord" },
    merchant: null
  },
  {
    _id: "demo_2",
    created: new Date().toISOString(),
    description: "Tesco Stores",
    amount: -1250,
    category: "groceries",
    month: "April 2026",
    merchant: { name: "Tesco", id: "merch_1" }
  },
];