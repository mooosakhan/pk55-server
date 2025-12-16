import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

settingsSchema.pre('save', function() {
  this.updatedAt = new Date();
});

export default mongoose.model('Settings', settingsSchema);
