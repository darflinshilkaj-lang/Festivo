const mongoose = require('mongoose');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected Successfully');
    
    // Safely convert any existing admin accounts to normal student accounts
    const User = require('../models/User');
    const result = await User.updateMany(
      { role: 'admin' },
      { $set: { role: 'student' } }
    );
    if (result.modifiedCount > 0) {
      console.log(`✅ Migrated ${result.modifiedCount} admin account(s) to student role.`);
    }
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
