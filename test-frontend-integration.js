const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:3001';

async function testFrontendIntegration() {
    console.log('🧪 Testing Frontend-Backend Integration...\n');

    try {
        // Test 1: Backend Health Check
        console.log('1️⃣ Testing Backend Health...');
        const healthResponse = await fetch(`${BASE_URL.replace('/api', '')}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Backend Status:', healthData.status);
        console.log('📊 Database:', healthData.database);
        console.log('🌐 WebSocket:', healthData.websocket);
        console.log();

        // Test 2: Authentication Flow
        console.log('2️⃣ Testing Authentication Flow...');
        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'john.doe@email.com',
                password: 'password123'
            })
        });

        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.status}`);
        }

        const loginData = await loginResponse.json();
        console.log('✅ Login successful');
        console.log('👤 User:', loginData.user?.name || 'N/A');
        console.log('🎭 Role:', loginData.user?.role || 'N/A');
        console.log('🔑 Token received:', !!loginData.token);
        
        const token = loginData.token;
        console.log();

        // Test 3: Student Dashboard Data
        console.log('3️⃣ Testing Student Dashboard APIs...');
        
        // Test user progress
        const progressResponse = await fetch(`${BASE_URL}/users/progress`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            console.log('✅ User Progress API working');
            console.log('📚 Enrolled Courses:', progressData.enrolledCourses?.length || 0);
            console.log('🎯 Active Learning Path:', progressData.currentLearningPath?.name || 'None');
        } else {
            console.log('❌ User Progress API failed:', progressResponse.status);
        }

        // Test analytics data
        const analyticsResponse = await fetch(`${BASE_URL}/analytics/summary`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json();
            console.log('✅ Analytics API working');
            console.log('⏱️ Study Time:', analyticsData.totalStudyTime || 0, 'hours');
            console.log('📊 Completion Rate:', analyticsData.averageCompletionRate || 0, '%');
        } else {
            console.log('❌ Analytics API failed:', analyticsResponse.status);
        }

        // Test adaptive learning
        const adaptiveResponse = await fetch(`${BASE_URL}/adaptive-learning/recommendations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (adaptiveResponse.ok) {
            const adaptiveData = await adaptiveResponse.json();
            console.log('✅ Adaptive Learning API working');
            console.log('💡 Recommendations:', adaptiveData.recommendations?.length || 0);
        } else {
            console.log('❌ Adaptive Learning API failed:', adaptiveResponse.status);
        }

        console.log();

        // Test 4: Instructor Dashboard Data (if user is instructor)
        if (loginData.user?.role === 'instructor') {
            console.log('4️⃣ Testing Instructor Dashboard APIs...');
            
            const coursesResponse = await fetch(`${BASE_URL}/courses/instructor-courses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (coursesResponse.ok) {
                const coursesData = await coursesResponse.json();
                console.log('✅ Instructor Courses API working');
                console.log('📚 Managed Courses:', coursesData.length || 0);
            } else {
                console.log('❌ Instructor Courses API failed:', coursesResponse.status);
            }
        }

        // Test 5: Social Learning Features
        console.log('5️⃣ Testing Social Learning APIs...');
        
        const studyBuddiesResponse = await fetch(`${BASE_URL}/social-learning/study-buddies/list`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (studyBuddiesResponse.ok) {
            const studyBuddiesData = await studyBuddiesResponse.json();
            console.log('✅ Study Buddies API working');
            console.log('👥 Study Buddies:', studyBuddiesData.length || 0);
        } else {
            console.log('❌ Study Buddies API failed:', studyBuddiesResponse.status);
        }

        console.log();

        // Test 6: Course Data
        console.log('6️⃣ Testing Course APIs...');
        
        const coursesResponse = await fetch(`${BASE_URL}/courses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (coursesResponse.ok) {
            const coursesData = await coursesResponse.json();
            console.log('✅ Courses API working');
            console.log('📚 Available Courses:', coursesData.length || 0);
            
            if (coursesData.length > 0) {
                const firstCourse = coursesData[0];
                console.log('📖 First Course:', firstCourse.title);
                console.log('👨‍🏫 Instructor:', firstCourse.instructor?.name || 'N/A');
            }
        } else {
            console.log('❌ Courses API failed:', coursesResponse.status);
        }

        console.log();
        console.log('🎉 Frontend-Backend Integration Test Complete!');
        console.log('🌐 Frontend URL:', FRONTEND_URL);
        console.log('🔗 Backend URL:', BASE_URL);
        console.log();
        console.log('📋 Next Steps:');
        console.log('1. Open frontend in browser:', FRONTEND_URL);
        console.log('2. Login with: john.doe@email.com / password123');
        console.log('3. Check if dashboard shows real data from APIs');
        console.log('4. Test navigation between different features');

    } catch (error) {
        console.error('❌ Integration test failed:', error.message);
        console.log();
        console.log('🔧 Troubleshooting:');
        console.log('1. Ensure backend is running on port 5000');
        console.log('2. Ensure frontend is running on port 3001');
        console.log('3. Check database connection and seeded data');
    }
}

testFrontendIntegration();
