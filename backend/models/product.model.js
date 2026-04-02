const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: String,
      required: true,
      trim: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const productSpecificationSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: String,
      required: true,
    },
    originalPrice: {
      type: String,
      required: true,
    },
    discountBadge: {
      type: String,
      required: true,
      trim: true,
    },
    imageData: {
      type: Buffer,
    },
    imageContentType: {
      type: String,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    promoText: {
      type: String,
      required: true,
      trim: true,
    },
    productInfo: {
      type: String,
      default: '',
      trim: true,
    },
    specifications: {
      type: [productSpecificationSchema],
      default: [],
    },
    variants: {
      type: [productVariantSchema],
      default: [],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
