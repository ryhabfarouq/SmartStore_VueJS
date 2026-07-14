const AuthService = require('../services/AuthService');

class AuthController {
  /**
   * POST /auth/register
   * Register a new user
   */
  async register(req, res) {
    try {
      const { name, email, password, phone, address, role } = req.body;
      
      // Basic input validation
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
      }

      const userData = await AuthService.registerUser({
        name,
        email,
        password,
        phone,
        address,
        role, // Seeder might supply role, defaults to Customer in service
      });

      res.status(201).json(userData);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * POST /auth/login
   * Authenticate user & get token
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const userData = await AuthService.loginUser(email, password);
      res.json(userData);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  /**
   * GET /auth/me
   * Get current authenticated user profile
   */
  async getProfile(req, res) {
    try {
      // req.user is populated by protect middleware
      const profile = await AuthService.getUserProfile(req.user._id);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * PUT /auth/me
   * Update current authenticated user profile
   */
  async updateProfile(req, res) {
    try {
      const profile = await AuthService.updateUserProfile(req.user._id, req.body);
      res.json(profile);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * GET /auth/wishlist
   */
  async getWishlist(req, res) {
    try {
      const wishlist = await AuthService.getUserWishlist(req.user._id);
      res.json(wishlist);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * POST /auth/wishlist
   */
  async addToWishlist(req, res) {
    try {
      const { productId } = req.body;
      if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
      }
      const wishlist = await AuthService.addProductToWishlist(req.user._id, productId);
      res.json(wishlist);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * DELETE /auth/wishlist/:productId
   */
  async removeFromWishlist(req, res) {
    try {
      const wishlist = await AuthService.removeProductFromWishlist(req.user._id, req.params.productId);
      res.json(wishlist);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new AuthController();
