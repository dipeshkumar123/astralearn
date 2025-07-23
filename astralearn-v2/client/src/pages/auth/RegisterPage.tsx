import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, Mail, Lock, User } from 'lucide-react';
import { RegisterApiRequestSchema, RegisterApiRequest } from '@astralearn/shared';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterApiRequest>({
    resolver: zodResolver(RegisterApiRequestSchema),
    defaultValues: {
      role: 'student',
    },
  });

  React.useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data: RegisterApiRequest) => {
    try {
      await registerUser(data);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center">
            <BookOpen className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">
              AstraLearn
            </span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join thousands of learners on their educational journey
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-error-50 border border-error-200 rounded-lg p-4">
              <p className="text-sm text-error-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                {...register('firstName')}
                label="First Name"
                type="text"
                leftIcon={<User />}
                placeholder="John"
                error={errors.firstName?.message}
                autoComplete="given-name"
              />

              <Input
                {...register('lastName')}
                label="Last Name"
                type="text"
                leftIcon={<User />}
                placeholder="Doe"
                error={errors.lastName?.message}
                autoComplete="family-name"
              />
            </div>

            <Input
              {...register('email')}
              label="Email Address"
              type="email"
              leftIcon={<Mail />}
              placeholder="john.doe@example.com"
              error={errors.email?.message}
              autoComplete="email"
            />

            <Input
              {...register('username')}
              label="Username"
              type="text"
              leftIcon={<User />}
              placeholder="johndoe"
              error={errors.username?.message}
              autoComplete="username"
              helperText="This will be your unique identifier on the platform"
            />

            <Input
              {...register('password')}
              label="Password"
              type="password"
              leftIcon={<Lock />}
              placeholder="Create a strong password"
              error={errors.password?.message}
              autoComplete="new-password"
              helperText="Must be at least 6 characters long"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to join as a
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative">
                  <input
                    {...register('role')}
                    type="radio"
                    value="student"
                    className="sr-only peer"
                  />
                  <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-primary-600 peer-checked:bg-primary-50 transition-all">
                    <div className="text-center">
                      <BookOpen className="h-6 w-6 mx-auto mb-2 text-gray-600 peer-checked:text-primary-600" />
                      <span className="text-sm font-medium text-gray-900">Student</span>
                      <p className="text-xs text-gray-500 mt-1">Learn and grow</p>
                    </div>
                  </div>
                </label>

                <label className="relative">
                  <input
                    {...register('role')}
                    type="radio"
                    value="instructor"
                    className="sr-only peer"
                  />
                  <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-primary-600 peer-checked:bg-primary-50 transition-all">
                    <div className="text-center">
                      <User className="h-6 w-6 mx-auto mb-2 text-gray-600 peer-checked:text-primary-600" />
                      <span className="text-sm font-medium text-gray-900">Instructor</span>
                      <p className="text-xs text-gray-500 mt-1">Teach and inspire</p>
                    </div>
                  </div>
                </label>
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-error-600">{errors.role.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Style (Optional)
              </label>
              <select
                {...register('learningStyle')}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select your learning style</option>
                <option value="visual">Visual - Learn through images and diagrams</option>
                <option value="auditory">Auditory - Learn through listening</option>
                <option value="kinesthetic">Kinesthetic - Learn through hands-on activities</option>
                <option value="reading">Reading/Writing - Learn through text</option>
              </select>
              {errors.learningStyle && (
                <p className="mt-1 text-sm text-error-600">{errors.learningStyle.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            loading={isLoading}
            fullWidth
            size="lg"
          >
            Create Account
          </Button>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign in
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
