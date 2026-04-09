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
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });

  try {
    const user = req.user as { id: string };
    const querySpec = {
      query: "SELECT * FROM c WHERE c.userId = @userId ORDER BY c.date DESC",
      parameters: [{ name: "@userId", value: user.id }]
    };
    const { resources: items } = await container.items.query(querySpec).fetchAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch" });
  }
});

router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });

  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });

    let rawText = "";
    if (req.file.mimetype.includes('spreadsheet') || req.file.mimetype.includes('csv')) {
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = sheetName ? workbook.Sheets[sheetName] : null;
      if (!worksheet) throw new Error("Invalid spreadsheet");
      rawText = xlsx.utils.sheet_to_csv(worksheet);
    } else if (req.file.mimetype === 'application/pdf') {
      const data = await pdf(req.file.buffer);
      rawText = data.text;
    }

    const transactions = await parseTransactionsWithAI(rawText);
    res.json({ transactions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Confirm and Save
router.post('/confirm', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { transactions } = req.body;
    const user = req.user as { id: string };
    
    const savePromises = transactions.map((t: any) => 
      container.items.create({
        id: uuidv4(),
        userId: user.id,
        ...t,
        isVerified: true,
        createdAt: new Date().toISOString()
      })
    );

    await Promise.all(savePromises);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Save failed" });
  }
});

export default router;