import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from 'react-error-boundary';

// Import styles
import './styles/globals.css';

// Import stores
import { useAuthStore } from './stores/authStore';

// Import components
import { ErrorFallback } from './components/ErrorFallback';
import { LoadingSpinner } from './components/LoadingSpinner';

// Import pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { LandingPage } from './pages/LandingPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseLearningPage } from './pages/CourseLearningPage';
import { CoursePageDebug } from './pages/CoursePageDebug';
import { StudyGroupPage } from './pages/StudyGroupPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { CreateCoursePage } from './pages/CreateCoursePage';
import { InstructorDashboard } from './pages/InstructorDashboard';
import { CourseEditor } from './pages/CourseEditor';
import { ButtonTestPage } from './pages/ButtonTestPage';
import { MinimalTestPage } from './pages/MinimalTestPage';
import { NoAuthTestPage } from './pages/NoAuthTestPage';
import { ComprehensiveDiagnosticPage } from './pages/ComprehensiveDiagnosticPage';

// Phase 3 Advanced Features
import { DiscussionForums } from './pages/DiscussionForums';
import { ForumPostDetail } from './pages/ForumPostDetail';
import { LearningAnalytics } from './pages/LearningAnalytics';
import { RecommendationsPage } from './pages/RecommendationsPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Auth wrapper component
const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
};

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public route component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            {/* No-auth test routes (outside AuthWrapper) */}
            <Route path="/no-auth-test" element={<NoAuthTestPage />} />
            <Route path="/diagnostic" element={<ComprehensiveDiagnosticPage />} />

            {/* Routes with AuthWrapper */}
            <Route path="/*" element={
              <AuthWrapper>
                <div className="min-h-screen bg-gray-50">
                  <Routes>
                {/* Public routes */}
                <Route
                  path="/"
                  element={
                    <PublicRoute>
                      <LandingPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <RegisterPage />
                    </PublicRoute>
                  }
                />

                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/courses"
                  element={
                    <ProtectedRoute>
                      <CoursesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/courses/:courseId/learn"
                  element={
                    <ProtectedRoute>
                      <CourseLearningPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/study-groups"
                  element={
                    <ProtectedRoute>
                      <StudyGroupPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-assistant"
                  element={
                    <ProtectedRoute>
                      <AIAssistantPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-course"
                  element={
                    <ProtectedRoute>
                      <CreateCoursePage />
                    </ProtectedRoute>
                  }
                />

                {/* Instructor Routes */}
                <Route
                  path="/instructor/dashboard"
                  element={
                    <ProtectedRoute>
                      <InstructorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/instructor/courses/create"
                  element={
                    <ProtectedRoute>
                      <CourseEditor />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/instructor/courses/:courseId/edit"
                  element={
                    <ProtectedRoute>
                      <CourseEditor />
                    </ProtectedRoute>
                  }
                />

                {/* Phase 3 Advanced Features Routes */}
                <Route
                  path="/forum"
                  element={
                    <ProtectedRoute>
                      <DiscussionForums />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/forum/posts/:postId"
                  element={
                    <ProtectedRoute>
                      <ForumPostDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <LearningAnalytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recommendations"
                  element={
                    <ProtectedRoute>
                      <RecommendationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Debug routes */}
                <Route path="/test-buttons" element={<ButtonTestPage />} />
                <Route path="/minimal-test" element={<MinimalTestPage />} />
                <Route path="/course-debug" element={<CoursePageDebug />} />

                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </AuthWrapper>
            } />
          </Routes>
        </Router>
        
        {/* React Query Devtools */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
