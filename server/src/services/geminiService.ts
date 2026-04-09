import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface TransactionDraft {
  date: string;
  description: string;
  amount: number;
  merchant: string;
  category: string;
}

export const parseTransactionsWithAI = async (rawText: string, retries = 0): Promise<TransactionDraft[]> => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-lite-latest", 
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const prompt = `
    Analyze this bank statement text and extract transactions into a JSON array.
    Required Keys: date (YYYY-MM-DD), description, amount (negative for expense), merchant, category.
    Categories: Food, Transport, Housing, Utilities, Entertainment, Income, Other.
    Raw Text: ${rawText}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) throw new Error("AI returned empty response.");
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];

  } catch (error: any) {
    if ((error.status === 503 || error.status === 429) && retries < 3) {
      console.warn(`AI Busy, retrying attempt #${retries + 1}...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      return parseTransactionsWithAI(rawText, retries + 1);
    }
    throw new Error(`AI Parsing Error: ${error.message}`);
  }
};