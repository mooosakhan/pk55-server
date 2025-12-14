import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document {
  discountPercentage: number;
  date: string;
  heading: string;
  description: string;
  image?: {
    data: Buffer;
    contentType: string;
    filename: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema: Schema = new Schema({
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  date: {
    type: String,
    required: true
  },
  heading: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    data: Buffer,
    contentType: String,
    filename: String
  }
}, {
  timestamps: true
});

export default mongoose.model<IBanner>('Banner', BannerSchema);
