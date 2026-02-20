import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Users, Clock, Star, ArrowLeft, Play, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AdvancedCourseSearch } from '@/components/AdvancedCourseSearch';
import { apiService } from '@/utils/api';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  price: number;
  duration: number;
  instructorName: string;
  enrollmentCount: number;
  rating: number;
  isPublished: boolean;
}

export const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [useAdvancedSearch, setUseAdvancedSearch] = useState(false);

  const { data: coursesData, isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: () => apiService.get('/courses'),
    enabled: !useAdvancedSearch, // Only fetch when not using advanced search
  });

  const courses: Course[] = coursesData?.data || [];

  // If using advanced search, render the advanced search component
  if (useAdvancedSearch) {
    return <AdvancedCourseSearch />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Courses</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/dashboard" className="mr-4">
                <Button variant="ghost" size="sm" leftIcon={<ArrowLeft />}>
                  Back to Dashboard
                </Button>
              </Link>
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Browse Courses
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                leftIcon={<Search />}
                onClick={() => setUseAdvancedSearch(true)}
              >
                Advanced Search
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Available Courses
          </h1>
          <p className="text-gray-600">
            Discover and enroll in courses to advance your learning journey.
          </p>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses available</h3>
            <p className="text-gray-600">Check back later for new courses.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      course.difficulty === 'beginner' 
                        ? 'bg-green-100 text-green-800'
                        : course.difficulty === 'intermediate'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {course.difficulty}
                    </span>
                    <span className="text-sm text-gray-500">{course.category}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {course.duration} min
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {course.enrollmentCount} enrolled
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-400" />
                      {course.rating}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">by {course.instructorName}</p>
                      {course.price > 0 ? (
                        <p className="text-lg font-bold text-primary-600">${course.price}</p>
                      ) : (
                        <p className="text-lg font-bold text-green-600">Free</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/courses/${course.id}/learn`)}
                        leftIcon={<Play />}
                      >
                        Start Learning
                      </Button>
                      <Button size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
