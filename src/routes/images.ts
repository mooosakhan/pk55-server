import { Router, Response } from 'express';
import type { Router as RouterType } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import cloudinary from '../config/cloudinary';

const router: RouterType = Router();
const imagesPath = path.join(__dirname, '../data/images.json');

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
router.get('/', (req, res: Response) => {
  try {
    const images: ImageData[] = JSON.parse(fs.readFileSync(imagesPath, 'utf-8'));
    const sortedImages = images.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(sortedImages);
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
        { folder: 'pk55', resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file!.buffer);
    });

    const images: ImageData[] = JSON.parse(fs.readFileSync(imagesPath, 'utf-8'));

    const newImage: ImageData = {
      id: result.public_id,
      imageUrl: result.secure_url,
      cloudinaryId: result.public_id,
      date: date,
      createdAt: new Date().toISOString()
    };

    images.push(newImage);
    fs.writeFileSync(imagesPath, JSON.stringify(images, null, 2));

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
    let images: ImageData[] = JSON.parse(fs.readFileSync(imagesPath, 'utf-8'));
    
    const image = images.find(img => img.id === id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    await cloudinary.uploader.destroy(image.cloudinaryId);
    images = images.filter(img => img.id !== id);
    fs.writeFileSync(imagesPath, JSON.stringify(images, null, 2));

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

    const images: ImageData[] = JSON.parse(fs.readFileSync(imagesPath, 'utf-8'));
    const imageIndex = images.findIndex(img => img.id === id);

    if (imageIndex === -1) {
      return res.status(404).json({ error: 'Image not found' });
    }

    images[imageIndex].date = date;
    fs.writeFileSync(imagesPath, JSON.stringify(images, null, 2));

    res.json({ message: 'Image date updated successfully', image: images[imageIndex] });
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

    let images: ImageData[] = JSON.parse(fs.readFileSync(imagesPath, 'utf-8'));
    const imageIndex = images.findIndex(img => img.id === id);

    if (imageIndex === -1) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete old image from Cloudinary
    await cloudinary.uploader.destroy(images[imageIndex].cloudinaryId);

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
    images[imageIndex] = {
      id: result.public_id,
      imageUrl: result.secure_url,
      cloudinaryId: result.public_id,
      date: date || images[imageIndex].date,
      createdAt: images[imageIndex].createdAt
    };

    fs.writeFileSync(imagesPath, JSON.stringify(images, null, 2));

    res.json({ message: 'Image replaced successfully', image: images[imageIndex] });
  } catch (error: any) {
    console.error('Replace error:', error);
    res.status(500).json({ error: 'Failed to replace image: ' + error.message });
  }
});

export default router;
