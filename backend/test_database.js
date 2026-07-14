const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');
const Category = require('./src/models/Category');
const Coupon = require('./src/models/Coupon');

dotenv.config();

async function testDatabase() {
  await connectDB();
  console.log('--- Database Collections Status ---');

  try {
    const userCount = await User.countDocuments({});
    const activeUsers = await User.countDocuments({ isRestricted: { $ne: true }, isDeleted: { $ne: true } });
    const productCount = await Product.countDocuments({});
    const categoryCount = await Category.countDocuments({});
    const orderCount = await Order.countDocuments({});
    const couponCount = await Coupon.countDocuments({});

    console.log('Total Users in DB:', userCount);
    console.log('Active (non-restricted, non-deleted) Users:', activeUsers);
    console.log('Total Products in DB:', productCount);
    console.log('Total Categories in DB:', categoryCount);
    console.log('Total Orders placed:', orderCount);
    console.log('Total Coupons created:', couponCount);

    console.log('\n--- Admin Stats Calculation Preview ---');
    // Calculate total revenue from non-cancelled orders
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    const pendingOrders = await Order.countDocuments({ status: 'Preparing' });

    console.log('Total Revenue (from completed/preparing/packaged orders):', '$' + totalRevenue.toFixed(2));
    console.log('Preparing Orders requiring dispatch:', pendingOrders);

    console.log('\n--- Category list preview ---');
    const categories = await Category.find({}).limit(5);
    categories.forEach(cat => console.log(`- ${cat.name}`));

    console.log('\n--- Coupon list preview ---');
    const coupons = await Coupon.find({}).limit(5);
    if (coupons.length === 0) {
      console.log('No coupons found. Creating a test coupon "WELCOME10"...');
      const testCoupon = new Coupon({
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        isActive: true
      });
      await testCoupon.save();
      console.log('Test coupon created successfully.');
    } else {
      coupons.forEach(c => console.log(`- ${c.code} (${c.discountType}: ${c.discountValue})`));
    }

  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
}

testDatabase();
