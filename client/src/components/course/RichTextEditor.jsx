/**
 * Rich Text Content Editor - Phase 3 Step 1
 * Advanced content editor with media support, block-based editing, and real-time preview
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Image, 
  Video, 
  Mic, 
  Code, 
  Quote, 
  List, 
  ListOrdered,
  Link,
  Trash2,
  Plus,
  Move,
  Eye,
  Save,
  Upload,
  Type,
  PauseCircle,
  PlayCircle,
  Download
} from 'lucide-react';

const RichTextEditor = ({ 
  content = null, 
  onSave, 
  onCancel,
  lessonId,
  isVisible = true 
}) => {
  const [editorContent, setEditorContent] = useState({
    type: 'richtext',
    blocks: [],
    metadata: {}
  });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [draggedBlockIndex, setDraggedBlockIndex] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (content) {
      setEditorContent(content);
    }
  }, [content]);

  // Block Management
  const addBlock = (type) => {
    const newBlock = createEmptyBlock(type);
    setEditorContent(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
  };

  const updateBlock = (index, updates) => {
    setEditorContent(prev => ({
      ...prev,
      blocks: prev.blocks.map((block, i) => 
        i === index ? { ...block, ...updates } : block
      )
    }));
  };

  const deleteBlock = (index) => {
    setEditorContent(prev => ({
      ...prev,
      blocks: prev.blocks.filter((_, i) => i !== index)
    }));
  };

  const moveBlock = (fromIndex, toIndex) => {
    setEditorContent(prev => {
      const newBlocks = [...prev.blocks];
      const [movedBlock] = newBlocks.splice(fromIndex, 1);
      newBlocks.splice(toIndex, 0, movedBlock);
      return { ...prev, blocks: newBlocks };
    });
  };

  const createEmptyBlock = (type) => {
    const baseBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      createdAt: new Date().toISOString()
    };

    switch (type) {
      case 'text':
        return {
          ...baseBlock,
          content: '',
          formatting: {
            style: 'paragraph',
            alignment: 'left',
            fontSize: 'medium'
          }
        };
      case 'image':
        return {
          ...baseBlock,
          src: '',
          alt: '',
          caption: '',
          width: 'auto',
          height: 'auto'
        };
      case 'video':
        return {
          ...baseBlock,
          src: '',
          title: '',
          description: '',
          thumbnail: '',
          duration: 0
        };
      case 'audio':
        return {
          ...baseBlock,
          src: '',
          title: '',
          duration: 0
        };
      case 'code':
        return {
          ...baseBlock,
          content: '',
          language: 'javascript',
          showLineNumbers: true
        };
      case 'quote':
        return {
          ...baseBlock,
          content: '',
          author: '',
          source: ''
        };
      case 'list':
        return {
          ...baseBlock,
          items: [''],
          ordered: false
        };
      default:
        return baseBlock;
    }
  };

  // File Upload Handler
  const handleFileUpload = async (file, blockIndex) => {
    if (!file || !lessonId) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('mediaFiles', file);
      formData.append('content', JSON.stringify(editorContent));

      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          // Update block with uploaded file information
          updateBlock(blockIndex, {
            src: response.fileUrl,
            metadata: response.metadata
          });
        }
      });

      xhr.open('POST', `/api/course-management/lessons/${lessonId}/content`);
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
      xhr.send(formData);

    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Save Content
  const handleSave = async () => {
    if (!lessonId || !onSave) return;

    try {
      await onSave(editorContent);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Editor Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Content Editor</h3>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                isPreviewMode 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreviewMode ? 'Edit' : 'Preview'}
            </button>
            
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Content
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

      {/* Editor Content */}
      <div className="p-6">
        {isPreviewMode ? (
          <ContentPreview content={editorContent} />
        ) : (
          <ContentEditor 
            content={editorContent}
            onAddBlock={addBlock}
            onUpdateBlock={updateBlock}
            onDeleteBlock={deleteBlock}
            onMoveBlock={moveBlock}
            onFileUpload={handleFileUpload}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept="image/*,video/*,audio/*"
        onChange={(e) => {
          const files = Array.from(e.target.files);
          // Handle multiple file uploads if needed
        }}
      />
    </div>
  );
};

