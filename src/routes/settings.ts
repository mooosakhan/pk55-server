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
      // Find the existing setting
      const existingSetting = await Settings.findOne({ key: 'subheaderText' });
      
      if (existingSetting) {
        // If value is different, save old value to history
        if (existingSetting.value !== subheaderText) {
          existingSetting.history = existingSetting.history || [];
          existingSetting.history.push({
            value: existingSetting.value,
            changedAt: new Date()
          });
          existingSetting.value = subheaderText;
          await existingSetting.save();
        }
      } else {
        // Create new setting with initial history entry
        await Settings.create({
          key: 'subheaderText',
          value: subheaderText,
          history: []
        });
      }
    }
    
    res.json({ message: 'Settings updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get subheader text history (public) with pagination
router.get('/subheader-history', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const setting = await Settings.findOne({ key: 'subheaderText' });
    
    if (!setting) {
      return res.json({ 
        items: [], 
        total: 0, 
        page, 
        limit, 
        hasMore: false 
      });
    }
    
    // Return history + current value
    const history = setting.history || [];
    const fullHistory = [
      {
        value: setting.value,
        changedAt: setting.updatedAt,
        current: true
      },
      ...history.map((h: any) => ({
        value: h.value,
        changedAt: h.changedAt
      }))
    ];
    
    // Sort by date (most recent first)
    fullHistory.sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
    
    // Apply pagination
    const total = fullHistory.length;
    const paginatedHistory = fullHistory.slice(skip, skip + limit);
    const hasMore = skip + limit < total;
    
    res.json({
      items: paginatedHistory,
      total,
      page,
      limit,
      hasMore
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
