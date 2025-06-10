/**
 * Course Metadata Manager - Phase 3 Step 1
 * Advanced metadata management interface for courses, modules, and lessons
 */

import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  Target, 
  Clock, 
  BarChart3, 
  Users, 
  BookOpen, 
  Plus, 
  X, 
  Edit, 
  Save, 
  AlertCircle,
  Check,
  Info
} from 'lucide-react';

const MetadataManager = ({ 
  item, 
  type = 'course', // 'course', 'module', 'lesson'
  onSave,
  onCancel,
  isVisible = true 
}) => {
  const [metadata, setMetadata] = useState({
    // Common metadata
    tags: [],
    category: '',
    difficulty: 'beginner',
    estimatedDuration: 0,
    
    // Course-specific
    targetAudience: [],
    prerequisites: [],
    learningObjectives: [],
    skillsGained: [],
    
    // Module/Lesson-specific
    keyTopics: [],
    resources: [],
    
    // Analytics metadata
    analytics: {
      expectedCompletionRate: 90,
      difficultyScore: 1,
      engagementLevel: 'medium'
    },
    
    // SEO and discovery metadata
    seo: {
      description: '',
      keywords: [],
      metaTitle: ''
    },
    
    // Content metadata
    content: {
      language: 'en',
      accessibility: {
        hasTranscripts: false,
        hasSubtitles: false,
        screenReaderFriendly: false
      },
      mediaTypes: []
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    if (item && item.metadata) {
      setMetadata({
        ...metadata,
        ...item.metadata,
        tags: item.tags || [],
        category: item.category || '',
        difficulty: item.difficulty || 'beginner',
        estimatedDuration: item.estimatedDuration || 0,
        learningObjectives: item.objectives || item.learningObjectives || [],
        prerequisites: item.prerequisites || [],
      });
    }
  }, [item]);

  const updateField = (field, value) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const updateNestedField = (section, field, value) => {
    setMetadata(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const addArrayItem = (field, defaultValue = '') => {
    updateField(field, [...(metadata[field] || []), defaultValue]);
  };

  const removeArrayItem = (field, index) => {
    updateField(field, metadata[field].filter((_, i) => i !== index));
  };

  const updateArrayItem = (field, index, value) => {
    const newArray = [...metadata[field]];
    newArray[index] = value;
    updateField(field, newArray);
  };

  const validateMetadata = () => {
    const errors = {};

    // Required fields validation
    if (!metadata.category?.trim()) {
      errors.category = 'Category is required';
    }

    if (metadata.estimatedDuration < 1) {
      errors.estimatedDuration = 'Duration must be at least 1 minute';
    }

    if (type === 'course' && metadata.learningObjectives.length === 0) {
      errors.learningObjectives = 'At least one learning objective is required';
    }

    // SEO validation
    if (metadata.seo.description && metadata.seo.description.length > 160) {
      errors.seoDescription = 'SEO description should be under 160 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateMetadata()) {
      return;
    }

    setSaveStatus('saving');
    try {
      await onSave(metadata);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner', color: 'green' },
    { value: 'intermediate', label: 'Intermediate', color: 'yellow' },
    { value: 'advanced', label: 'Advanced', color: 'red' }
  ];

  const engagementLevels = [
    { value: 'low', label: 'Low', description: 'Mostly reading/listening' },
    { value: 'medium', label: 'Medium', description: 'Some interactive elements' },
    { value: 'high', label: 'High', description: 'Highly interactive' }
  ];

  const mediaTypeOptions = [
    'text', 'image', 'video', 'audio', 'interactive', 'quiz', 'code'
  ];

  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Tag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {type.charAt(0).toUpperCase() + type.slice(1)} Metadata
              </h3>
              <p className="text-sm text-gray-600">
                Manage metadata, tags, and classification
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {saveStatus && (
              <div className={`flex items-center space-x-1 text-sm px-2 py-1 rounded ${
                saveStatus === 'success' ? 'bg-green-100 text-green-700' :
                saveStatus === 'error' ? 'bg-red-100 text-red-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {saveStatus === 'success' && <Check className="w-4 h-4" />}
                {saveStatus === 'error' && <AlertCircle className="w-4 h-4" />}
                <span>
                  {saveStatus === 'saving' ? 'Saving...' :
                   saveStatus === 'success' ? 'Saved!' :
                   'Save failed'}
                </span>
              </div>
            )}
            
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Metadata
            </button>
            
            {onCancel && (
              <button
                onClick={onCancel}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Information */}
            <MetadataSection
              title="Basic Information"
              icon={Info}
              fields={[
                {
                  label: 'Category *',
                  type: 'text',
                  value: metadata.category,
                  onChange: (value) => updateField('category', value),
                  error: validationErrors.category,
                  placeholder: 'e.g., Programming, Design, Business'
                },
                {
                  label: 'Difficulty Level',
                  type: 'select',
                  value: metadata.difficulty,
                  onChange: (value) => updateField('difficulty', value),
                  options: difficultyOptions
                },
                {
                  label: 'Estimated Duration (minutes) *',
                  type: 'number',
                  value: metadata.estimatedDuration,
                  onChange: (value) => updateField('estimatedDuration', parseInt(value) || 0),
                  error: validationErrors.estimatedDuration,
                  min: 1
                }
              ]}
            />

            {/* Tags */}
            <TagsManager
              tags={metadata.tags}
              onTagsChange={(tags) => updateField('tags', tags)}
            />

            {/* Target Audience (Course only) */}
            {type === 'course' && (
              <ArrayFieldManager
                title="Target Audience"
                icon={Users}
                items={metadata.targetAudience}
                onItemsChange={(items) => updateField('targetAudience', items)}
                placeholder="e.g., Beginners, Web developers, Students"
              />
            )}

            {/* Prerequisites */}
            <ArrayFieldManager
              title="Prerequisites"
              icon={BookOpen}
              items={metadata.prerequisites}
              onItemsChange={(items) => updateField('prerequisites', items)}
              placeholder="e.g., Basic HTML knowledge, Programming fundamentals"
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Learning Objectives */}
            {(type === 'course' || type === 'module') && (
              <ArrayFieldManager
                title="Learning Objectives"
                icon={Target}
                items={metadata.learningObjectives}
                onItemsChange={(items) => updateField('learningObjectives', items)}
                placeholder="Students will be able to..."
                error={validationErrors.learningObjectives}
                required={type === 'course'}
              />
            )}

            {/* Key Topics (Module/Lesson) */}
            {(type === 'module' || type === 'lesson') && (
              <ArrayFieldManager
                title="Key Topics"
                icon={BookOpen}
                items={metadata.keyTopics}
                onItemsChange={(items) => updateField('keyTopics', items)}
                placeholder="e.g., Variables, Functions, Loops"
              />
            )}

            {/* Skills Gained (Course only) */}
            {type === 'course' && (
              <ArrayFieldManager
                title="Skills Gained"
                icon={BarChart3}
                items={metadata.skillsGained}
                onItemsChange={(items) => updateField('skillsGained', items)}
                placeholder="e.g., React development, API integration"
              />
            )}

            {/* Analytics Metadata */}
            <AnalyticsManager
              analytics={metadata.analytics}
              onAnalyticsChange={(analytics) => updateField('analytics', analytics)}
            />
          </div>
        </div>

        {/* SEO and Content Metadata */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SeoManager
            seo={metadata.seo}
            onSeoChange={(seo) => updateField('seo', seo)}
            error={validationErrors.seoDescription}
          />
          
          <ContentMetadataManager
            content={metadata.content}
            onContentChange={(content) => updateField('content', content)}
            mediaTypeOptions={mediaTypeOptions}
          />
        </div>
      </div>
    </div>
  );
};

// Metadata Section Component
const MetadataSection = ({ title, icon: Icon, fields }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <div className="flex items-center space-x-2 mb-4">
      <Icon className="w-5 h-5 text-gray-600" />
      <h4 className="font-medium text-gray-900">{title}</h4>
    </div>
    
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={index}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
          </label>
          
          {field.type === 'text' && (
            <input
              type="text"
              value={field.value || ''}
              onChange={(e) => field.onChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                field.error ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={field.placeholder}
            />
          )}
          
          {field.type === 'number' && (
            <input
              type="number"
              value={field.value || ''}
              onChange={(e) => field.onChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                field.error ? 'border-red-300' : 'border-gray-300'
              }`}
              min={field.min}
              placeholder={field.placeholder}
            />
          )}
          
          {field.type === 'select' && (
            <select
              value={field.value || ''}
              onChange={(e) => field.onChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {field.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
          
          {field.error && (
            <p className="text-sm text-red-600 mt-1">{field.error}</p>
          )}
        </div>
      ))}
    </div>
  </div>
);

// Tags Manager Component
const TagsManager = ({ tags = [], onTagsChange }) => {
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onTagsChange([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (index) => {
    onTagsChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Tag className="w-5 h-5 text-gray-600" />
        <h4 className="font-medium text-gray-900">Tags</h4>
      </div>
      
      <div className="space-y-3">
        {/* Existing Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              <span>{tag}</span>
              <button
                onClick={() => removeTag(index)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Tag */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Add a tag..."
          />
          <button
            onClick={addTag}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Array Field Manager Component
const ArrayFieldManager = ({ 
  title, 
  icon: Icon, 
  items = [], 
  onItemsChange, 
  placeholder,
  error,
  required = false
}) => {
  const addItem = () => {
    onItemsChange([...items, '']);
  };

  const updateItem = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    onItemsChange(newItems);
  };

  const removeItem = (index) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-gray-600" />
          <h4 className="font-medium text-gray-900">
            {title} {required && <span className="text-red-500">*</span>}
          </h4>
        </div>
        <button
          onClick={addItem}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4 inline mr-1" />
          Add
        </button>
      </div>
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex space-x-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={placeholder}
            />
            <button
              onClick={() => removeItem(index)}
              className="text-red-600 hover:text-red-700 p-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {items.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-4">
            No {title.toLowerCase()} added yet. Click "Add" to get started.
          </div>
        )}
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
};

// Analytics Manager Component
const AnalyticsManager = ({ analytics, onAnalyticsChange }) => {
  const updateAnalytics = (field, value) => {
    onAnalyticsChange({ ...analytics, [field]: value });
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <BarChart3 className="w-5 h-5 text-gray-600" />
        <h4 className="font-medium text-gray-900">Analytics Metadata</h4>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expected Completion Rate (%)
          </label>
          <input
            type="number"
            value={analytics.expectedCompletionRate || 90}
            onChange={(e) => updateAnalytics('expectedCompletionRate', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="0"
            max="100"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Difficulty Score (1-5)
          </label>
          <input
            type="number"
            value={analytics.difficultyScore || 1}
            onChange={(e) => updateAnalytics('difficultyScore', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="1"
            max="5"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Engagement Level
          </label>
          <select
            value={analytics.engagementLevel || 'medium'}
            onChange={(e) => updateAnalytics('engagementLevel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// SEO Manager Component
const SeoManager = ({ seo, onSeoChange, error }) => {
  const updateSeo = (field, value) => {
    onSeoChange({ ...seo, [field]: value });
  };

  const addKeyword = (keyword) => {
    if (keyword.trim() && !seo.keywords.includes(keyword.trim())) {
      updateSeo('keywords', [...(seo.keywords || []), keyword.trim()]);
    }
  };

  const removeKeyword = (index) => {
    updateSeo('keywords', seo.keywords.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <BarChart3 className="w-5 h-5 text-gray-600" />
        <h4 className="font-medium text-gray-900">SEO Metadata</h4>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meta Title
          </label>
          <input
            type="text"
            value={seo.metaTitle || ''}
            onChange={(e) => updateSeo('metaTitle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="SEO-friendly title"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meta Description {seo.description && `(${seo.description.length}/160)`}
          </label>
          <textarea
            value={seo.description || ''}
            onChange={(e) => updateSeo('description', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
            rows={3}
            placeholder="Brief description for search engines"
          />
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Keywords
          </label>
          <TagsManager
            tags={seo.keywords || []}
            onTagsChange={(keywords) => updateSeo('keywords', keywords)}
          />
        </div>
      </div>
    </div>
  );
};

// Content Metadata Manager Component
const ContentMetadataManager = ({ content, onContentChange, mediaTypeOptions }) => {
  const updateContent = (field, value) => {
    onContentChange({ ...content, [field]: value });
  };

  const updateAccessibility = (field, value) => {
    onContentChange({
      ...content,
      accessibility: { ...content.accessibility, [field]: value }
    });
  };

  const toggleMediaType = (mediaType) => {
    const mediaTypes = content.mediaTypes || [];
    if (mediaTypes.includes(mediaType)) {
      updateContent('mediaTypes', mediaTypes.filter(type => type !== mediaType));
    } else {
      updateContent('mediaTypes', [...mediaTypes, mediaType]);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <BookOpen className="w-5 h-5 text-gray-600" />
        <h4 className="font-medium text-gray-900">Content Metadata</h4>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            value={content.language || 'en'}
            onChange={(e) => updateContent('language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="zh">Chinese</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Media Types
          </label>
          <div className="grid grid-cols-2 gap-2">
            {mediaTypeOptions.map(type => (
              <label key={type} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={(content.mediaTypes || []).includes(type)}
                  onChange={() => toggleMediaType(type)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Accessibility
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={content.accessibility?.hasTranscripts || false}
                onChange={(e) => updateAccessibility('hasTranscripts', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Has transcripts</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={content.accessibility?.hasSubtitles || false}
                onChange={(e) => updateAccessibility('hasSubtitles', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Has subtitles</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={content.accessibility?.screenReaderFriendly || false}
                onChange={(e) => updateAccessibility('screenReaderFriendly', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Screen reader friendly</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetadataManager;