// Content Editor Component
const ContentEditor = ({ 
  content, 
  onAddBlock, 
  onUpdateBlock, 
  onDeleteBlock, 
  onMoveBlock, 
  onFileUpload,
  isUploading,
  uploadProgress 
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      onMoveBlock(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <BlockToolbar onAddBlock={onAddBlock} />

      {/* Blocks */}
      <div className="space-y-3">
        {content.blocks.map((block, index) => (
          <div
            key={block.id}
            className={`relative border rounded-lg ${
              draggedIndex === index ? 'opacity-50' : ''
            }`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <BlockEditor
              block={block}
              index={index}
              onUpdate={(updates) => onUpdateBlock(index, updates)}
              onDelete={() => onDeleteBlock(index)}
              onFileUpload={(file) => onFileUpload(file, index)}
              isUploading={isUploading && uploadProgress > 0}
              uploadProgress={uploadProgress}
            />
          </div>
        ))}

        {content.blocks.length === 0 && (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            <Type className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Start creating content</h3>
            <p className="mb-4">Add text, images, videos, or other content blocks to build your lesson.</p>
            <BlockToolbar onAddBlock={onAddBlock} inline />
          </div>
        )}
      </div>
    </div>
  );
};

// Block Toolbar Component
const BlockToolbar = ({ onAddBlock, inline = false }) => {
  const blockTypes = [
    { type: 'text', icon: Type, label: 'Text' },
    { type: 'image', icon: Image, label: 'Image' },
    { type: 'video', icon: Video, label: 'Video' },
    { type: 'audio', icon: Mic, label: 'Audio' },
    { type: 'code', icon: Code, label: 'Code' },
    { type: 'quote', icon: Quote, label: 'Quote' },
    { type: 'list', icon: List, label: 'List' }
  ];

  const containerClass = inline 
    ? "flex flex-wrap gap-2 justify-center"
    : "flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border";

  const buttonClass = inline
    ? "flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
    : "flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded border-transparent hover:border-gray-300 text-sm";

  return (
    <div className={containerClass}>
      {!inline && (
        <span className="text-sm font-medium text-gray-700 mr-3">Add Block:</span>
      )}
      
      {blockTypes.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          onClick={() => onAddBlock(type)}
          className={buttonClass}
          title={`Add ${label}`}
        >
          <Icon className="w-4 h-4 mr-2" />
          {label}
        </button>
      ))}
    </div>
  );
};

