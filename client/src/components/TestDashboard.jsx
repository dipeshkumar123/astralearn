/**
 * Test Dashboard Directly - Bypass Authentication
 * Use this to test if the StudentDashboard works without auth issues
 */

import React from 'react';
import StudentDashboard from '../components/dashboard/StudentDashboard';

// Mock authentication context
const mockAuthContext = {
  user: {
    id: 'test-user-123',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    role: 'student'
  },
  token: 'demo-token',
  loading: false,
  isAuthenticated: true,
  isDemoMode: false
};

const TestDashboard = () => {
  console.log('🧪 TestDashboard component loaded');
  
  return (
    <div>
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <strong>Test Mode:</strong> This is a direct test of the StudentDashboard component
      </div>
      <StudentDashboard setCurrentView={(view) => console.log('View change:', view)} />
    </div>
  );
};

export default TestDashboard;
