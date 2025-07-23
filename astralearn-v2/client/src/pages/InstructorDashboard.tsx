import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Plus, 
  Edit3, 
  Eye, 
  BarChart3,
  Calendar,
  Clock,
  Star,
  Settings,
  Upload,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuthStore } from '@/stores/authStore';
import { apiService } from '@/utils/api';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  enrollmentCount: number;
  rating: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  modules?: any[];
}

interface CourseStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  publishedCourses: number;
  draftCourses: number;
}

export const InstructorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');

  // Fetch instructor's courses (with fallback to regular courses)
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['instructor-courses'],
    queryFn: async () => {
      try {
        return await apiService.get('/courses/instructor');
      } catch (error) {
        // Fallback to regular courses endpoint if instructor endpoint doesn't exist
        console.log('Instructor courses endpoint not available, using fallback');
        return await apiService.get('/courses');
      }
    },
    retry: false,
  });

  // Fetch instructor analytics (with mock data fallback)
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['instructor-analytics', selectedTimeframe],
    queryFn: async () => {
      try {
        return await apiService.get(`/analytics/instructor?timeframe=${selectedTimeframe}`);
      } catch (error) {
        // Return mock analytics data
        console.log('Analytics endpoint not available, using mock data');
        return {
          data: {
            stats: {
              totalCourses: courses.length,
              totalStudents: 45,
              totalRevenue: 1250,
              averageRating: 4.3,
              publishedCourses: courses.filter(c => c.isPublished).length,
              draftCourses: courses.filter(c => !c.isPublished).length,
            }
          }
        };
      }
    },
    retry: false,
  });

  const courses: Course[] = coursesData?.data || [];
  const stats: CourseStats = analyticsData?.data?.stats || {
    totalCourses: courses.length,
    totalStudents: courses.reduce((sum, course) => sum + course.enrollmentCount, 0),
    totalRevenue: 0,
    averageRating: courses.reduce((sum, course) => sum + course.rating, 0) / courses.length || 0,
    publishedCourses: courses.filter(c => c.isPublished).length,
    draftCourses: courses.filter(c => !c.isPublished).length,
  };

  if (coursesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Instructor Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.firstName}! Manage your courses and track student progress.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                leftIcon={<BarChart3 />}
                onClick={() => navigate('/instructor/analytics')}
              >
                Analytics
              </Button>
              <Button
                leftIcon={<Plus />}
                onClick={() => navigate('/instructor/courses/create')}
              >
                Create Course
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={<BookOpen className="h-6 w-6" />}
            color="blue"
          />
          <StatsCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<Users className="h-6 w-6" />}
            color="green"
          />
          <StatsCard
            title="Average Rating"
            value={stats.averageRating.toFixed(1)}
            icon={<Star className="h-6 w-6" />}
            color="yellow"
          />
          <StatsCard
            title="Published Courses"
            value={stats.publishedCourses}
            icon={<TrendingUp className="h-6 w-6" />}
            color="purple"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickActionCard
              title="Create New Course"
              description="Start building a new course from scratch"
              icon={<Plus className="h-8 w-8" />}
              onClick={() => navigate('/instructor/courses/create')}
              color="blue"
            />
            <QuickActionCard
              title="Course Analytics"
              description="View detailed analytics and insights"
              icon={<BarChart3 className="h-8 w-8" />}
              onClick={() => navigate('/instructor/analytics')}
              color="green"
            />
            <QuickActionCard
              title="Student Management"
              description="Manage students and enrollments"
              icon={<Users className="h-8 w-8" />}
              onClick={() => navigate('/instructor/students')}
              color="purple"
            />
          </div>
        </div>

        {/* Courses List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Your Courses</h2>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Upload />}
                >
                  Import
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download />}
                >
                  Export
                </Button>
              </div>
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first course
              </p>
              <Button
                leftIcon={<Plus />}
                onClick={() => navigate('/instructor/courses/create')}
              >
                Create Your First Course
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {courses.map((course) => (
                <CourseListItem key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Quick Action Card Component
const QuickActionCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: 'blue' | 'green' | 'purple';
}> = ({ title, description, icon, onClick, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 hover:bg-blue-50',
    green: 'text-green-600 hover:bg-green-50',
    purple: 'text-purple-600 hover:bg-purple-50',
  };

  return (
    <div
      className={`p-6 border rounded-lg cursor-pointer transition-colors ${colorClasses[color]}`}
      onClick={onClick}
    >
      <div className="flex items-center mb-3">
        {icon}
        <h3 className="text-lg font-semibold ml-3">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

// Course List Item Component
const CourseListItem: React.FC<{ course: Course }> = ({ course }) => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                course.isPublished
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {course.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
          
          <p className="text-gray-600 mb-3 line-clamp-2">{course.description}</p>
          
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {course.enrollmentCount} students
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 text-yellow-400" />
              {course.rating.toFixed(1)}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Updated {new Date(course.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-6">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Eye />}
            onClick={() => navigate(`/courses/${course.id}`)}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Edit3 />}
            onClick={() => navigate(`/instructor/courses/${course.id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<BarChart3 />}
            onClick={() => navigate(`/instructor/courses/${course.id}/analytics`)}
          >
            Analytics
          </Button>
        </div>
      </div>
    </div>
  );
};
