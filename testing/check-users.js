const mongoose = require('mongoose');
require('dotenv').config({ path: '../server/.env' });

async function checkUsers() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/astralearn');
    console.log('✅ Connected to MongoDB');

    const userSchema = new mongoose.Schema({
      email: String,
      role: String,
      firstName: String,
      lastName: String
    });
    
    const User = mongoose.model('User', userSchema);
    
    const users = await User.find({}, 'email role firstName lastName');
    console.log('\n📋 Found users:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.role}) - ${user.firstName} ${user.lastName}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkUsers();
