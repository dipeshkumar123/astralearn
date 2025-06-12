/**
 * Engagement Heatmap - Phase 5 Step 2
 * Visual engagement patterns and activity analysis
 * 
 * Features:
 * - Interactive engagement heatmaps
 * - Time-based activity patterns
 * - Content interaction analysis
 * - Real-time engagement monitoring
 * - Behavioral pattern insights
 * - Peak engagement identification
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  Cell
} from 'recharts';
import { 
  Activity, 
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  Calendar,
  Filter,
  Download,
  Play,
  Pause,
  RefreshCw,
  Maximize,
  Settings,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Map,
  Target,
  Zap,
  Timer,
  MessageSquare,
  BookOpen,
  Video,
  FileText,
  Image
} from 'lucide-react';

const EngagementHeatmap = ({ courseId, timeframe, realTimeData }) => {
  const [engagementData, setEngagementData] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('heatmap'); // heatmap, timeline, patterns
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [granularity, setGranularity] = useState('hour'); // hour, day, week
  const [contentFilter, setContentFilter] = useState('all');
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);
  
  // Real-time updates
  const wsRef = useRef(null);
  const updateIntervalRef = useRef(null);

  useEffect(() => {
    if (courseId) {
      loadEngagementData();
    }
  }, [courseId, timeframe, granularity]);

  useEffect(() => {
    if (isRealTimeMode && courseId) {
      startRealTimeUpdates();
    } else {
      stopRealTimeUpdates();
    }

    return () => stopRealTimeUpdates();
  }, [isRealTimeMode, courseId]);

  /**
   * Load Engagement Data
   */
  const loadEngagementData = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);

      // Load engagement heatmap data
      const heatmapResponse = await fetch(
        `/api/analytics/instructor/engagement-heatmap/${courseId}?timeframe=${timeframe}&granularity=${granularity}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (heatmapResponse.ok) {
        const heatmapResult = await heatmapResponse.json();
        setEngagementData(heatmapResult.data);
        setHeatmapData(heatmapResult.data.heatmapGrid || []);
      }

    } catch (error) {
      console.error('Engagement data loading error:', error);
      setError('Failed to load engagement data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Start Real-time Updates
   */
  const startRealTimeUpdates = useCallback(() => {
    if (!courseId) return;

    try {
      // Start engagement monitoring via WebSocket
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/instructor`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        wsRef.current.send(JSON.stringify({
          type: 'start_engagement_monitoring',
          data: { courseId }
        }));
      };

      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'engagement_update') {
          updateRealTimeData(message.data);
        }
      };

    } catch (error) {
      console.error('Real-time engagement monitoring error:', error);
    }
  }, [courseId]);

  /**
   * Stop Real-time Updates
   */
  const stopRealTimeUpdates = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  }, []);

  /**
   * Update Real-time Data
   */
  const updateRealTimeData = (data) => {
    setEngagementData(prev => ({
      ...prev,
      realTime: data,
      lastUpdate: new Date().toISOString()
    }));
  };

  /**
   * Get Engagement Color
   */
  const getEngagementColor = (value) => {
    if (value >= 80) return '#22C55E'; // Green
    if (value >= 60) return '#EAB308'; // Yellow
    if (value >= 40) return '#F97316'; // Orange
    if (value >= 20) return '#EF4444'; // Red
    return '#6B7280'; // Gray
  };

  /**
   * Get Engagement Intensity
   */
  const getEngagementIntensity = (value) => {
    return Math.min(value / 100, 1);
  };

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

  if (!engagementData) {
    return (
      <div className="text-center py-8">
        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No engagement data available for this course.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Engagement Heatmap</h2>
          <p className="text-gray-600">Visualize student engagement patterns and activity</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Selector */}
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="heatmap">Heatmap View</option>
            <option value="timeline">Timeline View</option>
            <option value="patterns">Pattern Analysis</option>
          </select>

          {/* Granularity Selector */}
          <select
            value={granularity}
            onChange={(e) => setGranularity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="hour">Hourly</option>
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
          </select>

          {/* Real-time Toggle */}
          <button
            onClick={() => setIsRealTimeMode(!isRealTimeMode)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
              isRealTimeMode
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            {isRealTimeMode ? (
              <>
                <Pause className="w-4 h-4 mr-1" />
                Live Mode
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Real-time
              </>
            )}
          </button>

          {/* Export Button */}
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Real-time Status */}
      {isRealTimeMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3" />
              <span className="font-medium text-green-800">Live Engagement Monitoring</span>
            </div>
            {engagementData.realTime && (
              <div className="text-sm text-green-700">
                Current Engagement: {engagementData.realTime.overallEngagement?.toFixed(1) || 0}% | 
                Active Students: {engagementData.realTime.studentEngagement?.length || 0}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Engagement Overview */}
      <EngagementOverview 
        data={engagementData}
        realTimeData={realTimeData}
      />

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === 'heatmap' && (
            <HeatmapView 
              data={heatmapData}
              selectedTimeSlot={selectedTimeSlot}
              setSelectedTimeSlot={setSelectedTimeSlot}
              granularity={granularity}
              getEngagementColor={getEngagementColor}
              getEngagementIntensity={getEngagementIntensity}
            />
          )}
          
          {viewMode === 'timeline' && (
            <TimelineView 
              data={engagementData}
              granularity={granularity}
            />
          )}
          
          {viewMode === 'patterns' && (
            <PatternAnalysis 
              data={engagementData}
              timeframe={timeframe}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/**
 * Engagement Overview Component
 */
const EngagementOverview = ({ data, realTimeData }) => {
  const overviewMetrics = [
    {
      title: 'Overall Engagement',
      value: `${data.overallEngagement?.toFixed(1) || 0}%`,
      change: data.engagementTrend || 0,
      icon: Activity,
      color: 'blue'
    },
    {
      title: 'Peak Engagement Time',
      value: data.peakEngagementTime || 'N/A',
      change: 0,
      icon: Clock,
      color: 'green'
    },
    {
      title: 'Active Students',
      value: data.activeStudentCount || 0,
      change: data.activeStudentTrend || 0,
      icon: Users,
      color: 'purple'
    },
    {
      title: 'Interaction Rate',
      value: `${data.interactionRate?.toFixed(1) || 0}%`,
      change: data.interactionTrend || 0,
      icon: MousePointer,
      color: 'orange'
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
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
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
 * Heatmap View Component
 */
const HeatmapView = ({ 
  data, 
  selectedTimeSlot, 
  setSelectedTimeSlot, 
  granularity, 
  getEngagementColor, 
  getEngagementIntensity 
}) => {
  const timeLabels = data.timeLabels || [];
  const contentLabels = data.contentLabels || [];
  const heatmapValues = data.values || [];

  return (
    <div className="space-y-6">
      {/* Heatmap Grid */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Engagement Heatmap</h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Low</span>
            <div className="flex space-x-1">
              {[0, 20, 40, 60, 80, 100].map(val => (
                <div
                  key={val}
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: getEngagementColor(val) }}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">High</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Time Header */}
            <div className="flex mb-2">
              <div className="w-32 flex-shrink-0"></div>
              {timeLabels.map((time, index) => (
                <div
                  key={index}
                  className="w-16 text-xs text-center text-gray-600 px-1"
                >
                  {time}
                </div>
              ))}
            </div>

            {/* Heatmap Rows */}
            {contentLabels.map((content, rowIndex) => (
              <div key={rowIndex} className="flex items-center mb-1">
                <div className="w-32 flex-shrink-0 text-xs text-gray-700 pr-2 truncate">
                  {content}
                </div>
                {timeLabels.map((time, colIndex) => {
                  const value = heatmapValues[rowIndex]?.[colIndex] || 0;
                  const isSelected = selectedTimeSlot?.row === rowIndex && selectedTimeSlot?.col === colIndex;
                  
                  return (
                    <motion.div
                      key={colIndex}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedTimeSlot({ row: rowIndex, col: colIndex, value, content, time })}
                      className={`w-16 h-8 m-px rounded cursor-pointer border-2 transition-all ${
                        isSelected ? 'border-blue-500 shadow-lg' : 'border-transparent'
                      }`}
                      style={{
                        backgroundColor: getEngagementColor(value),
                        opacity: 0.3 + getEngagementIntensity(value) * 0.7
                      }}
                      title={`${content} at ${time}: ${value}% engagement`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Time Slot Details */}
      {selectedTimeSlot && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Slot Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Content</p>
              <p className="font-medium text-gray-900">{selectedTimeSlot.content}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Time</p>
              <p className="font-medium text-gray-900">{selectedTimeSlot.time}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Engagement Level</p>
              <p className="font-medium text-gray-900">{selectedTimeSlot.value}%</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content Type Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Type Engagement</h3>
          <div className="space-y-4">
            {[
              { type: 'Video', engagement: 85, icon: Video },
              { type: 'Interactive', engagement: 78, icon: MousePointer },
              { type: 'Reading', engagement: 65, icon: BookOpen },
              { type: 'Assessment', engagement: 72, icon: FileText }
            ].map(item => (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex items-center">
                  <item.icon className="w-5 h-5 text-blue-500 mr-3" />
                  <span className="font-medium">{item.type}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${item.engagement}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{item.engagement}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Activity Times</h3>
          <div className="space-y-3">
            {[
              { time: '10:00 AM', activity: 'Video Session', engagement: 92 },
              { time: '2:00 PM', activity: 'Discussion Forum', engagement: 87 },
              { time: '4:00 PM', activity: 'Practice Quiz', engagement: 83 },
              { time: '7:00 PM', activity: 'Live Q&A', engagement: 89 }
            ].map((peak, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{peak.time}</p>
                  <p className="text-sm text-gray-600">{peak.activity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">{peak.engagement}%</p>
                  <p className="text-xs text-gray-500">engagement</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Timeline View Component
 */
const TimelineView = ({ data, granularity }) => {
  const timelineData = data.timelineData || [];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Timeline</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="engagement" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3}
                strokeWidth={2}
                name="Engagement %"
              />
              <Area 
                type="monotone" 
                dataKey="activeStudents" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.3}
                strokeWidth={2}
                name="Active Students"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hourlyDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="engagement" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Patterns</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.weeklyPattern || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="engagement" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Pattern Analysis Component
 */
const PatternAnalysis = ({ data, timeframe }) => {
  const patterns = data.patterns || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Engagement Patterns */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <Target className="w-5 h-5 inline mr-2" />
            Engagement Patterns
          </h3>
          <div className="space-y-3">
            {(patterns.engagement || []).map((pattern, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{pattern.description}</span>
                <span className="text-sm font-medium text-blue-600">{pattern.frequency}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Drop-off Points */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <TrendingDown className="w-5 h-5 inline mr-2" />
            Drop-off Points
          </h3>
          <div className="space-y-3">
            {(patterns.dropoffs || []).map((dropoff, index) => (
              <div key={index} className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm font-medium text-red-800">{dropoff.content}</p>
                <p className="text-xs text-red-600">{dropoff.dropoffRate}% drop-off rate</p>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Engagement */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <Zap className="w-5 h-5 inline mr-2" />
            Peak Engagement
          </h3>
          <div className="space-y-3">
            {(patterns.peaks || []).map((peak, index) => (
              <div key={index} className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">{peak.content}</p>
                <p className="text-xs text-green-600">{peak.engagementRate}% engagement rate</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Behavioral Insights */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Behavioral Insights</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={patterns.behavioral || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sessionDuration" name="Session Duration" />
                <YAxis dataKey="engagement" name="Engagement" />
                <Tooltip />
                <Scatter dataKey="engagement" fill="#3B82F6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Key Insights</h4>
            {(patterns.insights || []).map((insight, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementHeatmap;
