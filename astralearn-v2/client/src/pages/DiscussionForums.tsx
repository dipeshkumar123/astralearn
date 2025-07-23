import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter, 
  ThumbsUp, 
  ThumbsDown,
  Reply,
  Pin,
  Lock,
  Eye,
  Clock,
  User,
  Tag,
  TrendingUp,
  BookOpen,
  HelpCircle,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Flag,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuthStore } from '@/stores/authStore';
import { apiService } from '@/utils/api';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  type: 'discussion' | 'question' | 'announcement' | 'resource';
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: 'student' | 'instructor' | 'admin';
  };
  courseId?: string;
  courseName?: string;
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  isAnswered: boolean;
  upvotes: number;
  downvotes: number;
  replyCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  lastReply?: {
    author: string;
    timestamp: string;
  };
}

interface ForumReply {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: 'student' | 'instructor' | 'admin';
  };
  postId: string;
  parentReplyId?: string;
  upvotes: number;
  downvotes: number;
  isAcceptedAnswer: boolean;
  createdAt: string;
  updatedAt: string;
}

export const DiscussionForums: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'unanswered'>('recent');
  const [showCreatePost, setShowCreatePost] = useState(false);

  // Fetch forum posts
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['forum-posts', courseId, searchQuery, selectedType, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (courseId) params.append('courseId', courseId);
      if (searchQuery) params.append('q', searchQuery);
      if (selectedType !== 'all') params.append('type', selectedType);
      params.append('sort', sortBy);

      return await apiService.get(`/forum/posts?${params.toString()}`);
    },
    retry: 1,
  });

  const posts: ForumPost[] = postsData?.data || [];

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'question':
        return <HelpCircle className="h-5 w-5 text-blue-500" />;
      case 'discussion':
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case 'announcement':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'resource':
        return <Lightbulb className="h-5 w-5 text-purple-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'instructor':
        return 'text-blue-600 bg-blue-100';
      case 'admin':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (postsLoading) {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {courseId ? 'Course Discussion' : 'Discussion Forums'}
              </h1>
              <p className="text-gray-600 mt-1">
                {courseId 
                  ? 'Ask questions, share insights, and collaborate with your classmates'
                  : 'Connect with learners across all courses'
                }
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                leftIcon={<TrendingUp />}
                onClick={() => navigate('/forum/leaderboard')}
              >
                Leaderboard
              </Button>
              <Button
                leftIcon={<Plus />}
                onClick={() => setShowCreatePost(true)}
              >
                New Post
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search />}
              />
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Types</option>
                <option value="question">Questions</option>
                <option value="discussion">Discussions</option>
                <option value="announcement">Announcements</option>
                <option value="resource">Resources</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="unanswered">Unanswered</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <ForumSidebar courseId={courseId} />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
                <p className="text-gray-600 mb-6">
                  Be the first to start a conversation in this course
                </p>
                <Button
                  leftIcon={<Plus />}
                  onClick={() => setShowCreatePost(true)}
                >
                  Start Discussion
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <ForumPostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal
          courseId={courseId}
          onClose={() => setShowCreatePost(false)}
          onSuccess={() => {
            setShowCreatePost(false);
            queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
          }}
        />
      )}
    </div>
  );
};

// Forum Sidebar Component
const ForumSidebar: React.FC<{ courseId?: string }> = ({ courseId }) => (
  <div className="space-y-6">
    {/* Quick Stats */}
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Forum Stats</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Posts</span>
          <span className="font-medium">1,247</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Active Users</span>
          <span className="font-medium">89</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Answered Questions</span>
          <span className="font-medium">94%</span>
        </div>
      </div>
    </div>

    {/* Popular Tags */}
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Tags</h3>
      <div className="flex flex-wrap gap-2">
        {['javascript', 'react', 'async', 'promises', 'best-practices', 'debugging'].map(tag => (
          <span
            key={tag}
            className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full cursor-pointer hover:bg-gray-200"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>

    {/* Top Contributors */}
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Contributors</h3>
      <div className="space-y-3">
        {[
          { name: 'Dr. Johnson', role: 'instructor', points: 1250 },
          { name: 'Sarah Chen', role: 'student', points: 890 },
          { name: 'Mike Wilson', role: 'student', points: 675 }
        ].map((contributor, index) => (
          <div key={contributor.name} className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium text-sm">{index + 1}</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{contributor.name}</p>
              <p className="text-sm text-gray-600">{contributor.points} points</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Forum Post Card Component
const ForumPostCard: React.FC<{ post: ForumPost }> = ({ post }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {getPostTypeIcon(post.type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              {post.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
              {post.isLocked && <Lock className="h-4 w-4 text-red-500" />}
              {post.isAnswered && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              <h3 
                className="text-lg font-medium text-gray-900 cursor-pointer hover:text-primary-600"
                onClick={() => navigate(`/forum/posts/${post.id}`)}
              >
                {post.title}
              </h3>
            </div>

            <p className="text-gray-600 mb-3 line-clamp-2">{post.content}</p>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{post.author.name}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(post.author.role)}`}>
                    {post.author.role}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.viewCount}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" leftIcon={<ThumbsUp />}>
                    {post.upvotes}
                  </Button>
                  <Button variant="ghost" size="sm" leftIcon={<Reply />}>
                    {post.replyCount}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Post Modal Component (placeholder)
const CreatePostModal: React.FC<{
  courseId?: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ courseId, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'discussion' | 'question'>('discussion');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Post</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Post Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="discussion">Discussion</option>
                <option value="question">Question</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // Here you would normally submit the post
                console.log('Creating post:', { title, content, type, courseId });
                onSuccess();
              }}
              disabled={!title || !content}
            >
              Create Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
