/**
 * Course Hierarchy Builder - Phase 3 Step 1
 * Advanced drag-and-drop course builder with modules and lessons
 */

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  GripVertical, 
  BookOpen, 
  PlayCircle, 
  FileText,
  Clock,
  Target,
  ChevronDown,
  ChevronRight,
  Save,
  Eye,
  Copy
} from 'lucide-react';

const CourseHierarchyBuilder = ({ 
  courseData = null, 
  onSave, 
  onPreview, 
  isEditing = false 
}) => {
  const [course, setCourse] = useState({
    courseInfo: {
      title: '',
      description: '',
      difficulty: 'beginner',
      estimatedDuration: 0,
      objectives: [],
      tags: [],
      prerequisites: [],
      metadata: {
        category: '',
        targetAudience: [],
        skillsGained: []
      }
    },
    modules: []
  });

  const [expandedModules, setExpandedModules] = useState(new Set());
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (courseData) {
      setCourse(courseData);
      // Expand all modules by default when editing
      if (isEditing) {
        const moduleIds = new Set(courseData.modules?.map(m => m.id) || []);
        setExpandedModules(moduleIds);
      }
    }
  }, [courseData, isEditing]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'module') {
      // Reorder modules
      const newModules = Array.from(course.modules);
      const [reorderedItem] = newModules.splice(source.index, 1);
      newModules.splice(destination.index, 0, reorderedItem);

      setCourse(prev => ({
        ...prev,
        modules: newModules.map((module, index) => ({
          ...module,
          position: index + 1
        }))
      }));
    } else if (type === 'lesson') {
      // Reorder lessons within a module
      const moduleIndex = parseInt(source.droppableId.split('-')[1]);
      const newModules = [...course.modules];
      const newLessons = Array.from(newModules[moduleIndex].lessons || []);
      const [reorderedItem] = newLessons.splice(source.index, 1);
      newLessons.splice(destination.index, 0, reorderedItem);

      newModules[moduleIndex] = {
        ...newModules[moduleIndex],
        lessons: newLessons.map((lesson, index) => ({
          ...lesson,
          position: index + 1
        }))
      };

      setCourse(prev => ({ ...prev, modules: newModules }));
    }
  };

  const addModule = () => {
    const newModule = {
      id: `module-${Date.now()}`,
      title: '',
      description: '',
      position: course.modules.length + 1,
      objectives: [],
      estimatedDuration: 0,
      difficulty: course.courseInfo.difficulty,
      lessons: [],
      metadata: {
        tags: [],
        category: '',
        version: '1.0.0'
      }
    };

    setCourse(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));

    setEditingModule(course.modules.length);
    setShowModuleForm(true);
  };

  const addLesson = (moduleIndex) => {
    const newLesson = {
      id: `lesson-${Date.now()}`,
      title: '',
      content: {
        type: 'richtext',
        blocks: [],
        metadata: {}
      },
      objectives: [],
      position: (course.modules[moduleIndex].lessons?.length || 0) + 1,
      estimatedDuration: 0,
      difficulty: course.modules[moduleIndex].difficulty,
      keyTopics: [],
      resources: []
    };

    const newModules = [...course.modules];
    newModules[moduleIndex] = {
      ...newModules[moduleIndex],
      lessons: [...(newModules[moduleIndex].lessons || []), newLesson]
    };

    setCourse(prev => ({ ...prev, modules: newModules }));

    setEditingLesson({ moduleIndex, lessonIndex: newModules[moduleIndex].lessons.length - 1 });
    setShowLessonForm(true);
  };

  const deleteModule = (moduleIndex) => {
    if (window.confirm('Are you sure you want to delete this module? All lessons will be lost.')) {
      const newModules = course.modules.filter((_, index) => index !== moduleIndex);
      setCourse(prev => ({
        ...prev,
        modules: newModules.map((module, index) => ({
          ...module,
          position: index + 1
        }))
      }));
    }
  };

  const deleteLesson = (moduleIndex, lessonIndex) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      const newModules = [...course.modules];
      newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter(
        (_, index) => index !== lessonIndex
      ).map((lesson, index) => ({
        ...lesson,
        position: index + 1
      }));

      setCourse(prev => ({ ...prev, modules: newModules }));
    }
  };

  const duplicateModule = (moduleIndex) => {
    const moduleToClone = course.modules[moduleIndex];
    const clonedModule = {
      ...moduleToClone,
      id: `module-${Date.now()}`,
      title: `${moduleToClone.title} (Copy)`,
      position: course.modules.length + 1,
      lessons: moduleToClone.lessons?.map((lesson, index) => ({
        ...lesson,
        id: `lesson-${Date.now()}-${index}`,
        title: `${lesson.title} (Copy)`
      })) || []
    };

    setCourse(prev => ({
      ...prev,
      modules: [...prev.modules, clonedModule]
    }));
  };

  const toggleModuleExpansion = (moduleId) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const calculateTotalDuration = () => {
    return course.modules.reduce((total, module) => {
      return total + (module.estimatedDuration || 0);
    }, 0);
  };

  const calculateProgress = () => {
    const totalItems = course.modules.reduce((total, module) => {
      return total + 1 + (module.lessons?.length || 0);
    }, 0);

    const completedItems = course.modules.reduce((total, module) => {
      let moduleCompleted = module.title && module.description ? 1 : 0;
      const lessonCompleted = module.lessons?.filter(lesson => 
        lesson.title && lesson.content?.blocks?.length > 0
      ).length || 0;
      return total + moduleCompleted + lessonCompleted;
    }, 0);

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(course);
    } catch (error) {
      console.error('Error saving course:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Course' : 'Create New Course'}
            </h1>
            <p className="text-gray-600 mt-1">
              Build your course structure with modules and lessons
            </p>
          </div>
          <div className="flex items-center space-x-3">            <button
              onClick={onPreview}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Course'}
            </button>
          </div>
        </div>

        {/* Course Progress */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600">Completion</div>
            <div className="text-2xl font-bold text-blue-900">{calculateProgress()}%</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600">Modules</div>
            <div className="text-2xl font-bold text-green-900">{course.modules.length}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600">Lessons</div>
            <div className="text-2xl font-bold text-purple-900">
              {course.modules.reduce((total, module) => total + (module.lessons?.length || 0), 0)}
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-sm text-orange-600">Duration</div>
            <div className="text-2xl font-bold text-orange-900">
              {Math.round(calculateTotalDuration() / 60)}h
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Course Info Form */}
          <CourseInfoForm 
            courseInfo={course.courseInfo}
            onChange={(courseInfo) => setCourse(prev => ({ ...prev, courseInfo }))}
          />

          {/* Module Builder */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Course Structure</h2>
              <button
                onClick={addModule}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Module
              </button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="modules" type="module">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {course.modules.map((module, moduleIndex) => (
                      <ModuleCard
                        key={module.id}
                        module={module}
                        moduleIndex={moduleIndex}
                        isExpanded={expandedModules.has(module.id)}
                        onToggleExpand={() => toggleModuleExpansion(module.id)}
                        onEdit={() => {
                          setEditingModule(moduleIndex);
                          setShowModuleForm(true);
                        }}
                        onDelete={() => deleteModule(moduleIndex)}
                        onDuplicate={() => duplicateModule(moduleIndex)}
                        onAddLesson={() => addLesson(moduleIndex)}
                        onEditLesson={(lessonIndex) => {
                          setEditingLesson({ moduleIndex, lessonIndex });
                          setShowLessonForm(true);
                        }}
                        onDeleteLesson={(lessonIndex) => deleteLesson(moduleIndex, lessonIndex)}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {course.modules.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No modules yet</h3>
                <p className="mb-4">Start building your course by adding your first module.</p>
                <button
                  onClick={addModule}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Module
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Overview</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Target className="w-4 h-4 mr-2 text-blue-600" />
                <span className="text-gray-600">Difficulty:</span>
                <span className="ml-auto font-medium capitalize">
                  {course.courseInfo.difficulty}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-2 text-green-600" />
                <span className="text-gray-600">Duration:</span>
                <span className="ml-auto font-medium">
                  {calculateTotalDuration()} minutes
                </span>
              </div>
              <div className="flex items-center text-sm">
                <BookOpen className="w-4 h-4 mr-2 text-purple-600" />
                <span className="text-gray-600">Objectives:</span>
                <span className="ml-auto font-medium">
                  {course.courseInfo.objectives.length}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={addModule}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Module
              </button>              <button
                onClick={onPreview}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Course
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Building Tips</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Start with clear learning objectives</li>
              <li>• Keep modules focused on specific topics</li>
              <li>• Balance theory with practical exercises</li>
              <li>• Use drag & drop to reorder content</li>
              <li>• Preview regularly to test flow</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showModuleForm && (
        <ModuleFormModal
          module={editingModule !== null ? course.modules[editingModule] : null}
          onSave={(moduleData) => {
            if (editingModule !== null) {
              const newModules = [...course.modules];
              newModules[editingModule] = { ...newModules[editingModule], ...moduleData };
              setCourse(prev => ({ ...prev, modules: newModules }));
            }
            setShowModuleForm(false);
            setEditingModule(null);
          }}
          onClose={() => {
            setShowModuleForm(false);
            setEditingModule(null);
          }}
        />
      )}

      {showLessonForm && editingLesson && (
        <LessonFormModal
          lesson={course.modules[editingLesson.moduleIndex].lessons[editingLesson.lessonIndex]}
          onSave={(lessonData) => {
            const newModules = [...course.modules];
            newModules[editingLesson.moduleIndex].lessons[editingLesson.lessonIndex] = {
              ...newModules[editingLesson.moduleIndex].lessons[editingLesson.lessonIndex],
              ...lessonData
            };
            setCourse(prev => ({ ...prev, modules: newModules }));
            setShowLessonForm(false);
            setEditingLesson(null);
          }}
          onClose={() => {
            setShowLessonForm(false);
            setEditingLesson(null);
          }}
        />
      )}
    </div>
  );
};

// Course Info Form Component
const CourseInfoForm = ({ courseInfo, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateField = (field, value) => {
    onChange({ ...courseInfo, [field]: value });
  };

  const updateMetadata = (field, value) => {
    onChange({
      ...courseInfo,
      metadata: { ...courseInfo.metadata, [field]: value }
    });
  };

  const addObjective = () => {
    updateField('objectives', [...courseInfo.objectives, '']);
  };

  const updateObjective = (index, value) => {
    const newObjectives = [...courseInfo.objectives];
    newObjectives[index] = value;
    updateField('objectives', newObjectives);
  };

  const removeObjective = (index) => {
    updateField('objectives', courseInfo.objectives.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div 
        className="p-6 border-b border-gray-200 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Course Information</h2>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                value={courseInfo.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter course title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level *
              </label>
              <select
                value={courseInfo.difficulty}
                onChange={(e) => updateField('difficulty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Description *
            </label>
            <textarea
              value={courseInfo.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe what students will learn in this course"
              required
            />
          </div>

          {/* Learning Objectives */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Learning Objectives
              </label>
              <button
                onClick={addObjective}
                type="button"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add Objective
              </button>
            </div>
            <div className="space-y-2">
              {courseInfo.objectives.map((objective, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => updateObjective(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Learning objective ${index + 1}`}
                  />
                  <button
                    onClick={() => removeObjective(index)}
                    type="button"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                value={courseInfo.metadata.category || ''}
                onChange={(e) => updateMetadata('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Programming, Design, Business"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration (minutes)
              </label>
              <input
                type="number"
                value={courseInfo.estimatedDuration}
                onChange={(e) => updateField('estimatedDuration', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Total course duration"
                min="0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Module Card Component
const ModuleCard = ({ 
  module, 
  moduleIndex, 
  isExpanded, 
  onToggleExpand, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onAddLesson, 
  onEditLesson, 
  onDeleteLesson 
}) => {
  return (
    <Draggable draggableId={module.id} index={moduleIndex}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-white border rounded-lg mb-4 ${
            snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
          }`}
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div
                  {...provided.dragHandleProps}
                  className="mr-3 text-gray-400 hover:text-gray-600"
                >
                  <GripVertical className="w-5 h-5" />
                </div>
                
                <button
                  onClick={onToggleExpand}
                  className="mr-3 text-gray-500 hover:text-gray-700"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {module.title || `Module ${moduleIndex + 1}`}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {module.lessons?.length || 0} lessons • {module.estimatedDuration || 0} min
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={onEdit}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={onDuplicate}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {isExpanded && (
            <div className="p-4">
              {module.description && (
                <p className="text-gray-600 mb-4">{module.description}</p>
              )}

              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Lessons</h4>
                <button
                  onClick={onAddLesson}
                  className="flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Lesson
                </button>
              </div>

              <Droppable droppableId={`lessons-${moduleIndex}`} type="lesson">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {module.lessons?.map((lesson, lessonIndex) => (
                      <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        lessonIndex={lessonIndex}
                        onEdit={() => onEditLesson(lessonIndex)}
                        onDelete={() => onDeleteLesson(lessonIndex)}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {(!module.lessons || module.lessons.length === 0) && (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No lessons yet. Add your first lesson to get started.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

// Lesson Card Component
const LessonCard = ({ lesson, lessonIndex, onEdit, onDelete }) => {
  const getLessonIcon = (lesson) => {
    if (lesson.content?.type === 'video') return PlayCircle;
    return FileText;
  };

  const Icon = getLessonIcon(lesson);

  return (
    <Draggable draggableId={lesson.id} index={lessonIndex}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex items-center p-3 border border-gray-200 rounded-lg mb-2 bg-gray-50 ${
            snapshot.isDragging ? 'shadow-md' : ''
          }`}
        >
          <div
            {...provided.dragHandleProps}
            className="mr-3 text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          <Icon className="w-5 h-5 text-gray-500 mr-3" />

          <div className="flex-1">
            <h5 className="font-medium text-gray-900">
              {lesson.title || `Lesson ${lessonIndex + 1}`}
            </h5>
            <p className="text-sm text-gray-600">
              {lesson.estimatedDuration || 0} min
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};

// Modal Components (simplified - full implementation would be in separate files)
const ModuleFormModal = ({ module, onSave, onClose }) => {
  const [formData, setFormData] = useState(module || {
    title: '',
    description: '',
    objectives: [],
    estimatedDuration: 0,
    difficulty: 'beginner'
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        <h3 className="text-lg font-semibold mb-4">
          {module ? 'Edit Module' : 'Create Module'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Module title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Module description"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Module
          </button>
        </div>
      </div>
    </div>
  );
};

const LessonFormModal = ({ lesson, onSave, onClose }) => {
  const [formData, setFormData] = useState(lesson || {
    title: '',
    objectives: [],
    estimatedDuration: 0,
    difficulty: 'beginner'
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        <h3 className="text-lg font-semibold mb-4">
          {lesson ? 'Edit Lesson' : 'Create Lesson'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Lesson title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.estimatedDuration}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Lesson
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseHierarchyBuilder;
