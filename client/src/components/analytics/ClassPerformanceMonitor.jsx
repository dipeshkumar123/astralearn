/**
 * Class Performance Monitor - Phase 5 Step 2
 * Detailed class performance analytics and monitoring
 * 
 * Features:
 * - Real-time class performance tracking
 * - Individual student analytics
 * - Assignment and assessment analytics
 * - Comparative performance analysis
 * - Performance trends and predictions
 * - Risk assessment and early warnings
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
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  BookOpen,
  Target,
  Award,
  Brain,
  FileText,
  Eye,
  UserCheck,
  UserX,
  Filter,
  Download,
  Search,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Star,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

const ClassPerformanceMonitor = ({ courseId, timeframe, realTimeData }) => {
  const [performanceData, setPerformanceData] = useState(null);
  const [studentList, setStudentList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // overview, individual, comparative
  const [sortBy, setSortBy] = useState('performance');
  const [filterRisk, setFilterRisk] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (courseId) {
      loadPerformanceData();
    }
  }, [courseId, timeframe]);

  /**
   * Load Performance Data
   */
  const loadPerformanceData = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);

      // Load class performance overview
      const performanceResponse = await fetch(
        `/api/analytics/instructor/class-performance/${courseId}?timeframe=${timeframe}&includeComparison=true`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (performanceResponse.ok) {
        const performanceResult = await performanceResponse.json();
        setPerformanceData(performanceResult.data);
      }

      // Load student list with analytics
      const studentsResponse = await fetch(
        `/api/analytics/instructor/students-performance/${courseId}?timeframe=${timeframe}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (studentsResponse.ok) {
        const studentsResult = await studentsResponse.json();
        setStudentList(studentsResult.data || []);
      }

    } catch (error) {
      console.error('Performance data loading error:', error);
      setError('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load Individual Student Analytics
   */
  const loadStudentAnalytics = async (studentId) => {
    try {
      const response = await fetch(
        `/api/analytics/instructor/student-analytics/${studentId}/${courseId}?analysisType=performance`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSelectedStudent({
          ...result.data,
          studentId
        });
      }
    } catch (error) {
      console.error('Student analytics loading error:', error);
    }
  };

  /**
   * Filter and Sort Students
   */
  const filteredStudents = useCallback(() => {
    let filtered = [...studentList];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply risk filter
    if (filterRisk !== 'all') {
      filtered = filtered.filter(student => student.riskLevel === filterRisk);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'performance':
          return (b.averageScore || 0) - (a.averageScore || 0);
        case 'engagement':
          return (b.engagementScore || 0) - (a.engagementScore || 0);
        case 'progress':
          return (b.progressPercent || 0) - (a.progressPercent || 0);
        case 'risk':
          const riskOrder = { 'critical': 3, 'high': 2, 'medium': 1, 'low': 0 };
          return (riskOrder[b.riskLevel] || 0) - (riskOrder[a.riskLevel] || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [studentList, searchTerm, filterRisk, sortBy]);

  /**
   * Get Risk Level Color
   */
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  /**
   * Get Performance Trend Icon
   */
  const getTrendIcon = (trend) => {
    if (trend > 0) return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
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
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (!performanceData) {
    return (
      <div className="text-center py-8">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No performance data available for this course.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Class Performance Monitor</h2>
          <p className="text-gray-600">Track and analyze class and individual performance</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Selector */}
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="overview">Overview</option>
            <option value="individual">Individual Analysis</option>
            <option value="comparative">Comparative Analysis</option>
          </select>

          {/* Export Button */}
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Real-time Status */}
      {realTimeData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3" />
              <span className="font-medium text-green-800">Live Performance Data</span>
            </div>
            <div className="text-sm text-green-700">
              Active Students: {realTimeData.metrics?.activeStudents || 0} | 
              Avg Engagement: {realTimeData.metrics?.averageEngagement?.toFixed(1) || 0}%
            </div>
          </div>
        </motion.div>
      )}

      {/* Performance Overview */}
      {viewMode === 'overview' && (
        <PerformanceOverview 
          data={performanceData}
          realTimeData={realTimeData}
        />
      )}

      {/* Individual Analysis */}
      {viewMode === 'individual' && (
        <IndividualAnalysis 
          students={filteredStudents()}
          selectedStudent={selectedStudent}
          onSelectStudent={loadStudentAnalytics}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          filterRisk={filterRisk}
          setFilterRisk={setFilterRisk}
          getRiskColor={getRiskColor}
          getTrendIcon={getTrendIcon}
        />
      )}

      {/* Comparative Analysis */}
      {viewMode === 'comparative' && (
        <ComparativeAnalysis 
          data={performanceData}
          timeframe={timeframe}
        />
      )}
    </div>
  );
};

/**
 * Performance Overview Component
 */
const PerformanceOverview = ({ data, realTimeData }) => {
  const performanceMetrics = [
    {
      title: 'Class Average',
      value: `${data.averageScore?.toFixed(1) || 0}%`,
      change: data.performanceTrend || 0,
      icon: BarChart3,
      color: 'blue'
    },
    {
      title: 'Completion Rate',
      value: `${data.completionRate?.toFixed(1) || 0}%`,
      change: data.completionTrend || 0,
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'At Risk Students',
      value: data.atRiskCount || 0,
      change: data.riskTrend || 0,
      icon: AlertTriangle,
      color: 'red'
    },
    {
      title: 'Top Performers',
      value: data.topPerformersCount || 0,
      change: data.topPerformersTrend || 0,
      icon: Star,
      color: 'yellow'
    }
  ];

  const chartData = data.performanceHistory || [];

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
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
                <div className="flex items-center mt-1">
                  {metric.change > 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  ) : metric.change < 0 ? (
                    <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                  ) : (
                    <Minus className="w-4 h-4 text-gray-500 mr-1" />
                  )}
                  <span className={`text-sm ${
                    metric.change > 0 ? 'text-green-600' : metric.change < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {Math.abs(metric.change)}%
                  </span>
                </div>
              </div>
              <metric.icon className={`w-8 h-8 text-${metric.color}-500`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance Chart */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="averageScore" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Average Score"
              />
              <Line 
                type="monotone" 
                dataKey="completionRate" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Completion Rate"
              />
              <Line 
                type="monotone" 
                dataKey="engagementRate" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="Engagement Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.scoreDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
          <div className="space-y-4">
            {[
              { level: 'Critical', count: data.riskDistribution?.critical || 0, color: 'red' },
              { level: 'High', count: data.riskDistribution?.high || 0, color: 'orange' },
              { level: 'Medium', count: data.riskDistribution?.medium || 0, color: 'yellow' },
              { level: 'Low', count: data.riskDistribution?.low || 0, color: 'green' }
            ].map(risk => (
              <div key={risk.level} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-4 h-4 bg-${risk.color}-500 rounded-full mr-3`} />
                  <span className="font-medium">{risk.level} Risk</span>
                </div>
                <span className="text-gray-600">{risk.count} students</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Individual Analysis Component
 */
const IndividualAnalysis = ({ 
  students, 
  selectedStudent, 
  onSelectStudent, 
  searchTerm, 
  setSearchTerm,
  sortBy,
  setSortBy,
  filterRisk,
  setFilterRisk,
  getRiskColor,
  getTrendIcon
}) => {
  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="performance">Sort by Performance</option>
            <option value="engagement">Sort by Engagement</option>
            <option value="progress">Sort by Progress</option>
            <option value="risk">Sort by Risk Level</option>
            <option value="name">Sort by Name</option>
          </select>

          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical Risk</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student List */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Students ({students.length})
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {students.map((student, index) => (
              <motion.div
                key={student.studentId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectStudent(student.studentId)}
                className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{student.name}</h4>
                    <p className="text-sm text-gray-600">{student.email}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-sm">
                        Score: {student.averageScore?.toFixed(1) || 0}%
                      </span>
                      <span className="text-sm">
                        Progress: {student.progressPercent?.toFixed(1) || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(student.riskLevel)}`}>
                      {student.riskLevel}
                    </span>
                    {getTrendIcon(student.performanceTrend || 0)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Student Details */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Student Details</h3>
          </div>
          <div className="p-6">
            {selectedStudent ? (
              <StudentDetailView student={selectedStudent} />
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a student to view detailed analytics</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Student Detail View Component
 */
const StudentDetailView = ({ student }) => {
  return (
    <div className="space-y-6">
      {/* Student Info */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900">{student.name}</h4>
        <p className="text-gray-600">{student.email}</p>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{student.averageScore?.toFixed(1) || 0}%</p>
          <p className="text-sm text-gray-600">Average Score</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{student.progressPercent?.toFixed(1) || 0}%</p>
          <p className="text-sm text-gray-600">Progress</p>
        </div>
      </div>

      {/* Performance Chart */}
      {student.performanceHistory && (
        <div>
          <h5 className="font-medium text-gray-900 mb-3">Performance History</h5>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={student.performanceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Activities */}
      {student.recentActivities && (
        <div>
          <h5 className="font-medium text-gray-900 mb-3">Recent Activities</h5>
          <div className="space-y-2">
            {student.recentActivities.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{activity.title}</span>
                <span className="text-gray-500">{activity.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Comparative Analysis Component
 */
const ComparativeAnalysis = ({ data, timeframe }) => {
  const comparisonData = data.comparativeAnalysis || {};

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historical Comparison</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonData.historical || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="currentPeriod" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Current Period"
              />
              <Line 
                type="monotone" 
                dataKey="previousPeriod" 
                stroke="#6B7280" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Previous Period"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Peer Comparison</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData.peer || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="performance" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Benchmark Analysis</h3>
          <div className="space-y-4">
            {(comparisonData.benchmarks || []).map((benchmark, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-600">{benchmark.metric}</span>
                <div className="flex items-center">
                  <span className="mr-2">{benchmark.value}%</span>
                  <span className={`text-sm ${
                    benchmark.performance === 'above' ? 'text-green-600' : 
                    benchmark.performance === 'below' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    ({benchmark.performance} benchmark)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassPerformanceMonitor;
