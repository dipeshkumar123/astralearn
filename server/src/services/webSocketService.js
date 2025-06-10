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
   * Utility methods
   */
  updateUserActivity(userId) {
    const user = this.connectedUsers.get(userId);
    if (user) {
      user.lastActivity = new Date();
    }
  }

  updateUserRoom(userId, roomName) {
    const user = this.connectedUsers.get(userId);
    if (user) {
      user.currentRoom = roomName;
    }
  }

  broadcastUserStatus(userId, status) {
    this.io.emit('user:status-changed', {
      userId,
      status,
      timestamp: new Date().toISOString()
    });
  }

  getRoomParticipants(roomName) {
    const participants = [];
    const room = this.io.sockets.adapter.rooms.get(roomName);
    
    if (room) {
      for (const socketId of room) {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket && socket.userData) {
          participants.push(socket.userData);
        }
      }
    }
    
    return participants;
  }

  checkRateLimit(userId, eventType) {
    const key = `${userId}:${eventType}`;
    const now = Date.now();
    
    if (!this.rateLimits.has(key)) {
      this.rateLimits.set(key, {
        count: 1,
        resetTime: now + this.rateLimit.window
      });
      return true;
    }

    const limit = this.rateLimits.get(key);
    
    if (now > limit.resetTime) {
      // Reset the limit
      limit.count = 1;
      limit.resetTime = now + this.rateLimit.window;
      return true;
    }

    if (limit.count >= this.rateLimit.maxEvents) {
      return false; // Rate limit exceeded
    }

    limit.count++;
    return true;
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
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;
