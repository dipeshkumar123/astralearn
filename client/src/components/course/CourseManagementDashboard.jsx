/**
 * Course Management Dashboard - Phase 3 Step 1
 * Main interface that combines all course management components
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  Edit3, 
  Trash2, 
  Copy, 
  Eye, 
  BarChart3,
  Settings,
  FileText,
  Users,
  Calendar,
  Star,
  ArrowUp,
  ArrowDown,
  MoreVertical
} from 'lucide-react';

// Import the course management components
import CourseHierarchyBuilder from './CourseHierarchyBuilder';
import RichTextEditor from './RichTextEditor';
import MetadataManager from './MetadataManager';
import VersionControlPanel from './VersionControlPanel';
import CoursePreview from './CoursePreview';

const CourseManagementDashboard = ({ onBackToStatus }) => {
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, create, edit, preview
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    difficulty: '',
    status: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Component visibility states
  const [showRichTextEditor, setShowRichTextEditor] = useState(false);
  const [showMetadataManager, setShowMetadataManager] = useState(false);
  const [showVersionControl, setShowVersionControl] = useState(false);
  const [showCoursePreview, setShowCoursePreview] = useState(false);

  // Load courses on component mount
  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm,
        ...filters,
        page: 1,
        limit: 20      });
      
      const response = await fetch(`/api/course-management/search?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      } else {
        console.error('Course fetch failed:', response.status, response.statusText);
        // Handle 404 or other errors gracefully
        if (response.status === 404) {          console.log('Course management API not available, using mock data');
          setCourses([]); // Set empty array for now
        }
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      // Set fallback mock data for development
      setCourses([
        {
          id: 'mock-1',
          title: 'Introduction to React',
          description: 'Learn the fundamentals of React development',
          status: 'published',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          modules: 5,
          lessons: 15,
          enrollments: 120
        },
        {
          id: 'mock-2', 
          title: 'Advanced JavaScript',
          description: 'Master advanced JavaScript concepts and patterns',
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          modules: 8,
          lessons: 24,
          enrollments: 85
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (courseData) => {
    try {
      const response = await fetch('/api/course-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(courseData)
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(prev => [data.course, ...prev]);
        setActiveView('dashboard');
        setSelectedCourse(null);
      }
    } catch (error) {
      console.error('Failed to create course:', error);
    }
  };

  const handleEditCourse = async (courseId, courseData) => {
    try {
      const response = await fetch(`/api/course-management/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(courseData)
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(prev => prev.map(course => 
          course._id === courseId ? data.course : course
        ));
        fetchCourses(); // Refresh the course list
      }
    } catch (error) {
      console.error('Failed to update course:', error);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      const response = await fetch(`/api/course-management/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setCourses(prev => prev.filter(course => course._id !== courseId));
      }
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const handleDuplicateCourse = async (courseId) => {
    try {
      const response = await fetch(`/api/course-management/${courseId}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: `Copy of ${courses.find(c => c._id === courseId)?.title}`,
          isPublished: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(prev => [data.course, ...prev]);
      }
    } catch (error) {
      console.error('Failed to duplicate course:', error);
    }
  };

  const openCourseForEditing = async (courseId) => {
    try {
      const response = await fetch(`/api/course-management/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedCourse(data.course);
        setActiveView('edit');
      }
    } catch (error) {
      console.error('Failed to fetch course details:', error);
    }
  };
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {onBackToStatus && (
            <button
              onClick={onBackToStatus}
              className="text-blue-600 hover:text-blue-700 mb-2 text-sm flex items-center"
            >
              ← Back to Main Dashboard
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-1">Create, edit, and manage your courses</p>
        </div>
        
        <button
          onClick={() => setActiveView('create')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          
          <button
            onClick={fetchCourses}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="updatedAt">Last Updated</option>
                  <option value="createdAt">Date Created</option>
                  <option value="title">Title</option>
                  <option value="enrollmentCount">Enrollment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))
        ) : courses.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first course</p>
            <button
              onClick={() => setActiveView('create')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </button>
          </div>
        ) : (
          courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onEdit={() => openCourseForEditing(course._id)}
              onDelete={() => handleDeleteCourse(course._id)}
              onDuplicate={() => handleDuplicateCourse(course._id)}
              onPreview={() => {
                setSelectedCourse(course);
                setShowCoursePreview(true);
              }}
            />
          ))
        )}
      </div>
    </div>
  );

  const renderCreateCourse = () => (
    <div>
      <div className="mb-6">
        <button
          onClick={() => setActiveView('dashboard')}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
      </div>
      
      <CourseHierarchyBuilder
        onSave={handleCreateCourse}
        onPreview={(course) => {
          setSelectedCourse(course);
          setShowCoursePreview(true);
        }}
      />
    </div>
  );

  const renderEditCourse = () => (
    <div>
      <div className="mb-6">
        <button
          onClick={() => setActiveView('dashboard')}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowMetadataManager(!showMetadataManager)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Metadata
            </button>
            
            <button
              onClick={() => setShowVersionControl(!showVersionControl)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FileText className="w-4 h-4 mr-2" />
              Versions
            </button>
            
            <button
              onClick={() => {
                setSelectedCourse(selectedCourse);
                setShowCoursePreview(true);
              }}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-3">
          <CourseHierarchyBuilder
            courseData={selectedCourse}
            isEditing={true}
            onSave={(courseData) => handleEditCourse(selectedCourse._id, courseData)}
            onPreview={(course) => {
              setSelectedCourse(course);
              setShowCoursePreview(true);
            }}
          />
        </div>

        {/* Side Panels */}
        <div className="space-y-6">
          {/* Metadata Manager */}
          <MetadataManager
            item={selectedCourse}
            type="course"
            isVisible={showMetadataManager}
            onSave={(metadata) => {
              console.log('Metadata saved:', metadata);
            }}
            onCancel={() => setShowMetadataManager(false)}
          />

          {/* Version Control */}
          <VersionControlPanel
            courseId={selectedCourse?._id}
            isVisible={showVersionControl}
            onVersionRestore={(data) => {
              console.log('Version restored:', data);
            }}
          />
        </div>
      </div>

      {/* Rich Text Editor Modal */}
      <RichTextEditor
        lessonId={selectedLesson?._id}
        isVisible={showRichTextEditor}
        onSave={(content) => {
          console.log('Content saved:', content);
          setShowRichTextEditor(false);
        }}
        onCancel={() => setShowRichTextEditor(false)}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'create' && renderCreateCourse()}
        {activeView === 'edit' && renderEditCourse()}

        {/* Course Preview Modal */}
        <CoursePreview
          course={selectedCourse}
          isVisible={showCoursePreview}
          mode="instructor"
          onClose={() => {
            setShowCoursePreview(false);
            setSelectedCourse(null);
          }}
        />
      </div>
    </div>
  );
};

// Course Card Component
const CourseCard = ({ course, onEdit, onDelete, onDuplicate, onPreview }) => {
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{course.description}</p>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => { onEdit(); setShowActions(false); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => { onPreview(); setShowActions(false); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </button>
                <button
                  onClick={() => { onDuplicate(); setShowActions(false); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </button>
                <button
                  onClick={() => { onDelete(); setShowActions(false); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center space-x-2 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
          {course.difficulty}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          course.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {course.isPublished ? 'Published' : 'Draft'}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{course.modules?.length || 0}</div>
          <div className="text-xs text-gray-600">Modules</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{course.enrollmentCount || 0}</div>
          <div className="text-xs text-gray-600">Students</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
        <div className="flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          Updated {formatDate(course.updatedAt)}
        </div>
        <div className="flex items-center">
          <Star className="w-3 h-3 mr-1" />
          {course.rating?.toFixed(1) || '0.0'}
        </div>
      </div>
    </div>
  );
};

export default CourseManagementDashboard;
