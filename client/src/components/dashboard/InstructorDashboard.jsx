// Basic Instructor Dashboard - Redirects to Analytics Dashboard
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useAIAssistantStore } from '../../stores/aiAssistantStore';
import EnhancedAIAssistant from '../ai/EnhancedAIAssistant';
import AIToggleButton from '../ai/AIToggleButton';

// Import the main analytics dashboard
import AnalyticsInstructorDashboard from '../analytics/InstructorDashboard';

const InstructorDashboard = () => {
  // AI Assistant integration
  const { updateContext, setAssistantMode } = useAIAssistantStore();
  const location = useLocation();
  const { user } = useAuth();
  
  // Update AI context based on current page and user
  useEffect(() => {
    updateContext({
      page: 'instructor-dashboard',
      userId: user?.id,
      userRole: 'instructor',
      sessionData: {
        path: location.pathname,
        timestamp: Date.now()
      }
    });
    setAssistantMode('teaching-assistant');
  }, [updateContext, setAssistantMode, location, user]);

  return (
    <div className="relative">
      {/* Main Analytics Dashboard */}
      <AnalyticsInstructorDashboard />
      
      {/* Enhanced AI Assistant - Modern, Responsive, Real-time */}
      <EnhancedAIAssistant />
      
      {/* Floating AI Toggle for Mobile */}
      <div className="md:hidden">
        <AIToggleButton 
          variant="floating" 
          position="bottom-right"
          size="medium"
          showLabel={false}
        />
      </div>
    </div>
  );
};

export default InstructorDashboard;
