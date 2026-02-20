import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Trash2,
  GripVertical,
  Upload,
  Settings,
  BookOpen,
  Play,
  FileText,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { apiService } from '@/utils/api';

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  objectives: string[];
  prerequisites: string[];
  tags: string[];
  isPublished: boolean;
}

interface Module {
  id?: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id?: string;
  title: string;
  type: 'video' | 'text' | 'interactive' | 'assessment';
  content: string;
  duration: number;
  order: number;
}

export const CourseEditor: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!courseId;

  const [courseData, setCourseData] = useState<CourseFormData>({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    estimatedDuration: 0,
    objectives: [''],
    prerequisites: [''],
    tags: [''],
    isPublished: false,
  });

  const [modules, setModules] = useState<Module[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'settings'>('basic');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch course data if editing
  const { data: existingCourse, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => apiService.get(`/courses/${courseId}`),
    enabled: isEditing,
  });

  // Fetch course modules if editing
  const { data: courseModules } = useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: () => apiService.get(`/courses/${courseId}/modules`),
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingCourse?.data) {
      setCourseData({
        title: existingCourse.data.title || '',
        description: existingCourse.data.description || '',
        category: existingCourse.data.category || '',
        difficulty: existingCourse.data.difficulty || 'beginner',
        estimatedDuration: existingCourse.data.estimatedDuration || 0,
        objectives: existingCourse.data.objectives || [''],
        prerequisites: existingCourse.data.prerequisites || [''],
        tags: existingCourse.data.tags || [''],
        isPublished: existingCourse.data.isPublished || false,
      });
    }
  }, [existingCourse]);

  useEffect(() => {
    if (courseModules?.data) {
      setModules(courseModules.data);
    }
  }, [courseModules]);

  // Save course mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        if (isEditing) {
          return await apiService.put(`/courses/${courseId}`, data);
        } else {
          return await apiService.post('/courses', data);
        }
      } catch (error: any) {
        if (error.response?.status === 403) {
          throw new Error('You need instructor permissions to create/edit courses');
        }
        throw error;
      }
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
      if (!isEditing && response.data?.course?.id) {
        navigate(`/instructor/courses/${response.data.course.id}/edit`);
      }
    },
    onError: (error: any) => {
      console.error('Course save failed:', error.message);
      // You could add a toast notification here
    },
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveMutation.mutateAsync(courseData);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    const publishData = { ...courseData, isPublished: true };
    setCourseData(publishData);
    await saveMutation.mutateAsync(publishData);
  };

  const addObjective = () => {
    setCourseData(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setCourseData(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const removeObjective = (index: number) => {
    setCourseData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const addModule = () => {
    const newModule: Module = {
      title: 'New Module',
      description: '',
      order: modules.length + 1,
      lessons: []
    };
    setModules(prev => [...prev, newModule]);
  };

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<ArrowLeft />}
                onClick={() => navigate('/instructor/dashboard')}
                className="mr-4"
              >
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Edit Course' : 'Create New Course'}
                </h1>
                <p className="text-gray-600">
                  {isEditing ? 'Update your course content and settings' : 'Build an engaging learning experience'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {isEditing && (
                <Button
                  variant="outline"
                  leftIcon={<Eye />}
                  onClick={() => navigate(`/courses/${courseId}`)}
                >
                  Preview
                </Button>
              )}
              <Button
                variant="outline"
                leftIcon={<Save />}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button
                leftIcon={<Upload />}
                onClick={handlePublish}
                disabled={isSaving || !courseData.title}
              >
                {courseData.isPublished ? 'Update' : 'Publish'}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8">
            <TabButton
              active={activeTab === 'basic'}
              onClick={() => setActiveTab('basic')}
            >
              Basic Info
            </TabButton>
            <TabButton
              active={activeTab === 'content'}
              onClick={() => setActiveTab('content')}
            >
              Course Content
            </TabButton>
            <TabButton
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </TabButton>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'basic' && (
          <BasicInfoTab
            courseData={courseData}
            setCourseData={setCourseData}
            addObjective={addObjective}
            updateObjective={updateObjective}
            removeObjective={removeObjective}
          />
        )}

        {activeTab === 'content' && (
          <ContentTab
            modules={modules}
            setModules={setModules}
            addModule={addModule}
            courseId={courseId}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            courseData={courseData}
            setCourseData={setCourseData}
          />
        )}
      </div>
    </div>
  );
};

// Tab Button Component
const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    className={`py-4 px-1 border-b-2 font-medium text-sm ${
      active
        ? 'border-primary-500 text-primary-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

// Basic Info Tab Component
const BasicInfoTab: React.FC<{
  courseData: CourseFormData;
  setCourseData: React.Dispatch<React.SetStateAction<CourseFormData>>;
  addObjective: () => void;
  updateObjective: (index: number, value: string) => void;
  removeObjective: (index: number) => void;
}> = ({ courseData, setCourseData, addObjective, updateObjective, removeObjective }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-6">Course Information</h2>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Title *
          </label>
          <Input
            value={courseData.title}
            onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter course title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={courseData.category}
            onChange={(e) => setCourseData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="">Select category</option>
            <option value="programming">Programming</option>
            <option value="design">Design</option>
            <option value="business">Business</option>
            <option value="marketing">Marketing</option>
            <option value="data-science">Data Science</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level *
          </label>
          <select
            value={courseData.difficulty}
            onChange={(e) => setCourseData(prev => ({ ...prev, difficulty: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Duration (hours) *
          </label>
          <Input
            type="number"
            value={courseData.estimatedDuration}
            onChange={(e) => setCourseData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
            placeholder="0"
            min="1"
            required
          />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Description *
          </label>
          <textarea
            value={courseData.description}
            onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what students will learn in this course"
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Learning Objectives
          </label>
          <div className="space-y-2">
            {courseData.objectives.map((objective, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={objective}
                  onChange={(e) => updateObjective(index, e.target.value)}
                  placeholder="What will students learn?"
                />
                {courseData.objectives.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeObjective(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus />}
              onClick={addObjective}
            >
              Add Objective
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Content Tab Component (placeholder)
const ContentTab: React.FC<{
  modules: Module[];
  setModules: React.Dispatch<React.SetStateAction<Module[]>>;
  addModule: () => void;
  courseId?: string;
}> = ({ modules, addModule }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-lg font-semibold text-gray-900">Course Content</h2>
      <Button leftIcon={<Plus />} onClick={addModule}>
        Add Module
      </Button>
    </div>
    
    {modules.length === 0 ? (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No modules yet</h3>
        <p className="text-gray-600 mb-6">Start building your course by adding modules</p>
        <Button leftIcon={<Plus />} onClick={addModule}>
          Add Your First Module
        </Button>
      </div>
    ) : (
      <div className="space-y-4">
        {modules.map((module, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <GripVertical className="h-5 w-5 text-gray-400" />
                <div>
                  <h3 className="font-medium text-gray-900">{module.title}</h3>
                  <p className="text-sm text-gray-600">{module.lessons.length} lessons</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Settings Tab Component (placeholder)
const SettingsTab: React.FC<{
  courseData: CourseFormData;
  setCourseData: React.Dispatch<React.SetStateAction<CourseFormData>>;
}> = ({ courseData, setCourseData }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-6">Course Settings</h2>
    
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Published Status</h3>
          <p className="text-sm text-gray-600">Make this course visible to students</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={courseData.isPublished}
            onChange={(e) => setCourseData(prev => ({ ...prev, isPublished: e.target.checked }))}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
        </label>
      </div>
    </div>
  </div>
);
