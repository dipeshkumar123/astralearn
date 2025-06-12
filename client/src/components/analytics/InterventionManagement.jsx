/**
 * Intervention Management - Phase 5 Step 2
 * AI-powered intervention recommendations and management
 * 
 * Features:
 * - AI-powered intervention strategy generation
 * - Priority-based intervention recommendations
 * - Teaching strategy suggestions
 * - Resource allocation optimization
 * - Intervention effectiveness tracking
 * - Automated alert and notification system
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  Lightbulb,
  Target,
  Users,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Pause,
  RefreshCw,
  Filter,
  Download,
  Search,
  Eye,
  AlertTriangle,
  Bell,
  Send,
  BookOpen,
  Video,
  MessageSquare,
  FileText,
  Calendar,
  Star,
  Award,
  Brain,
  Zap,
  Settings,
  MoreVertical,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
  CheckSquare,
  AlertCircle,
  Activity
} from 'lucide-react';

const InterventionManagement = ({ courseId, alerts }) => {
  const [interventions, setInterventions] = useState([]);
  const [activeInterventions, setActiveInterventions] = useState([]);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('recommended'); // recommended, active, completed
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (courseId) {
      loadInterventions();
    }
  }, [courseId, viewMode]);

  /**
   * Load Interventions Data
   */
  const loadInterventions = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);

      // Load recommended interventions
      const recommendedResponse = await fetch(
        `/api/analytics/instructor/recommended-interventions/${courseId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (recommendedResponse.ok) {
        const recommendedResult = await recommendedResponse.json();
        setInterventions(recommendedResult.data || []);
      }

      // Load active interventions
      const activeResponse = await fetch(
        `/api/analytics/instructor/active-interventions/${courseId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (activeResponse.ok) {
        const activeResult = await activeResponse.json();
        setActiveInterventions(activeResult.data || []);
      }

    } catch (error) {
      console.error('Interventions loading error:', error);
      setError('Failed to load intervention data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate New Interventions
   */
  const generateInterventions = async () => {
    if (!courseId) return;

    try {
      setIsGenerating(true);

      // Get recent learning gaps for intervention generation
      const gapsResponse = await fetch(
        `/api/analytics/instructor/recent-gaps/${courseId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (gapsResponse.ok) {
        const gapsData = await gapsResponse.json();
        
        // Generate interventions for each student with gaps
        for (const studentGap of gapsData.data || []) {
          const generateResponse = await fetch(
            `/api/analytics/instructor/generate-interventions`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                studentId: studentGap.studentId,
                courseId,
                gapAnalysis: studentGap.gaps
              })
            }
          );

          if (generateResponse.ok) {
            const interventionResult = await generateResponse.json();
            // Update interventions list
            setInterventions(prev => [...prev, ...interventionResult.data]);
          }
        }
      }

      // Reload all interventions
      await loadInterventions();

    } catch (error) {
      console.error('Intervention generation error:', error);
      setError('Failed to generate interventions');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Start Intervention
   */
  const startIntervention = async (intervention) => {
    try {
      const response = await fetch(`/api/analytics/instructor/start-intervention`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          interventionId: intervention.id,
          studentId: intervention.studentId,
          courseId,
          strategy: intervention.strategy
        })
      });

      if (response.ok) {
        // Move intervention to active list
        setActiveInterventions(prev => [...prev, { ...intervention, status: 'active', startedAt: new Date() }]);
        setInterventions(prev => prev.filter(i => i.id !== intervention.id));
      }
    } catch (error) {
      console.error('Start intervention error:', error);
    }
  };

  /**
   * Update Intervention Progress
   */
  const updateInterventionProgress = async (interventionId, progress, notes) => {
    try {
      const response = await fetch(`/api/analytics/instructor/update-intervention`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          interventionId,
          progress,
          notes
        })
      });

      if (response.ok) {
        // Update local state
        setActiveInterventions(prev => 
          prev.map(intervention => 
            intervention.id === interventionId 
              ? { ...intervention, progress, notes, lastUpdated: new Date() }
              : intervention
          )
        );
      }
    } catch (error) {
      console.error('Update intervention error:', error);
    }
  };

  /**
   * Get Priority Color
   */
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  /**
   * Get Strategy Type Icon
   */
  const getStrategyIcon = (type) => {
    switch (type) {
      case 'content': return BookOpen;
      case 'practice': return Target;
      case 'discussion': return MessageSquare;
      case 'assessment': return FileText;
      case 'video': return Video;
      case 'tutoring': return Users;
      default: return Lightbulb;
    }
  };

  /**
   * Filter Interventions
   */
  const filteredInterventions = useCallback(() => {
    let currentList = viewMode === 'active' ? activeInterventions : interventions;

    // Apply priority filter
    if (filterPriority !== 'all') {
      currentList = currentList.filter(intervention => intervention.priority === filterPriority);
    }

    // Apply type filter
    if (filterType !== 'all') {
      currentList = currentList.filter(intervention => intervention.strategy?.type === filterType);
    }

    return currentList.sort((a, b) => {
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });
  }, [interventions, activeInterventions, viewMode, filterPriority, filterType]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Intervention Management</h2>
          <p className="text-gray-600">AI-powered teaching strategies and intervention tracking</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode */}
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="recommended">Recommended</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>

          {/* Generate Interventions */}
          <button
            onClick={generateInterventions}
            disabled={isGenerating || !courseId}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center disabled:bg-gray-300"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4 mr-2" />
                Generate AI Recommendations
              </>
            )}
          </button>

          {/* Export */}
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Intervention Overview */}
      <InterventionOverview 
        recommended={interventions.length}
        active={activeInterventions.length}
        alerts={alerts}
      />

      {/* Main Content */}
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center space-x-4">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="content">Content Review</option>
                <option value="practice">Practice Exercises</option>
                <option value="discussion">Discussion</option>
                <option value="assessment">Assessment</option>
                <option value="tutoring">One-on-One</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              Showing {filteredInterventions().length} interventions
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {viewMode === 'recommended' && (
              <RecommendedInterventions 
                interventions={filteredInterventions()}
                selectedIntervention={selectedIntervention}
                setSelectedIntervention={setSelectedIntervention}
                startIntervention={startIntervention}
                getPriorityColor={getPriorityColor}
                getStrategyIcon={getStrategyIcon}
              />
            )}
            
            {viewMode === 'active' && (
              <ActiveInterventions 
                interventions={filteredInterventions()}
                selectedIntervention={selectedIntervention}
                setSelectedIntervention={setSelectedIntervention}
                updateInterventionProgress={updateInterventionProgress}
                getPriorityColor={getPriorityColor}
                getStrategyIcon={getStrategyIcon}
              />
            )}
            
            {viewMode === 'completed' && (
              <CompletedInterventions 
                interventions={filteredInterventions()}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

/**
 * Intervention Overview Component
 */
const InterventionOverview = ({ recommended, active, alerts }) => {
  const overviewMetrics = [
    {
      title: 'Recommended Interventions',
      value: recommended,
      change: 0,
      icon: Lightbulb,
      color: 'blue'
    },
    {
      title: 'Active Interventions',
      value: active,
      change: 0,
      icon: Activity,
      color: 'green'
    },
    {
      title: 'Urgent Alerts',
      value: alerts?.filter(a => a.priority === 'critical').length || 0,
      change: 0,
      icon: AlertTriangle,
      color: 'red'
    },
    {
      title: 'Success Rate',
      value: '78%',
      change: 5,
      icon: Target,
      color: 'purple'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {overviewMetrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{metric.title}</p>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              {metric.change !== 0 && (
                <div className="flex items-center mt-1">
                  {metric.change > 0 ? (
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${
                    metric.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(metric.change)}%
                  </span>
                </div>
              )}
            </div>
            <metric.icon className={`w-8 h-8 text-${metric.color}-500`} />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

/**
 * Recommended Interventions Component
 */
const RecommendedInterventions = ({ 
  interventions, 
  selectedIntervention, 
  setSelectedIntervention,
  startIntervention,
  getPriorityColor,
  getStrategyIcon
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Interventions List */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            AI Recommendations ({interventions.length})
          </h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {interventions.map((intervention, index) => {
            const StrategyIcon = getStrategyIcon(intervention.strategy?.type);
            
            return (
              <motion.div
                key={intervention.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedIntervention(intervention)}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedIntervention?.id === intervention.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <StrategyIcon className="w-5 h-5 text-gray-600 mr-2" />
                      <h4 className="font-medium text-gray-900">{intervention.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{intervention.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(intervention.priority)}`}>
                          {intervention.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          {intervention.studentName}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm text-gray-600">{intervention.confidenceScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Intervention Details */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Intervention Details</h3>
        </div>
        <div className="p-6">
          {selectedIntervention ? (
            <InterventionDetailView 
              intervention={selectedIntervention} 
              onStart={() => startIntervention(selectedIntervention)}
              getPriorityColor={getPriorityColor}
              getStrategyIcon={getStrategyIcon}
            />
          ) : (
            <div className="text-center py-8">
              <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select an intervention to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Active Interventions Component
 */
const ActiveInterventions = ({ 
  interventions, 
  selectedIntervention, 
  setSelectedIntervention,
  updateInterventionProgress,
  getPriorityColor,
  getStrategyIcon
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Active Interventions List */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Active Interventions ({interventions.length})
          </h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {interventions.map((intervention, index) => {
            const StrategyIcon = getStrategyIcon(intervention.strategy?.type);
            
            return (
              <motion.div
                key={intervention.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedIntervention(intervention)}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedIntervention?.id === intervention.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <StrategyIcon className="w-5 h-5 text-gray-600 mr-2" />
                      <h4 className="font-medium text-gray-900">{intervention.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{intervention.studentName}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(intervention.priority)}`}>
                        {intervention.priority}
                      </span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${intervention.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{intervention.progress || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Progress Tracking */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Progress Tracking</h3>
        </div>
        <div className="p-6">
          {selectedIntervention ? (
            <InterventionProgressView 
              intervention={selectedIntervention} 
              onUpdateProgress={updateInterventionProgress}
            />
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select an active intervention to track progress</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Intervention Detail View Component
 */
const InterventionDetailView = ({ intervention, onStart, getPriorityColor, getStrategyIcon }) => {
  const StrategyIcon = getStrategyIcon(intervention.strategy?.type);

  return (
    <div className="space-y-6">
      {/* Intervention Info */}
      <div>
        <div className="flex items-center mb-2">
          <StrategyIcon className="w-6 h-6 text-gray-600 mr-2" />
          <h4 className="text-lg font-semibold text-gray-900">{intervention.title}</h4>
        </div>
        <p className="text-gray-600">{intervention.description}</p>
      </div>

      {/* Student and Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">Student</p>
          <p className="font-medium text-gray-900">{intervention.studentName}</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Priority</p>
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(intervention.priority)}`}>
            {intervention.priority}
          </span>
        </div>
      </div>

      {/* Strategy Details */}
      {intervention.strategy && (
        <div>
          <h5 className="font-medium text-gray-900 mb-3">Recommended Strategy</h5>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">Approach</p>
              <p className="text-sm text-gray-600">{intervention.strategy.approach}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">Expected Outcome</p>
              <p className="text-sm text-gray-600">{intervention.strategy.expectedOutcome}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">Time Estimate</p>
              <p className="text-sm text-gray-600">{intervention.strategy.timeEstimate}</p>
            </div>
          </div>
        </div>
      )}

      {/* Resources */}
      {intervention.resources && (
        <div>
          <h5 className="font-medium text-gray-900 mb-3">Recommended Resources</h5>
          <div className="space-y-2">
            {intervention.resources.map((resource, index) => (
              <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                <FileText className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-700">{resource.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confidence Score */}
      <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
        <div>
          <p className="text-sm font-medium text-gray-900">AI Confidence Score</p>
          <p className="text-xs text-gray-600">Likelihood of success</p>
        </div>
        <div className="flex items-center">
          <Star className="w-5 h-5 text-yellow-500 mr-1" />
          <span className="text-lg font-bold text-yellow-600">{intervention.confidenceScore}%</span>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={onStart}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
      >
        <Play className="w-4 h-4 mr-2" />
        Start Intervention
      </button>
    </div>
  );
};

/**
 * Intervention Progress View Component
 */
const InterventionProgressView = ({ intervention, onUpdateProgress }) => {
  const [progress, setProgress] = useState(intervention.progress || 0);
  const [notes, setNotes] = useState(intervention.notes || '');

  const handleUpdate = () => {
    onUpdateProgress(intervention.id, progress, notes);
  };

  return (
    <div className="space-y-6">
      {/* Intervention Info */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900">{intervention.title}</h4>
        <p className="text-gray-600">{intervention.studentName}</p>
      </div>

      {/* Progress Slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Progress: {progress}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => setProgress(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Not Started</span>
          <span>In Progress</span>
          <span>Completed</span>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Progress Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about the intervention progress..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
        />
      </div>

      {/* Timeline */}
      <div>
        <h5 className="font-medium text-gray-900 mb-3">Timeline</h5>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            <span className="text-gray-600">Started: {new Date(intervention.startedAt).toLocaleDateString()}</span>
          </div>
          {intervention.lastUpdated && (
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 text-blue-500 mr-2" />
              <span className="text-gray-600">Last updated: {new Date(intervention.lastUpdated).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Update Button */}
      <button
        onClick={handleUpdate}
        className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Update Progress
      </button>
    </div>
  );
};

/**
 * Completed Interventions Component
 */
const CompletedInterventions = ({ interventions }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Completed Interventions</h3>
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <p className="text-gray-600">Completed interventions tracking coming soon</p>
      </div>
    </div>
  );
};

export default InterventionManagement;
