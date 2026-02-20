import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  BookOpen, 
  Target, 
  RefreshCw,
  Star,
  Clock,
  TrendingUp,
  Users,
  Lightbulb,
  Award,
  Play,
  Plus,
  Filter,
  ArrowRight,
  CheckCircle,
  X,
  ThumbsUp,
  ThumbsDown,
  Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuthStore } from '@/stores/authStore';
import { apiService } from '@/utils/api';

interface Recommendation {
  id: string;
  type: 'course' | 'skill' | 'practice' | 'review' | 'path' | 'mentor';
  title: string;
  description: string;
  reason: string;
  confidence: number;
  estimatedTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  metadata: {
    courseId?: string;
    skillLevel?: number;
    prerequisites?: string[];
    outcomes?: string[];
  };
  aiInsights: {
    personalizedReason: string;
    learningStyle: string;
    successProbability: number;
  };
  isBookmarked: boolean;
  isDismissed: boolean;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  totalCourses: number;
  estimatedDuration: number;
  difficulty: string;
  skills: string[];
  progress: number;
  recommendations: Recommendation[];
}

export const RecommendationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'confidence' | 'time' | 'difficulty'>('confidence');
  const [showDismissed, setShowDismissed] = useState(false);

  // Fetch personalized recommendations
  const { data: recommendationsData, isLoading } = useQuery({
    queryKey: ['recommendations', user?.id, selectedCategory, sortBy],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') params.append('category', selectedCategory);
        params.append('sort', sortBy);
        params.append('includeDismissed', showDismissed.toString());
        
        return await apiService.get(`/recommendations/${user?.id}?${params.toString()}`);
      } catch (error) {
        // Mock comprehensive recommendations data
        console.log('Recommendations endpoint not available, using mock data');
        return {
          data: {
            recommendations: [
              {
                id: '1',
                type: 'course',
                title: 'Advanced React Patterns',
                description: 'Master advanced React concepts including render props, higher-order components, context patterns, and custom hooks.',
                reason: 'Based on your React progress and JavaScript mastery',
                confidence: 94,
                estimatedTime: 480,
                difficulty: 'advanced',
                tags: ['react', 'javascript', 'patterns', 'hooks'],
                metadata: {
                  courseId: 'react-advanced-001',
                  prerequisites: ['React Basics', 'JavaScript ES6+'],
                  outcomes: ['Advanced React patterns', 'Performance optimization', 'Custom hooks']
                },
                aiInsights: {
                  personalizedReason: 'Your learning velocity in React (1.2 lessons/hour) and high scores (92% avg) indicate you\'re ready for advanced concepts.',
                  learningStyle: 'You prefer hands-on coding exercises with real-world examples',
                  successProbability: 89
                },
                isBookmarked: false,
                isDismissed: false
              },
              {
                id: '2',
                type: 'skill',
                title: 'TypeScript Fundamentals',
                description: 'Add type safety to your JavaScript knowledge. Learn interfaces, generics, and advanced TypeScript features.',
                reason: 'Natural progression from JavaScript mastery',
                confidence: 87,
                estimatedTime: 360,
                difficulty: 'intermediate',
                tags: ['typescript', 'javascript', 'types', 'fundamentals'],
                metadata: {
                  skillLevel: 1,
                  prerequisites: ['JavaScript ES6+'],
                  outcomes: ['Type safety', 'Better IDE support', 'Reduced runtime errors']
                },
                aiInsights: {
                  personalizedReason: 'Your preference for structured learning and attention to detail makes TypeScript a perfect fit.',
                  learningStyle: 'You learn best with clear examples and gradual complexity increase',
                  successProbability: 85
                },
                isBookmarked: true,
                isDismissed: false
              },
              {
                id: '3',
                type: 'practice',
                title: 'JavaScript Algorithm Challenges',
                description: 'Strengthen your problem-solving skills with curated algorithm challenges and data structure exercises.',
                reason: 'Reinforce JavaScript fundamentals through practice',
                confidence: 82,
                estimatedTime: 120,
                difficulty: 'intermediate',
                tags: ['javascript', 'algorithms', 'practice', 'problem-solving'],
                metadata: {
                  prerequisites: ['JavaScript Basics'],
                  outcomes: ['Problem-solving skills', 'Algorithm knowledge', 'Code optimization']
                },
                aiInsights: {
                  personalizedReason: 'Your evening study pattern (6-9 PM) aligns well with focused problem-solving sessions.',
                  learningStyle: 'You enjoy challenges and learn through trial and error',
                  successProbability: 78
                },
                isBookmarked: false,
                isDismissed: false
              },
              {
                id: '4',
                type: 'path',
                title: 'Full-Stack JavaScript Developer',
                description: 'Complete learning path from frontend to backend, including React, Node.js, databases, and deployment.',
                reason: 'Comprehensive skill development based on your interests',
                confidence: 91,
                estimatedTime: 2400,
                difficulty: 'intermediate',
                tags: ['fullstack', 'javascript', 'react', 'nodejs', 'career'],
                metadata: {
                  prerequisites: ['JavaScript Fundamentals'],
                  outcomes: ['Full-stack development', 'Career readiness', 'Portfolio projects']
                },
                aiInsights: {
                  personalizedReason: 'Your consistent learning streak and goal-oriented approach make you ideal for a structured path.',
                  learningStyle: 'You thrive with clear milestones and project-based learning',
                  successProbability: 92
                },
                isBookmarked: false,
                isDismissed: false
              },
              {
                id: '5',
                type: 'review',
                title: 'Node.js Concepts Refresher',
                description: 'Review and reinforce your Node.js knowledge with updated best practices and new features.',
                reason: 'Your Node.js progress has slowed recently',
                confidence: 75,
                estimatedTime: 90,
                difficulty: 'beginner',
                tags: ['nodejs', 'review', 'backend', 'javascript'],
                metadata: {
                  prerequisites: ['Node.js Basics'],
                  outcomes: ['Refreshed knowledge', 'Updated practices', 'Confidence boost']
                },
                aiInsights: {
                  personalizedReason: 'A quick review session will help maintain momentum before advancing to more complex topics.',
                  learningStyle: 'You benefit from spaced repetition and concept reinforcement',
                  successProbability: 88
                },
                isBookmarked: false,
                isDismissed: false
              }
            ],
            learningPaths: [
              {
                id: 'path-1',
                title: 'Frontend Specialist',
                description: 'Become a frontend expert with React, TypeScript, and modern development tools',
                totalCourses: 8,
                estimatedDuration: 1200,
                difficulty: 'intermediate',
                skills: ['React', 'TypeScript', 'CSS', 'Testing'],
                progress: 35,
                recommendations: ['1', '2']
              },
              {
                id: 'path-2',
                title: 'Full-Stack Developer',
                description: 'Complete journey from frontend to backend development',
                totalCourses: 12,
                estimatedDuration: 2400,
                difficulty: 'intermediate',
                skills: ['React', 'Node.js', 'Databases', 'DevOps'],
                progress: 25,
                recommendations: ['1', '2', '4']
              }
            ]
          }
        };
      }
    },
    retry: false,
  });

  // Bookmark recommendation mutation
  const bookmarkMutation = useMutation({
    mutationFn: async ({ recommendationId, bookmark }: { recommendationId: string; bookmark: boolean }) => {
      try {
        return await apiService.post(`/recommendations/${recommendationId}/bookmark`, { bookmark });
      } catch (error) {
        console.log('Bookmark endpoint not available');
        return { data: { success: true } };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  // Dismiss recommendation mutation
  const dismissMutation = useMutation({
    mutationFn: async (recommendationId: string) => {
      try {
        return await apiService.post(`/recommendations/${recommendationId}/dismiss`);
      } catch (error) {
        console.log('Dismiss endpoint not available');
        return { data: { success: true } };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  // Feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: async ({ recommendationId, helpful }: { recommendationId: string; helpful: boolean }) => {
      try {
        return await apiService.post(`/recommendations/${recommendationId}/feedback`, { helpful });
      } catch (error) {
        console.log('Feedback endpoint not available');
        return { data: { success: true } };
      }
    },
  });

  const data = recommendationsData?.data;
  const recommendations: Recommendation[] = data?.recommendations || [];
  const learningPaths: LearningPath[] = data?.learningPaths || [];

  const filteredRecommendations = recommendations.filter(rec => {
    if (selectedCategory === 'all') return true;
    return rec.type === selectedCategory;
  });

  if (isLoading) {
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
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AI Recommendations</h1>
                <p className="text-gray-600 mt-1">
                  Personalized learning suggestions powered by AI
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Types</option>
                <option value="course">Courses</option>
                <option value="skill">Skills</option>
                <option value="practice">Practice</option>
                <option value="path">Learning Paths</option>
                <option value="review">Reviews</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="confidence">Best Match</option>
                <option value="time">Time Required</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Learning Paths */}
            {learningPaths.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommended Learning Paths</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {learningPaths.map((path) => (
                    <LearningPathCard key={path.id} path={path} />
                  ))}
                </div>
              </div>
            )}

            {/* Individual Recommendations */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Personalized Recommendations ({filteredRecommendations.length})
                </h2>
                <Button variant="outline" size="sm" leftIcon={<RefreshCw />}>
                  Refresh
                </Button>
              </div>

              {filteredRecommendations.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                  <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations found</h3>
                  <p className="text-gray-600">
                    Try adjusting your filters or continue learning to get more personalized suggestions
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredRecommendations.map((recommendation) => (
                    <RecommendationCard
                      key={recommendation.id}
                      recommendation={recommendation}
                      onBookmark={(bookmark) => bookmarkMutation.mutate({ recommendationId: recommendation.id, bookmark })}
                      onDismiss={() => dismissMutation.mutate(recommendation.id)}
                      onFeedback={(helpful) => feedbackMutation.mutate({ recommendationId: recommendation.id, helpful })}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <RecommendationsSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

// Learning Path Card Component
const LearningPathCard: React.FC<{ path: LearningPath }> = ({ path }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">{path.title}</h3>
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        path.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
        path.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        {path.difficulty}
      </span>
    </div>

    <p className="text-gray-600 mb-4">{path.description}</p>

    <div className="space-y-3 mb-4">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Progress</span>
        <span className="font-medium">{path.progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary-600 h-2 rounded-full"
          style={{ width: `${path.progress}%` }}
        />
      </div>
    </div>

    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
      <span>{path.totalCourses} courses</span>
      <span>{Math.floor(path.estimatedDuration / 60)}h total</span>
    </div>

    <div className="flex flex-wrap gap-1 mb-4">
      {path.skills.slice(0, 3).map(skill => (
        <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
          {skill}
        </span>
      ))}
      {path.skills.length > 3 && (
        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
          +{path.skills.length - 3} more
        </span>
      )}
    </div>

    <Button fullWidth leftIcon={<ArrowRight />}>
      Start Learning Path
    </Button>
  </div>
);

// Recommendation Card Component
const RecommendationCard: React.FC<{
  recommendation: Recommendation;
  onBookmark: (bookmark: boolean) => void;
  onDismiss: () => void;
  onFeedback: (helpful: boolean) => void;
}> = ({ recommendation, onBookmark, onDismiss, onFeedback }) => {
  const getTypeIcon = () => {
    switch (recommendation.type) {
      case 'course': return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'skill': return <Brain className="h-5 w-5 text-purple-500" />;
      case 'practice': return <Target className="h-5 w-5 text-green-500" />;
      case 'review': return <RefreshCw className="h-5 w-5 text-orange-500" />;
      case 'path': return <TrendingUp className="h-5 w-5 text-indigo-500" />;
      default: return <BookOpen className="h-5 w-5 text-gray-500" />;
    }
  };

  const getDifficultyColor = () => {
    switch (recommendation.difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          {getTypeIcon()}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{recommendation.title}</h3>
            <p className="text-gray-600 mb-3">{recommendation.description}</p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
              <span className={`px-2 py-1 rounded-full ${getDifficultyColor()}`}>
                {recommendation.difficulty}
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {Math.floor(recommendation.estimatedTime / 60)}h {recommendation.estimatedTime % 60}m
              </span>
              <span className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-400" />
                {recommendation.confidence}% match
              </span>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>AI Insight:</strong> {recommendation.aiInsights.personalizedReason}
              </p>
              <p className="text-xs text-blue-600">
                Success probability: {recommendation.aiInsights.successProbability}% • 
                Learning style: {recommendation.aiInsights.learningStyle}
              </p>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {recommendation.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBookmark(!recommendation.isBookmarked)}
          >
            <Bookmark className={`h-4 w-4 ${recommendation.isBookmarked ? 'fill-current text-yellow-500' : ''}`} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button size="sm" leftIcon={<Play />}>
            Start Learning
          </Button>
          <Button variant="outline" size="sm">
            Learn More
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Helpful?</span>
          <Button variant="ghost" size="sm" onClick={() => onFeedback(true)}>
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onFeedback(false)}>
            <ThumbsDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Recommendations Sidebar Component
const RecommendationsSidebar: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">How AI Recommendations Work</h3>
      <div className="space-y-3 text-sm text-gray-600">
        <p>Our AI analyzes your:</p>
        <ul className="space-y-1 ml-4">
          <li>• Learning progress and patterns</li>
          <li>• Skill gaps and strengths</li>
          <li>• Study habits and preferences</li>
          <li>• Career goals and interests</li>
        </ul>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <Button variant="outline" fullWidth leftIcon={<Target />}>
          Set Learning Goals
        </Button>
        <Button variant="outline" fullWidth leftIcon={<Users />}>
          Find Study Partners
        </Button>
        <Button variant="outline" fullWidth leftIcon={<Award />}>
          View Achievements
        </Button>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendation Stats</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Accuracy Rate</span>
          <span className="font-medium">94%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Completed</span>
          <span className="font-medium">12/15</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Success Rate</span>
          <span className="font-medium">89%</span>
        </div>
      </div>
    </div>
  </div>
);
