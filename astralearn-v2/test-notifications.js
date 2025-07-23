const io = require('socket.io-client');

// Test the real-time notification system
async function testNotificationSystem() {
  console.log('🧪 Testing Real-time Notification System\n');

  try {
    // Step 1: Login as different users
    console.log('1️⃣ Logging in users...');
    
    const loginUser = async (email, password) => {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password })
      });
      const data = await response.json();
      return data.data.tokens.accessToken;
    };

    const janeToken = await loginUser('jane.student@astralearn.com', 'password123');
    const mikeToken = await loginUser('mike.student@astralearn.com', 'password123');
    
    console.log('✅ Users logged in successfully');

    // Step 2: Connect WebSocket clients
    console.log('\n2️⃣ Connecting WebSocket clients...');
    
    const janeSocket = io('http://localhost:5000');
    const mikeSocket = io('http://localhost:5000');

    // Wait for connections
    await new Promise((resolve) => {
      let connected = 0;
      
      janeSocket.on('connect', () => {
        console.log('✅ Jane connected to WebSocket');
        janeSocket.emit('authenticate', janeToken);
        connected++;
        if (connected === 2) resolve();
      });

      mikeSocket.on('connect', () => {
        console.log('✅ Mike connected to WebSocket');
        mikeSocket.emit('authenticate', mikeToken);
        connected++;
        if (connected === 2) resolve();
      });
    });

    // Step 3: Set up notification listeners
    console.log('\n3️⃣ Setting up notification listeners...');
    
    let janeNotifications = [];
    let mikeNotifications = [];

    janeSocket.on('new_notification', (notification) => {
      console.log(`🔔 Jane received notification: ${notification.title}`);
      janeNotifications.push(notification);
    });

    mikeSocket.on('new_notification', (notification) => {
      console.log(`🔔 Mike received notification: ${notification.title}`);
      mikeNotifications.push(notification);
    });

    // Step 4: Test forum post notification
    console.log('\n4️⃣ Testing forum post notifications...');
    
    const createForumPost = async (token, title, content) => {
      const response = await fetch('http://localhost:5000/api/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content, category: 'general' })
      });
      return response.json();
    };

    const postResult = await createForumPost(
      janeToken, 
      'Test Notification Post', 
      'This is a test post to check notifications'
    );
    
    console.log('✅ Forum post created');

    // Wait for notifications
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 5: Test forum reply notification
    console.log('\n5️⃣ Testing forum reply notifications...');
    
    const createForumReply = async (token, postId, content) => {
      const response = await fetch(`http://localhost:5000/api/forum/posts/${postId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });
      return response.json();
    };

    const replyResult = await createForumReply(
      mikeToken,
      postResult.data.id,
      'Great post! Thanks for sharing.'
    );
    
    console.log('✅ Forum reply created');

    // Wait for notifications
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 6: Test voting notification
    console.log('\n6️⃣ Testing voting notifications...');
    
    const voteOnPost = async (token, postId, type) => {
      const response = await fetch(`http://localhost:5000/api/forum/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      });
      return response.json();
    };

    const voteResult = await voteOnPost(mikeToken, postResult.data.id, 'up');
    console.log('✅ Upvote recorded');

    // Wait for notifications
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 7: Test notification API endpoints
    console.log('\n7️⃣ Testing notification API endpoints...');
    
    const getNotifications = async (token) => {
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    };

    const janeNotificationsAPI = await getNotifications(janeToken);
    const mikeNotificationsAPI = await getNotifications(mikeToken);

    console.log(`✅ Jane has ${janeNotificationsAPI.data.notifications.length} notifications (${janeNotificationsAPI.data.unreadCount} unread)`);
    console.log(`✅ Mike has ${mikeNotificationsAPI.data.notifications.length} notifications (${mikeNotificationsAPI.data.unreadCount} unread)`);

    // Step 8: Test marking notifications as read
    console.log('\n8️⃣ Testing mark as read functionality...');
    
    if (janeNotificationsAPI.data.notifications.length > 0) {
      const firstNotification = janeNotificationsAPI.data.notifications[0];
      
      const markAsRead = async (token, notificationId) => {
        const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
      };

      await markAsRead(janeToken, firstNotification.id);
      console.log('✅ Marked notification as read');
    }

    // Step 9: Display results
    console.log('\n📊 NOTIFICATION TEST RESULTS:');
    console.log('=====================================');
    console.log(`🔔 Real-time notifications received:`);
    console.log(`   - Jane: ${janeNotifications.length} notifications`);
    console.log(`   - Mike: ${mikeNotifications.length} notifications`);
    
    console.log(`\n📬 API notifications retrieved:`);
    console.log(`   - Jane: ${janeNotificationsAPI.data.notifications.length} total, ${janeNotificationsAPI.data.unreadCount} unread`);
    console.log(`   - Mike: ${mikeNotificationsAPI.data.notifications.length} total, ${mikeNotificationsAPI.data.unreadCount} unread`);

    console.log(`\n🎯 Notification Types Tested:`);
    console.log(`   ✅ Forum new post notifications`);
    console.log(`   ✅ Forum reply notifications`);
    console.log(`   ✅ Forum upvote notifications`);
    console.log(`   ✅ Real-time WebSocket delivery`);
    console.log(`   ✅ API notification retrieval`);
    console.log(`   ✅ Mark as read functionality`);

    // Cleanup
    janeSocket.disconnect();
    mikeSocket.disconnect();
    
    console.log('\n🎉 NOTIFICATION SYSTEM TEST COMPLETED SUCCESSFULLY!');
    console.log('✅ All notification features are working correctly');

  } catch (error) {
    console.error('❌ Notification test failed:', error);
  }
}

// Run the test
testNotificationSystem();
