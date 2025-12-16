import mongoose, { Schema, Document } from 'mongoose';

export interface IImage extends Document {
  id: string;
  imageUrl: string;
  cloudinaryId: string;
  date: string;
  createdAt: Date;
}

const ImageSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  cloudinaryId: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IImage>('Image', ImageSchema);
