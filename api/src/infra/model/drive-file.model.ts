import mongoose from 'mongoose';

const driveFileSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  mimeType: { type: String, required: true },
  durationMillis: { type: Number, required: true },
  size: { type: Number, required: true },
  thumbnailLink: { type: String, required: false },
  hasThumbnail: { type: Boolean, required: false },
});

export const DriveFileModel = mongoose.model('DriveFile', driveFileSchema);
