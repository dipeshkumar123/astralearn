import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock, 
  Award, 
  Brain,
  Calendar,
  Users,
  BookOpen,
  Zap,
  Star,
  ArrowUp,
  ArrowDown,
  Activity,
  PieChart,
  LineChart,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuthStore } from '@/stores/authStore';
import { apiService } from '@/utils/api';

interface LearningAnalytics {
  overview: {
    totalLearningTime: number;
    coursesCompleted: number;
    coursesInProgress: number;
    averageScore: number;
    streakDays: number;
    skillsLearned: number;
  };
  weeklyProgress: {
    week: string;
    hoursStudied: number;
    lessonsCompleted: number;
    quizzesCompleted: number;
  }[];
  skillProgress: {
    skill: string;
    level: number;
    progress: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  learningPatterns: {
    preferredTimeOfDay: string;
    averageSessionLength: number;
    mostActiveDay: string;
    learningVelocity: number;
  };
  recommendations: {
    id: string;
    type: 'course' | 'skill' | 'practice' | 'review';
    title: string;
    description: string;
    reason: string;
    confidence: number;
    estimatedTime: number;
  }[];
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  }[];
}

export const LearningAnalytics: React.FC = () => {
  const { user } = useAuthStore();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'time' | 'progress' | 'performance'>('time');

  // Fetch learning analytics
  const { data: analyticsData, isLoading, refetch } = useQuery({
    queryKey: ['learning-analytics', user?.id, timeframe],
    queryFn: async () => {
      return await apiService.get(`/analytics/learning/${user?.id}?timeframe=${timeframe}`);
    },
    retry: 1,
  });

  const analytics: LearningAnalytics = analyticsData?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Analytics Data</h2>
          <p className="text-gray-600">Start learning to see your progress analytics</p>
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Learning Analytics</h1>
              <p className="text-gray-600 mt-1">
                Track your progress, discover insights, and get personalized recommendations
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
              
              <Button variant="outline" leftIcon={<RefreshCw />} onClick={() => refetch()}>
                Refresh
              </Button>
              
              <Button variant="outline" leftIcon={<Download />}>
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <OverviewCard
            title="Learning Time"
            value={`${Math.floor(analytics.overview.totalLearningTime / 60)}h ${analytics.overview.totalLearningTime % 60}m`}
            icon={<Clock className="h-6 w-6" />}
            color="blue"
            trend="+12%"
          />
          <OverviewCard
            title="Completed"
            value={analytics.overview.coursesCompleted}
            icon={<BookOpen className="h-6 w-6" />}
            color="green"
            trend="+2"
          />
          <OverviewCard
            title="In Progress"
            value={analytics.overview.coursesInProgress}
            icon={<Activity className="h-6 w-6" />}
            color="yellow"
            trend="stable"
          />
          <OverviewCard
            title="Avg Score"
            value={`${analytics.overview.averageScore}%`}
            icon={<Target className="h-6 w-6" />}
            color="purple"
            trend="+5%"
          />
          <OverviewCard
            title="Streak"
            value={`${analytics.overview.streakDays} days`}
            icon={<Zap className="h-6 w-6" />}
            color="orange"
            trend="+3"
          />
          <OverviewCard
            title="Skills"
            value={analytics.overview.skillsLearned}
            icon={<Brain className="h-6 w-6" />}
            color="indigo"
            trend="+2"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Analytics */}
          <div className="lg:col-span-2 space-y-8">
            {/* Weekly Progress Chart */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Weekly Progress</h2>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={selectedMetric === 'time' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedMetric('time')}
                  >
                    Time
                  </Button>
                  <Button
                    variant={selectedMetric === 'progress' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedMetric('progress')}
                  >
                    Lessons
                  </Button>
                  <Button
                    variant={selectedMetric === 'performance' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedMetric('performance')}
                  >
                    Quizzes
                  </Button>
                </div>
              </div>
              
              <WeeklyProgressChart 
                data={analytics.weeklyProgress} 
                metric={selectedMetric}
              />
            </div>

            {/* Skill Progress */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Skill Development</h2>
              <div className="space-y-4">
                {analytics.skillProgress.map((skill) => (
                  <SkillProgressBar key={skill.skill} skill={skill} />
                ))}
              </div>
            </div>

            {/* Learning Patterns */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Learning Patterns</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PatternCard
                  title="Preferred Time"
                  value={analytics.learningPatterns.preferredTimeOfDay}
                  icon={<Clock className="h-5 w-5" />}
                />
                <PatternCard
                  title="Session Length"
                  value={`${analytics.learningPatterns.averageSessionLength} min`}
                  icon={<Activity className="h-5 w-5" />}
                />
                <PatternCard
                  title="Most Active Day"
                  value={analytics.learningPatterns.mostActiveDay}
                  icon={<Calendar className="h-5 w-5" />}
                />
                <PatternCard
                  title="Learning Velocity"
                  value={`${analytics.learningPatterns.learningVelocity} lessons/hr`}
                  icon={<TrendingUp className="h-5 w-5" />}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* AI Recommendations */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Brain className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">AI Recommendations</h2>
              </div>
              
              <div className="space-y-4">
                {analytics.recommendations.slice(0, 3).map((rec) => (
                  <RecommendationCard key={rec.id} recommendation={rec} />
                ))}
              </div>
              
              <Button
                variant="outline"
                fullWidth
                className="mt-4"
                onClick={() => window.open('/recommendations', '_blank')}
              >
                View All Recommendations
              </Button>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Award className="h-5 w-5 text-yellow-600" />
                <h2 className="text-lg font-semibold text-gray-900">Recent Achievements</h2>
              </div>
              
              <div className="space-y-3">
                {analytics.achievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
              
              <Button variant="outline" fullWidth className="mt-4">
                View All Achievements
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button variant="outline" fullWidth leftIcon={<Target />}>
                  Set Learning Goals
                </Button>
                <Button variant="outline" fullWidth leftIcon={<Users />}>
                  Find Study Partners
                </Button>
                <Button variant="outline" fullWidth leftIcon={<Calendar />}>
                  Schedule Study Time
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Overview Card Component
const OverviewCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend: string;
}> = ({ title, value, icon, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  const getTrendIcon = () => {
    if (trend.includes('+')) return <ArrowUp className="h-3 w-3 text-green-500" />;
    if (trend.includes('-')) return <ArrowDown className="h-3 w-3 text-red-500" />;
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
        <div className="flex items-center space-x-1">
          {getTrendIcon()}
          <span className="text-xs text-gray-500">{trend}</span>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  );
};

// Weekly Progress Chart Component (simplified)
const WeeklyProgressChart: React.FC<{
  data: any[];
  metric: string;
}> = ({ data, metric }) => {
  const getMetricValue = (item: any) => {
    switch (metric) {
      case 'time': return item.hoursStudied;
      case 'progress': return item.lessonsCompleted;
      case 'performance': return item.quizzesCompleted;
      default: return item.hoursStudied;
    }
  };

  const maxValue = Math.max(...data.map(getMetricValue));

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center space-x-4">
          <div className="w-16 text-sm text-gray-600">{item.week}</div>
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(getMetricValue(item) / maxValue) * 100}%` }}
              />
            </div>
          </div>
          <div className="w-12 text-sm font-medium text-gray-900">
            {getMetricValue(item)}
          </div>
        </div>
      ))}
    </div>
  );
};

// Skill Progress Bar Component
const SkillProgressBar: React.FC<{
  skill: any;
}> = ({ skill }) => {
  const getTrendIcon = () => {
    switch (skill.trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />;
      default: return <div className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900">{skill.skill}</span>
          <div className="flex items-center space-x-2">
            {getTrendIcon()}
            <span className="text-sm text-gray-600">Level {skill.level}</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${skill.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Pattern Card Component
const PatternCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
}> = ({ title, value, icon }) => (
  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
    <div className="text-primary-600">{icon}</div>
    <div>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  </div>
);

// Recommendation Card Component
const RecommendationCard: React.FC<{
  recommendation: any;
}> = ({ recommendation }) => {
  const getTypeIcon = () => {
    switch (recommendation.type) {
      case 'course': return <BookOpen className="h-4 w-4" />;
      case 'skill': return <Brain className="h-4 w-4" />;
      case 'practice': return <Target className="h-4 w-4" />;
      case 'review': return <RefreshCw className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
      <div className="flex items-start space-x-3">
        <div className="text-primary-600 mt-1">{getTypeIcon()}</div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1">{recommendation.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{recommendation.reason}</span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-green-600">{recommendation.confidence}% match</span>
              <span className="text-xs text-gray-500">{Math.floor(recommendation.estimatedTime / 60)}h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Achievement Card Component
const AchievementCard: React.FC<{
  achievement: any;
}> = ({ achievement }) => {
  const getRarityColor = () => {
    switch (achievement.rarity) {
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 border rounded-lg">
      <div className="text-2xl">{achievement.icon}</div>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-gray-900">{achievement.title}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${getRarityColor()}`}>
            {achievement.rarity}
          </span>
        </div>
        <p className="text-sm text-gray-600">{achievement.description}</p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(achievement.unlockedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};
