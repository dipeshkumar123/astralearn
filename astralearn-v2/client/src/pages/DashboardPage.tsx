import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { ProgressDashboard } from '@/components/ProgressDashboard';
import { EnhancedStudentDashboard } from '@/components/EnhancedStudentDashboard';
import { BookOpen, Users, Trophy, Brain, LogOut } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleBrowseCourses = () => {
    navigate('/courses');
  };

  const handleJoinStudyGroup = () => {
    navigate('/study-groups');
  };

  const handleAskAIAssistant = () => {
    navigate('/ai-assistant');
  };

  const handleCreateCourse = () => {
    navigate('/create-course');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                AstraLearn
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.firstName[0]}{user.lastName[0]}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<LogOut />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.firstName}! 👋
          </h1>
          <p className="text-gray-600">
            Ready to continue your learning journey? Here's what's happening today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="bg-primary-100 rounded-lg p-3">
                <BookOpen className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Courses Enrolled</p>
                <p className="text-2xl font-bold text-gray-900">{user.stats?.coursesEnrolled || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="bg-success-100 rounded-lg p-3">
                <Trophy className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-gray-900">{user.stats?.totalPoints || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="bg-warning-100 rounded-lg p-3">
                <Users className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Study Groups</p>
                <p className="text-2xl font-bold text-gray-900">{user.stats?.studyGroupsJoined || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Level</p>
                <p className="text-2xl font-bold text-gray-900">{user.stats?.level || 1}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <p className="text-sm text-gray-600">
                  Welcome to AstraLearn! Complete your profile to get started.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-success-600 rounded-full"></div>
                <p className="text-sm text-gray-600">
                  Account created successfully
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Button variant="outline" fullWidth onClick={handleBrowseCourses}>
                Browse Courses
              </Button>
              <Button variant="outline" fullWidth onClick={handleJoinStudyGroup}>
                Join Study Group
              </Button>
              <Button variant="outline" fullWidth onClick={handleAskAIAssistant}>
                Ask AI Assistant
              </Button>
              {user.role === 'instructor' && (
                <Button variant="primary" fullWidth onClick={handleCreateCourse}>
                  Create New Course
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Learning Dashboard */}
        <div className="mt-8">
          <EnhancedStudentDashboard userId={user.id} />
        </div>

        {/* Profile Completion */}
        {user.profileCompleteness < 100 && (
          <div className="mt-8 bg-primary-50 border border-primary-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-primary-900">
                  Complete Your Profile
                </h3>
                <p className="text-primary-700 mt-1">
                  Your profile is {user.profileCompleteness}% complete. 
                  Add more information to get personalized recommendations.
                </p>
              </div>
              <Button variant="primary">
                Complete Profile
              </Button>
            </div>
            <div className="mt-4">
              <div className="bg-primary-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${user.profileCompleteness}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
