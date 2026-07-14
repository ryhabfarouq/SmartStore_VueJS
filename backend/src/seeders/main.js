const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('../config/db');
const seedUsers = require('./usersSeeder');
const seedProducts = require('./productsSeeder');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const runMasterSeeder = async () => {
  try {
    console.log('Starting master seeder...');
    
    // Connect to database
    await connectDB();

    // Run User Seeder
    console.log('\n--- Seeding Users ---');
    await seedUsers();

    // Run Product Seeder
    console.log('\n--- Seeding Products ---');
    await seedProducts();

    console.log('\nAll seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Master Seeder failed: ${error.message}`);
    process.exit(1);
  }
};

runMasterSeeder();
