import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Trophy,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { apiService } from '@/utils/api';

interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'code';
  question: string;
  options?: string[];
  correctAnswer: any;
  explanation: string;
  points: number;
  orderIndex: number;
}

interface Assessment {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  type: string;
  timeLimit: number;
  passingScore: number;
  maxAttempts: number;
  questions: Question[];
}

interface AssessmentAttempt {
  id: string;
  score: number;
  passed: boolean;
  earnedPoints: number;
  totalPoints: number;
  results: Array<{
    questionId: string;
    userAnswer: any;
    correctAnswer: any;
    isCorrect: boolean;
    points: number;
    explanation: string;
  }>;
  submittedAt: string;
}

interface AssessmentViewerProps {
  lessonId: string;
  onComplete: (passed: boolean) => void;
}

export const AssessmentViewer: React.FC<AssessmentViewerProps> = ({
  lessonId,
  onComplete
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const queryClient = useQueryClient();

  // Fetch assessment
  const { data: assessmentData, isLoading: assessmentLoading } = useQuery({
    queryKey: ['lesson-assessment', lessonId],
    queryFn: () => apiService.get(`/lessons/${lessonId}/assessment`),
    enabled: !!lessonId,
  });

  // Fetch previous attempts
  const { data: attemptsData } = useQuery({
    queryKey: ['assessment-attempts', assessmentData?.data?.id],
    queryFn: () => apiService.get(`/assessments/${assessmentData.data.id}/attempts`),
    enabled: !!assessmentData?.data?.id,
  });

  // Submit assessment mutation
  const submitAssessmentMutation = useMutation({
    mutationFn: (answers: any[]) => 
      apiService.post(`/assessments/${assessment.id}/submit`, { answers }),
    onSuccess: (data) => {
      setIsSubmitted(true);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ['assessment-attempts'] });
      onComplete(data.data.passed);
    },
  });

  const assessment: Assessment = assessmentData?.data;
  const attempts: AssessmentAttempt[] = attemptsData?.data || [];
  const latestAttempt = attempts[0];

  // Initialize answers array
  useEffect(() => {
    if (assessment && answers.length === 0) {
      setAnswers(new Array(assessment.questions.length).fill(null));
      setTimeRemaining(assessment.timeLimit);
    }
  }, [assessment, answers.length]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev && prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isSubmitted]);

  const handleAnswerChange = (questionIndex: number, answer: any) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (answers.some(answer => answer === null)) {
      if (!confirm('Some questions are not answered. Submit anyway?')) {
        return;
      }
    }
    submitAssessmentMutation.mutate(answers);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const canRetake = () => {
    return attempts.length < assessment?.maxAttempts;
  };

  const handleRetake = () => {
    setAnswers(new Array(assessment.questions.length).fill(null));
    setCurrentQuestionIndex(0);
    setTimeRemaining(assessment.timeLimit);
    setIsSubmitted(false);
    setShowResults(false);
  };

  if (assessmentLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-gray-600">No assessment found for this lesson.</p>
      </div>
    );
  }

  // Show results if submitted or if there's a previous attempt
  if (showResults || (latestAttempt && !isSubmitted)) {
    const attempt = isSubmitted ? submitAssessmentMutation.data?.data : latestAttempt;
    
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            attempt.passed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {attempt.passed ? (
              <Trophy className="h-8 w-8 text-green-600" />
            ) : (
              <XCircle className="h-8 w-8 text-red-600" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold mb-2">
            {attempt.passed ? 'Congratulations!' : 'Assessment Complete'}
          </h2>
          
          <p className="text-gray-600 mb-4">
            You scored {attempt.score}% ({attempt.earnedPoints}/{attempt.totalPoints} points)
          </p>
          
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            attempt.passed 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {attempt.passed ? 'Passed' : 'Failed'} • Required: {assessment.passingScore}%
          </div>
        </div>

        {/* Question Results */}
        <div className="space-y-4 mb-6">
          {attempt.results.map((result, index) => (
            <div key={result.questionId} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium">Question {index + 1}</h4>
                <div className={`flex items-center ${
                  result.isCorrect ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.isCorrect ? (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-1" />
                  )}
                  {result.points}/{assessment.questions[index].points} pts
                </div>
              </div>
              
              <p className="text-gray-700 mb-2">{assessment.questions[index].question}</p>
              
              <div className="text-sm">
                <p className="mb-1">
                  <span className="font-medium">Your answer:</span> {result.userAnswer}
                </p>
                {!result.isCorrect && (
                  <p className="mb-1">
                    <span className="font-medium">Correct answer:</span> {result.correctAnswer}
                  </p>
                )}
                <p className="text-gray-600">{result.explanation}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Retake Option */}
        {!attempt.passed && canRetake() && (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              You have {assessment.maxAttempts - attempts.length} attempts remaining.
            </p>
            <Button
              leftIcon={<RotateCcw />}
              onClick={handleRetake}
            >
              Retake Assessment
            </Button>
          </div>
        )}
      </div>
    );
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Assessment Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{assessment.title}</h2>
            <p className="text-gray-600">{assessment.description}</p>
          </div>
          
          {timeRemaining !== null && (
            <div className={`flex items-center px-3 py-2 rounded-lg ${
              timeRemaining < 60 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
              <Clock className="h-4 w-4 mr-2" />
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Question {currentQuestionIndex + 1} of {assessment.questions.length}</span>
          <span>Passing Score: {assessment.passingScore}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / assessment.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">{currentQuestion.question}</h3>
          
          <QuestionInput
            question={currentQuestion}
            value={answers[currentQuestionIndex]}
            onChange={(answer) => handleAnswerChange(currentQuestionIndex, answer)}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>

          <div className="flex space-x-1">
            {assessment.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium ${
                  index === currentQuestionIndex
                    ? 'bg-primary-600 text-white'
                    : answers[index] !== null
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex === assessment.questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={submitAssessmentMutation.isPending}
            >
              {submitAssessmentMutation.isPending ? 'Submitting...' : 'Submit Assessment'}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex(Math.min(assessment.questions.length - 1, currentQuestionIndex + 1))}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Question Input Component
const QuestionInput: React.FC<{
  question: Question;
  value: any;
  onChange: (value: any) => void;
}> = ({ question, value, onChange }) => {
  switch (question.type) {
    case 'multiple-choice':
      return (
        <div className="space-y-2">
          {question.options?.map((option, index) => (
            <label key={index} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name={`question-${question.id}`}
                value={index}
                checked={value === index}
                onChange={() => onChange(index)}
                className="mr-3"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      );

    case 'true-false':
      return (
        <div className="space-y-2">
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name={`question-${question.id}`}
              value="true"
              checked={value === true}
              onChange={() => onChange(true)}
              className="mr-3"
            />
            <span>True</span>
          </label>
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name={`question-${question.id}`}
              value="false"
              checked={value === false}
              onChange={() => onChange(false)}
              className="mr-3"
            />
            <span>False</span>
          </label>
        </div>
      );

    case 'code':
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-32 p-3 border rounded-lg font-mono text-sm"
          placeholder="Enter your code here..."
        />
      );

    default:
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 border rounded-lg"
          placeholder="Enter your answer..."
        />
      );
  }
};
