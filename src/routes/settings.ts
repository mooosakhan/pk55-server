import express, { Request, Response } from 'express';
import type { Router } from 'express';
import Settings from '../models/Settings';
import { authMiddleware } from '../middleware/auth';

const router: Router = express.Router();

// Get all settings (public)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const settings = await Settings.find();
    const settingsObject = settings.reduce((acc: any, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    
    // Set default if not exists
    if (!settingsObject.headerText) {
      settingsObject.headerText = 'DAILY PK 55 REPORT AND ALL KHABAR';
    }
    if (!settingsObject.subheaderText) {
      settingsObject.subheaderText = 'Stay Updated with the Latest News';
    }
    
    res.json(settingsObject);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update settings (protected - admin only)
router.put('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { headerText, subheaderText } = req.body;
    
    if (headerText) {
      await Settings.findOneAndUpdate(
        { key: 'headerText' },
        { key: 'headerText', value: headerText },
        { upsert: true, new: true }
      );
    }
    
    if (subheaderText) {
      await Settings.findOneAndUpdate(
        { key: 'subheaderText' },
        { key: 'subheaderText', value: subheaderText },
        { upsert: true, new: true }
      );
    }
    
    res.json({ message: 'Settings updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
