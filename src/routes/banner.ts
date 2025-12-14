import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

const router = Router();
const bannerPath = path.join(__dirname, '../data/banner.json');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../web/public/assets');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `bg-${Date.now()}${ext}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

// GET banner data (public)
router.get('/', (req, res: Response) => {
  try {
    const bannerData = JSON.parse(fs.readFileSync(bannerPath, 'utf-8'));
    res.json(bannerData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read banner data' });
  }
});

// UPDATE banner data (protected)
router.put('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { discountPercentage, date, heading, description, imageUrl } = req.body;
    
    const bannerData = JSON.parse(fs.readFileSync(bannerPath, 'utf-8'));
    
    if (discountPercentage !== undefined) bannerData.discountPercentage = discountPercentage;
    if (date !== undefined) bannerData.date = date;
    if (heading !== undefined) bannerData.heading = heading;
    if (description !== undefined) bannerData.description = description;
    if (imageUrl !== undefined) bannerData.imageUrl = imageUrl;

    fs.writeFileSync(bannerPath, JSON.stringify(bannerData, null, 2));
    
    res.json(bannerData);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update banner data' });
  }
});

// Upload image (protected)
router.post('/upload', authMiddleware, upload.single('image'), (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `/assets/${req.file.filename}`;
    
    // Update banner data with new image URL
    const bannerData = JSON.parse(fs.readFileSync(bannerPath, 'utf-8'));
    bannerData.imageUrl = imageUrl;
    fs.writeFileSync(bannerPath, JSON.stringify(bannerData, null, 2));

    res.json({ imageUrl, message: 'Image uploaded successfully' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;
