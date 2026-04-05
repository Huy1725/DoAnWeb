const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    discountType: {
      type: String,
      required: true,
      enum: ['fixed', 'percent'],
    },
    discountValue: {
      type: Number,
      required: true,
      min: 1,
    },
    maxDiscountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    autoTierReward: {
      type: Boolean,
      default: false,
    },
    tierFrom: {
      type: String,
      default: null,
      enum: ['S-NULL', 'S-NEW', 'S-MEM', 'S-VIP', null],
    },
    tierTo: {
      type: String,
      default: null,
      enum: ['S-NULL', 'S-NEW', 'S-MEM', 'S-VIP', null],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Promotion', promotionSchema);
