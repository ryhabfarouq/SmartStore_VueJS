const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

class ProductService {
  /**
   * Get all products with search, filtering, sorting, and pagination
   */
  async getProducts({
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    availabilityStatus,
    minRating,
    stock,
    sort,
    page = 1,
    limit = 12,
    isFeatured,
    isOnSale
  }) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const query = {};

    // 1. Search Query (partial match on title, brand, description or matching category name)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      
      // Find category IDs matching search query
      const categories = await Category.find({ name: searchRegex });
      const categoryIds = categories.map(c => c._id);

      query.$or = [
        { title: searchRegex },
        { brand: searchRegex },
        { description: searchRegex },
        { category: { $in: categoryIds } }
      ];
    }

    // 2. Category Filter (can be category name or category ID)
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        const cat = await Category.findOne({ name: new RegExp('^' + category + '$', 'i') });
        if (cat) {
          query.category = cat._id;
        } else {
          // If category name doesn't exist, return empty array
          query.category = new mongoose.Types.ObjectId();
        }
      }
    }

    // 3. Brand Filter (supports single brand or comma-separated list of brands)
    if (brand) {
      if (typeof brand === 'string' && brand.includes(',')) {
        const brands = brand.split(',').map(b => new RegExp('^' + b.trim() + '$', 'i'));
        query.brand = { $in: brands };
      } else {
        query.brand = new RegExp('^' + brand + '$', 'i');
      }
    }

    // 4. Price Filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        query.price.$lte = Number(maxPrice);
      }
      if (Object.keys(query.price).length === 0) {
        delete query.price;
      }
    }

    // 5. Availability Status Filter
    if (availabilityStatus) {
      if (typeof availabilityStatus === 'string' && availabilityStatus.includes(',')) {
        query.availabilityStatus = { $in: availabilityStatus.split(',').map(s => s.trim()) };
      } else {
        query.availabilityStatus = availabilityStatus;
      }
    }

    // 6. Rating Filter
    if (minRating !== undefined && minRating !== '') {
      query.rating = { $gte: Number(minRating) };
    }

    // 7. Stock Filter
    if (stock) {
      if (stock === 'inStock') {
        query.stock = { $gt: 0 };
      } else if (stock === 'lowStock') {
        query.stock = { $gt: 0, $lte: 5 };
      } else if (stock === 'outOfStock') {
        query.stock = 0;
      }
    }

    // 7b. Legacy filter support
    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true' || isFeatured === true;
    }
    if (isOnSale !== undefined) {
      query.isOnSale = isOnSale === 'true' || isOnSale === true;
    }

    // 8. Sorting
    let sortQuery = { createdAt: -1 }; // Default: Newest
    if (sort) {
      switch (sort) {
        case 'newest':
          sortQuery = { createdAt: -1 };
          break;
        case 'oldest':
          sortQuery = { createdAt: 1 };
          break;
        case 'priceAsc':
          sortQuery = { price: 1 };
          break;
        case 'priceDesc':
          sortQuery = { price: -1 };
          break;
        case 'ratingDesc':
          sortQuery = { rating: -1 };
          break;
        case 'alphaAsc':
          sortQuery = { title: 1 };
          break;
        case 'alphaDesc':
          sortQuery = { title: -1 };
          break;
        default:
          sortQuery = { createdAt: -1 };
      }
    }

    // 9. Execute Query
    const skip = (pageNum - 1) * limitNum;
    const products = await Product.find(query)
      .populate('category')
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(query);
    const pages = Math.ceil(total / limitNum);
    const hasNext = pageNum < pages;
    const hasPrevious = pageNum > 1;

    return {
      products,
      total,
      pages,
      page: pageNum,
      limit: limitNum,
      hasNext,
      hasPrevious
    };
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Product.findById(id).populate('category');
  }

  /**
   * Create a new product
   */
  async createProduct(productData) {
    // Set fallback name and image fields for legacy schema compatibility
    if (productData.title && !productData.name) {
      productData.name = productData.title;
    }
    if (productData.thumbnail && !productData.image) {
      productData.image = productData.thumbnail;
    }

    const product = new Product(productData);
    return await product.save();
  }

  /**
   * Update an existing product
   */
  async updateProduct(id, productData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    // Maintain name and image fallbacks
    if (productData.title && !productData.name) {
      productData.name = productData.title;
    }
    if (productData.thumbnail && !productData.image) {
      productData.image = productData.thumbnail;
    }

    return await Product.findByIdAndUpdate(id, productData, {
      new: true,
      runValidators: true
    }).populate('category');
  }

  /**
   * Add a customer review to a product
   */
  async addReview(id, user, reviewData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const product = await Product.findById(id);
    if (!product) {
      return null;
    }

    const rating = Number(reviewData.rating);
    product.reviews.push({
      user: user._id,
      rating,
      comment: reviewData.comment,
      date: new Date(),
      reviewerName: user.name,
      reviewerEmail: user.email,
    });

    product.rating = product.reviews.reduce((total, review) => total + Number(review.rating || 0), 0) / product.reviews.length;

    await product.save();
    return await Product.findById(product._id).populate('category');
  }

  /**
   * Delete a product
   */
  async deleteProduct(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Product.findByIdAndDelete(id);
  }

  /**
   * Get all unique product brands for filtering sidebar
   */
  async getDistinctBrands() {
    return await Product.distinct('brand', { brand: { $ne: null, $ne: '' } });
  }
}

module.exports = new ProductService();
