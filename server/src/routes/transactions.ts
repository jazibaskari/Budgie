import { Router } from 'express';
import type { Request, Response } from 'express';
import { upload } from '../middleware/upload.js';
import { parseTransactionsWithAI } from '../services/geminiService.js';
import { client } from '../config/cosmos.js';
import * as xlsx from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
const container = client.database("BudgieDB").container("Transactions");

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
  
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
  
      const querySpec = {
        query: "SELECT * FROM c WHERE c.userId = @userId ORDER BY c.date DESC",
        parameters: [
          { name: "@userId", value: userId }
        ]
      };
  
      const { resources: items } = await container.items
        .query(querySpec)
        .fetchAll();
  
      res.json(items);
    } catch (err: any) {
      console.error("Cosmos Retrieval Error:", err);
      res.status(500).json({ error: "Failed to fetch transactions from database" });
    }
  });

router.post('/upload', upload.single('statement'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    let rawText = "";
    const mimetype = req.file.mimetype;

    if (mimetype === 'text/csv' || mimetype.includes('spreadsheet') || mimetype.includes('excel')) {
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      
      if (!sheetName) return res.status(400).json({ error: 'Spreadsheet is empty.' });
      
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) return res.status(400).json({ error: 'Worksheet not found.' });
      
      rawText = xlsx.utils.sheet_to_csv(worksheet);
    } 
 
    else if (mimetype === 'application/pdf') {
      try {
        const data = await pdf(req.file.buffer);
        rawText = data.text;
      } catch (pdfError) {
        console.error("PDF Parse Error:", pdfError);
        return res.status(422).json({ error: 'The PDF file is unreadable.' });
      }
    }
    
    if (!rawText || rawText.trim().length < 10) {
      return res.status(400).json({ error: 'Could not extract enough text from file.' });
    }

    const transactions = await parseTransactionsWithAI(rawText);

    res.json({
      message: "AI Parsing Successful",
      fileName: req.file.originalname,
      count: transactions.length,
      data: transactions 
    });

  } catch (err: any) {
    console.error("ETL Error:", err);
    res.status(500).json({ error: 'Internal processing error.', details: err.message });
  }
});

router.post('/confirm', async (req: Request, res: Response) => {
    try {
      const { data } = req.body; 
      const userId = (req.user as any)?.id;
  
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
      }
  
      if (!data || !Array.isArray(data)) {
        return res.status(400).json({ error: "No transaction data found in request body." });
      }
  
      const container = client.database("BudgieDB").container("Transactions");
  
      const savePromises = data.map((t: any) => {
        return container.items.create({
          id: uuidv4(),
          userId: userId, 
          date: t.date,
          description: t.description,
          amount: t.amount,
          merchant: t.merchant,
          category: t.category,
          isVerified: true,
          createdAt: new Date().toISOString()
        });
      });
  
      await Promise.all(savePromises);
  
      res.json({ 
        success: true, 
        message: `Successfully saved ${data.length} transactions to Azure Cosmos DB.` 
      });
  
    } catch (err: any) {
      console.error("Cosmos Save Error:", err);
      res.status(500).json({ error: "Failed to save to database." });
    }
  });

export default router;