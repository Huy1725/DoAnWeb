const mongoose = require('mongoose');

const userVoucherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    promotion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Promotion',
      required: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
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
    status: {
      type: String,
      required: true,
      enum: ['available', 'used', 'expired'],
      default: 'available',
      index: true,
    },
    source: {
      type: String,
      required: true,
      enum: ['tier-upgrade', 'manual'],
      default: 'manual',
    },
    issuedReason: {
      type: String,
      default: '',
      trim: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    usedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userVoucherSchema.index({ user: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('UserVoucher', userVoucherSchema);
