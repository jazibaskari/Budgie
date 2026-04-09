import { Router } from 'express';
import type { Request, Response } from 'express';
import { upload } from '../middleware/upload.js';
import { parseTransactionsWithAI } from '../services/geminiService.js';
import { client } from '../config/cosmos.js';
import * as xlsx from 'xlsx';
import { createRequire } from 'module';
import crypto from 'crypto';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const router = Router();
const container = client.database("BudgieDB").container("Transactions");

router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });

  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    let rawText = "";
    const mime = req.file.mimetype;

    if (mime.includes('spreadsheet') || mime.includes('csv') || mime.includes('excel')) {
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new Error("The Excel file appears to be empty (no sheets found).");
      }

      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        throw new Error(`Could not read the worksheet named: ${sheetName}`);
      }


      rawText = xlsx.utils.sheet_to_csv(worksheet);
      
    } 

    else if (mime === 'application/pdf') {
      const data = await pdf(req.file.buffer);
      rawText = data.text;
    } 

    else {
      rawText = req.file.buffer.toString('utf-8');
    }

    const transactions = await parseTransactionsWithAI(rawText);
    res.json({ transactions });

  } catch (err: any) {
    console.error("🔥 Upload Error:", err.message);
    res.status(500).json({ error: err.message || "Failed to process file" });
  }
});

router.post('/confirm', async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!req.isAuthenticated() || !user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { transactions, month } = req.body;
    const currentMonth = month || new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const savePromises = transactions.map((t: any) => 
      container.items.create({
        id: crypto.randomUUID(),
        userId: String(user.id), 
        month: currentMonth,
        ...t,
        isVerified: true,
        createdAt: new Date().toISOString()
      })
    );

    await Promise.all(savePromises);
    res.json({ success: true });

  } catch (err: any) {
    console.error("🔥 Confirm Error:", err.message);
    res.status(500).json({ error: "Failed to save transactions to database" });
  }
});

router.get('/', async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!req.isAuthenticated() || !user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {

    const querySpec = {
      query: "SELECT * FROM c WHERE c.userId = @userId ORDER BY c.date DESC",
      parameters: [{ name: "@userId", value: String(user.id) }]
    };
    
    const { resources: items } = await container.items.query(querySpec).fetchAll();
    

    res.json(items || []);

  } catch (err: any) {
    console.error("Fetch Error:", err.message);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

export default router;