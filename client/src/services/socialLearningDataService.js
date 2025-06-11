/**
 * Social Learning Data Service
 * Handles database integration and persistence for social learning features
 * Works with real-time integration service for live updates
 */

class SocialLearningDataService {
  constructor() {
    this.baseURL = '/api/social-learning';
    this.token = null;
  }

  setAuthToken(token) {
    this.token = token;
  }

  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token || localStorage.getItem('token')}`
    };
  }

  // ========== Discussion Forums Data ==========

  async createDiscussion(discussionData) {
    try {
      const response = await fetch(`${this.baseURL}/discussions/create`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(discussionData)
      });

      const result = await response.json();
      console.log('📝 Discussion created:', result);
      
      return result;
    } catch (error) {
      console.error('Error creating discussion:', error);
      throw error;
    }
  }

  async getDiscussions(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${this.baseURL}/discussions?${queryParams}`, {
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      return result.discussions || [];
    } catch (error) {
      console.error('Error fetching discussions:', error);
      return [];
    }
  }

  async voteOnDiscussion(discussionId, voteType) {
    try {
      const response = await fetch(`${this.baseURL}/discussions/vote`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ discussionId, voteType })
      });

      const result = await response.json();
      console.log('👍 Vote recorded:', result);
      
      return result;
    } catch (error) {
      console.error('Error voting on discussion:', error);
      throw error;
    }
  }

  async replyToDiscussion(discussionId, replyData) {
    try {
      const response = await fetch(`${this.baseURL}/discussions/${discussionId}/replies`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(replyData)
      });

      const result = await response.json();
      console.log('💭 Reply posted:', result);
      
      return result;
    } catch (error) {
      console.error('Error posting reply:', error);
      throw error;
    }
  }

  // ========== Study Groups Data ==========

  async createStudyGroup(groupData) {
    try {
      const response = await fetch(`${this.baseURL}/study-groups/create`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(groupData)
      });

      const result = await response.json();
      console.log('👥 Study group created:', result);
      
      return result;
    } catch (error) {
      console.error('Error creating study group:', error);
      throw error;
    }
  }

  async getStudyGroups(userId) {
    try {
      const response = await fetch(`${this.baseURL}/study-groups?userId=${userId}`, {
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      return result.groups || [];
    } catch (error) {
      console.error('Error fetching study groups:', error);
      return [];
    }
  }

  async joinStudyGroup(groupId) {
    try {
      const response = await fetch(`${this.baseURL}/study-groups/${groupId}/join`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      console.log('🚪 Joined study group:', result);
      
      return result;
    } catch (error) {
      console.error('Error joining study group:', error);
      throw error;
    }
  }

  async sendGroupMessage(groupId, messageData) {
    try {
      const response = await fetch(`${this.baseURL}/study-groups/${groupId}/messages`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(messageData)
      });

      const result = await response.json();
      console.log('💬 Group message sent:', result);
      
      return result;
    } catch (error) {
      console.error('Error sending group message:', error);
      throw error;
    }
  }

  // ========== Social Activities Data ==========

  async getSocialActivities(userId) {
    try {
      const response = await fetch(`${this.baseURL}/activities?userId=${userId}`, {
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      return result.activities || [];
    } catch (error) {
      console.error('Error fetching social activities:', error);
      return [];
    }
  }

  async recordSocialActivity(activityData) {
    try {
      const response = await fetch(`${this.baseURL}/activities/record`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(activityData)
      });

      const result = await response.json();
      console.log('📊 Social activity recorded:', result);
      
      return result;
    } catch (error) {
      console.error('Error recording social activity:', error);
      throw error;
    }
  }

  // ========== Study Buddy System Data ==========

  async sendStudyBuddyRequest(targetUserId, message) {
    try {
      const response = await fetch(`${this.baseURL}/study-buddies/request`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ targetUserId, message })
      });

      const result = await response.json();
      console.log('🤝 Study buddy request sent:', result);
      
      return result;
    } catch (error) {
      console.error('Error sending study buddy request:', error);
      throw error;
    }
  }

  async getStudyBuddyRequests() {
    try {
      const response = await fetch(`${this.baseURL}/study-buddies/requests`, {
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      return result.requests || [];
    } catch (error) {
      console.error('Error fetching study buddy requests:', error);
      return [];
    }
  }

  async respondToStudyBuddyRequest(requestId, response) {
    try {
      const apiResponse = await fetch(`${this.baseURL}/study-buddies/requests/${requestId}/respond`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ response })
      });

      const result = await apiResponse.json();
      console.log('✅ Study buddy request responded:', result);
      
      return result;
    } catch (error) {
      console.error('Error responding to study buddy request:', error);
      throw error;
    }
  }

  async getStudyBuddies() {
    try {
      const response = await fetch(`${this.baseURL}/study-buddies`, {
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      return result.buddies || [];
    } catch (error) {
      console.error('Error fetching study buddies:', error);
      return [];
    }
  }

  // ========== Collaboration Sessions Data ==========

  async createCollaborationSession(sessionData) {
    try {
      const response = await fetch(`${this.baseURL}/collaboration/sessions/create`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(sessionData)
      });

      const result = await response.json();
      console.log('🎯 Collaboration session created:', result);
      
      return result;
    } catch (error) {
      console.error('Error creating collaboration session:', error);
      throw error;
    }
  }

  async getCollaborationSessions(userId) {
    try {
      const response = await fetch(`${this.baseURL}/collaboration/sessions?userId=${userId}`, {
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      return result.sessions || [];
    } catch (error) {
      console.error('Error fetching collaboration sessions:', error);
      return [];
    }
  }

  async joinCollaborationSession(sessionId) {
    try {
      const response = await fetch(`${this.baseURL}/collaboration/sessions/${sessionId}/join`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      console.log('🎭 Joined collaboration session:', result);
      
      return result;
    } catch (error) {
      console.error('Error joining collaboration session:', error);
      throw error;
    }
  }

  // ========== Whiteboard Data ==========

  async saveWhiteboardState(sessionId, whiteboardData) {
    try {
      const response = await fetch(`${this.baseURL}/collaboration/whiteboard/${sessionId}/save`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(whiteboardData)
      });

      const result = await response.json();
      console.log('🎨 Whiteboard state saved:', result);
      
      return result;
    } catch (error) {
      console.error('Error saving whiteboard state:', error);
      throw error;
    }
  }

  async loadWhiteboardState(sessionId) {
    try {
      const response = await fetch(`${this.baseURL}/collaboration/whiteboard/${sessionId}`, {
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      return result.whiteboardData || null;
    } catch (error) {
      console.error('Error loading whiteboard state:', error);
      return null;
    }
  }

  // ========== Notifications Data ==========

  async getNotifications(userId) {
    try {
      const response = await fetch(`${this.baseURL}/notifications?userId=${userId}`, {
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      return result.notifications || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      const response = await fetch(`${this.baseURL}/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      console.log('✅ Notification marked as read:', result);
      
      return result;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllNotificationsAsRead(userId) {
    try {
      const response = await fetch(`${this.baseURL}/notifications/read-all`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ userId })
      });

      const result = await response.json();
      console.log('✅ All notifications marked as read:', result);
      
      return result;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // ========== Analytics and Reporting ==========

  async getSocialLearningAnalytics(userId, timeRange = '30d') {
    try {
      const response = await fetch(`${this.baseURL}/analytics?userId=${userId}&timeRange=${timeRange}`, {
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      return result.analytics || {};
    } catch (error) {
      console.error('Error fetching social learning analytics:', error);
      return {};
    }
  }

  // ========== Utility Methods ==========

  async uploadFile(file, context = 'general') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('context', context);

      const response = await fetch(`${this.baseURL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token || localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();
      console.log('📁 File uploaded:', result);
      
      return result;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async syncRealTimeChanges(entityType, entityId, changes) {
    try {
      const response = await fetch(`${this.baseURL}/sync/${entityType}/${entityId}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ changes, timestamp: Date.now() })
      });

      const result = await response.json();
      console.log('🔄 Real-time changes synced:', result);
      
      return result;
    } catch (error) {
      console.error('Error syncing real-time changes:', error);
      throw error;
    }
  }
}

// Create singleton instance
const socialLearningDataService = new SocialLearningDataService();

export default socialLearningDataService;
