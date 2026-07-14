const express = require('express');
const AuthController = require('../controllers/AuthController');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes (require JWT token)
router.get('/me', protect, AuthController.getProfile);
router.put('/me', protect, AuthController.updateProfile);
router.get('/wishlist', protect, AuthController.getWishlist);
router.post('/wishlist', protect, AuthController.addToWishlist);
router.delete('/wishlist/:productId', protect, AuthController.removeFromWishlist);

module.exports = router;
