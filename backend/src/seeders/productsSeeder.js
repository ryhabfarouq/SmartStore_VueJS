const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const Category = require('../models/Category');
const connectDB = require('../config/db');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedProducts = async () => {
  try {
    // Connect to database if not already connected
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    const productsDataPath = path.join(__dirname, '../data/products.json');
    if (!fs.existsSync(productsDataPath)) {
      throw new Error(`Products data file not found at ${productsDataPath}`);
    }

    const fileContent = fs.readFileSync(productsDataPath, 'utf8');
    const { products } = JSON.parse(fileContent);

    console.log(`Found ${products.length} products in JSON. Seeding categories and products...`);

    // 1. Identify all unique categories and seed them
    const uniqueCategoryNames = [...new Set(products.map(p => p.category))];
    console.log(`Found ${uniqueCategoryNames.length} unique categories. Syncing with database...`);

    const categoryMap = {}; // name -> ObjectId
    for (const catName of uniqueCategoryNames) {
      // capitalize first letter for display consistency
      const displayName = catName.charAt(0).toUpperCase() + catName.slice(1);
      
      // Upsert Category
      let categoryObj = await Category.findOne({ name: displayName });
      if (!categoryObj) {
        categoryObj = await Category.create({
          name: displayName,
          image: `https://picsum.photos/seed/${catName}/500/500`,
          description: `All kinds of ${displayName} items`,
        });
      }
      categoryMap[catName] = categoryObj._id;
    }

    // 2. Seed Products
    let createdCount = 0;
    let updatedCount = 0;

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const categoryId = categoryMap[p.category];

      // Calculate original price if discount is present
      const hasDiscount = p.discountPercentage && p.discountPercentage > 0;
      const originalPrice = hasDiscount
        ? Math.round((p.price / (1 - p.discountPercentage / 100)) * 100) / 100
        : p.price;

      // Map dummy JSON to our product schema
      const productData = {
        name: p.title,
        title: p.title,
        description: p.description,
        price: p.price,
        discountPercentage: p.discountPercentage || 0,
        rating: p.rating || 0,
        stock: p.stock || 0,
        brand: p.brand || 'Generic',
        category: categoryId,
        thumbnail: p.thumbnail,
        image: p.thumbnail, // fallback for legacy code expecting 'image'
        images: p.images || [],
        availabilityStatus: p.availabilityStatus || 'In Stock',
        sku: p.sku || `SKU-${p.id || i}`,
        tags: p.tags || [],
        dimensions: p.dimensions || { width: 0, height: 0, depth: 0 },
        shippingInformation: p.shippingInformation || '',
        warrantyInformation: p.warrantyInformation || '',
        reviews: p.reviews || [],
        meta: p.meta || {},
        sales: p.sales || Math.floor(Math.random() * 200), // legacy sales
        isFeatured: p.rating > 4.8, // set high rated products as featured
        isOnSale: hasDiscount,
        originalPrice: hasDiscount ? originalPrice : undefined,
      };

      // Search by SKU or Name to check duplicate
      const query = productData.sku 
        ? { sku: productData.sku } 
        : { title: productData.title };

      const existingProduct = await Product.findOne(query);
      if (existingProduct) {
        await Product.updateOne({ _id: existingProduct._id }, productData);
        updatedCount++;
      } else {
        await Product.create(productData);
        createdCount++;
      }
    }

    console.log(`Products seeding completed: ${createdCount} created, ${updatedCount} updated.`);
  } catch (error) {
    console.error(`Error seeding products: ${error.message}`);
    throw error;
  }
};

// If run directly
if (require.main === module) {
  (async () => {
    try {
      await seedProducts();
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })();
}

module.exports = seedProducts;
