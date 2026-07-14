const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// GET administrative stats (Admin only)
router.get('/stats', protect, authorize('Admin'), async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({});
    const activeUsers = await User.countDocuments({ isRestricted: { $ne: true }, isDeleted: { $ne: true } });
    const pendingOrders = await Order.countDocuments({ status: 'Preparing' });

    // Calculate total revenue from non-cancelled orders
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      totalProducts,
      activeUsers,
      pendingOrders,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// GET all users (Admin only)
router.get('/', protect, authorize('Admin'), async (req, res) => {
  try {
    // Return non-deleted users
    const users = await User.find({ isDeleted: { $ne: true } }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// PUT update user approval/restriction (Admin only)
router.put('/:id/status', protect, authorize('Admin'), async (req, res) => {
  try {
    const { isApproved, isRestricted } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (isApproved !== undefined) user.isApproved = isApproved;
    if (isRestricted !== undefined) user.isRestricted = isRestricted;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// PUT update user role (Admin only)
router.put('/:id/role', protect, authorize('Admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['Customer', 'Seller', 'Admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// DELETE soft delete user (Admin only)
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isDeleted = true;
    await user.save();
    res.json({ message: 'User soft-deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
