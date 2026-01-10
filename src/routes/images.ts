import { Router, Response } from 'express';
import type { Router as RouterType } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import cloudinary from '../config/cloudinary';
import Image from '../models/Image';

const router: RouterType = Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

interface ImageData {
  id: string;
  imageUrl: string;
  cloudinaryId: string;
  date: string;
  createdAt: string;
}

// GET all images sorted by date
router.get('/', async (req, res: Response) => {
  try {
    const images = await Image.find().sort({ date: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read images data' });
  }
});

// Upload image
router.post('/upload' , upload.single('image'), async (req, res:Response ) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { date } = req.body;
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'pk55', 
          resource_type: 'image',
          timeout: 120000 // 2 minutes timeout
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file!.buffer);
    });

    const newImage = await Image.create({
      id: result.public_id,
      imageUrl: result.secure_url,
      cloudinaryId: result.public_id,
      date: date
    });

    res.json({ message: 'Image uploaded successfully', image: newImage });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image: ' + error.message });
  }
});

// Delete image
router.delete('/:id(*)', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = decodeURIComponent(req.params.id);
    
    const image = await Image.findOne({ id });
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    await cloudinary.uploader.destroy(image.cloudinaryId);
    await Image.deleteOne({ id });

    res.json({ message: 'Image deleted successfully' });
  } catch (error: any) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete image: ' + error.message });
  }
});

// Update image date
router.put('/:id(*)/update-date', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = decodeURIComponent(req.params.id);
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const image = await Image.findOneAndUpdate(
      { id },
      { date },
      { new: true }
    );

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json({ message: 'Image date updated successfully', image });
  } catch (error: any) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update image: ' + error.message });
  }
});

// Replace image (delete old and upload new)
router.put('/:id(*)/replace', authMiddleware, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    const id = decodeURIComponent(req.params.id);
    const { date } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const existingImage = await Image.findOne({ id });

    if (!existingImage) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete old image from Cloudinary
    await cloudinary.uploader.destroy(existingImage.cloudinaryId);

    // Upload new image
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'pk55', resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file!.buffer);
    });

    // Update image data
    const updatedImage = await Image.findOneAndUpdate(
      { id },
      {
        id: result.public_id,
        imageUrl: result.secure_url,
        cloudinaryId: result.public_id,
        date: date || existingImage.date
      },
      { new: true }
    );

    res.json({ message: 'Image replaced successfully', image: updatedImage });
  } catch (error: any) {
    console.error('Replace error:', error);
    res.status(500).json({ error: 'Failed to replace image: ' + error.message });
  }
});

export default router;
