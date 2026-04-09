import { Router } from 'express';
import type { Request, Response } from 'express';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/upload', upload.single('statement'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;

    res.json({
      message: `File '${fileName}' received! Ready for AI processing.`,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed.' });
  }
});

export default router;