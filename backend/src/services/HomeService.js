const Category = require('../models/Category');
const Product = require('../models/Product');

class HomeService {
  async getHomeData() {
    const [categories, bestSelling, featuredItems, latestItems, onSaleItems] = await Promise.all([
      Category.find({}),
      Product.find().sort({ sales: -1 }).limit(4),
      Product.find({ isFeatured: true }).limit(3),
      Product.find().sort({ createdAt: -1 }).limit(3),
      Product.find({ isOnSale: true }).limit(3)
    ]);
    
    const bestReviewed = [...latestItems].reverse();

    return {
      categories,
      bestSelling,
      featuredItems,
      latestItems,
      onSaleItems,
      bestReviewed
    };
  }
}

module.exports = new HomeService();
