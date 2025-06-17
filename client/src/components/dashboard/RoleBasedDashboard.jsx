/**
 * Role-Based Dashboard Router
 * Routes users to appropriate dashboards based on their roles
 */

import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import StudentDashboard from './StudentDashboard';
import InstructorDashboard from './InstructorDashboard';
import AdminDashboard from './AdminDashboard';

const RoleBasedDashboard = ({ setCurrentView }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // This will be handled by the auth provider
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'student':
      return <StudentDashboard setCurrentView={setCurrentView} />;
    case 'instructor':
      return <InstructorDashboard setCurrentView={setCurrentView} />;
    case 'admin':
      return <AdminDashboard setCurrentView={setCurrentView} />;
    default:
      return <StudentDashboard setCurrentView={setCurrentView} />; // Default to student dashboard
  }
};

export default RoleBasedDashboard;
