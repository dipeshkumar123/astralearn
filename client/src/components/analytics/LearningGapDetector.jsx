/**
 * Learning Gap Detector - Phase 5 Step 2
 * Automated identification of learning difficulties and knowledge gaps
 * 
 * Features:
 * - AI-powered learning gap identification
 * - Skill deficiency analysis
 * - Prerequisites knowledge assessment
 * - Learning pathway obstruction detection
 * - Predictive gap detection
 * - Gap resolution tracking
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell
} from 'recharts';
import { 
  AlertTriangle, 
  Brain,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Play,
  Pause,
  RefreshCw,
  Eye,
  Lightbulb,
  ArrowRight,
  ArrowDown,
  AlertCircle,
  Info,
  Zap,
  Map,
  Route,
  BarChart3,
  PieChart,
  Activity,
  FileText,
  GraduationCap
} from 'lucide-react';

const LearningGapDetector = ({ courseId, alerts }) => {
  const [gapData, setGapData] = useState(null);
  const [selectedGap, setSelectedGap] = useState(null);
  const [studentGaps, setStudentGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisDepth, setAnalysisDepth] = useState('detailed');
  const [viewMode, setViewMode] = useState('overview'); // overview, individual, predictive
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (courseId) {
      loadGapData();
    }
  }, [courseId, analysisDepth]);

  /**
   * Load Gap Detection Data
   */
  const loadGapData = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);

      // Load existing gap analysis
      const gapResponse = await fetch(
        `/api/analytics/instructor/gap-analysis/${courseId}?depth=${analysisDepth}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (gapResponse.ok) {
        const gapResult = await gapResponse.json();
        setGapData(gapResult.data);
      }

      // Load student-specific gaps
      const studentGapsResponse = await fetch(
        `/api/analytics/instructor/student-gaps/${courseId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (studentGapsResponse.ok) {
        const studentGapsResult = await studentGapsResponse.json();
        setStudentGaps(studentGapsResult.data || []);
      }

    } catch (error) {
      console.error('Gap data loading error:', error);
      setError('Failed to load learning gap data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Run Gap Analysis
   */
  const runGapAnalysis = async () => {
    if (!courseId) return;

    try {
      setIsAnalyzing(true);

      // Get all students in course
      const studentsResponse = await fetch(
        `/api/courses/${courseId}/students`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        const studentIds = studentsData.students?.map(s => s._id) || [];

        // Run gap detection
        const detectResponse = await fetch(
          `/api/analytics/instructor/detect-gaps/${courseId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              studentIds,
              analysisDepth
            })
          }
        );

        if (detectResponse.ok) {
          const detectResult = await detectResponse.json();
          setGapData(detectResult.data);
          
          // Refresh student gaps
          await loadGapData();
        }
      }

    } catch (error) {
      console.error('Gap analysis error:', error);
      setError('Failed to run gap analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Get Gap Severity Color
   */
  const getGapSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  /**
   * Get Gap Type Icon
   */
  const getGapTypeIcon = (type) => {
    switch (type) {
      case 'conceptual': return Brain;
      case 'procedural': return Route;
      case 'application': return Target;
      case 'prerequisite': return ArrowDown;
      default: return AlertTriangle;
    }
  };

  /**
   * Filter Gaps
   */
  const filteredGaps = useCallback(() => {
    if (!gapData?.gaps) return [];

    let filtered = [...gapData.gaps];

    // Apply severity filter
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(gap => gap.severity === filterSeverity);
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(gap => gap.type === filterType);
    }

    return filtered.sort((a, b) => {
      const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
    });
  }, [gapData, filterSeverity, filterType]);

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
          <h2 className="text-2xl font-bold text-gray-900">Learning Gap Detector</h2>
          <p className="text-gray-600">Identify and analyze learning difficulties and knowledge gaps</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Analysis Depth */}
          <select
            value={analysisDepth}
            onChange={(e) => setAnalysisDepth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="basic">Basic Analysis</option>
            <option value="detailed">Detailed Analysis</option>
            <option value="comprehensive">Comprehensive Analysis</option>
          </select>

          {/* View Mode */}
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="overview">Overview</option>
            <option value="individual">Individual Analysis</option>
            <option value="predictive">Predictive Analysis</option>
          </select>

          {/* Run Analysis */}
          <button
            onClick={runGapAnalysis}
            disabled={isAnalyzing || !courseId}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center disabled:bg-gray-300"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Analysis
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

      {/* Gap Overview */}
      <GapOverview 
        data={gapData}
        alerts={alerts}
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
          {viewMode === 'overview' && (
            <GapOverviewAnalysis 
              gaps={filteredGaps()}
              selectedGap={selectedGap}
              setSelectedGap={setSelectedGap}
              filterSeverity={filterSeverity}
              setFilterSeverity={setFilterSeverity}
              filterType={filterType}
              setFilterType={setFilterType}
              getGapSeverityColor={getGapSeverityColor}
              getGapTypeIcon={getGapTypeIcon}
            />
          )}
          
          {viewMode === 'individual' && (
            <IndividualGapAnalysis 
              studentGaps={studentGaps}
              courseId={courseId}
              getGapSeverityColor={getGapSeverityColor}
              getGapTypeIcon={getGapTypeIcon}
            />
          )}
          
          {viewMode === 'predictive' && (
            <PredictiveGapAnalysis 
              data={gapData}
              courseId={courseId}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/**
 * Gap Overview Component
 */
const GapOverview = ({ data, alerts }) => {
  const overviewMetrics = [
    {
      title: 'Total Gaps Detected',
      value: data?.totalGaps || 0,
      change: data?.gapTrend || 0,
      icon: AlertTriangle,
      color: 'red'
    },
    {
      title: 'Critical Gaps',
      value: data?.criticalGaps || 0,
      change: data?.criticalGapTrend || 0,
      icon: XCircle,
      color: 'red'
    },
    {
      title: 'Students Affected',
      value: data?.affectedStudents || 0,
      change: data?.affectedStudentsTrend || 0,
      icon: Users,
      color: 'orange'
    },
    {
      title: 'Average Resolution Time',
      value: data?.avgResolutionTime || 'N/A',
      change: 0,
      icon: Clock,
      color: 'blue'
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
                    <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                  )}
                  <span className={`text-sm ${
                    metric.change > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {Math.abs(metric.change)}
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
 * Gap Overview Analysis Component
 */
const GapOverviewAnalysis = ({ 
  gaps, 
  selectedGap, 
  setSelectedGap, 
  filterSeverity, 
  setFilterSeverity,
  filterType,
  setFilterType,
  getGapSeverityColor,
  getGapTypeIcon
}) => {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center space-x-4">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Severities</option>
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
              <option value="conceptual">Conceptual</option>
              <option value="procedural">Procedural</option>
              <option value="application">Application</option>
              <option value="prerequisite">Prerequisite</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Showing {gaps.length} gaps
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gap List */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Detected Gaps</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {gaps.map((gap, index) => {
              const GapIcon = getGapTypeIcon(gap.type);
              
              return (
                <motion.div
                  key={gap.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedGap(gap)}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedGap?.id === gap.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <GapIcon className="w-5 h-5 text-gray-600 mr-2" />
                        <h4 className="font-medium text-gray-900">{gap.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{gap.description}</p>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getGapSeverityColor(gap.severity)}`}>
                          {gap.severity}
                        </span>
                        <span className="text-xs text-gray-500">
                          {gap.affectedStudents} students affected
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Gap Details */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Gap Details</h3>
          </div>
          <div className="p-6">
            {selectedGap ? (
              <GapDetailView gap={selectedGap} />
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a gap to view detailed analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gap Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gap Severity Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { severity: 'Critical', count: gaps.filter(g => g.severity === 'critical').length },
                { severity: 'High', count: gaps.filter(g => g.severity === 'high').length },
                { severity: 'Medium', count: gaps.filter(g => g.severity === 'medium').length },
                { severity: 'Low', count: gaps.filter(g => g.severity === 'low').length }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="severity" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gap Type Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { type: 'Conceptual', count: gaps.filter(g => g.type === 'conceptual').length },
                { type: 'Procedural', count: gaps.filter(g => g.type === 'procedural').length },
                { type: 'Application', count: gaps.filter(g => g.type === 'application').length },
                { type: 'Prerequisite', count: gaps.filter(g => g.type === 'prerequisite').length }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Gap Detail View Component
 */
const GapDetailView = ({ gap }) => {
  const GapIcon = getGapTypeIcon(gap.type);

  return (
    <div className="space-y-6">
      {/* Gap Info */}
      <div>
        <div className="flex items-center mb-2">
          <GapIcon className="w-6 h-6 text-gray-600 mr-2" />
          <h4 className="text-lg font-semibold text-gray-900">{gap.title}</h4>
        </div>
        <p className="text-gray-600">{gap.description}</p>
      </div>

      {/* Gap Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-600">{gap.severity}</p>
          <p className="text-sm text-gray-600">Severity</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{gap.affectedStudents}</p>
          <p className="text-sm text-gray-600">Students Affected</p>
        </div>
      </div>

      {/* Affected Skills */}
      {gap.affectedSkills && (
        <div>
          <h5 className="font-medium text-gray-900 mb-3">Affected Skills</h5>
          <div className="space-y-2">
            {gap.affectedSkills.map((skill, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{skill.name}</span>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${skill.gapSeverity}%` }}
                    />
                  </div>
                  <span className="text-gray-500">{skill.gapSeverity}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {gap.recommendations && (
        <div>
          <h5 className="font-medium text-gray-900 mb-3">Recommendations</h5>
          <div className="space-y-2">
            {gap.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start">
                <Lightbulb className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Individual Gap Analysis Component
 */
const IndividualGapAnalysis = ({ studentGaps, courseId, getGapSeverityColor, getGapTypeIcon }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student List */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Students with Gaps ({studentGaps.length})
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {studentGaps.map((student, index) => (
              <motion.div
                key={student.studentId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedStudent(student)}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedStudent?.studentId === student.studentId ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{student.name}</h4>
                    <p className="text-sm text-gray-600">{student.email}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-sm">
                        Gaps: {student.gaps?.length || 0}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                        getGapSeverityColor(student.overallRisk)
                      }`}>
                        {student.overallRisk} risk
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Student Gap Details */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Student Gap Analysis</h3>
          </div>
          <div className="p-6">
            {selectedStudent ? (
              <StudentGapAnalysis student={selectedStudent} getGapTypeIcon={getGapTypeIcon} />
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a student to view their learning gaps</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Student Gap Analysis Component
 */
const StudentGapAnalysis = ({ student, getGapTypeIcon }) => {
  return (
    <div className="space-y-6">
      {/* Student Info */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900">{student.name}</h4>
        <p className="text-gray-600">{student.email}</p>
      </div>

      {/* Gap Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-600">{student.gaps?.length || 0}</p>
          <p className="text-sm text-gray-600">Learning Gaps</p>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <p className="text-2xl font-bold text-orange-600">{student.overallRisk}</p>
          <p className="text-sm text-gray-600">Risk Level</p>
        </div>
      </div>

      {/* Individual Gaps */}
      {student.gaps && student.gaps.length > 0 && (
        <div>
          <h5 className="font-medium text-gray-900 mb-3">Learning Gaps</h5>
          <div className="space-y-3">
            {student.gaps.map((gap, index) => {
              const GapIcon = getGapTypeIcon(gap.type);
              
              return (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <GapIcon className="w-5 h-5 text-gray-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h6 className="font-medium text-gray-900">{gap.skill}</h6>
                      <p className="text-sm text-gray-600">{gap.description}</p>
                      <div className="flex items-center mt-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          gap.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          gap.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                          gap.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {gap.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Predictive Gap Analysis Component
 */
const PredictiveGapAnalysis = ({ data, courseId }) => {
  const predictiveData = data?.predictive || {};

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Predictive Gap Analysis</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictiveData.timeline || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="predictedGaps" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Predicted Gaps"
                />
                <Line 
                  type="monotone" 
                  dataKey="currentGaps" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Current Gaps"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Risk Predictions</h4>
            {(predictiveData.risks || []).map((risk, index) => (
              <div key={index} className="flex items-start p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{risk.student}</p>
                  <p className="text-sm text-gray-600">{risk.prediction}</p>
                  <p className="text-xs text-gray-500">Confidence: {risk.confidence}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const getGapTypeIcon = (type) => {
  switch (type) {
    case 'conceptual': return Brain;
    case 'procedural': return Route;
    case 'application': return Target;
    case 'prerequisite': return ArrowDown;
    default: return AlertTriangle;
  }
};

export default LearningGapDetector;
