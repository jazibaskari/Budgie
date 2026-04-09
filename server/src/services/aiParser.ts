import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const mapHeadersWithAI = async (headers: string[]) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `Map these bank CSV headers: [${headers.join(", ")}] 
                  to this JSON format: { "date": string, "amount": string, "desc": string }.
                  Return ONLY JSON.`;
  
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};