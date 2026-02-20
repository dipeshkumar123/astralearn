import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowLeft, Plus, MessageCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const StudyGroupPage: React.FC = () => {
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
              <Users className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Study Groups
              </span>
            </div>
            <Button leftIcon={<Plus />}>
              Create Study Group
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Study Groups
          </h1>
          <p className="text-gray-600">
            Join study groups to collaborate with other learners and enhance your learning experience.
          </p>
        </div>

        {/* Coming Soon Message */}
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Study Groups Coming Soon!
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            We're working on an amazing study group feature that will allow you to:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <MessageCircle className="h-8 w-8 text-primary-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Group Discussions</h3>
              <p className="text-sm text-gray-600">
                Chat with fellow learners about course topics and share insights.
              </p>
            </div>
            <div className="text-center">
              <Calendar className="h-8 w-8 text-primary-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Study Sessions</h3>
              <p className="text-sm text-gray-600">
                Schedule and join virtual study sessions with your group members.
              </p>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 text-primary-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Peer Learning</h3>
              <p className="text-sm text-gray-600">
                Learn together, share resources, and support each other's progress.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              In the meantime, you can continue learning with our available courses.
            </p>
            <Link to="/courses">
              <Button>
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
