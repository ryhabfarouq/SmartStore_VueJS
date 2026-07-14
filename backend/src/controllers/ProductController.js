const ProductService = require('../services/ProductService');

class ProductController {
  /**
   * GET /products
   * List products with filtering, search, sorting, and pagination
   */
  async getProducts(req, res) {
    try {
      const {
        search,
        category,
        brand,
        minPrice,
        maxPrice,
        availabilityStatus,
        minRating,
        stock,
        sort,
        page,
        limit,
        isFeatured,
        isOnSale,
      } = req.query;

      const data = await ProductService.getProducts({
        search,
        category,
        brand,
        minPrice,
        maxPrice,
        availabilityStatus,
        minRating,
        stock,
        sort,
        page,
        limit,
        isFeatured,
        isOnSale,
      });

      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
  }

  /**
   * GET /products/brands
   * List distinct brands for search sidebar
   */
  async getDistinctBrands(req, res) {
    try {
      const brands = await ProductService.getDistinctBrands();
      res.json(brands);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching distinct brands', error: error.message });
    }
  }

  /**
   * GET /products/:id
   * Get single product details by ID
   */
  async getProductById(req, res) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching product details', error: error.message });
    }
  }

  /**
   * POST /products
   * Create new product (Admin feature prep)
   */
  async createProduct(req, res) {
    try {
      const product = await ProductService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: 'Error creating product', error: error.message });
    }
  }

  /**
   * PUT /products/:id
   * Update product by ID (Admin feature prep)
   */
  async updateProduct(req, res) {
    try {
      const product = await ProductService.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: 'Error updating product', error: error.message });
    }
  }

  /**
   * POST /products/:id/reviews
   * Add a review for a product
   */
  async addReview(req, res) {
    try {
      const { rating, comment } = req.body;

      if (!rating || !comment || !comment.trim()) {
        return res.status(400).json({ message: 'Rating and review text are required' });
      }

      const ratingValue = Number(rating);
      if (ratingValue < 1 || ratingValue > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }

      const product = await ProductService.addReview(req.params.id, req.user, {
        rating: ratingValue,
        comment: comment.trim(),
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: 'Error adding review', error: error.message });
    }
  }

  /**
   * DELETE /products/:id
   * Delete product by ID (Admin feature prep)
   */
  async deleteProduct(req, res) {
    try {
      const result = await ProductService.deleteProduct(req.params.id);
      if (!result) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
  }
}

module.exports = new ProductController();
