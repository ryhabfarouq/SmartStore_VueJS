const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
  /**
   * Helper to generate JWT token
   * @param {string} id - User ID
   * @param {string} role - User role
   */
  generateToken(id, role) {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', {
      expiresIn: '30d',
    });
  }

  /**
   * Register a new user
   */
  async registerUser({ name, email, password, phone, address, role }) {
    // Normalize email
    const emailNorm = email.toLowerCase().trim();

    // Check if user already exists
    const userExists = await User.findOne({ email: emailNorm });
    if (userExists) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: emailNorm,
      password: hashedPassword,
      phone: phone || '',
      address: address || '',
      role: role || 'Customer',
    });

    const token = this.generateToken(user._id, user.role);

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      token,
    };
  }

  /**
   * Authenticate a user and generate token
   */
  async loginUser(email, password) {
    const emailNorm = email.toLowerCase().trim();
    
    // Find user
    const user = await User.findOne({ email: emailNorm });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    if (user.isDeleted) {
      throw new Error('This account has been deleted');
    }

    if (user.isRestricted) {
      throw new Error('This account has been restricted. Please contact support.');
    }

    const token = this.generateToken(user._id, user.role);

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      token,
    };
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Update user profile details
   */
  async updateUserProfile(userId, updateData) {
    // Remove fields that shouldn't be updated through standard profile API
    delete updateData.password;
    delete updateData.role;
    delete updateData.email;

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Get user's wishlist
   */
  async getUserWishlist(userId) {
    const user = await User.findById(userId).populate('wishlist');
    if (!user) {
      throw new Error('User not found');
    }
    return (user.wishlist || []).filter(item => item !== null);
  }

  /**
   * Add a product to the user's wishlist
   */
  async addProductToWishlist(userId, productId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.wishlist) {
      user.wishlist = [];
    }

    const hasProduct = user.wishlist.some(id => id.toString() === productId.toString());
    if (!hasProduct) {
      user.wishlist.push(productId);
      await user.save();
    }

    const updatedUser = await User.findById(userId).populate('wishlist');
    return (updatedUser.wishlist || []).filter(item => item !== null);
  }

  /**
   * Remove a product from the user's wishlist
   */
  async removeProductFromWishlist(userId, productId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.wishlist) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== productId.toString());
      await user.save();
    }

    const updatedUser = await User.findById(userId).populate('wishlist');
    return (updatedUser.wishlist || []).filter(item => item !== null);
  }
}

module.exports = new AuthService();
