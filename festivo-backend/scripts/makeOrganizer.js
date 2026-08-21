const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../config/db');
const User = require('../models/User');

const makeOrganizer = async () => {
  try {
    await connectDB();

    const targetEmail = process.argv[2] ? process.argv[2].toLowerCase().trim() : 'admin@festivo.com';

    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      if (!process.argv[2]) {
        console.log(`ℹ️ No custom email provided. Previous admin account (${targetEmail}) was not found in DB.`);
        process.exit(0);
      }
      console.error(`❌ Error: User with email "${targetEmail}" not found in database.`);
      process.exit(1);
    }

    user.role = 'student';
    user.isOrganizer = true;
    await user.save();

    console.log(`✅ Success: User successfully migrated/promoted to Student Organizer!`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   isOrganizer: ${user.isOrganizer}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error in promote script:', error);
    process.exit(1);
  }
};

makeOrganizer();
