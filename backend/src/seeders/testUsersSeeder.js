const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const testUsers = [
  {
    name: 'System Admin One',
    email: 'admin1@smartstore.com',
    password: 'admin123',
    role: 'Admin',
    phone: '555-0101',
    address: '100 Admin HQ Blvd'
  },
  {
    name: 'System Admin Two',
    email: 'admin2@smartstore.com',
    password: 'admin234',
    role: 'Admin',
    phone: '555-0102',
    address: '102 Admin HQ Blvd'
  },
  {
    name: 'Customer User One',
    email: 'user1@smartstore.com',
    password: 'user123',
    role: 'Customer',
    phone: '555-0201',
    address: '456 Customer Ave, Apt 3B'
  },
  {
    name: 'Customer User Two',
    email: 'user2@smartstore.com',
    password: 'user234',
    role: 'Customer',
    phone: '555-0202',
    address: '789 User Blvd, Suite 10'
  },
  {
    name: 'Seller Vendor One',
    email: 'seller1@smartstore.com',
    password: 'seller123',
    role: 'Seller',
    phone: '555-0301',
    address: '321 Vendor Street, Warehouse A'
  },
  {
    name: 'Seller Vendor Two',
    email: 'seller2@smartstore.com',
    password: 'seller234',
    role: 'Seller',
    phone: '555-0302',
    address: '654 Merchant Road, Building C'
  }
];

const seedTestUsers = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Seeding authentication test accounts...');

    let createdCount = 0;
    let updatedCount = 0;

    for (const u of testUsers) {
      const hashedPassword = bcrypt.hashSync(u.password, 10);
      const userData = {
        name: u.name,
        email: u.email.toLowerCase(),
        password: hashedPassword,
        role: u.role,
        phone: u.phone,
        address: u.address
      };

      // Check duplicate
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        await User.updateOne({ _id: existingUser._id }, userData);
        updatedCount++;
      } else {
        await User.create(userData);
        createdCount++;
      }
    }

    console.log(`Test accounts seeded successfully: ${createdCount} created, ${updatedCount} updated.`);
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding test accounts: ${error.message}`);
    process.exit(1);
  }
};

seedTestUsers();
