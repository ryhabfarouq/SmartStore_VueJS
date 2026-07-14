const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./src/models/Product');
const connectDB = require('./src/config/db');

dotenv.config();
connectDB();

const updateImages = async () => {
  try {
    const products = await Product.find();

    let index = 1;
    for (const product of products) {
      // Use loremflickr to get a random image based on technology and the product name
      const keyword = encodeURIComponent(product.name.split(' ')[0].toLowerCase());
      product.image = `https://loremflickr.com/500/500/technology,gadget,${keyword}?lock=${index}`;
      await product.save();
      index++;
    }

    console.log('Product images updated successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error updating images: ${error}`);
    process.exit(1);
  }
};

updateImages();
