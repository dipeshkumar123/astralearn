/**
 * WebSocket Service for Real-time Collaboration
 * Part of Phase 3 Step 3: Production Optimization & Advanced Features
 * 
 * Provides real-time collaboration capabilities:
 * - Live collaborative learning sessions
 * - Real-time notifications and updates
 * - Synchronized data across clients
 * - Live dashboards and analytics
 * - Instructor-student real-time communication
 */

import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventListeners = new Map();
    this.collaborationSessions = new Map();
    this.userPresence = new Map();
    this.authToken = null;
    this.pendingConnection = false;
    
    // Don't auto-initialize, wait for authentication
  }

  /**
   * Initialize WebSocket connection with authentication
   */
  initialize(authToken = null) {
    try {
      console.log('🔌 Initializing WebSocket Service...');
      
      // Store the authentication token
      this.authToken = authToken || this.getStoredToken();
      
      if (!this.authToken) {
        console.log('⚠️ No authentication token available, WebSocket connection delayed');
        return;
      }

      // Disconnect existing connection if any
      if (this.socket) {
        this.socket.disconnect();
      }
      
      const serverUrl = import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:5000';
      
      this.socket = io(serverUrl, {
        auth: {
          token: this.authToken
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        timeout: 20000,
        forceNew: true
      });

      this.setupEventHandlers();
      
    } catch (error) {
      console.error('❌ WebSocket initialization failed:', error);
    }
  }
  /**
   * Get stored authentication token
   */
  getStoredToken() {
    const token = localStorage.getItem('token');
    // Don't return demo token for WebSocket authentication
    if (token === 'demo_token_for_development') {
      return null;
    }
    return token;
  }

  /**
   * Connect with authentication token
   */
  connectWithAuth(token) {
    console.log('🔐 Connecting WebSocket with authentication token');
    this.authToken = token;
    this.initialize(token);
  }

  /**
   * Update authentication token and reconnect if needed
   */
  updateAuthToken(token) {
    if (this.authToken !== token) {
      console.log('🔄 Updating WebSocket authentication token');
      this.authToken = token;
      
      if (token) {
        // Reconnect with new token
        this.initialize(token);
      } else {
        // Disconnect if no token
        this.disconnect();
      }
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  setupEventHandlers() {
    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.onConnected();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      this.isConnected = false;
      this.onDisconnected(reason);
    });    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
      
      // Handle specific authentication errors
      if (error.message.includes('Authentication')) {
        console.log('🔐 WebSocket authentication failed - token may be invalid or expired');
        // Don't retry connection with bad auth
        this.authToken = null;
        localStorage.removeItem('token');
      }
      
      this.onConnectionError(error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
      this.onReconnected(attemptNumber);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ WebSocket reconnection failed');
      this.onReconnectionFailed();
    });

    // Collaboration events
    this.socket.on('collaboration:session_created', (data) => {
      this.handleSessionCreated(data);
    });

    this.socket.on('collaboration:user_joined', (data) => {
      this.handleUserJoined(data);
    });

    this.socket.on('collaboration:user_left', (data) => {
      this.handleUserLeft(data);
    });

    this.socket.on('collaboration:content_updated', (data) => {
      this.handleContentUpdated(data);
    });

    this.socket.on('collaboration:cursor_moved', (data) => {
      this.handleCursorMoved(data);
    });

    // Learning events
    this.socket.on('learning:progress_updated', (data) => {
      this.handleProgressUpdated(data);
    });

    this.socket.on('learning:assessment_completed', (data) => {
      this.handleAssessmentCompleted(data);
    });

    this.socket.on('learning:achievement_unlocked', (data) => {
      this.handleAchievementUnlocked(data);
    });

    // Communication events
    this.socket.on('communication:message_received', (data) => {
      this.handleMessageReceived(data);
    });

    this.socket.on('communication:notification', (data) => {
      this.handleNotification(data);
    });

    this.socket.on('communication:typing', (data) => {
      this.handleTypingIndicator(data);
    });

    // Analytics events
    this.socket.on('analytics:live_update', (data) => {
      this.handleAnalyticsUpdate(data);
    });

    this.socket.on('analytics:dashboard_refresh', (data) => {
      this.handleDashboardRefresh(data);
    });
  }

  /**
   * Join a collaboration session
   */
  joinCollaborationSession(sessionId, userInfo) {
    if (!this.isConnected) {
      console.warn('⚠️ Cannot join session - WebSocket not connected');
      return false;
    }

    this.socket.emit('collaboration:join_session', {
      sessionId,
      userInfo: {
        id: userInfo.id,
        name: userInfo.name,
        role: userInfo.role,
        avatar: userInfo.avatar
      },
      timestamp: new Date().toISOString()
    });

    this.collaborationSessions.set(sessionId, {
      id: sessionId,
      joinedAt: new Date().toISOString(),
      participants: new Map(),
      currentUser: userInfo
    });

    console.log(`🤝 Joining collaboration session: ${sessionId}`);
    return true;
  }

  /**
   * Leave a collaboration session
   */
  leaveCollaborationSession(sessionId) {
    if (!this.isConnected) return false;

    this.socket.emit('collaboration:leave_session', {
      sessionId,
      timestamp: new Date().toISOString()
    });

    this.collaborationSessions.delete(sessionId);
    console.log(`👋 Left collaboration session: ${sessionId}`);
    return true;
  }

  /**
   * Update content in real-time
   */
  updateCollaborativeContent(sessionId, contentUpdate) {
    if (!this.isConnected) return false;

    this.socket.emit('collaboration:update_content', {
      sessionId,
      contentUpdate: {
        type: contentUpdate.type,
        data: contentUpdate.data,
        position: contentUpdate.position,
        userId: contentUpdate.userId
      },
      timestamp: new Date().toISOString()
    });

    return true;
  }

  /**
   * Send cursor position for collaborative editing
   */
  updateCursorPosition(sessionId, position) {
    if (!this.isConnected) return false;

    this.socket.emit('collaboration:cursor_position', {
      sessionId,
      position,
      timestamp: new Date().toISOString()
    });

    return true;
  }

  /**
   * Send real-time message
   */
  sendMessage(channelId, message) {
    if (!this.isConnected) return false;

    this.socket.emit('communication:send_message', {
      channelId,
      message: {
        content: message.content,
        type: message.type || 'text',
        metadata: message.metadata
      },
      timestamp: new Date().toISOString()
    });

    return true;
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(channelId, isTyping) {
    if (!this.isConnected) return false;

    this.socket.emit('communication:typing', {
      channelId,
      isTyping,
      timestamp: new Date().toISOString()
    });

    return true;
  }

  /**
   * Update learning progress in real-time
   */
  updateLearningProgress(progressData) {
    if (!this.isConnected) return false;

    this.socket.emit('learning:update_progress', {
      userId: progressData.userId,
      courseId: progressData.courseId,
      progress: progressData.progress,
      currentModule: progressData.currentModule,
      timeSpent: progressData.timeSpent,
      timestamp: new Date().toISOString()
    });

    return true;
  }

  /**
   * Submit assessment completion
   */
  submitAssessmentCompletion(assessmentData) {
    if (!this.isConnected) return false;

    this.socket.emit('learning:assessment_complete', {
      userId: assessmentData.userId,
      assessmentId: assessmentData.assessmentId,
      score: assessmentData.score,
      answers: assessmentData.answers,
      timeSpent: assessmentData.timeSpent,
      timestamp: new Date().toISOString()
    });

    return true;
  }

  /**
   * Subscribe to live analytics updates
   */
  subscribeLiveAnalytics(dashboardId, filters = {}) {
    if (!this.isConnected) return false;

    this.socket.emit('analytics:subscribe', {
      dashboardId,
      filters,
      timestamp: new Date().toISOString()
    });

    console.log(`📊 Subscribed to live analytics: ${dashboardId}`);
    return true;
  }

  /**
   * Unsubscribe from live analytics
   */
  unsubscribeLiveAnalytics(dashboardId) {
    if (!this.isConnected) return false;

    this.socket.emit('analytics:unsubscribe', {
      dashboardId,
      timestamp: new Date().toISOString()
    });

    return true;
  }

  /**
   * Register event listener
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  /**
   * Unregister event listener
   */
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
  }

  /**
   * Emit custom event to listeners
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Handle session created
   */
  handleSessionCreated(data) {
    console.log('🎉 Collaboration session created:', data);
    this.emit('sessionCreated', data);
  }

  /**
   * Handle user joined session
   */
  handleUserJoined(data) {
    console.log('👤 User joined session:', data);
    
    const session = this.collaborationSessions.get(data.sessionId);
    if (session) {
      session.participants.set(data.user.id, data.user);
    }
    
    this.emit('userJoined', data);
  }

  /**
   * Handle user left session
   */
  handleUserLeft(data) {
    console.log('👋 User left session:', data);
    
    const session = this.collaborationSessions.get(data.sessionId);
    if (session) {
      session.participants.delete(data.userId);
    }
    
    this.emit('userLeft', data);
  }

  /**
   * Handle content update
   */
  handleContentUpdated(data) {
    console.log('📝 Content updated:', data);
    this.emit('contentUpdated', data);
  }

  /**
   * Handle cursor movement
   */
  handleCursorMoved(data) {
    this.emit('cursorMoved', data);
  }

  /**
   * Handle progress update
   */
  handleProgressUpdated(data) {
    console.log('📈 Progress updated:', data);
    this.emit('progressUpdated', data);
  }

  /**
   * Handle assessment completion
   */
  handleAssessmentCompleted(data) {
    console.log('✅ Assessment completed:', data);
    this.emit('assessmentCompleted', data);
  }

  /**
   * Handle achievement unlocked
   */
  handleAchievementUnlocked(data) {
    console.log('🏆 Achievement unlocked:', data);
    this.emit('achievementUnlocked', data);
  }

  /**
   * Handle message received
   */
  handleMessageReceived(data) {
    console.log('💬 Message received:', data);
    this.emit('messageReceived', data);
  }

  /**
   * Handle notification
   */
  handleNotification(data) {
    console.log('🔔 Notification received:', data);
    this.emit('notificationReceived', data);
  }

  /**
   * Handle typing indicator
   */
  handleTypingIndicator(data) {
    this.emit('typingIndicator', data);
  }

  /**
   * Handle analytics update
   */
  handleAnalyticsUpdate(data) {
    console.log('📊 Analytics update:', data);
    this.emit('analyticsUpdate', data);
  }

  /**
   * Handle dashboard refresh
   */
  handleDashboardRefresh(data) {
    console.log('🔄 Dashboard refresh:', data);
    this.emit('dashboardRefresh', data);
  }

  /**
   * Connection lifecycle handlers
   */
  onConnected() {
    this.emit('connected', { timestamp: new Date().toISOString() });
  }

  onDisconnected(reason) {
    this.emit('disconnected', { reason, timestamp: new Date().toISOString() });
  }

  onConnectionError(error) {
    this.emit('connectionError', { error, timestamp: new Date().toISOString() });
  }

  onReconnected(attemptNumber) {
    this.emit('reconnected', { attemptNumber, timestamp: new Date().toISOString() });
  }

  onReconnectionFailed() {
    this.emit('reconnectionFailed', { timestamp: new Date().toISOString() });
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
      activeSessions: this.collaborationSessions.size,
      eventListeners: this.eventListeners.size,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get collaboration session info
   */
  getSessionInfo(sessionId) {
    return this.collaborationSessions.get(sessionId);
  }

  /**
   * Get all active sessions
   */
  getActiveSessions() {
    return Array.from(this.collaborationSessions.values());
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('🔌 WebSocket disconnected manually');
    }
  }

  /**
   * Cleanup resources
   */
  dispose() {
    this.disconnect();
    this.eventListeners.clear();
    this.collaborationSessions.clear();
    this.userPresence.clear();
    console.log('🧹 WebSocket Service disposed');
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;
