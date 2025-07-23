import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  Calendar,
  Play,
  CheckCircle,
  BarChart3,
  Users,
  Star,
  Filter,
  Search,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ProgressDashboard } from '@/components/ProgressDashboard';
import { useAuthStore } from '@/stores/authStore';
import { apiService } from '@/utils/api';

interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  instructorName: string;
  progress: {
    completedLessons: number;
    totalLessons: number;
    progressPercentage: number;
    timeSpent: number;
    lastAccessed: string;
  };
  nextLesson?: {
    id: string;
    title: string;
    moduleTitle: string;
  };
}

interface LearningStats {
  totalCoursesEnrolled: number;
  coursesCompleted: number;
  totalLearningTime: number;
  currentStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  certificatesEarned: number;
  skillsLearned: string[];
}

interface RecentActivity {
  id: string;
  type: 'lesson_completed' | 'assessment_passed' | 'course_enrolled' | 'certificate_earned';
  title: string;
  courseTitle: string;
  timestamp: string;
  score?: number;
}

export const EnhancedStudentDashboard: React.FC<{ userId: string }> = ({ userId }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in-progress' | 'completed'>('all');

  // Fetch enrolled courses (with fallback to regular courses)
  const { data: enrolledCoursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['enrolled-courses', userId],
    queryFn: async () => {
      return await apiService.get(`/users/${userId}/enrolled-courses`);
    },
    retry: 1,
  });

  // Fetch learning statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['learning-stats', userId],
    queryFn: async () => {
      return await apiService.get(`/users/${userId}/learning-stats`);
    },
    retry: 1,
  });

  // Fetch recent activity
  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-activity', userId],
    queryFn: async () => {
      return await apiService.get(`/users/${userId}/recent-activity`);
    },
    retry: 1,
  });

  const enrolledCourses: EnrolledCourse[] = enrolledCoursesData?.data || [];
  const stats: LearningStats = statsData?.data || {
    totalCoursesEnrolled: 0,
    coursesCompleted: 0,
    totalLearningTime: 0,
    currentStreak: 0,
    weeklyGoal: 5,
    weeklyProgress: 0,
    certificatesEarned: 0,
    skillsLearned: [],
  };
  const recentActivity: RecentActivity[] = activityData?.data || [];

  // Filter courses based on search and status
  const filteredCourses = enrolledCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'completed') {
      return matchesSearch && course.progress.progressPercentage === 100;
    } else if (filterStatus === 'in-progress') {
      return matchesSearch && course.progress.progressPercentage > 0 && course.progress.progressPercentage < 100;
    }
    
    return matchesSearch;
  });

  if (coursesLoading || statsLoading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Welcome back, {user?.firstName}! 👋
            </h2>
            <p className="text-primary-100">
              You're making great progress on your learning journey
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.currentStreak}</div>
            <div className="text-primary-100">Day streak</div>
          </div>
        </div>
      </div>

      {/* Learning Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Courses Enrolled"
          value={stats.totalCoursesEnrolled}
          icon={<BookOpen className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Courses Completed"
          value={stats.coursesCompleted}
          icon={<CheckCircle className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="Learning Hours"
          value={`${Math.round(stats.totalLearningTime / 60)}h`}
          icon={<Clock className="h-6 w-6" />}
          color="purple"
        />
        <StatCard
          title="Certificates"
          value={stats.certificatesEarned}
          icon={<Award className="h-6 w-6" />}
          color="yellow"
        />
      </div>

      {/* Weekly Goal Progress */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Weekly Learning Goal</h3>
          <Button variant="outline" size="sm" leftIcon={<Target />}>
            Set Goal
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{stats.weeklyProgress} hours this week</span>
              <span>{stats.weeklyGoal} hours goal</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((stats.weeklyProgress / stats.weeklyGoal) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Complete</div>
          </div>
        </div>
      </div>

      {/* Continue Learning Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Continue Learning</h3>
        </div>
        
        <div className="p-6">
          {enrolledCourses.filter(course => course.progress.progressPercentage > 0 && course.progress.progressPercentage < 100).length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No courses in progress</h4>
              <p className="text-gray-600 mb-6">Start learning by enrolling in a course</p>
              <Link to="/courses">
                <Button leftIcon={<BookOpen />}>
                  Browse Courses
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {enrolledCourses
                .filter(course => course.progress.progressPercentage > 0 && course.progress.progressPercentage < 100)
                .slice(0, 4)
                .map(course => (
                  <ContinueLearningCard key={course.id} course={course} />
                ))}
            </div>
          )}
        </div>
      </div>

      {/* My Courses Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">My Courses</h3>
            <Link to="/courses">
              <Button variant="outline" size="sm" leftIcon={<BookOpen />}>
                Browse More
              </Button>
            </Link>
          </div>
          
          {/* Search and Filter */}
          <div className="flex space-x-4 mt-4">
            <div className="flex-1">
              <Input
                placeholder="Search your courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search />}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Courses</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        
        <div className="p-6">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No courses found</h4>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCourses.map(course => (
                <EnrolledCourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        
        <div className="p-6">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h4>
              <p className="text-gray-600">Start learning to see your progress here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.slice(0, 5).map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'yellow';
}> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
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

// Continue Learning Card Component
const ContinueLearningCard: React.FC<{ course: EnrolledCourse }> = ({ course }) => {
  const navigate = useNavigate();

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{course.title}</h4>
          <p className="text-sm text-gray-600">by {course.instructorName}</p>
        </div>
        <span className="text-sm font-medium text-primary-600">
          {course.progress.progressPercentage}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div 
          className="bg-primary-600 h-2 rounded-full"
          style={{ width: `${course.progress.progressPercentage}%` }}
        />
      </div>
      
      {course.nextLesson && (
        <div className="mb-3">
          <p className="text-sm text-gray-600">Next: {course.nextLesson.title}</p>
        </div>
      )}
      
      <Button
        size="sm"
        fullWidth
        leftIcon={<Play />}
        onClick={() => navigate(`/courses/${course.id}/learn`)}
      >
        Continue Learning
      </Button>
    </div>
  );
};

// Enrolled Course Card Component
const EnrolledCourseCard: React.FC<{ course: EnrolledCourse }> = ({ course }) => {
  const navigate = useNavigate();

  return (
    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-medium text-gray-900 mb-2">{course.title}</h4>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <span className="capitalize">{course.difficulty}</span>
            <span>•</span>
            <span>{course.category}</span>
            <span>•</span>
            <span>by {course.instructorName}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{course.progress.completedLessons} of {course.progress.totalLessons} lessons</span>
          <span>{course.progress.progressPercentage}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full"
            style={{ width: `${course.progress.progressPercentage}%` }}
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Last accessed {new Date(course.progress.lastAccessed).toLocaleDateString()}
        </div>
        <Button
          size="sm"
          leftIcon={course.progress.progressPercentage > 0 ? <Play /> : <BookOpen />}
          onClick={() => navigate(`/courses/${course.id}/learn`)}
        >
          {course.progress.progressPercentage > 0 ? 'Continue' : 'Start'}
        </Button>
      </div>
    </div>
  );
};

// Activity Item Component
const ActivityItem: React.FC<{ activity: RecentActivity }> = ({ activity }) => {
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'lesson_completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'assessment_passed':
        return <Award className="h-5 w-5 text-yellow-500" />;
      case 'course_enrolled':
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'certificate_earned':
        return <Award className="h-5 w-5 text-purple-500" />;
      default:
        return <BarChart3 className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 mt-1">
        {getActivityIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
        <p className="text-sm text-gray-500">{activity.courseTitle}</p>
        {activity.score && (
          <p className="text-sm text-green-600">Score: {activity.score}%</p>
        )}
      </div>
      <div className="flex-shrink-0">
        <p className="text-xs text-gray-400">
          {new Date(activity.timestamp).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};
