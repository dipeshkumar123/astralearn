/**
 * Real-time Integration Service for Social Learning
 * Part of Phase 4 Step 2: Advanced Gamification Features
 * 
 * Bridges WebSocket service with social learning components for real-time features:
 * - Social activity feeds
 * - Live collaboration sessions
 * - Real-time notifications
 * - Study group interactions
 * - Discussion forum updates
 * - Whiteboard collaboration
 */

import webSocketService from './webSocketService.js';

class RealTimeIntegrationService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 1000;
    this.eventListeners = new Map();
    this.subscriptions = new Set();
    this.messageQueue = [];
    this.heartbeatInterval = null;
    this.connectionListeners = new Set();
    this.listeners = new Map();
    this.activeCollaborationSessions = new Map();
    this.studyGroupRooms = new Map();
    this.discussionSubscriptions = new Map();
    this.initialized = false;

    this.initialize();
  }

  /**
   * Initialize real-time integration
   */
  initialize() {
    if (this.initialized) return;

    // Setup WebSocket event listeners for social learning
    this.setupSocialLearningEvents();
    this.setupCollaborationEvents();
    this.setupNotificationEvents();
    this.setupStudyGroupEvents();
    this.setupDiscussionEvents();
    this.setupWhiteboardEvents();

    this.initialized = true;
    console.log('🔄 Real-time Integration Service initialized');
  }

  /**
   * Setup social learning real-time events
   */
  setupSocialLearningEvents() {
    // Social activity feed updates
    webSocketService.on('social:activity_update', (data) => {
      this.emit('socialActivityUpdate', data);
    });

    // Study buddy status changes
    webSocketService.on('social:buddy_status', (data) => {
      this.emit('studyBuddyStatusChange', data);
    });

    // Social achievements
    webSocketService.on('social:achievement_unlocked', (data) => {
      this.emit('socialAchievementUnlocked', data);
    });

    // Helpfulness rating updates
    webSocketService.on('social:helpfulness_update', (data) => {
      this.emit('helpfulnessUpdate', data);
    });
  }

  /**
   * Setup collaboration real-time events
   */
  setupCollaborationEvents() {
    // WebRTC session events
    webSocketService.on('collaboration:session_created', (data) => {
      this.handleSessionCreated(data);
    });

    webSocketService.on('collaboration:user_joined', (data) => {
      this.handleUserJoinedSession(data);
    });

    webSocketService.on('collaboration:user_left', (data) => {
      this.handleUserLeftSession(data);
    });

    // Screen sharing events
    webSocketService.on('collaboration:screen_share_started', (data) => {
      this.emit('screenShareStarted', data);
    });

    webSocketService.on('collaboration:screen_share_stopped', (data) => {
      this.emit('screenShareStopped', data);
    });

    // Document collaboration
    webSocketService.on('collaboration:document_updated', (data) => {
      this.emit('documentUpdated', data);
    });

    // WebRTC signaling
    webSocketService.on('collaboration:webrtc_offer', (data) => {
      this.emit('webrtcOffer', data);
    });

    webSocketService.on('collaboration:webrtc_answer', (data) => {
      this.emit('webrtcAnswer', data);
    });

    webSocketService.on('collaboration:webrtc_ice_candidate', (data) => {
      this.emit('webrtcIceCandidate', data);
    });
  }

  /**
   * Setup notification real-time events
   */
  setupNotificationEvents() {
    webSocketService.on('notificationReceived', (data) => {
      this.emit('realTimeNotification', data);
    });

    webSocketService.on('social:interaction_notification', (data) => {
      this.emit('socialInteractionNotification', data);
    });
  }

  /**
   * Setup study group real-time events
   */
  setupStudyGroupEvents() {
    // Study group updates
    webSocketService.on('study-group:member-joined', (data) => {
      this.handleStudyGroupMemberJoined(data);
    });

    webSocketService.on('study-group:member-left', (data) => {
      this.handleStudyGroupMemberLeft(data);
    });

    webSocketService.on('study-group:message', (data) => {
      this.emit('studyGroupMessage', data);
    });

    webSocketService.on('study-group:activity_update', (data) => {
      this.emit('studyGroupActivityUpdate', data);
    });

    // Live study sessions
    webSocketService.on('study-group:session_started', (data) => {
      this.emit('studySessionStarted', data);
    });

    webSocketService.on('study-group:session_ended', (data) => {
      this.emit('studySessionEnded', data);
    });
  }

  /**
   * Setup discussion forum real-time events
   */
  setupDiscussionEvents() {
    // New discussions and replies
    webSocketService.on('discussion:new_post', (data) => {
      this.emit('newDiscussionPost', data);
    });

    webSocketService.on('discussion:new_reply', (data) => {
      this.emit('newDiscussionReply', data);
    });

    // Voting updates
    webSocketService.on('discussion:vote_update', (data) => {
      this.emit('discussionVoteUpdate', data);
    });

    // Discussion status changes
    webSocketService.on('discussion:status_changed', (data) => {
      this.emit('discussionStatusChanged', data);
    });

    // Live typing indicators
    webSocketService.on('discussion:typing_indicator', (data) => {
      this.emit('discussionTypingIndicator', data);
    });
  }

  /**
   * Setup whiteboard real-time events
   */
  setupWhiteboardEvents() {
    // Drawing events
    webSocketService.on('whiteboard:drawing_update', (data) => {
      this.emit('whiteboardDrawingUpdate', data);
    });

    webSocketService.on('whiteboard:element_added', (data) => {
      this.emit('whiteboardElementAdded', data);
    });

    webSocketService.on('whiteboard:element_updated', (data) => {
      this.emit('whiteboardElementUpdated', data);
    });

    webSocketService.on('whiteboard:element_deleted', (data) => {
      this.emit('whiteboardElementDeleted', data);
    });

    // Cursor tracking
    webSocketService.on('whiteboard:cursor_moved', (data) => {
      this.emit('whiteboardCursorMoved', data);
    });

    // Whiteboard state
    webSocketService.on('whiteboard:cleared', (data) => {
      this.emit('whiteboardCleared', data);
    });
  }

  // ========== Social Learning Real-time Actions ==========

  /**
   * Join social activity feed
   */
  subscribeSocialActivityFeed(userId) {
    if (webSocketService.isConnected) {
      webSocketService.socket.emit('social:subscribe_activity_feed', {
        userId,
        timestamp: new Date().toISOString()
      });
      
      console.log('📡 Subscribed to social activity feed');
    }
  }

  /**
   * Update social activity in real-time
   */
  broadcastSocialActivity(activityData) {
    if (webSocketService.isConnected) {
      webSocketService.socket.emit('social:broadcast_activity', {
        ...activityData,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Send study buddy request
   */
  sendStudyBuddyRequest(targetUserId, message) {
    if (webSocketService.isConnected) {
      webSocketService.socket.emit('social:send_buddy_request', {
        targetUserId,
        message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update study buddy status
   */
  updateStudyBuddyStatus(status, studyTopic = null) {
    if (webSocketService.isConnected) {
      webSocketService.socket.emit('social:update_buddy_status', {
        status, // 'available', 'studying', 'busy', 'offline'
        studyTopic,
        timestamp: new Date().toISOString()
      });
    }
  }

  // ========== Collaboration Real-time Actions ==========

  /**
   * Create live collaboration session
   */
  createCollaborationSession(sessionData) {
    if (webSocketService.isConnected) {
      webSocketService.socket.emit('collaboration:create_session', {
        ...sessionData,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Join collaboration session
   */
  joinCollaborationSession(sessionId, userInfo) {
    return webSocketService.joinCollaborationSession(sessionId, userInfo);
  }

  /**
   * Leave collaboration session
   */
  leaveCollaborationSession(sessionId) {
    return webSocketService.leaveCollaborationSession(sessionId);
  }

  /**
   * Send WebRTC signaling data
   */
  sendWebRTCSignal(sessionId, signalType, signalData) {
    if (webSocketService.isConnected) {
      webSocketService.socket.emit('collaboration:webrtc_signal', {
        sessionId,
        signalType, // 'offer', 'answer', 'ice-candidate'
        signalData,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Start screen sharing
   */
  startScreenShare(sessionId, streamData) {
    if (webSocketService.isConnected) {
      webSocketService.socket.emit('collaboration:start_screen_share', {
        sessionId,
        streamData,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Stop screen sharing
   */
  stopScreenShare(sessionId) {
    if (webSocketService.isConnected) {
      webSocketService.socket.emit('collaboration:stop_screen_share', {
        sessionId,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update collaborative document
   */
  updateCollaborativeDocument(sessionId, documentData) {
    return webSocketService.updateCollaborativeContent(sessionId, {
      type: 'document',
      data: documentData
    });
  }

  // ========== Study Group Real-time Actions ==========

  /**
   * Join study group room
   */
  joinStudyGroupRoom(groupId) {
    if (webSocketService.isConnected) {
      webSocketService.socket.emit('study-group:join', {
        groupId,
        timestamp: new Date().toISOString()
      });

      this.studyGroupRooms.set(groupId, {
        joinedAt: new Date().toISOString(),
        active: true
      });

      console.log(`📚 Joined study group room: ${groupId}`);
    }
  }

  /**
   * Leave study group room
   */
  leaveStudyGroupRoom(groupId) {
    if (webSocketService.isConnected) {
      webSocketService.socket.emit('study-group:leave', {
        groupId,
        timestamp: new Date().toISOString()
      });

      this.studyGroupRooms.delete(groupId);
      console.log(`👋 Left study group room: ${groupId}`);
    }
  }

  /**
   * Send study group message
   */
  sendStudyGroupMessage(groupId, message) {
    if (webSocketService.isConnected) {
      webSocketService.socket.emit('study-group:send_message', {
        groupId,
        message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Start live study session
   */
  startLiveStudySession(groupId, sessionData) {
    if (webSocketService.isConnected) {
      webSocketService.socket.emit('study-group:start_session', {
        groupId,
        sessionData,
        timestamp: new Date().toISOString()
      });
    }
  }

  // ========== Discussion Forum Real-time Actions ==========

  /**
   * Subscribe to discussion updates
   */
  subscribeToDiscussion(discussionId) {
    if (webSocketService.isConnected) {
      webSocketService.socket.emit('discussion:subscribe', {
        discussionId,
        timestamp: new Date().toISOString()
      });

      this.discussionSubscriptions.set(discussionId, {
        subscribedAt: new Date().toISOString()
      });

      console.log(`💬 Subscribed to discussion: ${discussionId}`);
    }
  }

  /**
   * Unsubscribe from discussion updates
   */
  unsubscribeFromDiscussion(discussionId) {
    if (webSocketService.isConnected) {
      webSocketService.socket.emit('discussion:unsubscribe', {
        discussionId,
        timestamp: new Date().toISOString()
      });

      this.discussionSubscriptions.delete(discussionId);
    }
  }

  /**
   * Send typing indicator for discussions
   */
  sendDiscussionTypingIndicator(discussionId, isTyping) {
    if (webSocketService.isConnected) {
      webSocketService.socket.emit('discussion:typing', {
        discussionId,
        isTyping,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Vote on discussion in real-time
   */
  voteOnDiscussion(discussionId, voteType) {
    if (webSocketService.isConnected) {
      webSocketService.socket.emit('discussion:vote', {
        discussionId,
        voteType, // 'upvote', 'downvote', 'remove'
        timestamp: new Date().toISOString()
      });
    }
  }

  // ========== Whiteboard Real-time Actions ==========

  /**
   * Join whiteboard session
   */
  joinWhiteboardSession(sessionId) {
    if (webSocketService.isConnected) {
      webSocketService.socket.emit('whiteboard:join', {
        sessionId,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Send drawing data to whiteboard
   */
  sendWhiteboardDrawing(sessionId, drawingData) {
    if (webSocketService.isConnected) {
      webSocketService.socket.emit('whiteboard:draw', {
        sessionId,
        drawingData,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Add element to whiteboard
   */
  addWhiteboardElement(sessionId, element) {
    if (webSocketService.isConnected) {
      webSocketService.socket.emit('whiteboard:add_element', {
        sessionId,
        element,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update whiteboard element
   */
  updateWhiteboardElement(sessionId, elementId, updates) {
    if (webSocketService.isConnected) {
      webSocketService.socket.emit('whiteboard:update_element', {
        sessionId,
        elementId,
        updates,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Delete whiteboard element
   */
  deleteWhiteboardElement(sessionId, elementId) {
    if (webSocketService.isConnected) {
      webSocketService.socket.emit('whiteboard:delete_element', {
        sessionId,
        elementId,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Send cursor position on whiteboard
   */
  sendWhiteboardCursor(sessionId, position) {
    if (webSocketService.isConnected) {
      webSocketService.socket.emit('whiteboard:cursor_move', {
        sessionId,
        position,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Clear whiteboard
   */
  clearWhiteboard(sessionId) {
    if (webSocketService.isConnected) {
      webSocketService.socket.emit('whiteboard:clear', {
        sessionId,
        timestamp: new Date().toISOString()
      });
    }
  }

  // ========== WebSocket Connection Management ==========

  connect(url = 'ws://localhost:8080') {
    try {
      console.log('🔌 Connecting to WebSocket server:', url);
      
      this.socket = new WebSocket(url);
      
      this.socket.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.processMessageQueue();
        this.emit('connect');
        this.notifyConnectionListeners('connected');
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleIncomingMessage(data);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('🔌 WebSocket connection closed');
        this.isConnected = false;
        this.stopHeartbeat();
        this.emit('disconnect');
        this.notifyConnectionListeners('disconnected');
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('❌ Failed to connect to WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  disconnect() {
    console.log('🔌 Disconnecting from WebSocket server');
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.stopHeartbeat();
    this.subscriptions.clear();
    this.messageQueue = [];
  }

  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.connect();
    this.emit('reconnect');
    this.notifyConnectionListeners('reconnecting');
  }

  scheduleReconnect() {
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts);
    console.log(`⏰ Scheduling reconnect in ${delay}ms`);
    
    setTimeout(() => {
      this.reconnect();
    }, delay);
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: 'ping', timestamp: Date.now() });
      }
    }, 30000); // 30 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  notifyConnectionListeners(status) {
    this.connectionListeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('❌ Error notifying connection listener:', error);
      }
    });
  }

  // ========== Message Handling ==========

  send(data) {
    if (this.isConnected && this.socket) {
      try {
        this.socket.send(JSON.stringify(data));
        console.log('📤 Message sent:', data.type);
      } catch (error) {
        console.error('❌ Error sending message:', error);
        this.messageQueue.push(data);
      }
    } else {
      console.log('📦 Queueing message (not connected):', data.type);
      this.messageQueue.push(data);
    }
  }

  processMessageQueue() {
    console.log(`📦 Processing ${this.messageQueue.length} queued messages`);
    
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  handleIncomingMessage(data) {
    console.log('📥 Received message:', data.type);
    
    switch (data.type) {
      case 'pong':
        // Heartbeat response
        break;
      
      default:
        this.emit(data.type, data);
        break;
    }
  }

  // ========== Event Handling Methods ==========

  /**
   * Handle session created
   */
  handleSessionCreated(data) {
    this.activeCollaborationSessions.set(data.sessionId, {
      ...data,
      participants: new Map()
    });
    this.emit('collaborationSessionCreated', data);
  }

  /**
   * Handle user joined session
   */
  handleUserJoinedSession(data) {
    const session = this.activeCollaborationSessions.get(data.sessionId);
    if (session) {
      session.participants.set(data.user.id, data.user);
    }
    this.emit('collaborationUserJoined', data);
  }

  /**
   * Handle user left session
   */
  handleUserLeftSession(data) {
    const session = this.activeCollaborationSessions.get(data.sessionId);
    if (session) {
      session.participants.delete(data.user.id);
    }
    this.emit('collaborationUserLeft', data);
  }

  /**
   * Handle study group member joined
   */
  handleStudyGroupMemberJoined(data) {
    this.emit('studyGroupMemberJoined', data);
  }

  /**
   * Handle study group member left
   */
  handleStudyGroupMemberLeft(data) {
    this.emit('studyGroupMemberLeft', data);
  }

  // ========== Utility Methods ==========

  /**
   * Register event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  /**
   * Unregister event listener
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  /**
   * Emit event to listeners
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in real-time integration listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      connected: webSocketService.isConnected,
      activeCollaborationSessions: this.activeCollaborationSessions.size,
      studyGroupRooms: this.studyGroupRooms.size,
      discussionSubscriptions: this.discussionSubscriptions.size,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get active collaboration sessions
   */
  getActiveCollaborationSessions() {
    return Array.from(this.activeCollaborationSessions.values());
  }

  /**
   * Get active study group rooms
   */
  getActiveStudyGroupRooms() {
    return Array.from(this.studyGroupRooms.keys());
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.listeners.clear();
    this.activeCollaborationSessions.clear();
    this.studyGroupRooms.clear();
    this.discussionSubscriptions.clear();
    console.log('🧹 Real-time Integration Service cleaned up');
  }
}

// Create singleton instance
const realTimeIntegrationService = new RealTimeIntegrationService();

export default realTimeIntegrationService;
