const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerInfo: {
      fullName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: String, required: true },
      },
    ],
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },
    subtotalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    appliedVoucher: {
      code: {
        type: String,
        default: null,
        trim: true,
      },
      discountType: {
        type: String,
        enum: ['fixed', 'percent', null],
        default: null,
      },
      discountValue: {
        type: Number,
        default: 0,
        min: 0,
      },
      maxDiscountAmount: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      default: 'Pending',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
