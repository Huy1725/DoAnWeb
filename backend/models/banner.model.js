const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    position: {
      type: String,
      required: true,
      unique: true,
      enum: ['main', 'side1', 'side2', 'side3'],
    },
    imageData: {
      type: Buffer,
    },
    imageContentType: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Banner', bannerSchema);
