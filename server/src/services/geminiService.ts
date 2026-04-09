import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const parseTransactionsWithAI = async (rawText: string) => {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-3-flash-preview",
        generationConfig: {
          responseMimeType: "application/json",
        }
      });

  const prompt = `
    You are a professional financial accountant. 
    Analyze the following raw text from a bank statement and extract all transactions.
    
    Return the data ONLY as a JSON array of objects. Do not include conversational text.
    
    Required Keys:
    - date: (ISO string YYYY-MM-DD)
    - description: (Original text)
    - amount: (Number, negative for expense, positive for income)
    - merchant: (Cleaned up name)
    - category: (One of: Food, Transport, Housing, Utilities, Entertainment, Income, Other)

    Raw Text: ${rawText}
  `;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();

    const cleanJson = text.replace(/```json|```/gi, "").trim();

    return JSON.parse(cleanJson);
  } catch (error: any) {
    console.error("AI Parsing Error:", error);
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
};