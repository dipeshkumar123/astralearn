import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  MapPin,
  Clock,
  Star,
  MessageCircle,
  Video,
  BookOpen,
  Settings,
  UserPlus,
  ChevronRight,
  Eye,
  Lock,
  Globe,
  Crown,
  Shield,
  User,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';

// Import real-time integration service
import realTimeIntegrationService from '../../services/realTimeIntegrationService';

/**
 * Study Groups Hub Component
 * Comprehensive interface for study group management and discovery
 */
const StudyGroupsHub = () => {
  const [activeTab, setActiveTab] = useState('my-groups');
  const [studyGroups, setStudyGroups] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeGroupMembers, setActiveGroupMembers] = useState(new Map());
  const [groupMessages, setGroupMessages] = useState(new Map());

  // Member presence tracking state
  const [memberPresence, setMemberPresence] = useState(new Map());
  const [onlineMembers, setOnlineMembers] = useState(new Set());

  useEffect(() => {
    fetchStudyGroups();
    initializeRealTimeFeatures();
    
    return () => {
      cleanupRealTimeFeatures();
    };
  }, []);

  const fetchStudyGroups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch user's study groups
      const myGroupsResponse = await fetch('/api/social-learning/study-groups/my-groups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const myGroupsData = await myGroupsResponse.json();

      // Fetch available groups to join
      const availableResponse = await fetch('/api/social-learning/study-groups/discover', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const availableData = await availableResponse.json();

      setStudyGroups(myGroupsData.studyGroups || []);
      setAvailableGroups(availableData.studyGroups || []);
    } catch (error) {
      console.error('Error fetching study groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (groupData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/social-learning/study-groups/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(groupData)
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchStudyGroups(); // Refresh the groups
      }
    } catch (error) {
      console.error('Error creating study group:', error);
    }
  };

  const handleJoinGroup = async (groupId, inviteCode = null) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/social-learning/study-groups/join', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ groupId, inviteCode })
      });

      if (response.ok) {
        fetchStudyGroups(); // Refresh the groups
      }
    } catch (error) {
      console.error('Error joining study group:', error);
    }
  };

  // ========== Real-time Study Group Methods ==========

  const joinGroupRoom = (groupId) => {
    realTimeIntegrationService.joinStudyGroupRoom(groupId);
    console.log(`📚 Joined study group room: ${groupId}`);
  };

  const leaveGroupRoom = (groupId) => {
    realTimeIntegrationService.leaveStudyGroupRoom(groupId);
    console.log(`👋 Left study group room: ${groupId}`);
  };

  const sendGroupMessage = async (groupId, message) => {
    try {
      // Send via real-time service
      realTimeIntegrationService.sendStudyGroupMessage(groupId, {
        content: message,
        type: 'text',
        timestamp: new Date().toISOString()
      });

      // Also persist via REST API
      const token = localStorage.getItem('token');
      await fetch('/api/social-learning/study-groups/send-message', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ groupId, message })
      });

      console.log(`💬 Message sent to group ${groupId}`);
    } catch (error) {
      console.error('Error sending group message:', error);
    }
  };

  const startLiveStudySession = async (groupId, sessionData) => {
    try {
      // Start via real-time service
      realTimeIntegrationService.startLiveStudySession(groupId, sessionData);

      // Update via REST API
      const token = localStorage.getItem('token');
      await fetch('/api/social-learning/study-groups/start-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ groupId, sessionData })
      });

      console.log(`🎓 Live study session started for group ${groupId}`);
    } catch (error) {
      console.error('Error starting study session:', error);
    }
  };

  const handleRealTimeJoinGroup = async (groupId, inviteCode = null) => {
    try {
      // Join via REST API first
      await handleJoinGroup(groupId, inviteCode);
      
      // Then join the real-time room
      joinGroupRoom(groupId);
      
      console.log(`🚪 Joined group ${groupId} with real-time features`);
    } catch (error) {
      console.error('Error joining group with real-time features:', error);
    }
  };

  const filteredGroups = availableGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || group.subject === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const initializeRealTimeFeatures = () => {
    // Setup real-time event listeners for study groups
    realTimeIntegrationService.on('studyGroupMemberJoined', (data) => {
      setActiveGroupMembers(prev => {
        const updated = new Map(prev);
        const members = updated.get(data.groupId) || [];
        updated.set(data.groupId, [...members, data.user]);
        return updated;
      });
      console.log('👤 Member joined study group:', data);
    });

    realTimeIntegrationService.on('studyGroupMemberLeft', (data) => {
      setActiveGroupMembers(prev => {
        const updated = new Map(prev);
        const members = updated.get(data.groupId) || [];
        updated.set(data.groupId, members.filter(m => m.id !== data.user.id));
        return updated;
      });
      console.log('👋 Member left study group:', data);
    });

    realTimeIntegrationService.on('studyGroupMessage', (data) => {
      setGroupMessages(prev => {
        const updated = new Map(prev);
        const messages = updated.get(data.groupId) || [];
        updated.set(data.groupId, [...messages, data].slice(-20)); // Keep latest 20 messages
        return updated;
      });
      console.log('💬 New study group message:', data);
    });

    realTimeIntegrationService.on('studyGroupActivityUpdate', (data) => {
      setStudyGroups(prev => prev.map(group => 
        group.id === data.groupId 
          ? { ...group, lastActivity: data.timestamp, activityType: data.type }
          : group
      ));
      console.log('📚 Study group activity updated:', data);
    });

    realTimeIntegrationService.on('studySessionStarted', (data) => {
      setStudyGroups(prev => prev.map(group => 
        group.id === data.groupId 
          ? { ...group, hasActiveSession: true, sessionData: data.sessionData }
          : group
      ));
      console.log('🎓 Study session started:', data);
    });

    realTimeIntegrationService.on('studySessionEnded', (data) => {
      setStudyGroups(prev => prev.map(group => 
        group.id === data.groupId 
          ? { ...group, hasActiveSession: false, sessionData: null }
          : group
      ));
      console.log('📖 Study session ended:', data);
    });

    // Member presence events
    realTimeIntegrationService.on('memberPresenceUpdate', (data) => {
      updateMemberPresence(data.memberId, data.status);
      console.log('🟢 Member presence updated:', data);
    });

    realTimeIntegrationService.on('memberActivity', (data) => {
      trackMemberActivity(data.memberId, data.activity);
      console.log('🛠️ Member activity tracked:', data);
    });

    console.log('🔄 Study groups real-time features initialized');
  };

  const cleanupRealTimeFeatures = () => {
    // Remove event listeners
    realTimeIntegrationService.off('studyGroupMemberJoined');
    realTimeIntegrationService.off('studyGroupMemberLeft');
    realTimeIntegrationService.off('studyGroupMessage');
    realTimeIntegrationService.off('studyGroupActivityUpdate');
    realTimeIntegrationService.off('studySessionStarted');
    realTimeIntegrationService.off('studySessionEnded');
    realTimeIntegrationService.off('memberPresenceUpdate');
    realTimeIntegrationService.off('memberActivity');
    
    console.log('🧹 Study groups real-time features cleaned up');
  };

  // Member presence tracking functions
  const updateMemberPresence = (memberId, status) => {
    setMemberPresence(prev => {
      const updated = new Map(prev);
      updated.set(memberId, {
        status: status,
        lastSeen: Date.now(),
        isTyping: false
      });
      return updated;
    });

    if (status === 'online') {
      setOnlineMembers(prev => new Set([...prev, memberId]));
    } else {
      setOnlineMembers(prev => {
        const updated = new Set(prev);
        updated.delete(memberId);
        return updated;
      });
    }
  };

  const trackMemberActivity = (memberId, activity) => {
    setMemberPresence(prev => {
      const updated = new Map(prev);
      const member = updated.get(memberId) || {};
      updated.set(memberId, {
        ...member,
        lastActivity: activity,
        lastSeen: Date.now()
      });
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'my-groups', label: 'My Groups', icon: Users },
    { id: 'discover', label: 'Discover', icon: Search },
    { id: 'create', label: 'Create Group', icon: Plus }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            👥 Study Groups
          </h1>
          <p className="text-gray-600">
            Join or create study groups to learn collaboratively with your peers
          </p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">My Groups</p>
                <p className="text-3xl font-bold text-blue-600">{studyGroups.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-3xl font-bold text-green-600">3</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Video className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Hours</p>
                <p className="text-3xl font-bold text-purple-600">48</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'my-groups' && (
            <motion.div
              key="my-groups"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <MyGroupsSection studyGroups={studyGroups} />
            </motion.div>
          )}

          {activeTab === 'discover' && (
            <motion.div
              key="discover"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DiscoverGroupsSection 
                groups={filteredGroups}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedFilter={selectedFilter}
                setSelectedFilter={setSelectedFilter}
                onJoinGroup={handleJoinGroup}
              />
            </motion.div>
          )}

          {activeTab === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CreateGroupSection onCreateGroup={handleCreateGroup} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// My Groups Section Component
const MyGroupsSection = ({ studyGroups }) => {
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'moderator': return <Shield className="h-4 w-4 text-blue-600" />;
      case 'mentor': return <Star className="h-4 w-4 text-purple-600" />;
      default: return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-yellow-100 text-yellow-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      case 'mentor': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (studyGroups.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm text-center">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Study Groups Yet</h3>
        <p className="text-gray-600 mb-6">Join or create your first study group to start collaborating!</p>
        <div className="flex justify-center space-x-4">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Discover Groups
          </button>
          <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors">
            Create Group
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {studyGroups.map((group, index) => (
        <motion.div
          key={group.groupId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {group.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{group.description}</p>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(group.userRole)}`}>
                  {getRoleIcon(group.userRole)}
                  <span className="ml-1 capitalize">{group.userRole}</span>
                </span>
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                  {group.subject}
                </span>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{group.members?.length || 0} members</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>Last active {group.lastActive || '2h ago'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <MessageCircle className="h-4 w-4 text-blue-600" />
              </button>
              <button className="p-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <Video className="h-4 w-4 text-green-600" />
              </button>
              <button className="p-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <Calendar className="h-4 w-4 text-purple-600" />
              </button>
            </div>
            <button className="flex items-center text-blue-600 hover:text-blue-700">
              <span className="text-sm mr-1">View Group</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Discover Groups Section Component
const DiscoverGroupsSection = ({ 
  groups, 
  searchTerm, 
  setSearchTerm, 
  selectedFilter, 
  setSelectedFilter, 
  onJoinGroup 
}) => {
  const subjects = ['all', 'Mathematics', 'Physics', 'Chemistry', 'Programming', 'Biology', 'Literature'];

  const getPrivacyIcon = (type) => {
    switch (type) {
      case 'public': return <Globe className="h-4 w-4 text-green-600" />;
      case 'private': return <Lock className="h-4 w-4 text-red-600" />;
      default: return <Eye className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search study groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject === 'all' ? 'All Subjects' : subject}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Groups Found</h3>
          <p className="text-gray-600">Try adjusting your search terms or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {groups.map((group, index) => (
            <motion.div
              key={group.groupId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{group.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {group.subject}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full flex items-center">
                      {getPrivacyIcon(group.type)}
                      <span className="ml-1 capitalize">{group.type}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{group.memberCount || 0}/{group.maxMembers || 20}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  <span>{group.rating || 4.5}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Created by {group.createdBy?.name || 'Unknown'}
                </div>
                <button
                  onClick={() => onJoinGroup(group.groupId)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <UserPlus className="h-4 w-4 mr-1 inline" />
                  Join Group
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// Create Group Section Component
const CreateGroupSection = ({ onCreateGroup }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    type: 'public',
    maxMembers: 20,
    isPublic: true,
    allowInvites: true,
    requireApproval: false
  });

  const [errors, setErrors] = useState({});

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Programming', 'Biology', 'Literature', 'History', 'Economics'];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Group name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onCreateGroup(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Study Group</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter group name..."
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe your study group..."
            />
            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.subject ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select subject...</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              {errors.subject && <p className="text-red-600 text-sm mt-1">{errors.subject}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Members
              </label>
              <input
                type="number"
                value={formData.maxMembers}
                onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
                min={2}
                max={50}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Privacy Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Privacy Settings
            </label>
            <div className="space-y-3">
              <div>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="public"
                    checked={formData.type === 'public'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="mr-2"
                  />
                  <Globe className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm">Public - Anyone can find and join</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="invite-only"
                    checked={formData.type === 'invite-only'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="mr-2"
                  />
                  <Eye className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm">Invite Only - Members must be invited</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="private"
                    checked={formData.type === 'private'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="mr-2"
                  />
                  <Lock className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-sm">Private - Hidden from search</span>
                </label>
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Group Settings
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.allowInvites}
                  onChange={(e) => setFormData({ ...formData, allowInvites: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">Allow members to invite others</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.requireApproval}
                  onChange={(e) => setFormData({ ...formData, requireApproval: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">Require approval for new members</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudyGroupsHub;
