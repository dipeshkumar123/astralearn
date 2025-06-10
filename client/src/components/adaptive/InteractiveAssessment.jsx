/**
 * Interactive Assessment Interface - Phase 3 Step 2
 * Advanced assessment interface with AI-powered questions, adaptive difficulty,
 * and real-time feedback based on learning style and performance
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Target,
  TrendingUp,
  BookOpen,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Send,
  Mic,
  Code,
  FileText,
  Image
} from 'lucide-react';

const InteractiveAssessment = ({ 
  lessonId, 
  courseId, 
  userId, 
  assessmentType = 'adaptive',
  onComplete,
  onCancel 
}) => {
  const [assessment, setAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState('medium');
  const [performanceMetrics, setPerformanceMetrics] = useState({
    correct: 0,
    total: 0,
    streak: 0,
    avgTime: 0
  });

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimeElapsed(time => time + 1);
      }, 1000);
    } else if (!isActive && timeElapsed !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeElapsed]);

  // Load assessment data
  useEffect(() => {
    loadAssessment();
  }, [lessonId, courseId, assessmentType]);

  const loadAssessment = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/adaptive-learning/assessments/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          lessonId,
          courseId,
          userId,
          assessmentType,
          questionCount: 10,
          difficulty: difficultyLevel
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAssessment(data.assessment);
        setIsActive(true);
      } else {
        console.error('Failed to load assessment');
      }
    } catch (error) {
      console.error('Assessment loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitAnswer = async (questionId, answer) => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/adaptive-learning/assessments/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          questionId,
          answer,
          userId,
          timeSpent: timeElapsed,
          currentDifficulty: difficultyLevel
        })
      });

      if (response.ok) {
        const result = await response.json();
        setFeedback(prev => ({
          ...prev,
          [questionId]: result.feedback
        }));

        // Update performance metrics
        setPerformanceMetrics(prev => ({
          ...prev,
          correct: prev.correct + (result.feedback.correct ? 1 : 0),
          total: prev.total + 1,
          streak: result.feedback.correct ? prev.streak + 1 : 0,
          avgTime: (prev.avgTime * prev.total + timeElapsed) / (prev.total + 1)
        }));

        // Adapt difficulty based on performance
        if (result.adaptedDifficulty) {
          setDifficultyLevel(result.adaptedDifficulty);
        }

        setShowFeedback(true);
        
        // Auto-advance after showing feedback
        setTimeout(() => {
          if (currentQuestion < assessment.questions.length - 1) {
            nextQuestion();
          } else {
            completeAssessment();
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Answer submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < assessment.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowFeedback(false);
      setTimeElapsed(0);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setShowFeedback(false);
    }
  };

  const completeAssessment = async () => {
    setIsActive(false);
    const finalScore = (performanceMetrics.correct / performanceMetrics.total) * 100;
    
    try {
      const response = await fetch(`/api/adaptive-learning/assessments/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          assessmentId: assessment.id,
          answers,
          score: finalScore,
          timeElapsed: timeElapsed,
          performanceMetrics
        })
      });

      if (response.ok) {
        const result = await response.json();
        onComplete && onComplete(result);
      }
    } catch (error) {
      console.error('Assessment completion error:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuestionContent = (question) => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswerChange(question.id, option)}
                className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                  answers[question.id] === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                {option}
              </motion.button>
            ))}
          </div>
        );

      case 'true_false':
        return (
          <div className="flex space-x-4">
            {['True', 'False'].map((option) => (
              <motion.button
                key={option}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswerChange(question.id, option)}
                className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                  answers[question.id] === option
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option}
              </motion.button>
            ))}
          </div>
        );

      case 'fill_blank':
        return (
          <div className="space-y-4">
            <div 
              className="text-lg leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: question.text.replace(
                  /___/g, 
                  '<input type="text" class="inline-block mx-2 px-2 py-1 border-b-2 border-blue-500 bg-transparent" placeholder="...">'
                )
              }}
            />
          </div>
        );

      case 'short_answer':
        return (
          <textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Type your answer here..."
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
            rows={4}
          />
        );

      case 'coding':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Code className="w-4 h-4" />
              <span>Language: {question.language}</span>
            </div>
            <textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={`Write your ${question.language} code here...`}
              className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm resize-none"
              rows={8}
            />
          </div>
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  const renderFeedback = (questionId) => {
    const feedbackData = feedback[questionId];
    if (!feedbackData) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mt-6 p-4 rounded-lg ${
          feedbackData.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}
      >
        <div className="flex items-center space-x-2 mb-2">
          {feedbackData.correct ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <span className={`font-medium ${feedbackData.correct ? 'text-green-800' : 'text-red-800'}`}>
            {feedbackData.correct ? 'Correct!' : 'Incorrect'}
          </span>
        </div>
        
        <p className="text-gray-700 mb-2">{feedbackData.explanation}</p>
        
        {feedbackData.learningTips && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center space-x-2 mb-1">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Learning Tip</span>
            </div>
            <p className="text-sm text-blue-700">{feedbackData.learningTips}</p>
          </div>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Generating Assessment</h3>
          <p className="text-gray-600">AI is creating personalized questions for you...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Assessment Unavailable</h3>
        <p className="text-gray-600 mb-4">Unable to load the assessment. Please try again.</p>
        <button
          onClick={loadAssessment}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const currentQuestionData = assessment.questions[currentQuestion];
  const timer = timeElapsed;
  const progress = assessment ? ((currentQuestion + 1) / assessment.questions.length) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{assessment.title}</h1>
            <p className="text-gray-600">{assessment.description}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{formatTime(timeElapsed)}</div>
            <div className="text-sm text-gray-500">Time Elapsed</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} of {assessment.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div 
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-green-600">{performanceMetrics.correct}</div>
            <div className="text-xs text-gray-500">Correct</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-600">{performanceMetrics.total}</div>
            <div className="text-xs text-gray-500">Answered</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-orange-600">{performanceMetrics.streak}</div>
            <div className="text-xs text-gray-500">Streak</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-purple-600">{difficultyLevel}</div>
            <div className="text-xs text-gray-500">Level</div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Question */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                {currentQuestionData.type.replace('_', ' ')}
              </span>
              <span className="text-sm text-gray-500">• {currentQuestionData.difficulty}</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {currentQuestionData.question}
            </h2>
          </div>

          {/* Answer Input */}
          {renderQuestionContent(currentQuestionData)}

          {/* Feedback */}
          <AnimatePresence>
            {showFeedback && renderFeedback(currentQuestionData.id)}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex space-x-3">
              {!showFeedback && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => submitAnswer(currentQuestionData.id, answers[currentQuestionData.id])}
                  disabled={!answers[currentQuestionData.id] || submitting}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                      <RotateCcw className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{submitting ? 'Submitting...' : 'Submit Answer'}</span>
                </motion.button>
              )}
            </div>

            <button
              onClick={nextQuestion}
              disabled={currentQuestion === assessment.questions.length - 1 || !showFeedback}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Cancel Button */}
      <div className="text-center mt-6">
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          Cancel Assessment
        </button>
      </div>
    </div>
  );
};

export default InteractiveAssessment;
