import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ChevronLeft, Maximize2, Minimize2, FileText, Award, Share2 } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import CourseSidebar from '../components/CourseSidebar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import AIChatbot from '../components/AIChatbot';
import QuizPlayer from '../components/QuizPlayer';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';

export default function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  // State
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [completedLessons, setCompletedLessons] = useState([]);
  const [marking, setMarking] = useState(false);
  const [quizzesForLesson, setQuizzesForLesson] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState({ enrolled: false, purchased: false });

  // Fetch course + progress + enrollment
  useEffect(() => {
    async function init() {
      try {
        const courseRes = await axios.get(`/api/courses/${courseId}`);
        const data = courseRes.data;
        const modules = (data.sections || []).map(s => ({
          id: s.id,
          title: s.title,
          lessons: (s.lessons || []).sort((a, b) => (a.position || 0) - (b.position || 0))
        }));
        const flatLessons = modules.flatMap(m => m.lessons);
        setCourse({ ...data, modules, lessons: flatLessons });
        if (flatLessons.length > 0) setCurrentLesson(flatLessons[0]);
      } catch (e) {
        toast.error('Failed to load course');
      } finally {
        setLoading(false);
      }

      // Enrollment status
      try {
        const token = await getToken();
        const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const enrollRes = await axios.get(`/api/courses/${courseId}/enrollment-status`, cfg);
        setEnrollmentStatus(enrollRes.data);
      } catch {}

      // Progress
      try {
        const token = await getToken();
        const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const progRes = await axios.get(`/api/progress/course/${courseId}`, cfg);
        const completed = progRes.data.filter(p => p.isCompleted).map(p => p.lessonId);
        setCompletedLessons(completed);
      } catch {}
    }
    init();
  }, [courseId]);

  // Fetch quizzes when lesson changes
  useEffect(() => {
    async function fetchQuizzes() {
      if (!currentLesson) return;
      try {
        const res = await axios.get(`/api/quizzes/lesson/${currentLesson.id}`);
        setQuizzesForLesson(res.data || []);
      } catch {
        setQuizzesForLesson([]);
      }
    }
    fetchQuizzes();
  }, [currentLesson?.id]);

  // Handlers
  const handleLessonSelect = (lesson) => {
    setCurrentLesson(lesson);
    setSelectedQuizId(null);
    setActiveTab('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const markProgress = async (lessonId) => {
    setMarking(true);
    try {
      const token = await getToken();
      const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.post(`/api/progress/lesson/${lessonId}`, {}, cfg);
      const progRes = await axios.get(`/api/progress/course/${courseId}`, cfg);
      const completed = progRes.data.filter(p => p.isCompleted).map(p => p.lessonId);
      setCompletedLessons(completed);
    } catch (e) {
      toast.error('Failed to mark progress');
    } finally {
      setMarking(false);
    }
  };

  const unmarkProgress = async (lessonId) => {
    setMarking(true);
    try {
      const token = await getToken();
      const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.delete(`/api/progress/lesson/${lessonId}`, cfg);
      const progRes = await axios.get(`/api/progress/course/${courseId}`, cfg);
      const completed = progRes.data.filter(p => p.isCompleted).map(p => p.lessonId);
      setCompletedLessons(completed);
    } catch (e) {
      toast.error('Failed to unmark');
    } finally {
      setMarking(false);
    }
  };

  const nextLesson = () => {
    if (!course || !currentLesson) return;
    const idx = course.lessons.findIndex(l => l.id === currentLesson.id);
    if (idx < course.lessons.length - 1) handleLessonSelect(course.lessons[idx + 1]);
  };
  const prevLesson = () => {
    if (!course || !currentLesson) return;
    const idx = course.lessons.findIndex(l => l.id === currentLesson.id);
    if (idx > 0) handleLessonSelect(course.lessons[idx - 1]);
  };

  const enrollInCourse = async () => {
    try {
      const token = await getToken();
      const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.post(`/api/courses/${courseId}/enroll`, {}, cfg);
      toast.success('Enrolled successfully!');
      setEnrollmentStatus(s => ({ ...s, enrolled: true }));
    } catch (e) {
      toast.error(e.response?.data?.error || 'Enrollment failed');
    }
  };

  const toggleSidebar = () => setSidebarOpen(s => !s);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Course not found</h2>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 truncate max-w-md">{course.title}</h1>
            <p className="text-xs text-slate-500">{currentLesson ? currentLesson.title : 'Select a lesson'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleSidebar} className="hidden lg:flex">
            {sidebarOpen ? <Maximize2 className="h-4 w-4 mr-2" /> : <Minimize2 className="h-4 w-4 mr-2" />}
            {sidebarOpen ? 'Cinema Mode' : 'Show Sidebar'}
          </Button>
          <Button variant="primary" size="sm"><Share2 className="h-4 w-4 mr-2" />Share</Button>
          {!enrollmentStatus.enrolled && (
            <Button variant="secondary" size="sm" onClick={enrollInCourse} className="bg-green-600 text-white hover:bg-green-700">Enroll</Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6">
          <div className={`mx-auto transition-all duration-300 ${sidebarOpen ? 'max-w-5xl' : 'max-w-6xl'}`}>            
            <div className="mb-6">
              <VideoPlayer playbackId={currentLesson?.muxPlaybackId} videoUrl={currentLesson?.videoUrl} title={currentLesson?.title} />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-slate-200 mb-6 overflow-x-auto">
              {['overview', ...(quizzesForLesson.length > 0 ? ['quiz'] : []), 'notes', 'reviews', 'ai-tutor'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-1 text-sm font-medium capitalize transition-all border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >{tab.replace('-', ' ')}</button>
              ))}
            </div>

            <div className="min-h-[300px]">
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{currentLesson?.title}</h2>
                    <p className="text-slate-600 leading-relaxed">{currentLesson?.description || 'No description available for this lesson.'}</p>
                  </div>
                  <Card className="p-6 bg-primary-50 border-primary-100">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-full shadow-sm text-primary"><Award className="h-6 w-6" /></div>
                      <div>
                        <h3 className="font-bold text-slate-900 mb-1">Learning Objectives</h3>
                        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                          <li>Understand the core concepts of {currentLesson?.title}</li>
                          <li>Apply knowledge in practical scenarios</li>
                          <li>Complete the quiz to verify understanding</li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                  {currentLesson && (
                    <div className="flex flex-wrap gap-3">
                      {completedLessons.includes(currentLesson.id) ? (
                        <Button size="sm" data-testid="unmark-complete" disabled={marking} onClick={() => unmarkProgress(currentLesson.id)} className="bg-red-600 text-white">Unmark Complete</Button>
                      ) : (
                        <Button size="sm" data-testid="mark-complete" disabled={marking} onClick={() => markProgress(currentLesson.id)} className="bg-green-600 text-white">Mark Complete</Button>
                      )}
                      <Button size="sm" variant="secondary" disabled={!course || course.lessons[0]?.id === currentLesson.id} onClick={prevLesson}>Prev</Button>
                      <Button size="sm" variant="secondary" disabled={!course || course.lessons[course.lessons.length - 1]?.id === currentLesson.id} onClick={nextLesson}>Next</Button>
                    </div>
                  )}
                  {quizzesForLesson.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="font-semibold text-slate-800">Quizzes for this lesson</h4>
                      {quizzesForLesson.map(q => (
                        <div key={q.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                          <div>
                            <p className="font-medium text-slate-900">{q.title}</p>
                            <p className="text-xs text-slate-500">{q.passingScore}% pass · {q._count?.questions || 0} question(s)</p>
                          </div>
                          <Button size="sm" variant="secondary" onClick={() => { setSelectedQuizId(q.id); setActiveTab('quiz'); }}>Start Quiz</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'quiz' && selectedQuizId && (
                <div className="animate-fade-in">
                  <QuizPlayer quizId={selectedQuizId} onComplete={() => toast.success('Quiz attempt recorded')} />
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">My Notes</h3>
                    <Button size="sm" variant="secondary"><FileText className="h-4 w-4 mr-2" />Export Notes</Button>
                  </div>
                  <textarea className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none font-sans text-slate-700" placeholder="Take notes here... (Auto-saved)" />
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="animate-fade-in space-y-8">
                  <ReviewForm courseId={courseId} />
                  <ReviewList courseId={courseId} />
                </div>
              )}

              {activeTab === 'ai-tutor' && (
                <div className="animate-fade-in h-[600px]">
                  <AIChatbot courseId={courseId} context={`Course: ${course.title}, Lesson: ${currentLesson?.title}`} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`bg-white border-l border-slate-200 transition-all duration-300 ease-in-out shrink-0 ${sidebarOpen ? 'w-80 translate-x-0' : 'w-0 translate-x-full opacity-0 overflow-hidden'}`}>
          <CourseSidebar
            course={course}
            currentLessonId={currentLesson?.id}
            onSelectLesson={handleLessonSelect}
            completedLessons={completedLessons}
          />
        </div>
      </div>
    </div>
  );
}
