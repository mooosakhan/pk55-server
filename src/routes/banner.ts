import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import Banner from '../models/Banner';

const router: Router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

// GET banner data (public)
router.get('/', async (req, res: Response) => {
  try {
    // Get the most recent banner, or create default if none exists
    let banner = await Banner.findOne().sort({ createdAt: -1 });
    
    if (!banner) {
      // Create default banner without image
      banner = new Banner({
        discountPercentage: 0,
        date: new Date().toISOString().split('T')[0],
        heading: 'Welcome',
        description: 'Check out our latest offers!'
      });
      await banner.save();
    }
    
    // Return banner data without image buffer
    const bannerData = {
      _id: banner._id,
      discountPercentage: banner.discountPercentage,
      date: banner.date,
      heading: banner.heading,
      description: banner.description,
      hasImage: !!banner.image,
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt
    };
    
    res.json(bannerData);
  } catch (error) {
    console.error('Get banner error:', error);
    res.status(500).json({ error: 'Failed to read banner data' });
  }
});

// GET banner image (public)
router.get('/image', async (req, res: Response) => {
  try {
    const banner = await Banner.findOne().sort({ createdAt: -1 });
    
    if (!banner || !banner.image || !banner.image.data) {
      return res.status(404).json({ error: 'No image found' });
    }
    
    res.set('Content-Type', banner.image.contentType);
    res.send(banner.image.data);
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({ error: 'Failed to retrieve image' });
  }
});

// UPDATE banner data (protected)
router.put('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { discountPercentage, date, heading, description } = req.body;
    
    // Get the most recent banner or create new one
    let banner = await Banner.findOne().sort({ createdAt: -1 });
    
    if (!banner) {
      banner = new Banner({
        discountPercentage: discountPercentage || 0,
        date: date || new Date().toISOString().split('T')[0],
        heading: heading || 'Welcome',
        description: description || ''
      });
    } else {
      // Update existing banner
      if (discountPercentage !== undefined) banner.discountPercentage = discountPercentage;
      if (date !== undefined) banner.date = date;
      if (heading !== undefined) banner.heading = heading;
      if (description !== undefined) banner.description = description;
    }

    await banner.save();
    
    // Return banner data without image buffer
    const bannerData = {
      _id: banner._id,
      discountPercentage: banner.discountPercentage,
      date: banner.date,
      heading: banner.heading,
      description: banner.description,
      hasImage: !!banner.image,
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt
    };
    
    res.json(bannerData);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update banner data' });
  }
});

// Upload image (protected)
router.post('/upload', authMiddleware, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get or create banner
    let banner = await Banner.findOne().sort({ createdAt: -1 });
    
    if (!banner) {
      banner = new Banner({
        discountPercentage: 0,
        date: new Date().toISOString().split('T')[0],
        heading: 'Welcome',
        description: '',
        image: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
          filename: req.file.originalname
        }
      });
    } else {
      banner.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname
      };
    }
    
    await banner.save();

    res.json({ 
      message: 'Image uploaded successfully',
      filename: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;
