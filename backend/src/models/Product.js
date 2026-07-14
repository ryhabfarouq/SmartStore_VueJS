const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    brand: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    image: {
      type: String,
    },
    thumbnail: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    availabilityStatus: {
      type: String,
      default: 'In Stock',
    },
    sku: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
    dimensions: {
      width: { type: Number },
      height: { type: Number },
      depth: { type: Number },
    },
    shippingInformation: {
      type: String,
    },
    warrantyInformation: {
      type: String,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: { type: Number },
        comment: { type: String },
        date: { type: Date },
        reviewerName: { type: String },
        reviewerEmail: { type: String },
      },
    ],
    meta: {
      createdAt: { type: Date },
      updatedAt: { type: Date },
      barcode: { type: String },
      qrCode: { type: String },
    },
    sales: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isOnSale: {
      type: Boolean,
      default: false,
    },
    originalPrice: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for search queries
productSchema.index({ title: 'text', brand: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
