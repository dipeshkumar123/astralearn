import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Award,
  Play,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useEnrollmentStatus } from '@/hooks/useEnrollmentStatus';
import { apiService } from '@/utils/api';

interface CourseProgress {
  courseId: string;
  userId: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  lessons: Array<{
    lessonId: string;
    completed: boolean;
    timeSpent: number;
    score?: number;
  }>;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  instructorName: string;
}

interface ProgressDashboardProps {
  userId: string;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ userId }) => {
  // Fetch user's enrolled courses
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => apiService.get('/courses'),
  });

  // Only show first 3 courses for demo (in real app, you'd fetch user's enrolled courses)
  const courses: Course[] = (coursesData?.data || []).slice(0, 3);

  if (coursesLoading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Learning Progress</h2>
        <Link to="/courses">
          <Button variant="outline" leftIcon={<BookOpen />}>
            Browse More Courses
          </Button>
        </Link>
      </div>

      {/* Progress Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProgressCard
          title="Courses in Progress"
          value="3"
          icon={<BookOpen className="h-6 w-6" />}
          color="blue"
        />
        <ProgressCard
          title="Lessons Completed"
          value="12"
          icon={<CheckCircle className="h-6 w-6" />}
          color="green"
        />
        <ProgressCard
          title="Study Time"
          value="8.5h"
          icon={<Clock className="h-6 w-6" />}
          color="purple"
        />
      </div>

      {/* Course Progress List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Your Courses</h3>
        </div>
        
        <div className="divide-y">
          {courses.slice(0, 3).map((course) => (
            <CourseProgressItem key={course.id} course={course} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <ActivityItem
              type="lesson_completed"
              title="Completed: Variables and Data Types"
              course="Introduction to JavaScript"
              time="2 hours ago"
              icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            />
            <ActivityItem
              type="assessment_passed"
              title="Passed: JavaScript Basics Quiz"
              course="Introduction to JavaScript"
              time="1 day ago"
              icon={<Award className="h-5 w-5 text-yellow-500" />}
            />
            <ActivityItem
              type="course_started"
              title="Started: Advanced React Development"
              course="Advanced React Development"
              time="3 days ago"
              icon={<Play className="h-5 w-5 text-blue-500" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Progress Card Component
const ProgressCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple';
}> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
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

// Course Progress Item Component
const CourseProgressItem: React.FC<{ course: Course }> = ({ course }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Use the new enrollment status hook
  const { isEnrolled, isLoading, progress } = useEnrollmentStatus(course.id);

  // Enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: () => apiService.post(`/courses/${course.id}/enroll`, {}),
    onSuccess: () => {
      // Invalidate progress query to refetch after enrollment
      queryClient.invalidateQueries({ queryKey: ['course-progress', course.id] });
      // Navigate to learning page
      navigate(`/courses/${course.id}/learn`);
    },
    onError: (error: any) => {
      console.error('Enrollment failed:', error);
    },
  });

  const progressPercentage = progress?.progressPercentage || 0;

  const handleStartLearning = () => {
    if (!isEnrolled) {
      // Enroll first, then navigate (handled in mutation onSuccess)
      enrollMutation.mutate();
    } else {
      // Already enrolled, navigate directly
      navigate(`/courses/${course.id}/learn`);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-medium text-gray-900">{course.title}</h4>
            <span className="text-sm text-gray-500">{progressPercentage}% complete</span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">{course.description}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <span className="capitalize">{course.difficulty}</span>
            <span>•</span>
            <span>{course.category}</span>
            <span>•</span>
            <span>by {course.instructorName}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {isLoading ? (
            <div className="text-sm text-gray-500">
              Loading progress...
            </div>
          ) : isEnrolled && progress ? (
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{progress.completedLessons} of {progress.totalLessons} lessons</span>
              <span>•</span>
              <span>{Math.round(progress.lessons.reduce((acc, lesson) => acc + lesson.timeSpent, 0) / 60)} min studied</span>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Not enrolled • Click "Start" to enroll
            </div>
          )}
        </div>

        <div className="ml-6">
          <Button
            size="sm"
            leftIcon={<Play />}
            onClick={handleStartLearning}
            disabled={enrollMutation.isPending}
          >
            {enrollMutation.isPending
              ? 'Enrolling...'
              : isEnrolled && progressPercentage > 0
                ? 'Continue'
                : 'Start'
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

// Activity Item Component
const ActivityItem: React.FC<{
  type: string;
  title: string;
  course: string;
  time: string;
  icon: React.ReactNode;
}> = ({ title, course, time, icon }) => {
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{course}</p>
      </div>
      <div className="flex-shrink-0">
        <p className="text-xs text-gray-400">{time}</p>
      </div>
    </div>
  );
};
