const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedUsers = async () => {
  try {
    // Connect to database if not already connected
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    const usersDataPath = path.join(__dirname, '../data/users.json');
    if (!fs.existsSync(usersDataPath)) {
      throw new Error(`Users data file not found at ${usersDataPath}`);
    }

    const fileContent = fs.readFileSync(usersDataPath, 'utf8');
    const { users } = JSON.parse(fileContent);

    console.log(`Found ${users.length} users in JSON. Seeding users...`);

    let createdCount = 0;
    let updatedCount = 0;

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const fullName = `${user.firstName} ${user.lastName}`;
      const hashedPassword = bcrypt.hashSync(user.password || 'password123', 10);
      
      // Assign roles: first user is Admin, second is Seller, rest are Customers
      let role = 'Customer';
      if (i === 0) role = 'Admin';
      else if (i === 1) role = 'Seller';

      const addressStr = user.address 
        ? `${user.address.address}, ${user.address.city}`
        : '';

      const userData = {
        name: fullName,
        email: user.email.toLowerCase(),
        password: hashedPassword,
        role: role,
        phone: user.phone || '',
        address: addressStr,
      };

      // Check if user exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        // Update existing user (optional, but avoids duplicating and preserves document)
        await User.updateOne({ _id: existingUser._id }, userData);
        updatedCount++;
      } else {
        // Create new user
        await User.create(userData);
        createdCount++;
      }
    }

    console.log(`Users seeding completed: ${createdCount} created, ${updatedCount} updated.`);
  } catch (error) {
    console.error(`Error seeding users: ${error.message}`);
    throw error;
  }
};

// If run directly
if (require.main === module) {
  (async () => {
    try {
      await seedUsers();
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })();
}

module.exports = seedUsers;
