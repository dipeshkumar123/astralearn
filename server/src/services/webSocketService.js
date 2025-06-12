/**
 * WebSocket Service for AstraLearn
 * Part of Phase 3 Step 3: Production Optimization & Advanced Features
 * 
 * Provides real-time features including:
 * - Live collaboration
 * - Real-time notifications
 * - Live learning sessions
 * - Performance monitoring updates
 * - Chat and messaging
 */

import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';
import redisCacheService from './redisCacheService.js';
import performanceMonitorService from './performanceMonitorService.js';

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
    this.activeRooms = new Map();
    this.sessionStats = {
      totalConnections: 0,
      currentConnections: 0,
      messagesExchanged: 0,
      roomsCreated: 0
    };

    // Rate limiting for socket events
    this.rateLimits = new Map();
    this.rateLimit = {
      window: 60000, // 1 minute
      maxEvents: 100  // Max events per window
    };
  }

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.server.corsOrigin,
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e6, // 1MB
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.startMetricsCollection();

    console.log('🌐 WebSocket Service: Initialized successfully');
  }

  /**
   * Setup authentication and middleware
   */
  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication required'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, config.jwt.secret);
        const user = await this.getUserById(decoded.userId || decoded.id);
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user.id;
        socket.userRole = user.role;
        socket.userData = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        };

        next();
      } catch (error) {
        console.error('WebSocket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });

    // Rate limiting middleware
    this.io.use((socket, next) => {
      socket.use((event, next) => {
        if (this.checkRateLimit(socket.userId, event[0])) {
          next();
        } else {
          next(new Error('Rate limit exceeded'));
        }
      });
      next();
    });
  }

  /**
   * Setup WebSocket event handlers
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  /**
   * Handle new socket connection
   */
  handleConnection(socket) {
    const { userId, userData } = socket;
    
    // Update session stats
    this.sessionStats.totalConnections++;
    this.sessionStats.currentConnections++;

    // Store connected user
    this.connectedUsers.set(userId, {
      socketId: socket.id,
      user: userData,
      connectedAt: new Date(),
      lastActivity: new Date(),
      currentRoom: null
    });

    console.log(`🔗 User connected: ${userData.name} (${userId})`);

    // Join user to their personal room
    socket.join(`user:${userId}`);

    // Send welcome message
    socket.emit('connection:welcome', {
      message: 'Connected to AstraLearn',
      userId,
      timestamp: new Date().toISOString()
    });

    // Broadcast user online status
    this.broadcastUserStatus(userId, 'online');

    // Setup event handlers for this socket
    this.setupSocketEvents(socket);

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });
  }

  /**
   * Setup individual socket event handlers
   */
  setupSocketEvents(socket) {
    const { userId, userData } = socket;

    // Real-time learning session events
    socket.on('learning:join-session', (data) => {
      this.handleJoinLearningSession(socket, data);
    });

    socket.on('learning:leave-session', (data) => {
      this.handleLeaveLearningSession(socket, data);
    });

    socket.on('learning:progress-update', (data) => {
      this.handleProgressUpdate(socket, data);
    });

    // Collaboration events
    socket.on('collaboration:join-room', (data) => {
      this.handleJoinCollaborationRoom(socket, data);
    });

    socket.on('collaboration:leave-room', (data) => {
      this.handleLeaveCollaborationRoom(socket, data);
    });

    socket.on('collaboration:message', (data) => {
      this.handleCollaborationMessage(socket, data);
    });

    socket.on('collaboration:cursor-move', (data) => {
      this.handleCursorMove(socket, data);
    });

    // Chat and messaging
    socket.on('chat:send-message', (data) => {
      this.handleChatMessage(socket, data);
    });

    socket.on('chat:typing', (data) => {
      this.handleTypingIndicator(socket, data);
    });

    // Notification events
    socket.on('notifications:mark-read', (data) => {
      this.handleMarkNotificationRead(socket, data);
    });

    // Performance monitoring events
    socket.on('performance:subscribe', () => {
      this.handlePerformanceSubscription(socket);
    });

    socket.on('performance:unsubscribe', () => {
      this.handlePerformanceUnsubscription(socket);
    });

    // Study group events
    socket.on('study-group:join', (data) => {
      this.handleJoinStudyGroup(socket, data);
    });

    socket.on('study-group:leave', (data) => {
      this.handleLeaveStudyGroup(socket, data);
    });

    socket.on('study-group:share-screen', (data) => {
      this.handleScreenShare(socket, data);
    });

    // AI assistant events
    socket.on('ai:query', (data) => {
      this.handleAIQuery(socket, data);
    });

    // Social Learning Real-time Events
    socket.on('social:subscribe_activity_feed', (data) => {
      this.handleSubscribeSocialActivityFeed(socket, data);
    });

    socket.on('social:broadcast_activity', (data) => {
      this.handleBroadcastSocialActivity(socket, data);
    });

    socket.on('social:send_buddy_request', (data) => {
      this.handleSendBuddyRequest(socket, data);
    });

    socket.on('social:update_buddy_status', (data) => {
      this.handleUpdateBuddyStatus(socket, data);
    });

    // Collaboration Real-time Events
    socket.on('collaboration:create_session', (data) => {
      this.handleCreateCollaborationSession(socket, data);
    });

    socket.on('collaboration:webrtc_signal', (data) => {
      this.handleWebRTCSignal(socket, data);
    });

    socket.on('collaboration:start_screen_share', (data) => {
      this.handleStartScreenShare(socket, data);
    });

    socket.on('collaboration:stop_screen_share', (data) => {
      this.handleStopScreenShare(socket, data);
    });

    // Discussion Forum Real-time Events
    socket.on('discussion:subscribe', (data) => {
      this.handleSubscribeDiscussion(socket, data);
    });

    socket.on('discussion:unsubscribe', (data) => {
      this.handleUnsubscribeDiscussion(socket, data);
    });

    socket.on('discussion:typing', (data) => {
      this.handleDiscussionTyping(socket, data);
    });

    socket.on('discussion:vote', (data) => {
      this.handleDiscussionVote(socket, data);
    });

    // Whiteboard Real-time Events
    socket.on('whiteboard:join', (data) => {
      this.handleJoinWhiteboard(socket, data);
    });

    socket.on('whiteboard:draw', (data) => {
      this.handleWhiteboardDraw(socket, data);
    });

    socket.on('whiteboard:add_element', (data) => {
      this.handleWhiteboardAddElement(socket, data);
    });

    socket.on('whiteboard:update_element', (data) => {
      this.handleWhiteboardUpdateElement(socket, data);
    });

    socket.on('whiteboard:delete_element', (data) => {
      this.handleWhiteboardDeleteElement(socket, data);
    });

    socket.on('whiteboard:cursor_move', (data) => {
      this.handleWhiteboardCursorMove(socket, data);
    });

    socket.on('whiteboard:clear', (data) => {
      this.handleWhiteboardClear(socket, data);
    });

    socket.on('study-group:send_message', (data) => {
      this.handleStudyGroupMessage(socket, data);
    });

    socket.on('study-group:start_session', (data) => {
      this.handleStartStudySession(socket, data);
    });

    // Update last activity
    socket.onAny(() => {
      this.updateUserActivity(userId);
    });
  }

  /**
   * Handle user disconnection
   */
  handleDisconnection(socket) {
    const { userId, userData } = socket;
    
    this.sessionStats.currentConnections--;
    
    // Remove from connected users
    this.connectedUsers.delete(userId);
    
    // Leave all rooms
    const userConnection = this.connectedUsers.get(userId);
    if (userConnection?.currentRoom) {
      this.leaveRoom(socket, userConnection.currentRoom);
    }

    // Broadcast user offline status
    this.broadcastUserStatus(userId, 'offline');

    console.log(`🔌 User disconnected: ${userData.name} (${userId})`);
  }

  /**
   * Learning session event handlers
   */
  handleJoinLearningSession(socket, data) {
    const { sessionId, courseId } = data;
    const roomName = `session:${sessionId}`;
    
    socket.join(roomName);
    this.updateUserRoom(socket.userId, roomName);

    // Notify others in the session
    socket.to(roomName).emit('learning:user-joined', {
      user: socket.userData,
      sessionId,
      timestamp: new Date().toISOString()
    });

    // Send session info to the user
    socket.emit('learning:session-joined', {
      sessionId,
      courseId,
      participants: this.getRoomParticipants(roomName),
      timestamp: new Date().toISOString()
    });

    console.log(`📚 User ${socket.userData.name} joined learning session ${sessionId}`);
  }

  handleLeaveLearningSession(socket, data) {
    const { sessionId } = data;
    const roomName = `session:${sessionId}`;
    
    socket.leave(roomName);
    this.updateUserRoom(socket.userId, null);

    // Notify others in the session
    socket.to(roomName).emit('learning:user-left', {
      user: socket.userData,
      sessionId,
      timestamp: new Date().toISOString()
    });

    console.log(`📚 User ${socket.userData.name} left learning session ${sessionId}`);
  }

  handleProgressUpdate(socket, data) {
    const { sessionId, lessonId, progress, timeSpent } = data;
    const roomName = `session:${sessionId}`;

    // Broadcast progress update to session participants
    socket.to(roomName).emit('learning:progress-updated', {
      user: socket.userData,
      lessonId,
      progress,
      timeSpent,
      timestamp: new Date().toISOString()
    });

    // Cache progress data
    this.cacheProgressUpdate(socket.userId, data);
  }

  /**
   * Collaboration event handlers
   */
  handleJoinCollaborationRoom(socket, data) {
    const { roomId, roomType } = data;
    const roomName = `collab:${roomType}:${roomId}`;
    
    socket.join(roomName);
    this.updateUserRoom(socket.userId, roomName);

    // Track room usage
    if (!this.activeRooms.has(roomName)) {
      this.activeRooms.set(roomName, {
        participants: new Set(),
        createdAt: new Date(),
        type: roomType,
        roomId
      });
      this.sessionStats.roomsCreated++;
    }

    this.activeRooms.get(roomName).participants.add(socket.userId);

    // Notify room participants
    socket.to(roomName).emit('collaboration:user-joined', {
      user: socket.userData,
      roomId,
      roomType,
      timestamp: new Date().toISOString()
    });

    // Send room info to user
    socket.emit('collaboration:room-joined', {
      roomId,
      roomType,
      participants: Array.from(this.activeRooms.get(roomName).participants)
        .map(id => this.connectedUsers.get(id)?.user)
        .filter(Boolean),
      timestamp: new Date().toISOString()
    });
  }

  handleLeaveCollaborationRoom(socket, data) {
    const { roomId, roomType } = data;
    const roomName = `collab:${roomType}:${roomId}`;
    
    socket.leave(roomName);
    this.updateUserRoom(socket.userId, null);

    // Update room tracking
    const room = this.activeRooms.get(roomName);
    if (room) {
      room.participants.delete(socket.userId);
      
      // Remove room if empty
      if (room.participants.size === 0) {
        this.activeRooms.delete(roomName);
      }
    }

    // Notify room participants
    socket.to(roomName).emit('collaboration:user-left', {
      user: socket.userData,
      roomId,
      roomType,
      timestamp: new Date().toISOString()
    });
  }

  handleCollaborationMessage(socket, data) {
    const { roomId, roomType, message, messageType } = data;
    const roomName = `collab:${roomType}:${roomId}`;

    this.sessionStats.messagesExchanged++;

    // Broadcast message to room
    socket.to(roomName).emit('collaboration:message-received', {
      user: socket.userData,
      message,
      messageType,
      roomId,
      roomType,
      timestamp: new Date().toISOString()
    });

    // Store message for persistence (optional)
    this.storeCollaborationMessage(roomId, roomType, socket.userId, message);
  }

  handleCursorMove(socket, data) {
    const { roomId, roomType, position, element } = data;
    const roomName = `collab:${roomType}:${roomId}`;

    // Broadcast cursor position to room (except sender)
    socket.to(roomName).emit('collaboration:cursor-moved', {
      user: socket.userData,
      position,
      element,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Chat event handlers
   */
  handleChatMessage(socket, data) {
    const { recipientId, message, chatType } = data;

    this.sessionStats.messagesExchanged++;

    if (chatType === 'direct') {
      // Direct message
      this.io.to(`user:${recipientId}`).emit('chat:message-received', {
        sender: socket.userData,
        message,
        chatType,
        timestamp: new Date().toISOString()
      });
    } else {
      // Group or public message
      socket.broadcast.emit('chat:message-received', {
        sender: socket.userData,
        message,
        chatType,
        timestamp: new Date().toISOString()
      });
    }

    // Store message for persistence
    this.storeChatMessage(socket.userId, recipientId, message, chatType);
  }

  handleTypingIndicator(socket, data) {
    const { recipientId, isTyping } = data;

    this.io.to(`user:${recipientId}`).emit('chat:typing-indicator', {
      sender: socket.userData,
      isTyping,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Performance monitoring handlers
   */
  handlePerformanceSubscription(socket) {
    socket.join('performance-monitoring');
    
    // Send current performance snapshot
    this.sendPerformanceUpdate(socket);
    
    console.log(`📊 User ${socket.userData.name} subscribed to performance monitoring`);
  }

  handlePerformanceUnsubscription(socket) {
    socket.leave('performance-monitoring');
  }

  /**
   * Notification handlers
   */
  handleMarkNotificationRead(socket, data) {
    const { notificationId } = data;
    
    // Mark notification as read in database
    this.markNotificationAsRead(socket.userId, notificationId);
    
    // Acknowledge to client
    socket.emit('notifications:marked-read', {
      notificationId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Study group handlers
   */
  handleJoinStudyGroup(socket, data) {
    const { groupId } = data;
    const roomName = `study-group:${groupId}`;
    
    socket.join(roomName);
    this.updateUserRoom(socket.userId, roomName);

    // Notify group members
    socket.to(roomName).emit('study-group:member-joined', {
      user: socket.userData,
      groupId,
      timestamp: new Date().toISOString()
    });
  }

  handleLeaveStudyGroup(socket, data) {
    const { groupId } = data;
    const roomName = `study-group:${groupId}`;
    
    socket.leave(roomName);
    this.updateUserRoom(socket.userId, null);

    // Notify group members
    socket.to(roomName).emit('study-group:member-left', {
      user: socket.userData,
      groupId,
      timestamp: new Date().toISOString()
    });
  }

  handleScreenShare(socket, data) {
    const { groupId, streamData } = data;
    const roomName = `study-group:${groupId}`;

    // Broadcast screen share to group members
    socket.to(roomName).emit('study-group:screen-shared', {
      user: socket.userData,
      streamData,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * AI assistant handlers
   */
  handleAIQuery(socket, data) {
    const { query, context } = data;
    
    // Process AI query (integrate with existing AI service)
    this.processAIQuery(socket, query, context);
  }

  /**
   * Social Learning Event Handlers
   */
  handleSubscribeSocialActivityFeed(socket, data) {
    const { userId } = data;
    socket.join(`social-feed:${userId}`);
    
    console.log(`📡 User ${socket.userData.name} subscribed to social activity feed`);
    
    // Send recent activity
    this.sendRecentSocialActivity(socket, userId);
  }

  handleBroadcastSocialActivity(socket, data) {
    const { type, content, targetUsers } = data;
    
    // Broadcast to social feed subscribers
    if (targetUsers && targetUsers.length > 0) {
      targetUsers.forEach(userId => {
        this.io.to(`social-feed:${userId}`).emit('social:activity_update', {
          type,
          content,
          author: socket.userData,
          timestamp: new Date().toISOString()
        });
      });
    } else {
      // Broadcast to all connected users' feeds
      this.io.emit('social:activity_update', {
        type,
        content,
        author: socket.userData,
        timestamp: new Date().toISOString()
      });
    }
  }

  handleSendBuddyRequest(socket, data) {
    const { targetUserId, message } = data;
    
    // Send buddy request to target user
    this.io.to(`user:${targetUserId}`).emit('social:buddy_request', {
      sender: socket.userData,
      message,
      timestamp: new Date().toISOString()
    });

    // Send confirmation to sender
    socket.emit('social:buddy_request_sent', {
      targetUserId,
      timestamp: new Date().toISOString()
    });

    console.log(`🤝 Study buddy request sent from ${socket.userData.name} to ${targetUserId}`);
  }

  handleUpdateBuddyStatus(socket, data) {
    const { status, studyTopic } = data;
    
    // Update user's buddy status and broadcast to relevant users
    this.io.emit('social:buddy_status', {
      user: socket.userData,
      status,
      studyTopic,
      timestamp: new Date().toISOString()
    });

    console.log(`📱 ${socket.userData.name} updated buddy status to: ${status}`);
  }

  /**
   * Enhanced Collaboration Event Handlers
   */
  handleCreateCollaborationSession(socket, data) {
    const { sessionData } = data;
    const sessionId = `session_${Date.now()}_${socket.userId}`;
    
    // Create session room
    socket.join(`collaboration:${sessionId}`);
    
    // Track session
    this.activeRooms.set(`collaboration:${sessionId}`, {
      participants: new Set([socket.userId]),
      createdAt: new Date(),
      type: 'collaboration',
      sessionId,
      creator: socket.userData,
      ...sessionData
    });

    // Emit session created event
    socket.emit('collaboration:session_created', {
      sessionId,
      creator: socket.userData,
      ...sessionData,
      timestamp: new Date().toISOString()
    });

    console.log(`🎥 Collaboration session created: ${sessionId} by ${socket.userData.name}`);
  }

  handleWebRTCSignal(socket, data) {
    const { sessionId, signalType, signalData } = data;
    const roomName = `collaboration:${sessionId}`;

    // Forward WebRTC signaling to other participants
    socket.to(roomName).emit(`collaboration:webrtc_${signalType}`, {
      sender: socket.userData,
      signalData,
      timestamp: new Date().toISOString()
    });
  }

  handleStartScreenShare(socket, data) {
    const { sessionId, streamData } = data;
    const roomName = `collaboration:${sessionId}`;

    // Notify other participants about screen sharing
    socket.to(roomName).emit('collaboration:screen_share_started', {
      user: socket.userData,
      streamData,
      timestamp: new Date().toISOString()
    });

    console.log(`🖥️ Screen sharing started by ${socket.userData.name} in session ${sessionId}`);
  }

  handleStopScreenShare(socket, data) {
    const { sessionId } = data;
    const roomName = `collaboration:${sessionId}`;

    // Notify other participants that screen sharing stopped
    socket.to(roomName).emit('collaboration:screen_share_stopped', {
      user: socket.userData,
      timestamp: new Date().toISOString()
    });

    console.log(`🖥️ Screen sharing stopped by ${socket.userData.name} in session ${sessionId}`);
  }

  /**
   * Discussion Forum Event Handlers
   */
  handleSubscribeDiscussion(socket, data) {
    const { discussionId } = data;
    const roomName = `discussion:${discussionId}`;
    
    socket.join(roomName);
    
    // Send current typing indicators
    this.sendCurrentTypingIndicators(socket, discussionId);
    
    console.log(`💬 User ${socket.userData.name} subscribed to discussion: ${discussionId}`);
  }

  handleUnsubscribeDiscussion(socket, data) {
    const { discussionId } = data;
    const roomName = `discussion:${discussionId}`;
    
    socket.leave(roomName);
    
    console.log(`💬 User ${socket.userData.name} unsubscribed from discussion: ${discussionId}`);
  }

  handleDiscussionTyping(socket, data) {
    const { discussionId, isTyping } = data;
    const roomName = `discussion:${discussionId}`;

    // Broadcast typing indicator to other discussion participants
    socket.to(roomName).emit('discussion:typing_indicator', {
      user: socket.userData,
      isTyping,
      timestamp: new Date().toISOString()
    });
  }

  handleDiscussionVote(socket, data) {
    const { discussionId, voteType } = data;
    const roomName = `discussion:${discussionId}`;

    // Broadcast vote update to discussion participants
    socket.to(roomName).emit('discussion:vote_update', {
      user: socket.userData,
      voteType,
      discussionId,
      timestamp: new Date().toISOString()
    });

    console.log(`👍 Vote ${voteType} by ${socket.userData.name} on discussion ${discussionId}`);
  }

  /**
   * Whiteboard Event Handlers
   */
  handleJoinWhiteboard(socket, data) {
    const { sessionId } = data;
    const roomName = `whiteboard:${sessionId}`;
    
    socket.join(roomName);
    
    // Send current whiteboard state
    this.sendWhiteboardState(socket, sessionId);
    
    console.log(`🎨 User ${socket.userData.name} joined whiteboard: ${sessionId}`);
  }

  handleWhiteboardDraw(socket, data) {
    const { sessionId, drawingData } = data;
    const roomName = `whiteboard:${sessionId}`;

    // Broadcast drawing data to other participants
    socket.to(roomName).emit('whiteboard:drawing_update', {
      user: socket.userData,
      drawingData,
      timestamp: new Date().toISOString()
    });
  }

  handleWhiteboardAddElement(socket, data) {
    const { sessionId, element } = data;
    const roomName = `whiteboard:${sessionId}`;

    // Broadcast new element to other participants
    socket.to(roomName).emit('whiteboard:element_added', {
      user: socket.userData,
      element,
      timestamp: new Date().toISOString()
    });

    console.log(`🎨 Element added to whiteboard ${sessionId} by ${socket.userData.name}`);
  }

  handleWhiteboardUpdateElement(socket, data) {
    const { sessionId, elementId, updates } = data;
    const roomName = `whiteboard:${sessionId}`;

    // Broadcast element update to other participants
    socket.to(roomName).emit('whiteboard:element_updated', {
      user: socket.userData,
      elementId,
      updates,
      timestamp: new Date().toISOString()
    });
  }

  handleWhiteboardDeleteElement(socket, data) {
    const { sessionId, elementId } = data;
    const roomName = `whiteboard:${sessionId}`;

    // Broadcast element deletion to other participants
    socket.to(roomName).emit('whiteboard:element_deleted', {
      user: socket.userData,
      elementId,
      timestamp: new Date().toISOString()
    });
  }

  handleWhiteboardCursorMove(socket, data) {
    const { sessionId, position } = data;
    const roomName = `whiteboard:${sessionId}`;

    // Broadcast cursor position to other participants
    socket.to(roomName).emit('whiteboard:cursor_moved', {
      user: socket.userData,
      position,
      timestamp: new Date().toISOString()
    });
  }

  handleWhiteboardClear(socket, data) {
    const { sessionId } = data;
    const roomName = `whiteboard:${sessionId}`;

    // Broadcast whiteboard clear to other participants
    socket.to(roomName).emit('whiteboard:cleared', {
      user: socket.userData,
      timestamp: new Date().toISOString()
    });

    console.log(`🎨 Whiteboard ${sessionId} cleared by ${socket.userData.name}`);
  }

  /**
   * Enhanced Study Group Handlers
   */
  handleStudyGroupMessage(socket, data) {
    const { groupId, message } = data;
    const roomName = `study-group:${groupId}`;

    // Broadcast message to group members
    socket.to(roomName).emit('study-group:message', {
      user: socket.userData,
      message,
      groupId,
      timestamp: new Date().toISOString()
    });

    console.log(`📚 Message sent to study group ${groupId} by ${socket.userData.name}`);
  }

  handleStartStudySession(socket, data) {
    const { groupId, sessionData } = data;
    const roomName = `study-group:${groupId}`;

    // Broadcast session start to group members
    socket.to(roomName).emit('study-group:session_started', {
      user: socket.userData,
      sessionData,
      groupId,
      timestamp: new Date().toISOString()
    });

    console.log(`📚 Study session started in group ${groupId} by ${socket.userData.name}`);
  }

  /**
   * Social Learning Event Handlers
   */
  handleSocialLearningEvents(socket, data) {
    console.log('🎓 Handling social learning event:', data.type);
    
    switch (data.type) {
      case 'socialActivityUpdate':
        this.handleSocialActivityUpdate(socket, data);
        break;
      
      case 'studyBuddyRequest':
        this.handleStudyBuddyRequest(socket, data);
        break;
      
      case 'studyBuddyResponse':
        this.handleStudyBuddyResponse(socket, data);
        break;
      
      case 'userStatusChange':
        this.handleUserStatusChange(socket, data);
        break;
      
      case 'socialAchievementUnlocked':
        this.handleSocialAchievement(socket, data);
        break;
      
      default:
        console.log('❓ Unknown social learning event:', data.type);
    }
  }

  handleSocialActivityUpdate(socket, data) {
    // Broadcast social activity to relevant users
    this.broadcastToRoom(`social_feed_${data.userId}`, 'socialActivityUpdate', data);
    
    // Also broadcast to friends/study buddies
    if (data.broadcast) {
      data.broadcast.forEach(userId => {
        this.sendToUser(userId, 'socialActivityUpdate', data);
      });
    }
  }

  handleStudyBuddyRequest(socket, data) {
    this.sendToUser(data.targetUserId, 'studyBuddyRequest', {
      ...data,
      requestId: this.generateId(),
      timestamp: Date.now()
    });
  }

  handleStudyBuddyResponse(socket, data) {
    this.sendToUser(data.requesterId, 'studyBuddyResponse', data);
  }

  handleUserStatusChange(socket, data) {
    // Broadcast user status to all relevant rooms
    const userRooms = this.getUserRooms(socket.userId);
    userRooms.forEach(roomId => {
      this.broadcastToRoom(roomId, 'userStatusChange', {
        userId: socket.userId,
        status: data.status,
        timestamp: Date.now()
      });
    });
  }

  handleSocialAchievement(socket, data) {
    // Broadcast achievement to user's social network
    this.broadcastToRoom(`social_feed_${socket.userId}`, 'socialAchievementUnlocked', data);
  }

  // Study Group Events
  handleStudyGroupEvents(socket, data) {
    console.log('👥 Handling study group event:', data.type);
    
    switch (data.type) {
      case 'joinStudyGroup':
        this.handleJoinStudyGroup(socket, data);
        break;
      
      case 'leaveStudyGroup':
        this.handleLeaveStudyGroup(socket, data);
        break;
      
      case 'studyGroupMessage':
        this.handleStudyGroupMessage(socket, data);
        break;
      
      case 'startLiveSession':
        this.handleStartLiveSession(socket, data);
        break;
      
      default:
        console.log('❓ Unknown study group event:', data.type);
    }
  }

  handleJoinStudyGroup(socket, data) {
    const roomId = `study_group_${data.groupId}`;
    socket.join(roomId);
    
    this.broadcastToRoom(roomId, 'memberJoined', {
      groupId: data.groupId,
      userId: socket.userId,
      timestamp: Date.now()
    });
  }

  handleLeaveStudyGroup(socket, data) {
    const roomId = `study_group_${data.groupId}`;
    socket.leave(roomId);
    
    this.broadcastToRoom(roomId, 'memberLeft', {
      groupId: data.groupId,
      userId: socket.userId,
      timestamp: Date.now()
    });
  }

  handleStudyGroupMessage(socket, data) {
    const roomId = `study_group_${data.groupId}`;
    this.broadcastToRoom(roomId, 'groupMessage', {
      ...data,
      messageId: this.generateId(),
      userId: socket.userId,
      timestamp: Date.now()
    });
  }

  handleStartLiveSession(socket, data) {
    const roomId = `study_group_${data.groupId}`;
    this.broadcastToRoom(roomId, 'liveSessionStarted', {
      ...data,
      sessionId: this.generateId(),
      hostId: socket.userId,
      timestamp: Date.now()
    });
  }

  // User Presence Tracking
  updateUserPresence(socket, status) {
    const userRooms = this.getUserRooms(socket.userId);
    
    userRooms.forEach(roomId => {
      this.broadcastToRoom(roomId, 'userPresenceUpdate', {
        userId: socket.userId,
        status: status,
        timestamp: Date.now()
      });
    });
  }

  getUserRooms(userId) {
    // Return array of room IDs that user should be in
    // This would typically come from database
    return [
      `user_${userId}`,
      `social_feed_${userId}`
    ];
  }

  /**
   * Send real-time notifications
   */
  sendNotificationToUser(userId, notification) {
    this.io.to(`user:${userId}`).emit('notification:received', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  }

  sendNotificationToRoom(roomName, notification) {
    this.io.to(roomName).emit('notification:received', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send performance updates to subscribed users
   */
  async sendPerformanceUpdate(socket = null) {
    try {
      const metrics = await performanceMonitorService.getPerformanceMetrics(60000); // Last minute
      
      const performanceData = {
        metrics: {
          responseTime: metrics.request.averageResponseTime,
          memoryUsage: metrics.memory.current.usagePercent,
          errorRate: metrics.error.errorRate,
          requestsPerSecond: metrics.request.requestsPerSecond
        },
        timestamp: new Date().toISOString()
      };

      if (socket) {
        socket.emit('performance:update', performanceData);
      } else {
        this.io.to('performance-monitoring').emit('performance:update', performanceData);
      }
    } catch (error) {
      console.error('Error sending performance update:', error);
    }
  }

  /**
   * Start metrics collection for WebSocket service
   */
  startMetricsCollection() {
    // Send performance updates every 30 seconds
    setInterval(() => {
      this.sendPerformanceUpdate();
    }, 30000);

    // Clean up inactive rate limits every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, limit] of this.rateLimits.entries()) {
        if (now > limit.resetTime) {
          this.rateLimits.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Database operations (integrate with existing services)
   */
  async getUserById(userId) {
    // Integrate with existing user service
    try {
      // This would use your existing User model
      const User = (await import('../models/User.js')).default;
      return await User.findById(userId).select('name email role avatar');
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async cacheProgressUpdate(userId, progressData) {
    try {
      await redisCacheService.cacheRealTimeData(
        `progress:${userId}:${progressData.lessonId}`,
        progressData,
        300 // 5 minutes
      );
    } catch (error) {
      // Silently fail if caching not available
    }
  }

  async storeCollaborationMessage(roomId, roomType, userId, message) {
    // Implement message storage logic
    // This could integrate with your database
  }

  async storeChatMessage(senderId, recipientId, message, chatType) {
    // Implement chat message storage logic
  }

  async markNotificationAsRead(userId, notificationId) {
    // Implement notification read status update
  }

  async processAIQuery(socket, query, context) {
    // Integrate with existing AI service
    socket.emit('ai:response', {
      query,
      response: 'AI processing...',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get WebSocket service statistics
   */
  getStatistics() {
    return {
      ...this.sessionStats,
      activeUsers: this.connectedUsers.size,
      activeRooms: this.activeRooms.size,
      rateLimitEntries: this.rateLimits.size,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Health check for WebSocket service
   */
  healthCheck() {
    return {
      status: this.io ? 'healthy' : 'unhealthy',
      connections: this.sessionStats.currentConnections,
      rooms: this.activeRooms.size,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }

  // ===========================
  // PHASE 5 STEP 2 - INSTRUCTOR MONITORING WEBSOCKET EVENTS
  // ===========================
  /**
   * Initialize Instructor Monitoring WebSocket Events
   * Real-time class monitoring and analytics for instructors
   */
  initializeInstructorMonitoring() {
    if (!this.io) return;

    // Instructor namespace for real-time monitoring
    const instructorNamespace = this.io.of('/instructor');

    // Authentication middleware for instructor namespace
    instructorNamespace.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication required'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, config.jwt.secret);
        const user = await this.getUserById(decoded.userId || decoded.id);
        
        if (!user) {
          return next(new Error('User not found'));
        }

        // Verify instructor role
        if (user.role !== 'instructor' && user.role !== 'admin') {
          return next(new Error('Instructor access required'));
        }

        socket.userId = user.id;
        socket.userRole = user.role;
        socket.userData = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        };

        next();
      } catch (error) {
        console.error('Instructor WebSocket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });

    instructorNamespace.on('connection', (socket) => {
      console.log(`Instructor connected: ${socket.userId}`);

      // Join instructor to their monitoring room
      socket.join(`instructor_${socket.userId}`);

      // Handle real-time class monitoring
      this.handleInstructorClassMonitoring(socket);

      // Handle engagement monitoring
      this.handleEngagementMonitoring(socket);

      // Handle learning gap alerts
      this.handleLearningGapAlerts(socket);

      // Handle intervention tracking
      this.handleInterventionTracking(socket);

      socket.on('disconnect', () => {
        console.log(`Instructor disconnected: ${socket.userId}`);
        this.cleanupInstructorSession(socket);
      });
    });
  }

  /**
   * Handle Real-time Class Monitoring Events
   */
  handleInstructorClassMonitoring(socket) {
    // Start monitoring a specific class
    socket.on('start_class_monitoring', async (data) => {
      try {
        const { courseId, sessionId } = data;
        
        // Validate instructor has access to course
        if (!await this.validateInstructorCourseAccess(socket.userId, courseId)) {
          socket.emit('monitoring_error', { error: 'Access denied to course' });
          return;
        }

        // Join class monitoring room
        const monitoringRoom = `class_monitor_${courseId}`;
        socket.join(monitoringRoom);

        // Store monitoring session
        await redisCacheService.set(
          `instructor_monitoring_${socket.userId}_${courseId}`,
          { sessionId, startTime: new Date().toISOString() },
          600 // 10 minutes TTL
        );

        socket.emit('monitoring_started', { courseId, sessionId });

        // Start sending real-time updates
        this.startRealTimeClassUpdates(socket, courseId, sessionId);

      } catch (error) {
        console.error('Class monitoring start error:', error);
        socket.emit('monitoring_error', { error: 'Failed to start monitoring' });
      }
    });

    // Stop monitoring a class
    socket.on('stop_class_monitoring', async (data) => {
      try {
        const { courseId } = data;
        const monitoringRoom = `class_monitor_${courseId}`;
        
        socket.leave(monitoringRoom);
        
        // Clean up monitoring session
        await redisCacheService.delete(`instructor_monitoring_${socket.userId}_${courseId}`);
        
        socket.emit('monitoring_stopped', { courseId });

      } catch (error) {
        console.error('Class monitoring stop error:', error);
        socket.emit('monitoring_error', { error: 'Failed to stop monitoring' });
      }
    });

    // Request live class metrics
    socket.on('request_live_metrics', async (data) => {
      try {
        const { courseId } = data;
        
        // Get real-time class metrics
        const metrics = await this.getLiveClassMetrics(courseId);
        
        socket.emit('live_metrics_update', {
          courseId,
          metrics,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Live metrics request error:', error);
        socket.emit('monitoring_error', { error: 'Failed to get live metrics' });
      }
    });
  }

  /**
   * Handle Engagement Monitoring Events
   */
  handleEngagementMonitoring(socket) {
    // Start engagement monitoring
    socket.on('start_engagement_monitoring', async (data) => {
      try {
        const { courseId, studentIds = [] } = data;
        
        const engagementRoom = `engagement_${courseId}`;
        socket.join(engagementRoom);

        // Store engagement monitoring session
        await redisCacheService.set(
          `engagement_monitoring_${socket.userId}_${courseId}`,
          { studentIds, startTime: new Date().toISOString() },
          600
        );

        socket.emit('engagement_monitoring_started', { courseId, studentCount: studentIds.length });

        // Start sending engagement updates
        this.startEngagementUpdates(socket, courseId, studentIds);

      } catch (error) {
        console.error('Engagement monitoring start error:', error);
        socket.emit('monitoring_error', { error: 'Failed to start engagement monitoring' });
      }
    });

    // Update engagement thresholds
    socket.on('update_engagement_thresholds', async (data) => {
      try {
        const { courseId, thresholds } = data;
        
        // Store updated thresholds
        await redisCacheService.set(
          `engagement_thresholds_${courseId}`,
          thresholds,
          3600 // 1 hour TTL
        );

        socket.emit('thresholds_updated', { courseId, thresholds });

      } catch (error) {
        console.error('Engagement thresholds update error:', error);
        socket.emit('monitoring_error', { error: 'Failed to update thresholds' });
      }
    });
  }

  /**
   * Handle Learning Gap Alert Events
   */
  handleLearningGapAlerts(socket) {
    // Subscribe to gap detection alerts
    socket.on('subscribe_gap_alerts', async (data) => {
      try {
        const { courseId, alertTypes = ['critical', 'warning'] } = data;
        
        const alertRoom = `gap_alerts_${courseId}`;
        socket.join(alertRoom);

        // Store alert subscription
        await redisCacheService.set(
          `gap_alerts_${socket.userId}_${courseId}`,
          { alertTypes, subscribedAt: new Date().toISOString() },
          3600
        );

        socket.emit('gap_alerts_subscribed', { courseId, alertTypes });

      } catch (error) {
        console.error('Gap alerts subscription error:', error);
        socket.emit('monitoring_error', { error: 'Failed to subscribe to gap alerts' });
      }
    });

    // Acknowledge gap alert
    socket.on('acknowledge_gap_alert', async (data) => {
      try {
        const { alertId, courseId, studentId } = data;
        
        // Mark alert as acknowledged
        await redisCacheService.set(
          `gap_alert_ack_${alertId}`,
          { 
            acknowledgedBy: socket.userId, 
            acknowledgedAt: new Date().toISOString(),
            courseId,
            studentId
          },
          86400 // 24 hours TTL
        );

        socket.emit('gap_alert_acknowledged', { alertId });

        // Notify other instructors in the course
        socket.to(`gap_alerts_${courseId}`).emit('gap_alert_acknowledged_by_peer', {
          alertId,
          acknowledgedBy: socket.userId
        });

      } catch (error) {
        console.error('Gap alert acknowledgment error:', error);
        socket.emit('monitoring_error', { error: 'Failed to acknowledge alert' });
      }
    });
  }

  /**
   * Handle Intervention Tracking Events
   */
  handleInterventionTracking(socket) {
    // Start intervention
    socket.on('start_intervention', async (data) => {
      try {
        const { interventionId, studentId, courseId, strategy } = data;
        
        // Store intervention start
        await redisCacheService.set(
          `intervention_${interventionId}`,
          {
            instructorId: socket.userId,
            studentId,
            courseId,
            strategy,
            startedAt: new Date().toISOString(),
            status: 'active'
          },
          86400 // 24 hours TTL
        );

        socket.emit('intervention_started', { interventionId, studentId });

        // Join intervention tracking room
        socket.join(`intervention_${interventionId}`);

      } catch (error) {
        console.error('Intervention start error:', error);
        socket.emit('monitoring_error', { error: 'Failed to start intervention' });
      }
    });

    // Update intervention progress
    socket.on('update_intervention', async (data) => {
      try {
        const { interventionId, progress, notes } = data;
        
        // Get existing intervention data
        const interventionData = await redisCacheService.get(`intervention_${interventionId}`);
        
        if (interventionData) {
          interventionData.progress = progress;
          interventionData.notes = notes;
          interventionData.lastUpdated = new Date().toISOString();
          
          await redisCacheService.set(`intervention_${interventionId}`, interventionData, 86400);
          
          socket.emit('intervention_updated', { interventionId, progress });

          // Notify intervention room
          socket.to(`intervention_${interventionId}`).emit('intervention_progress_update', {
            interventionId,
            progress,
            updatedBy: socket.userId
          });
        }

      } catch (error) {
        console.error('Intervention update error:', error);
        socket.emit('monitoring_error', { error: 'Failed to update intervention' });
      }
    });
  }

  /**
   * Start Real-time Class Updates
   */
  async startRealTimeClassUpdates(socket, courseId, sessionId) {
    const updateInterval = setInterval(async () => {
      try {
        // Check if monitoring is still active
        const monitoringSession = await redisCacheService.get(
          `instructor_monitoring_${socket.userId}_${courseId}`
        );
        
        if (!monitoringSession) {
          clearInterval(updateInterval);
          return;
        }

        // Get live metrics
        const metrics = await this.getLiveClassMetrics(courseId);
        
        socket.emit('realtime_class_update', {
          courseId,
          sessionId,
          metrics,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Real-time update error:', error);
        clearInterval(updateInterval);
      }
    }, 5000); // Update every 5 seconds

    // Store interval for cleanup
    socket.updateInterval = updateInterval;
  }

  /**
   * Start Engagement Updates
   */
  async startEngagementUpdates(socket, courseId, studentIds) {
    const updateInterval = setInterval(async () => {
      try {
        // Check if engagement monitoring is still active
        const engagementSession = await redisCacheService.get(
          `engagement_monitoring_${socket.userId}_${courseId}`
        );
        
        if (!engagementSession) {
          clearInterval(updateInterval);
          return;
        }

        // Get live engagement data
        const engagementData = await this.getLiveEngagementData(courseId, studentIds);
        
        socket.emit('engagement_update', {
          courseId,
          engagementData,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Engagement update error:', error);
        clearInterval(updateInterval);
      }
    }, 3000); // Update every 3 seconds

    // Store interval for cleanup
    socket.engagementInterval = updateInterval;
  }

  /**
   * Get Live Class Metrics
   */
  async getLiveClassMetrics(courseId) {
    try {
      // This would integrate with classMonitoringService
      const metrics = {
        activeStudents: await this.getActiveStudentCount(courseId),
        averageEngagement: await this.getAverageEngagement(courseId),
        completionRate: await this.getCurrentCompletionRate(courseId),
        questionsAsked: await this.getQuestionsAsked(courseId),
        lastActivity: new Date().toISOString()
      };

      return metrics;
    } catch (error) {
      console.error('Live metrics error:', error);
      return null;
    }
  }

  /**
   * Get Live Engagement Data
   */
  async getLiveEngagementData(courseId, studentIds) {
    try {
      // This would integrate with classMonitoringService
      const engagementData = {
        courseId,
        studentEngagement: studentIds.map(studentId => ({
          studentId,
          engagementScore: Math.random() * 100, // Placeholder
          lastActive: new Date().toISOString(),
          currentActivity: 'reading'
        })),
        overallEngagement: Math.random() * 100,
        engagementTrend: 'increasing'
      };

      return engagementData;
    } catch (error) {
      console.error('Live engagement data error:', error);
      return null;
    }
  }

  /**
   * Broadcast Learning Gap Alert
   */
  async broadcastLearningGapAlert(courseId, alert) {
    try {
      const alertRoom = `gap_alerts_${courseId}`;
      
      this.io.of('/instructor').to(alertRoom).emit('learning_gap_alert', {
        ...alert,
        timestamp: new Date().toISOString()
      });

      // Store alert for persistence
      await redisCacheService.set(
        `gap_alert_${alert.id}`,
        alert,
        86400 // 24 hours TTL
      );

    } catch (error) {
      console.error('Gap alert broadcast error:', error);
    }
  }

  /**
   * Broadcast Intervention Recommendation
   */
  async broadcastInterventionRecommendation(courseId, recommendation) {
    try {
      const monitoringRoom = `class_monitor_${courseId}`;
      
      this.io.of('/instructor').to(monitoringRoom).emit('intervention_recommendation', {
        ...recommendation,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Intervention recommendation broadcast error:', error);
    }
  }

  /**
   * Cleanup Instructor Session
   */
  async cleanupInstructorSession(socket) {
    try {
      // Clear update intervals
      if (socket.updateInterval) {
        clearInterval(socket.updateInterval);
      }
      if (socket.engagementInterval) {
        clearInterval(socket.engagementInterval);
      }

      // Remove monitoring sessions
      const keys = await redisCacheService.getKeys(`*monitoring_${socket.userId}_*`);
      for (const key of keys) {
        await redisCacheService.delete(key);
      }

    } catch (error) {
      console.error('Instructor session cleanup error:', error);
    }
  }

  /**
   * Helper Methods for Live Data
   */
  async getActiveStudentCount(courseId) {
    // Placeholder - would integrate with actual monitoring service
    return Math.floor(Math.random() * 50) + 10;
  }

  async getAverageEngagement(courseId) {
    // Placeholder - would integrate with actual monitoring service
    return Math.random() * 100;
  }

  async getCurrentCompletionRate(courseId) {
    // Placeholder - would integrate with actual monitoring service
    return Math.random() * 100;
  }

  async getQuestionsAsked(courseId) {
    // Placeholder - would integrate with actual monitoring service
    return Math.floor(Math.random() * 20);
  }

  async validateInstructorCourseAccess(instructorId, courseId) {
    // Placeholder - would validate instructor has access to course
    return true;
  }

  /**
   * Health check for WebSocket service
   */
  healthCheck() {
    return {
      status: this.io ? 'healthy' : 'unhealthy',
      connections: this.sessionStats.currentConnections,
      rooms: this.activeRooms.size,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;