// Block Editor Component
const BlockEditor = ({ 
  block, 
  index, 
  onUpdate, 
  onDelete, 
  onFileUpload,
  isUploading,
  uploadProgress 
}) => {
  const renderBlockContent = () => {
    switch (block.type) {
      case 'text':
        return <TextBlockEditor block={block} onUpdate={onUpdate} />;
      case 'image':
        return <ImageBlockEditor block={block} onUpdate={onUpdate} onFileUpload={onFileUpload} />;
      case 'video':
        return <VideoBlockEditor block={block} onUpdate={onUpdate} onFileUpload={onFileUpload} />;
      case 'audio':
        return <AudioBlockEditor block={block} onUpdate={onUpdate} onFileUpload={onFileUpload} />;
      case 'code':
        return <CodeBlockEditor block={block} onUpdate={onUpdate} />;
      case 'quote':
        return <QuoteBlockEditor block={block} onUpdate={onUpdate} />;
      case 'list':
        return <ListBlockEditor block={block} onUpdate={onUpdate} />;
      default:
        return <div className="p-4 text-gray-500">Unknown block type: {block.type}</div>;
    }
  };

  return (
    <div className="group">
      {/* Block Header */}
      <div className="flex items-center justify-between p-2 border-b bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center space-x-2">
          <Move className="w-4 h-4 text-gray-400 cursor-move" />
          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            {block.type}
          </span>
        </div>
        
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-700 p-1 rounded"
          title="Delete Block"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Block Content */}
      <div className="p-4">
        {renderBlockContent()}
        
        {/* Upload Progress */}
        {isUploading && uploadProgress > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Uploading...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Text Block Editor
const TextBlockEditor = ({ block, onUpdate }) => {
  const [content, setContent] = useState(block.content || '');
  const [formatting, setFormatting] = useState(block.formatting || {});
  
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    onUpdate({ content: newContent });
  };

  const handleFormatChange = (formatKey, value) => {
    const newFormatting = { ...formatting, [formatKey]: value };
    setFormatting(newFormatting);
    onUpdate({ formatting: newFormatting });
  };

  return (
    <div className="space-y-3">
      {/* Formatting Controls */}
      <div className="flex items-center space-x-3 text-sm">
        <select
          value={formatting.style || 'paragraph'}
          onChange={(e) => handleFormatChange('style', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="paragraph">Paragraph</option>
          <option value="heading1">Heading 1</option>
          <option value="heading2">Heading 2</option>
          <option value="heading3">Heading 3</option>
        </select>

        <select
          value={formatting.alignment || 'left'}
          onChange={(e) => handleFormatChange('alignment', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </select>
      </div>

      {/* Content Input */}
      <textarea
        value={content}
        onChange={handleContentChange}
        className="w-full min-h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
        placeholder="Enter your text content..."
        style={{
          textAlign: formatting.alignment || 'left',
          fontSize: formatting.fontSize === 'large' ? '18px' : formatting.fontSize === 'small' ? '14px' : '16px'
        }}
      />
    </div>
  );
};

// Image Block Editor
const ImageBlockEditor = ({ block, onUpdate, onFileUpload }) => {
  const [imageData, setImageData] = useState({
    src: block.src || '',
    alt: block.alt || '',
    caption: block.caption || '',
  });

  const handleDataChange = (field, value) => {
    const newData = { ...imageData, [field]: value };
    setImageData(newData);
    onUpdate(newData);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      onFileUpload(file);
    }
  };

  return (
    <div className="space-y-3">
      {/* File Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id={`image-upload-${block.id}`}
        />
        <label
          htmlFor={`image-upload-${block.id}`}
          className="cursor-pointer flex flex-col items-center"
        >
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-sm text-gray-600">Click to upload image</span>
        </label>
      </div>

      {/* Image Preview */}
      {imageData.src && (
        <div className="relative">
          <img
            src={imageData.src}
            alt={imageData.alt}
            className="max-w-full h-auto rounded-lg shadow-sm"
          />
        </div>
      )}

      {/* Image Metadata */}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alt Text
          </label>
          <input
            type="text"
            value={imageData.alt}
            onChange={(e) => handleDataChange('alt', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the image for accessibility"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Caption
          </label>
          <input
            type="text"
            value={imageData.caption}
            onChange={(e) => handleDataChange('caption', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Optional caption"
          />
        </div>
      </div>
    </div>
  );
};

// Video Block Editor
const VideoBlockEditor = ({ block, onUpdate, onFileUpload }) => {
  const [videoData, setVideoData] = useState({
    src: block.src || '',
    title: block.title || '',
    description: block.description || '',
  });

  const handleDataChange = (field, value) => {
    const newData = { ...videoData, [field]: value };
    setVideoData(newData);
    onUpdate(newData);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      onFileUpload(file);
    }
  };

  return (
    <div className="space-y-3">
      {/* File Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        <input
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
          id={`video-upload-${block.id}`}
        />
        <label
          htmlFor={`video-upload-${block.id}`}
          className="cursor-pointer flex flex-col items-center"
        >
          <Video className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-sm text-gray-600">Click to upload video</span>
        </label>
      </div>

      {/* Video Preview */}
      {videoData.src && (
        <div className="relative">
          <video
            src={videoData.src}
            controls
            className="w-full rounded-lg shadow-sm"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Video Metadata */}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={videoData.title}
            onChange={(e) => handleDataChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Video title"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={videoData.description}
            onChange={(e) => handleDataChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Video description"
          />
        </div>
      </div>
    </div>
  );
};

// Audio Block Editor
const AudioBlockEditor = ({ block, onUpdate, onFileUpload }) => {
  const [audioData, setAudioData] = useState({
    src: block.src || '',
    title: block.title || '',
  });

  const handleDataChange = (field, value) => {
    const newData = { ...audioData, [field]: value };
    setAudioData(newData);
    onUpdate(newData);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      onFileUpload(file);
    }
  };

  return (
    <div className="space-y-3">
      {/* File Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
          id={`audio-upload-${block.id}`}
        />
        <label
          htmlFor={`audio-upload-${block.id}`}
          className="cursor-pointer flex flex-col items-center"
        >
          <Mic className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-sm text-gray-600">Click to upload audio</span>
        </label>
      </div>

      {/* Audio Preview */}
      {audioData.src && (
        <div className="relative">
          <audio
            src={audioData.src}
            controls
            className="w-full"
          >
            Your browser does not support the audio tag.
          </audio>
        </div>
      )}

      {/* Audio Metadata */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={audioData.title}
          onChange={(e) => handleDataChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Audio title"
        />
      </div>
    </div>
  );
};

// Code Block Editor
const CodeBlockEditor = ({ block, onUpdate }) => {
  const [codeData, setCodeData] = useState({
    content: block.content || '',
    language: block.language || 'javascript',
    showLineNumbers: block.showLineNumbers !== false,
  });

  const handleDataChange = (field, value) => {
    const newData = { ...codeData, [field]: value };
    setCodeData(newData);
    onUpdate(newData);
  };

  return (
    <div className="space-y-3">
      {/* Code Controls */}
      <div className="flex items-center space-x-3">
        <select
          value={codeData.language}
          onChange={(e) => handleDataChange('language', e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="sql">SQL</option>
          <option value="json">JSON</option>
        </select>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={codeData.showLineNumbers}
            onChange={(e) => handleDataChange('showLineNumbers', e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Show line numbers</span>
        </label>
      </div>

      {/* Code Input */}
      <textarea
        value={codeData.content}
        onChange={(e) => handleDataChange('content', e.target.value)}
        className="w-full min-h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm bg-gray-50"
        placeholder="Enter your code..."
      />
    </div>
  );
};

// Quote Block Editor
const QuoteBlockEditor = ({ block, onUpdate }) => {
  const [quoteData, setQuoteData] = useState({
    content: block.content || '',
    author: block.author || '',
    source: block.source || '',
  });

  const handleDataChange = (field, value) => {
    const newData = { ...quoteData, [field]: value };
    setQuoteData(newData);
    onUpdate(newData);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quote
        </label>
        <textarea
          value={quoteData.content}
          onChange={(e) => handleDataChange('content', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Enter the quote..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Author
          </label>
          <input
            type="text"
            value={quoteData.author}
            onChange={(e) => handleDataChange('author', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Author name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source
          </label>
          <input
            type="text"
            value={quoteData.source}
            onChange={(e) => handleDataChange('source', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Source/Publication"
          />
        </div>
      </div>
    </div>
  );
};

// List Block Editor
const ListBlockEditor = ({ block, onUpdate }) => {
  const [listData, setListData] = useState({
    items: block.items || [''],
    ordered: block.ordered || false,
  });

  const handleDataChange = (field, value) => {
    const newData = { ...listData, [field]: value };
    setListData(newData);
    onUpdate(newData);
  };

  const addItem = () => {
    handleDataChange('items', [...listData.items, '']);
  };

  const updateItem = (index, value) => {
    const newItems = [...listData.items];
    newItems[index] = value;
    handleDataChange('items', newItems);
  };

  const removeItem = (index) => {
    const newItems = listData.items.filter((_, i) => i !== index);
    handleDataChange('items', newItems);
  };

  return (
    <div className="space-y-3">
      {/* List Type */}
      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            checked={!listData.ordered}
            onChange={() => handleDataChange('ordered', false)}
            className="border-gray-300"
          />
          <List className="w-4 h-4" />
          <span className="text-sm">Unordered</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            checked={listData.ordered}
            onChange={() => handleDataChange('ordered', true)}
            className="border-gray-300"
          />
          <ListOrdered className="w-4 h-4" />
          <span className="text-sm">Ordered</span>
        </label>
      </div>

      {/* List Items */}
      <div className="space-y-2">
        {listData.items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 w-6">
              {listData.ordered ? `${index + 1}.` : '•'}
            </span>
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="List item"
            />
            <button
              onClick={() => removeItem(index)}
              className="text-red-600 hover:text-red-700 p-1"
              disabled={listData.items.length === 1}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        <button
          onClick={addItem}
          className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Item
        </button>
      </div>
    </div>
  );
};

// Content Preview Component
const ContentPreview = ({ content }) => {
  const renderBlock = (block, index) => {
    switch (block.type) {
      case 'text':
        const Tag = block.formatting?.style === 'heading1' ? 'h1' : 
                   block.formatting?.style === 'heading2' ? 'h2' :
                   block.formatting?.style === 'heading3' ? 'h3' : 'p';
        return (
          <Tag 
            key={index}
            style={{ 
              textAlign: block.formatting?.alignment || 'left',
              fontSize: block.formatting?.fontSize === 'large' ? '18px' : 
                       block.formatting?.fontSize === 'small' ? '14px' : '16px'
            }}
            className={`mb-4 ${
              block.formatting?.style?.startsWith('heading') ? 'font-bold' : ''
            }`}
          >
            {block.content}
          </Tag>
        );
      
      case 'image':
        return (
          <div key={index} className="mb-6">
            {block.src && (
              <img
                src={block.src}
                alt={block.alt}
                className="max-w-full h-auto rounded-lg shadow-sm"
              />
            )}
            {block.caption && (
              <p className="text-sm text-gray-600 mt-2 text-center italic">
                {block.caption}
              </p>
            )}
          </div>
        );
      
      case 'video':
        return (
          <div key={index} className="mb-6">
            {block.title && (
              <h4 className="font-medium mb-2">{block.title}</h4>
            )}
            {block.src && (
              <video
                src={block.src}
                controls
                className="w-full rounded-lg shadow-sm"
              >
                Your browser does not support the video tag.
              </video>
            )}
            {block.description && (
              <p className="text-sm text-gray-600 mt-2">{block.description}</p>
            )}
          </div>
        );
      
      case 'audio':
        return (
          <div key={index} className="mb-6">
            {block.title && (
              <h4 className="font-medium mb-2">{block.title}</h4>
            )}
            {block.src && (
              <audio
                src={block.src}
                controls
                className="w-full"
              >
                Your browser does not support the audio tag.
              </audio>
            )}
          </div>
        );
      
      case 'code':
        return (
          <div key={index} className="mb-6">
            <div className="bg-gray-100 rounded-t-lg px-4 py-2 border-b">
              <span className="text-sm font-medium text-gray-600">
                {block.language}
              </span>
            </div>
            <pre className="bg-gray-50 p-4 rounded-b-lg overflow-x-auto">
              <code className="text-sm font-mono">{block.content}</code>
            </pre>
          </div>
        );
      
      case 'quote':
        return (
          <blockquote key={index} className="border-l-4 border-gray-300 pl-4 mb-6 italic">
            <p className="text-lg mb-2">"{block.content}"</p>
            {(block.author || block.source) && (
              <cite className="text-sm text-gray-600">
                — {block.author} {block.source && `(${block.source})`}
              </cite>
            )}
          </blockquote>
        );
      
      case 'list':
        const ListTag = block.ordered ? 'ol' : 'ul';
        return (
          <ListTag key={index} className={`mb-6 ${block.ordered ? 'list-decimal' : 'list-disc'} list-inside`}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex} className="mb-1">{item}</li>
            ))}
          </ListTag>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="prose max-w-none">
      <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300 mb-4">
        <div className="flex items-center justify-center text-gray-500 mb-2">
          <Eye className="w-5 h-5 mr-2" />
          <span className="font-medium">Content Preview</span>
        </div>
        <p className="text-sm text-center text-gray-600">
          This is how your content will appear to students
        </p>
      </div>
      
      {content.blocks.length > 0 ? (
        <div className="space-y-1">
          {content.blocks.map(renderBlock)}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Type className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No content to preview yet. Add some blocks to see the preview.</p>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
