/**
 * Simple sample data creator for testing
 */

const mongoose = require('mongoose');

// Simple connection and test
async function createTestData() {
  try {
    console.log('🌱 Starting simple data creation...');
    
    // Use the same connection string as the main app
    await mongoose.connect('mongodb://localhost:27017/astralearn');
    console.log('✅ Connected to MongoDB');
    
    // Create a simple user schema
    const userSchema = new mongoose.Schema({
      email: String,
      username: String,
      firstName: String,
      lastName: String,
      role: { type: String, default: 'student' },
      password: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const User = mongoose.model('User', userSchema);
    
    // Check if test user exists
    const existingUser = await User.findOne({ email: 'test@astralearn.dev' });
    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.email);
    } else {
      // Create test user
      const testUser = new User({
        email: 'test@astralearn.dev',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        password: 'hashedpassword123'
      });
      
      await testUser.save();
      console.log('✅ Created test user:', testUser.email);
    }
    
    // Create some sample students
    const sampleUsers = [
      {
        email: 'alice@astralearn.dev',
        username: 'alice',
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'student',
        password: 'hashedpassword123'
      },
      {
        email: 'bob@astralearn.dev',
        username: 'bob',
        firstName: 'Bob',
        lastName: 'Smith',
        role: 'student',
        password: 'hashedpassword123'
      },
      {
        email: 'instructor@astralearn.dev',
        username: 'instructor',
        firstName: 'Dr. Maria',
        lastName: 'Garcia',
        role: 'instructor',
        password: 'hashedpassword123'
      }
    ];
    
    for (const userData of sampleUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (!existing) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${userData.firstName} ${userData.lastName}`);
      } else {
        console.log(`⚠️  User ${userData.email} already exists`);
      }
    }
    
    console.log('🎉 Sample data creation completed!');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📋 Database connection closed');
  }
}

createTestData();
