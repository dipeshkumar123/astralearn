import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { apiService } from '@/utils/api';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const CoursePageDebug: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  
  const { data: coursesData, isLoading: coursesLoading, error } = useQuery({
    queryKey: ['courses-debug'],
    queryFn: () => apiService.get('/courses'),
    enabled: isAuthenticated, // Only fetch if authenticated
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Course Page Debug</h1>
        
        {/* Authentication Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>Auth Loading:</strong> {authLoading ? 'Yes' : 'No'}</p>
            <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? `${user.firstName} ${user.lastName} (${user.email})` : 'None'}</p>
          </div>
        </div>

        {/* API Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Status</h2>
          <div className="space-y-2">
            <p><strong>Courses Loading:</strong> {coursesLoading ? 'Yes' : 'No'}</p>
            <p><strong>Error:</strong> {error ? JSON.stringify(error) : 'None'}</p>
            <p><strong>Courses Data:</strong> {coursesData ? `${coursesData.data?.length || 0} courses` : 'None'}</p>
          </div>
        </div>

        {/* Raw Data */}
        {coursesData && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Raw Course Data</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(coursesData, null, 2)}
            </pre>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <Button onClick={() => window.location.href = '/login'}>
              Go to Login
            </Button>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </Button>
            <Button onClick={() => window.location.href = '/courses'}>
              Go to Courses
            </Button>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {(authLoading || coursesLoading) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-center">Loading...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
