const express = require('express');
const ProductController = require('../controllers/ProductController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// GET products (supports search, pagination, combined filtering, sorting)
router.get('/', ProductController.getProducts);

// GET distinct brands list (for filtering sidebar)
router.get('/brands', ProductController.getDistinctBrands);

// GET product by ID
router.get('/:id', ProductController.getProductById);

// POST add product review (Authenticated users)
router.post('/:id/reviews', protect, ProductController.addReview);

// POST create product (Admin feature prep)
router.post('/', protect, authorize('Admin'), ProductController.createProduct);

// PUT update product by ID (Admin feature prep)
router.put('/:id', protect, authorize('Admin'), ProductController.updateProduct);

// DELETE product by ID (Admin feature prep)
router.delete('/:id', protect, authorize('Admin'), ProductController.deleteProduct);

module.exports = router;
