import mongoose from 'mongoose';

interface HistoryEntry {
  value: string;
  changedAt: Date;
}

const historyEntrySchema = new mongoose.Schema({
  value: { type: String, required: true },
  changedAt: { type: Date, default: Date.now }
}, { _id: false });

const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  history: [historyEntrySchema],
  updatedAt: { type: Date, default: Date.now }
});

settingsSchema.pre('save', function() {
  this.updatedAt = new Date();
});

export default mongoose.model('Settings', settingsSchema);
