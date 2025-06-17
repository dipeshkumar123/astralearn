import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Phone,
  PhoneOff,
  Users,
  MessageSquare,
  Settings,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Camera,
  Share2,
  Download,
  Upload,
  FileText,
  Image,
  PenTool,
  Eraser,
  Square,
  Circle,
  Type,
  Palette,
  Undo,
  Redo,
  Save,
  Clock,
  UserPlus,
  Crown,
  Hand
} from 'lucide-react';

/**
 * Live Collaboration Component
 * Real-time video chat, screen sharing, whiteboard, and document collaboration
 */
const LiveCollaboration = () => {
  const [isInSession, setIsInSession] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [activeTab, setActiveTab] = useState('sessions');
  const [mediaState, setMediaState] = useState({
    video: false,
    audio: false,
    screen: false
  });
  
  // Session management
  const [activeSessions, setActiveSessions] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Collaboration tools
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showDocuments, setShowDocuments] = useState(false);

  // Refs for media elements
  const localVideoRef = useRef(null);
  const remoteVideosRef = useRef({});
  useEffect(() => {
    fetchActiveSessions();
    initializeRealTimeCollaboration();
    
    return () => {
      cleanup();
    };
  }, []);

  const fetchActiveSessions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/social-learning/collaboration/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      setActiveSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeRealTimeCollaboration = () => {
    // Setup real-time event listeners
    realTimeIntegrationService.on('collaborationSessionCreated', (data) => {
      setActiveSessions(prev => [...prev, data]);
      console.log('🎉 New collaboration session created:', data);
    });

    realTimeIntegrationService.on('collaborationUserJoined', (data) => {
      if (sessionData && data.sessionId === sessionData.id) {
        setParticipants(prev => [...prev, data.user]);
        console.log('👤 User joined session:', data.user.name);
      }
    });

    realTimeIntegrationService.on('collaborationUserLeft', (data) => {
      if (sessionData && data.sessionId === sessionData.id) {
        setParticipants(prev => prev.filter(p => p.id !== data.user.id));
        console.log('👋 User left session:', data.user.name);
      }
    });

    realTimeIntegrationService.on('screenShareStarted', (data) => {
      console.log('🖥️ Screen sharing started by:', data.user.name);
      // Handle screen share display
    });

    realTimeIntegrationService.on('screenShareStopped', (data) => {
      console.log('🖥️ Screen sharing stopped by:', data.user.name);
      // Handle screen share cleanup
    });

    realTimeIntegrationService.on('documentUpdated', (data) => {
      console.log('📄 Document updated:', data);
      // Handle document updates
    });

    // WebRTC signaling events
    realTimeIntegrationService.on('webrtcOffer', handleWebRTCOffer);
    realTimeIntegrationService.on('webrtcAnswer', handleWebRTCAnswer);
    realTimeIntegrationService.on('webrtcIceCandidate', handleWebRTCIceCandidate);

    // User presence updates
    realTimeIntegrationService.on('userPresenceUpdate', handleUserPresenceUpdate);

    console.log('🔄 Real-time collaboration initialized');
  };
  const startSession = async (sessionData) => {
    try {
      const token = localStorage.getItem('token');
      
      // Create session via real-time service
      realTimeIntegrationService.createCollaborationSession({
        ...sessionData,
        creator: {
          id: 'current-user-id', // Would come from auth context
          name: 'Current User', // Would come from auth context
          avatar: null
        }
      });

      // Also update via REST API for persistence
      const response = await fetch('/api/social-learning/collaboration/start-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });

      if (response.ok) {
        const data = await response.json();
        setSessionData(data.session);
        setIsInSession(true);
        
        // Join the collaboration session via real-time service
        realTimeIntegrationService.joinCollaborationSession(data.session.id, {
          id: 'current-user-id',
          name: 'Current User',
          role: 'host',
          avatar: null
        });

        await initializeWebRTC();
        
        // Start local media
        await startLocalMedia();
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };
  const joinSession = async (sessionId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Join via real-time service first
      realTimeIntegrationService.joinCollaborationSession(sessionId, {
        id: 'current-user-id',
        name: 'Current User', 
        role: 'participant',
        avatar: null
      });

      // Also update via REST API
      const response = await fetch('/api/social-learning/collaboration/join-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId })
      });

      if (response.ok) {
        const data = await response.json();
        setSessionData(data.session);
        setIsInSession(true);
        setParticipants(data.session.participants || []);
        
        // Start local media
        await startLocalMedia();
      }
    } catch (error) {
      console.error('Error joining session:', error);
    }
  };
  const leaveSession = async () => {
    try {
      if (sessionData) {
        // Leave via real-time service first
        realTimeIntegrationService.leaveCollaborationSession(sessionData.id || sessionData.sessionId);
        
        // Update REST API
        const token = localStorage.getItem('token');
        await fetch('/api/social-learning/collaboration/leave-session', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sessionId: sessionData.sessionId || sessionData.id })
        });
      }
      
      // Stop local media
      await stopLocalMedia();
      
      setIsInSession(false);
      setSessionData(null);
      setParticipants([]);
      setMediaState({ video: false, audio: false, screen: false });
      
      // Refresh active sessions
      fetchActiveSessions();
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  };

  const startLocalMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setMediaState(prev => ({ ...prev, video: true, audio: true }));
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const stopLocalMedia = async () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const toggleMedia = async (type) => {
    try {
      if (type === 'screen') {
        if (!mediaState.screen) {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
            video: true, 
            audio: true 
          });
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = screenStream;
          }
          
          setMediaState(prev => ({ ...prev, screen: true }));
        } else {
          // Switch back to camera
          await startLocalMedia();
          setMediaState(prev => ({ ...prev, screen: false }));
        }
      } else {
        // Toggle video or audio
        if (localVideoRef.current && localVideoRef.current.srcObject) {
          const tracks = localVideoRef.current.srcObject.getTracks();
          
          if (type === 'video') {
            const videoTrack = tracks.find(track => track.kind === 'video');
            if (videoTrack) {
              videoTrack.enabled = !mediaState.video;
              setMediaState(prev => ({ ...prev, video: !prev.video }));
            }
          } else if (type === 'audio') {
            const audioTrack = tracks.find(track => track.kind === 'audio');
            if (audioTrack) {
              audioTrack.enabled = !mediaState.audio;
              setMediaState(prev => ({ ...prev, audio: !prev.audio }));
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error toggling ${type}:`, error);
    }
  };  const cleanup = () => {
    stopLocalMedia();
    // Clean up real-time integration
    if (sessionData) {
      realTimeIntegrationService.leaveCollaborationSession(sessionData.id || sessionData.sessionId);
    }
  };

  // ========== WebRTC Real-time Handlers ==========

  const initializeWebRTC = async () => {
    try {
      // Initialize WebRTC peer connections
      console.log('🔄 Initializing WebRTC connections...');
      
      // This would set up the actual WebRTC peer connection
      // For now, just log the initialization
      return Promise.resolve();
    } catch (error) {
      console.error('❌ WebRTC initialization failed:', error);
      throw error;
    }
  };

  const handleWebRTCOffer = async (data) => {
    try {
      console.log('📞 Received WebRTC offer from:', data.sender.name);
      // Handle incoming WebRTC offer
      // Create answer and send back via real-time service
      
      const answer = { /* mock answer data */ };
      realTimeIntegrationService.sendWebRTCSignal(
        sessionData.id || sessionData.sessionId, 
        'answer', 
        answer
      );
    } catch (error) {
      console.error('❌ Error handling WebRTC offer:', error);
    }
  };

  const handleWebRTCAnswer = async (data) => {
    try {
      console.log('📞 Received WebRTC answer from:', data.sender.name);
      // Handle incoming WebRTC answer
    } catch (error) {
      console.error('❌ Error handling WebRTC answer:', error);
    }
  };

  const handleWebRTCIceCandidate = async (data) => {
    try {
      console.log('🧊 Received ICE candidate from:', data.sender.name);
      // Handle incoming ICE candidate
    } catch (error) {
      console.error('❌ Error handling ICE candidate:', error);
    }
  };

  // ========== Enhanced Media Controls ==========

  const startScreenShare = async () => {
    try {
      if (sessionData) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true, 
          audio: true 
        });
        
        // Notify other participants via real-time service
        realTimeIntegrationService.startScreenShare(sessionData.id || sessionData.sessionId, {
          streamId: screenStream.id,
          hasAudio: screenStream.getAudioTracks().length > 0
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        setMediaState(prev => ({ ...prev, screen: true }));
        
        // Handle screen share end
        screenStream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };
      }
    } catch (error) {
      console.error('❌ Error starting screen share:', error);
    }
  };

  const stopScreenShare = async () => {
    try {
      if (sessionData) {
        // Notify other participants
        realTimeIntegrationService.stopScreenShare(sessionData.id || sessionData.sessionId);
        
        // Switch back to camera
        await startLocalMedia();
        setMediaState(prev => ({ ...prev, screen: false }));
      }
    } catch (error) {
      console.error('❌ Error stopping screen share:', error);
    }
  };

  // User presence tracking state
  const [userPresence, setUserPresence] = useState(new Map());
  const [participantStatus, setParticipantStatus] = useState(new Map());

  // User presence tracking functions
  const updateUserPresence = (userId, presenceData) => {
    setUserPresence(prev => {
      const updated = new Map(prev);
      updated.set(userId, {
        ...presenceData,
        lastUpdate: Date.now()
      });
      return updated;
    });

    // Broadcast presence update
    if (realTimeIntegrationService.isConnected()) {
      realTimeIntegrationService.broadcastUserPresence({
        sessionId: currentSession?.id,
        userId: userId,
        presence: presenceData
      });
    }
  };

  const trackParticipantActivity = (userId, activity) => {
    setParticipantStatus(prev => {
      const updated = new Map(prev);
      updated.set(userId, {
        activity: activity,
        timestamp: Date.now(),
        isActive: true
      });
      return updated;
    });
  };

  const handleUserPresenceUpdate = (data) => {
    updateUserPresence(data.userId, data.presence);
    trackParticipantActivity(data.userId, 'presence_update');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
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

  if (isInSession) {
    return <LiveSessionInterface 
      sessionData={sessionData}
      participants={participants}
      mediaState={mediaState}
      localVideoRef={localVideoRef}
      remoteVideosRef={remoteVideosRef}
      onToggleMedia={toggleMedia}
      onLeaveSession={leaveSession}
      showWhiteboard={showWhiteboard}
      setShowWhiteboard={setShowWhiteboard}
      showChat={showChat}
      setShowChat={setShowChat}
      showDocuments={showDocuments}
      setShowDocuments={setShowDocuments}
    />;
  }

  const tabs = [
    { id: 'sessions', label: 'Active Sessions', icon: Video },
    { id: 'create', label: 'Start Session', icon: Users },
    { id: 'scheduled', label: 'Scheduled', icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎥 Live Collaboration
          </h1>
          <p className="text-gray-600">
            Connect with peers through video calls, screen sharing, and real-time collaboration
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
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-3xl font-bold text-purple-600">{activeSessions.length}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Video className="h-6 w-6 text-purple-600" />
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
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-3xl font-bold text-blue-600">
                  {activeSessions.reduce((total, session) => total + (session.participantCount || 0), 0)}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
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
                <p className="text-3xl font-bold text-green-600">12</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
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
                  ? 'bg-purple-100 text-purple-700'
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
          {activeTab === 'sessions' && (
            <SessionsTab 
              activeSessions={activeSessions} 
              onJoinSession={joinSession}
            />
          )}
          {activeTab === 'create' && (
            <CreateSessionTab onStartSession={startSession} />
          )}
          {activeTab === 'scheduled' && (
            <ScheduledSessionsTab />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Active Sessions Tab Component
const SessionsTab = ({ activeSessions, onJoinSession }) => (
  <motion.div
    key="sessions"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
  >
    {activeSessions.length === 0 ? (
      <div className="col-span-full bg-white rounded-xl p-8 shadow-sm text-center">
        <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Sessions</h3>
        <p className="text-gray-600">Start a new session or wait for others to begin</p>
      </div>
    ) : (
      activeSessions.map((session, index) => (
        <motion.div
          key={session.sessionId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{session.title}</h3>
              <p className="text-sm text-gray-600">{session.description}</p>
            </div>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Live
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{session.participantCount || 0} participants</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{session.duration || '0m'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs">
              {session.features?.video && <Video className="h-4 w-4 text-blue-600" />}
              {session.features?.audio && <Mic className="h-4 w-4 text-green-600" />}
              {session.features?.screen && <Monitor className="h-4 w-4 text-purple-600" />}
              {session.features?.whiteboard && <PenTool className="h-4 w-4 text-orange-600" />}
            </div>
            <button
              onClick={() => onJoinSession(session.sessionId)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              Join Session
            </button>
          </div>
        </motion.div>
      ))
    )}
  </motion.div>
);

// Create Session Tab Component
const CreateSessionTab = ({ onStartSession }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'study-session',
    maxParticipants: 10,
    features: {
      video: true,
      audio: true,
      screen: true,
      whiteboard: true,
      chat: true,
      documents: false
    },
    privacy: 'public'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onStartSession(formData);
  };

  return (
    <motion.div
      key="create"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Start New Session</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter session title..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Describe your session..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="study-session">Study Session</option>
                <option value="tutoring">Tutoring</option>
                <option value="presentation">Presentation</option>
                <option value="workshop">Workshop</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Participants
              </label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                min={2}
                max={50}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Features
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'video', label: 'Video Chat', icon: Video },
                { key: 'audio', label: 'Audio Chat', icon: Mic },
                { key: 'screen', label: 'Screen Share', icon: Monitor },
                { key: 'whiteboard', label: 'Whiteboard', icon: PenTool },
                { key: 'chat', label: 'Text Chat', icon: MessageSquare },
                { key: 'documents', label: 'Document Share', icon: FileText }
              ].map(feature => (
                <label key={feature.key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.features[feature.key]}
                    onChange={(e) => setFormData({
                      ...formData,
                      features: {
                        ...formData.features,
                        [feature.key]: e.target.checked
                      }
                    })}
                    className="mr-2"
                  />
                  <feature.icon className="h-4 w-4 mr-2 text-gray-600" />
                  <span className="text-sm">{feature.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Start Session
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

// Scheduled Sessions Tab Component
const ScheduledSessionsTab = () => (
  <motion.div
    key="scheduled"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  >
    <div className="bg-white rounded-xl p-8 shadow-sm text-center">
      <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Scheduled Sessions</h3>
      <p className="text-gray-600">Schedule sessions with your study groups</p>
    </div>
  </motion.div>
);

// Live Session Interface Component
const LiveSessionInterface = ({ 
  sessionData, 
  participants, 
  mediaState, 
  localVideoRef, 
  remoteVideosRef, 
  onToggleMedia, 
  onLeaveSession,
  showWhiteboard,
  setShowWhiteboard,
  showChat,
  setShowChat,
  showDocuments,
  setShowDocuments
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-gray-900 flex flex-col`}>
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{sessionData.title}</h2>
          <p className="text-sm text-gray-400">{participants.length} participants</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-gray-700 rounded"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
          <button
            onClick={onLeaveSession}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
          >
            <PhoneOff className="h-4 w-4 mr-2 inline" />
            Leave
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative">
          {/* Remote Videos Grid */}
          <div className="grid grid-cols-2 gap-2 h-full p-4">
            {participants.map(participant => (
              <div key={participant.userId} className="bg-gray-800 rounded-lg relative overflow-hidden">
                <video
                  ref={el => remoteVideosRef.current[participant.userId] = el}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {participant.name}
                  {participant.isHost && <Crown className="h-3 w-3 ml-1 inline text-yellow-400" />}
                </div>
              </div>
            ))}
          </div>

          {/* Local Video (Picture-in-Picture) */}
          <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              You
            </div>
          </div>

          {/* Whiteboard Overlay */}
          {showWhiteboard && (
            <WhiteboardComponent onClose={() => setShowWhiteboard(false)} />
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-100 flex flex-col">
          {/* Sidebar Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setShowChat(true)}
              className={`flex-1 p-3 text-sm font-medium ${showChat ? 'bg-white text-blue-600' : 'text-gray-600'}`}
            >
              <MessageSquare className="h-4 w-4 mr-2 inline" />
              Chat
            </button>
            <button
              onClick={() => setShowDocuments(true)}
              className={`flex-1 p-3 text-sm font-medium ${showDocuments ? 'bg-white text-blue-600' : 'text-gray-600'}`}
            >
              <FileText className="h-4 w-4 mr-2 inline" />
              Docs
            </button>
          </div>

          {/* Chat or Documents */}
          <div className="flex-1 overflow-hidden">
            {showChat && <ChatComponent />}
            {showDocuments && <DocumentsComponent />}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex items-center justify-center space-x-4">
        <button
          onClick={() => onToggleMedia('audio')}
          className={`p-3 rounded-full ${mediaState.audio ? 'bg-gray-600' : 'bg-red-600'}`}
        >
          {mediaState.audio ? <Mic className="h-5 w-5 text-white" /> : <MicOff className="h-5 w-5 text-white" />}
        </button>
        
        <button
          onClick={() => onToggleMedia('video')}
          className={`p-3 rounded-full ${mediaState.video ? 'bg-gray-600' : 'bg-red-600'}`}
        >
          {mediaState.video ? <Video className="h-5 w-5 text-white" /> : <VideoOff className="h-5 w-5 text-white" />}
        </button>
        
        <button
          onClick={() => onToggleMedia('screen')}
          className={`p-3 rounded-full ${mediaState.screen ? 'bg-blue-600' : 'bg-gray-600'}`}
        >
          {mediaState.screen ? <MonitorOff className="h-5 w-5 text-white" /> : <Monitor className="h-5 w-5 text-white" />}
        </button>
        
        <button
          onClick={() => setShowWhiteboard(!showWhiteboard)}
          className={`p-3 rounded-full ${showWhiteboard ? 'bg-orange-600' : 'bg-gray-600'}`}
        >
          <PenTool className="h-5 w-5 text-white" />
        </button>
        
        <button className="p-3 rounded-full bg-gray-600">
          <Hand className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  );
};

// Chat Component
const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: Date.now(),
        text: newMessage,
        sender: 'You',
        timestamp: new Date()
      }]);
      setNewMessage('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {messages.map(message => (
          <div key={message.id} className="text-sm">
            <div className="font-medium text-gray-900">{message.sender}</div>
            <div className="text-gray-600">{message.text}</div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

// Documents Component
const DocumentsComponent = () => (
  <div className="h-full p-4">
    <div className="text-center text-gray-500">
      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
      <p>No documents shared yet</p>
      <button className="mt-2 text-blue-600 text-sm">Upload Document</button>
    </div>
  </div>
);

// Whiteboard Component
const WhiteboardComponent = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');

  return (
    <div className="absolute inset-4 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded ${tool === 'pen' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
          >
            <PenTool className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded ${tool === 'eraser' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
          >
            <Eraser className="h-4 w-4" />
          </button>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded"
          />
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ×
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ height: 'calc(100% - 64px)' }}
      />
    </div>
  );
};

export default LiveCollaboration;
