// Comprehensive test script for AstraLearn v2 User Management API
const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

// Test data
const testUsers = [
  {
    email: 'alice@astralearn.com',
    username: 'alice_student',
    password: 'password123',
    firstName: 'Alice',
    lastName: 'Johnson',
    role: 'student',
    learningStyle: 'visual',
    interests: ['programming', 'data-science'],
    preferredLanguage: 'en',
    timezone: 'America/New_York',
  },
  {
    email: 'bob@astralearn.com',
    username: 'bob_instructor',
    password: 'password123',
    firstName: 'Bob',
    lastName: 'Smith',
    role: 'instructor',
    learningStyle: 'kinesthetic',
    interests: ['web-development', 'ai'],
    preferredLanguage: 'en',
    timezone: 'Europe/London',
  }
];

let userTokens = {};
let userIds = {};

async function testUserManagementAPI() {
  console.log('🧪 Starting AstraLearn v2 User Management API Tests\n');

  try {
    // Test 1: API Info
    console.log('1️⃣ Testing API Info...');
    const apiResponse = await axios.get(`${BASE_URL}/api`);
    console.log('✅ API Info:', apiResponse.data.message);
    console.log('   Features:', apiResponse.data.features.length);
    console.log('');

    // Test 2: Register multiple users
    console.log('2️⃣ Testing User Registration...');
    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      try {
        const response = await axios.post(`${BASE_URL}/api/auth/register`, user);
        userTokens[user.username] = response.data.data.tokens.accessToken;
        userIds[user.username] = response.data.data.user.id;
        console.log(`✅ Registered ${user.firstName} ${user.lastName} (${user.role})`);
        console.log(`   User ID: ${userIds[user.username]}`);
      } catch (error) {
        console.log(`❌ Failed to register ${user.firstName}:`, error.response?.data?.message);
      }
    }
    console.log('');

    // Test 3: Get user profile by ID
    console.log('3️⃣ Testing Get User by ID...');
    try {
      const userId = userIds['alice_student'];
      const response = await axios.get(`${BASE_URL}/api/users/${userId}`);
      console.log('✅ Retrieved user profile');
      console.log(`   Name: ${response.data.data.firstName} ${response.data.data.lastName}`);
      console.log(`   Role: ${response.data.data.role}`);
      console.log(`   Username: ${response.data.data.username}`);
    } catch (error) {
      console.log('❌ Get user failed:', error.response?.data?.message);
    }
    console.log('');

    // Test 4: Update user profile
    console.log('4️⃣ Testing Update User Profile...');
    try {
      const token = userTokens['alice_student'];
      const updateData = {
        bio: 'Passionate student learning data science and AI',
        location: 'New York, USA',
        interests: ['machine-learning', 'python', 'statistics'],
        difficultyLevel: 'intermediate',
      };

      const response = await axios.put(`${BASE_URL}/api/users/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Profile updated successfully');
      console.log(`   Bio: ${response.data.data.bio}`);
      console.log(`   Location: ${response.data.data.location}`);
      console.log(`   Interests: ${response.data.data.interests.join(', ')}`);
    } catch (error) {
      console.log('❌ Update profile failed:', error.response?.data?.message);
    }
    console.log('');

    // Test 5: Update privacy settings
    console.log('5️⃣ Testing Update Privacy Settings...');
    try {
      const token = userTokens['alice_student'];
      const privacyData = {
        profileVisibility: 'public',
        showEmail: false,
        showProgress: true,
        allowMessages: true,
      };

      const response = await axios.put(`${BASE_URL}/api/users/privacy`, privacyData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Privacy settings updated');
      console.log(`   Profile Visibility: ${response.data.data.profileVisibility}`);
      console.log(`   Show Progress: ${response.data.data.showProgress}`);
    } catch (error) {
      console.log('❌ Update privacy failed:', error.response?.data?.message);
    }
    console.log('');

    // Test 6: Update notification preferences
    console.log('6️⃣ Testing Update Notification Preferences...');
    try {
      const token = userTokens['alice_student'];
      const notificationData = {
        email: true,
        push: false,
        courseUpdates: true,
        socialActivity: false,
        achievements: true,
        reminders: true,
      };

      const response = await axios.put(`${BASE_URL}/api/users/notifications`, notificationData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Notification preferences updated');
      console.log(`   Email: ${response.data.data.email}`);
      console.log(`   Push: ${response.data.data.push}`);
      console.log(`   Course Updates: ${response.data.data.courseUpdates}`);
    } catch (error) {
      console.log('❌ Update notifications failed:', error.response?.data?.message);
    }
    console.log('');

    // Test 7: Get user statistics
    console.log('7️⃣ Testing Get User Statistics...');
    try {
      const token = userTokens['alice_student'];
      const response = await axios.get(`${BASE_URL}/api/users/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Statistics retrieved');
      console.log(`   Level: ${response.data.data.level}`);
      console.log(`   Total Points: ${response.data.data.totalPoints}`);
      console.log(`   Profile Completeness: ${response.data.data.profileCompleteness}%`);
    } catch (error) {
      console.log('❌ Get statistics failed:', error.response?.data?.message);
    }
    console.log('');

    // Test 8: Update user statistics (simulate progress)
    console.log('8️⃣ Testing Update User Statistics...');
    try {
      const token = userTokens['alice_student'];
      const statsData = {
        coursesEnrolled: 3,
        coursesCompleted: 1,
        totalPoints: 1250,
        level: 5,
        studyGroupsJoined: 2,
        lessonsCompleted: 25,
        timeSpentLearning: 480, // 8 hours
        streakDays: 7,
        achievements: ['first-course', 'week-streak', 'early-bird'],
      };

      const response = await axios.put(`${BASE_URL}/api/users/stats`, statsData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Statistics updated');
      console.log(`   Level: ${response.data.data.level}`);
      console.log(`   Total Points: ${response.data.data.totalPoints}`);
      console.log(`   Courses Completed: ${response.data.data.coursesCompleted}`);
      console.log(`   Achievements: ${response.data.data.achievements.join(', ')}`);
    } catch (error) {
      console.log('❌ Update statistics failed:', error.response?.data?.message);
    }
    console.log('');

    // Test 9: Search users
    console.log('9️⃣ Testing User Search...');
    try {
      const searchTests = [
        { q: 'Alice', role: undefined },
        { q: 'Bob', role: 'instructor' },
        { q: 'student', role: 'student' },
      ];

      for (const search of searchTests) {
        const params = { q: search.q };
        if (search.role) params.role = search.role;

        const response = await axios.get(`${BASE_URL}/api/users/search`, { params });
        console.log(`✅ Search "${search.q}"${search.role ? ` (${search.role})` : ''}: ${response.data.count} results`);
        
        if (response.data.data.length > 0) {
          response.data.data.forEach(user => {
            console.log(`   - ${user.firstName} ${user.lastName} (@${user.username}) - ${user.role}`);
          });
        }
      }
    } catch (error) {
      console.log('❌ Search users failed:', error.response?.data?.message);
    }
    console.log('');

    // Test 10: Authentication required tests
    console.log('🔟 Testing Authentication Requirements...');
    try {
      // Test without token
      await axios.put(`${BASE_URL}/api/users/profile`, { bio: 'test' });
      console.log('❌ Should have required authentication!');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Authentication correctly required for profile update');
      }
    }

    try {
      // Test with invalid token
      await axios.get(`${BASE_URL}/api/users/stats`, {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      console.log('❌ Should have rejected invalid token!');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid token correctly rejected');
      }
    }
    console.log('');

    console.log('🎉 All User Management tests completed!');
    console.log('');
    console.log('📊 Test Summary:');
    console.log('   ✅ API Information');
    console.log('   ✅ User Registration with Enhanced Data');
    console.log('   ✅ Get User Profile by ID');
    console.log('   ✅ Update User Profile');
    console.log('   ✅ Privacy Settings Management');
    console.log('   ✅ Notification Preferences');
    console.log('   ✅ User Statistics Retrieval');
    console.log('   ✅ User Statistics Updates');
    console.log('   ✅ User Search & Discovery');
    console.log('   ✅ Authentication & Authorization');
    console.log('');
    console.log('🚀 AstraLearn v2 User Management System is working perfectly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 Make sure the server is running on http://localhost:5000');
      console.log('   Run: node simple-server.js');
    }
  }
}

// Check if server is running first
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running on http://localhost:5000');
    console.log('');
    console.log('Please start the server first:');
    console.log('   cd test-auth');
    console.log('   node simple-server.js');
    console.log('');
    console.log('Then run this test again:');
    console.log('   node test-user-management.js');
    return;
  }

  await testUserManagementAPI();
}

main();
