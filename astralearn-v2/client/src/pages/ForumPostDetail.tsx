import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft,
  ThumbsUp, 
  ThumbsDown,
  Reply,
  Pin,
  Lock,
  Flag,
  Share2,
  MoreVertical,
  CheckCircle2,
  User,
  Clock,
  Eye,
  MessageSquare,
  Award,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
    reputation: number;
  };
  courseId?: string;
  courseName?: string;
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  isAnswered: boolean;
  upvotes: number;
  downvotes: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ForumReply {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: 'student' | 'instructor' | 'admin';
    reputation: number;
  };
  postId: string;
  parentReplyId?: string;
  upvotes: number;
  downvotes: number;
  isAcceptedAnswer: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: ForumReply[];
}

export const ForumPostDetail: React.FC = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showReplyForm, setShowReplyForm] = useState(false);

  // Fetch post details
  const { data: postData, isLoading: postLoading } = useQuery({
    queryKey: ['forum-post', postId],
    queryFn: async () => {
      try {
        return await apiService.get(`/forum/posts/${postId}`);
      } catch (error) {
        // Mock data for demonstration
        console.log('Forum post endpoint not available, using mock data');
        return {
          data: {
            id: postId,
            title: 'How to handle async/await in JavaScript?',
            content: `I'm having trouble understanding when to use async/await vs promises. Can someone explain the difference and when to use each approach?

Here's what I'm trying to do:

\`\`\`javascript
function fetchData() {
  return fetch('/api/data')
    .then(response => response.json())
    .then(data => console.log(data));
}
\`\`\`

vs

\`\`\`javascript
async function fetchData() {
  const response = await fetch('/api/data');
  const data = await response.json();
  console.log(data);
}
\`\`\`

Which approach is better and why?`,
            type: 'question',
            author: {
              id: '2',
              name: 'Sarah Chen',
              role: 'student',
              reputation: 245
            },
            courseId: '1',
            courseName: 'Introduction to JavaScript',
            tags: ['javascript', 'async', 'promises', 'async-await'],
            isPinned: false,
            isLocked: false,
            isAnswered: true,
            upvotes: 15,
            downvotes: 2,
            viewCount: 124,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
          }
        };
      }
    },
    retry: false,
  });

  // Fetch replies
  const { data: repliesData, isLoading: repliesLoading } = useQuery({
    queryKey: ['forum-replies', postId],
    queryFn: async () => {
      try {
        return await apiService.get(`/forum/posts/${postId}/replies`);
      } catch (error) {
        // Mock data for demonstration
        console.log('Forum replies endpoint not available, using mock data');
        return {
          data: [
            {
              id: '1',
              content: `Great question! Both approaches achieve the same result, but async/await is generally more readable and easier to work with.

**Promises with .then():**
- More verbose, especially with multiple chained operations
- Can lead to "callback hell" with complex logic
- Error handling requires .catch()

**Async/Await:**
- Cleaner, more synchronous-looking code
- Better error handling with try/catch
- Easier to debug and understand

Here's a more complex example:

\`\`\`javascript
// With promises
function processData() {
  return fetchUser()
    .then(user => fetchUserPosts(user.id))
    .then(posts => posts.map(post => processPost(post)))
    .catch(error => console.error(error));
}

// With async/await
async function processData() {
  try {
    const user = await fetchUser();
    const posts = await fetchUserPosts(user.id);
    return posts.map(post => processPost(post));
  } catch (error) {
    console.error(error);
  }
}
\`\`\`

I'd recommend using async/await for new code - it's much more readable!`,
              author: {
                id: '1',
                name: 'Dr. Johnson',
                role: 'instructor',
                reputation: 1250
              },
              postId: postId!,
              upvotes: 12,
              downvotes: 0,
              isAcceptedAnswer: true,
              createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              replies: []
            },
            {
              id: '2',
              content: `I agree with Dr. Johnson! One thing to add is that async/await is just syntactic sugar over promises. Under the hood, it's still using promises.

Also, remember that you can only use \`await\` inside an \`async\` function. If you need to use it at the top level, you'll need to wrap it in an async function or use .then().`,
              author: {
                id: '3',
                name: 'Mike Wilson',
                role: 'student',
                reputation: 567
              },
              postId: postId!,
              upvotes: 8,
              downvotes: 0,
              isAcceptedAnswer: false,
              createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
              updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
              replies: []
            }
          ]
        };
      }
    },
    retry: false,
  });

  const post: ForumPost = postData?.data;
  const replies: ForumReply[] = repliesData?.data || [];

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ type, targetId, targetType }: { 
      type: 'upvote' | 'downvote'; 
      targetId: string; 
      targetType: 'post' | 'reply' 
    }) => {
      try {
        return await apiService.post(`/forum/${targetType}s/${targetId}/vote`, { type });
      } catch (error) {
        console.log('Vote endpoint not available');
        return { data: { success: true } };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-post', postId] });
      queryClient.invalidateQueries({ queryKey: ['forum-replies', postId] });
    },
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async (content: string) => {
      try {
        return await apiService.post(`/forum/posts/${postId}/replies`, { content });
      } catch (error) {
        console.log('Reply endpoint not available');
        return { data: { success: true } };
      }
    },
    onSuccess: () => {
      setReplyContent('');
      setShowReplyForm(false);
      queryClient.invalidateQueries({ queryKey: ['forum-replies', postId] });
    },
  });

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

  if (postLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h2>
          <p className="text-gray-600 mb-6">The discussion post you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/forum')}>
            Back to Forums
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              leftIcon={<ArrowLeft />}
              onClick={() => navigate('/forum')}
            >
              Back to Forums
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" leftIcon={<Share2 />}>
                Share
              </Button>
              <Button variant="outline" size="sm" leftIcon={<Flag />}>
                Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Post Content */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            {/* Post Header */}
            <div className="flex items-center space-x-2 mb-4">
              {post.isPinned && <Pin className="h-5 w-5 text-yellow-500" />}
              {post.isLocked && <Lock className="h-5 w-5 text-red-500" />}
              {post.isAnswered && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
            </div>

            {/* Post Meta */}
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{post.author.name}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(post.author.role)}`}>
                  {post.author.role}
                </span>
                <span className="text-yellow-600">★ {post.author.reputation}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{new Date(post.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{post.viewCount} views</span>
              </div>
            </div>

            {/* Post Content */}
            <div className="prose max-w-none mb-6">
              <div className="whitespace-pre-wrap">{post.content}</div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<ThumbsUp />}
                  onClick={() => voteMutation.mutate({ type: 'upvote', targetId: post.id, targetType: 'post' })}
                >
                  {post.upvotes}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<ThumbsDown />}
                  onClick={() => voteMutation.mutate({ type: 'downvote', targetId: post.id, targetType: 'post' })}
                >
                  {post.downvotes}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Reply />}
                  onClick={() => setShowReplyForm(!showReplyForm)}
                >
                  Reply
                </Button>
              </div>

              {user?.id === post.author.id && (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" leftIcon={<Edit />}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" leftIcon={<Trash2 />}>
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Reply</h3>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
            />
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => replyMutation.mutate(replyContent)}
                disabled={!replyContent.trim() || replyMutation.isPending}
              >
                {replyMutation.isPending ? 'Posting...' : 'Post Reply'}
              </Button>
            </div>
          </div>
        )}

        {/* Replies */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </h2>

          {repliesLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : replies.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No replies yet</h3>
              <p className="text-gray-600 mb-4">Be the first to share your thoughts</p>
              <Button
                leftIcon={<Reply />}
                onClick={() => setShowReplyForm(true)}
              >
                Write Reply
              </Button>
            </div>
          ) : (
            replies.map((reply) => (
              <ReplyCard
                key={reply.id}
                reply={reply}
                onVote={(type) => voteMutation.mutate({ type, targetId: reply.id, targetType: 'reply' })}
                isAcceptedAnswer={reply.isAcceptedAnswer}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Reply Card Component
const ReplyCard: React.FC<{
  reply: ForumReply;
  onVote: (type: 'upvote' | 'downvote') => void;
  isAcceptedAnswer: boolean;
}> = ({ reply, onVote, isAcceptedAnswer }) => {
  const { user } = useAuthStore();

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

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${isAcceptedAnswer ? 'ring-2 ring-green-200' : ''}`}>
      {isAcceptedAnswer && (
        <div className="bg-green-50 px-4 py-2 border-b flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">Accepted Answer</span>
          <Award className="h-4 w-4 text-green-600" />
        </div>
      )}
      
      <div className="p-6">
        {/* Reply Header */}
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="font-medium text-gray-900">{reply.author.name}</span>
            <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(reply.author.role)}`}>
              {reply.author.role}
            </span>
            <span className="text-yellow-600">★ {reply.author.reputation}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{new Date(reply.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Reply Content */}
        <div className="prose max-w-none mb-4">
          <div className="whitespace-pre-wrap">{reply.content}</div>
        </div>

        {/* Reply Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ThumbsUp />}
              onClick={() => onVote('upvote')}
            >
              {reply.upvotes}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ThumbsDown />}
              onClick={() => onVote('downvote')}
            >
              {reply.downvotes}
            </Button>
            <Button variant="ghost" size="sm" leftIcon={<Reply />}>
              Reply
            </Button>
          </div>

          {user?.id === reply.author.id && (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" leftIcon={<Edit />}>
                Edit
              </Button>
              <Button variant="ghost" size="sm" leftIcon={<Trash2 />}>
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
