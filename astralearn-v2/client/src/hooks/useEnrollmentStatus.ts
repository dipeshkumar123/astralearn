import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/utils/api';

interface EnrollmentStatus {
  isEnrolled: boolean;
  isLoading: boolean;
  error: any;
  progress: any;
}

export const useEnrollmentStatus = (courseId: string): EnrollmentStatus => {
  const [enrollmentChecked, setEnrollmentChecked] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // First, try to fetch progress to check enrollment status
  const { data: progressData, error: progressError, isLoading: progressLoading } = useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: () => apiService.get(`/courses/${courseId}/progress`),
    retry: false,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !enrollmentChecked, // Only fetch if we haven't checked enrollment yet
  });

  useEffect(() => {
    if (progressData) {
      // Successfully got progress data, user is enrolled
      setIsEnrolled(true);
      setEnrollmentChecked(true);
    } else if (progressError?.response?.status === 403) {
      // 403 means user is not enrolled
      setIsEnrolled(false);
      setEnrollmentChecked(true);
    }
  }, [progressData, progressError]);

  return {
    isEnrolled,
    isLoading: progressLoading && !enrollmentChecked,
    error: progressError,
    progress: progressData?.data,
  };
};
