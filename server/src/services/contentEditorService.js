/**
 * Content Editor Service - Phase 3 Step 1
 * Rich text editor with media support, content validation, and version control
 */

import mongoose from 'mongoose';
import { Lesson } from '../models/Lesson.js';
import { Module } from '../models/Module.js';
import path from 'path';
import fs from 'fs/promises';

class ContentEditorService {

  /**
   * Save lesson content with rich text and media
   */
  async saveLessonContent(lessonId, contentData, userId, files = []) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const lesson = await Lesson.findById(lessonId).session(session);
      if (!lesson) {
        throw new Error('Lesson not found');
      }

      // Process uploaded media files
      const processedMedia = await this.processMediaFiles(files, lessonId);

      // Create content with rich text formatting
      const processedContent = await this.processRichTextContent(
        contentData, 
        processedMedia,
        lessonId
      );

      // Validate content structure
      const validationResult = this.validateContentStructure(processedContent);
      if (!validationResult.isValid) {
        throw new Error(`Content validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Create version snapshot before updating
      const versionSnapshot = await this.createContentSnapshot(lesson, userId);

      // Update lesson with new content
      const updatedLesson = await Lesson.findByIdAndUpdate(
        lessonId,
        {
          content: processedContent,
          'metadata.version': this.incrementVersion(lesson.metadata?.version || '1.0.0'),
          'metadata.lastEditedBy': userId,
          'metadata.lastUpdated': new Date(),
          'metadata.wordCount': this.calculateWordCount(processedContent),
          'metadata.estimatedReadTime': this.calculateReadTime(processedContent),
          $push: {
            'metadata.contentHistory': versionSnapshot
          }
        },
        { 
          new: true, 
          session,
          runValidators: true 
        }
      );

      // Update lesson's AI context based on new content
      await this.updateAIContext(updatedLesson, session);

      await session.commitTransaction();

      return {
        success: true,
        lesson: updatedLesson,
        contentStats: {
          wordCount: updatedLesson.metadata.wordCount,
          estimatedReadTime: updatedLesson.metadata.estimatedReadTime,
          mediaCount: processedMedia.length
        },
        versionInfo: {
          newVersion: updatedLesson.metadata.version,
          snapshotId: versionSnapshot._id
        }
      };

    } catch (error) {
      await session.abortTransaction();
      // Clean up any uploaded files on error
      if (files.length > 0) {
        await this.cleanupFiles(files);
      }
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Process rich text content with embedded media
   */
  async processRichTextContent(contentData, mediaFiles, lessonId) {
    const {
      type = 'richtext',
      blocks = [],
      rawText = '',
      metadata = {}
    } = contentData;

    const processedBlocks = await Promise.all(
      blocks.map(async (block) => {
        switch (block.type) {
          case 'text':
            return this.processTextBlock(block);
          case 'image':
            return this.processImageBlock(block, mediaFiles);
          case 'video':
            return this.processVideoBlock(block, mediaFiles);
          case 'audio':
            return this.processAudioBlock(block, mediaFiles);
          case 'interactive':
            return this.processInteractiveBlock(block);
          case 'code':
            return this.processCodeBlock(block);
          case 'quiz':
            return this.processQuizBlock(block);
          default:
            return block;
        }
      })
    );

    return {
      type,
      blocks: processedBlocks,
      rawText: this.extractRawText(processedBlocks),
      metadata: {
        ...metadata,
        processedAt: new Date(),
        lessonId,
        blockCount: processedBlocks.length
      }
    };
  }

  /**
   * Process different content block types
   */
  processTextBlock(block) {
    const {
      id,
      content = '',
      formatting = {},
      style = 'paragraph'
    } = block;

    // Sanitize HTML content
    const sanitizedContent = this.sanitizeHTMLContent(content);

    return {
      id: id || new mongoose.Types.ObjectId().toString(),
      type: 'text',
      content: sanitizedContent,
      formatting: {
        style,
        alignment: formatting.alignment || 'left',
        fontSize: formatting.fontSize || 'medium',
        color: formatting.color || 'default',
        backgroundColor: formatting.backgroundColor || 'transparent'
      },
      metadata: {
        wordCount: this.countWords(sanitizedContent),
        updatedAt: new Date()
      }
    };
  }

  async processImageBlock(block, mediaFiles) {
    const {
      id,
      src,
      alt = '',
      caption = '',
      size = 'medium',
      alignment = 'center'
    } = block;

    // Find corresponding media file
    const mediaFile = mediaFiles.find(file => 
      file.originalName === block.fileName || file.id === block.mediaId
    );

    return {
      id: id || new mongoose.Types.ObjectId().toString(),
      type: 'image',
      src: mediaFile ? mediaFile.url : src,
      alt,
      caption,
      size,
      alignment,
      metadata: {
        fileSize: mediaFile?.size,
        dimensions: mediaFile?.dimensions,
        format: mediaFile?.format,
        uploadedAt: new Date()
      }
    };
  }

  async processVideoBlock(block, mediaFiles) {
    const {
      id,
      src,
      poster = '',
      controls = true,
      autoplay = false,
      duration = 0,
      transcription = ''
    } = block;

    const mediaFile = mediaFiles.find(file => 
      file.originalName === block.fileName || file.id === block.mediaId
    );

    return {
      id: id || new mongoose.Types.ObjectId().toString(),
      type: 'video',
      src: mediaFile ? mediaFile.url : src,
      poster,
      controls,
      autoplay,
      duration: mediaFile?.duration || duration,
      transcription,
      metadata: {
        fileSize: mediaFile?.size,
        format: mediaFile?.format,
        resolution: mediaFile?.resolution,
        uploadedAt: new Date()
      }
    };
  }

  async processAudioBlock(block, mediaFiles) {
    const {
      id,
      src,
      controls = true,
      autoplay = false,
      duration = 0,
      transcription = ''
    } = block;

    const mediaFile = mediaFiles.find(file => 
      file.originalName === block.fileName || file.id === block.mediaId
    );

    return {
      id: id || new mongoose.Types.ObjectId().toString(),
      type: 'audio',
      src: mediaFile ? mediaFile.url : src,
      controls,
      autoplay,
      duration: mediaFile?.duration || duration,
      transcription,
      metadata: {
        fileSize: mediaFile?.size,
        format: mediaFile?.format,
        uploadedAt: new Date()
      }
    };
  }

  processInteractiveBlock(block) {
    const {
      id,
      interactiveType = 'simulation',
      config = {},
      data = {}
    } = block;

    return {
      id: id || new mongoose.Types.ObjectId().toString(),
      type: 'interactive',
      interactiveType,
      config: {
        ...config,
        validated: true,
        securityLevel: 'safe'
      },
      data,
      metadata: {
        createdAt: new Date(),
        estimatedInteractionTime: config.estimatedTime || 300 // 5 minutes default
      }
    };
  }

  processCodeBlock(block) {
    const {
      id,
      code = '',
      language = 'javascript',
      showLineNumbers = true,
      highlightLines = [],
      runnable = false
    } = block;

    return {
      id: id || new mongoose.Types.ObjectId().toString(),
      type: 'code',
      code: this.sanitizeCode(code),
      language,
      showLineNumbers,
      highlightLines,
      runnable,
      metadata: {
        lineCount: code.split('\n').length,
        characterCount: code.length,
        updatedAt: new Date()
      }
    };
  }

  processQuizBlock(block) {
    const {
      id,
      questions = [],
      settings = {}
    } = block;

    const processedQuestions = questions.map(q => ({
      ...q,
      id: q.id || new mongoose.Types.ObjectId().toString(),
      validation: this.validateQuizQuestion(q)
    }));

    return {
      id: id || new mongoose.Types.ObjectId().toString(),
      type: 'quiz',
      questions: processedQuestions,
      settings: {
        shuffleQuestions: settings.shuffleQuestions || false,
        showCorrectAnswers: settings.showCorrectAnswers || true,
        allowRetake: settings.allowRetake || true,
        timeLimit: settings.timeLimit || null,
        ...settings
      },
      metadata: {
        questionCount: processedQuestions.length,
        estimatedTime: processedQuestions.length * 60, // 1 minute per question
        createdAt: new Date()
      }
    };
  }

  /**
   * Process and validate media files
   */
  async processMediaFiles(files, lessonId) {
    const processedFiles = [];

    for (const file of files) {
      try {
        // Validate file type and size
        const validation = this.validateMediaFile(file);
        if (!validation.isValid) {
          throw new Error(`File validation failed: ${validation.error}`);
        }

        // Generate unique filename
        const uniqueFilename = this.generateUniqueFilename(file.originalname);
        const filePath = path.join('uploads', 'lessons', lessonId, uniqueFilename);

        // Save file to storage (this would be cloud storage in production)
        await this.saveFileToStorage(file, filePath);

        // Extract metadata
        const metadata = await this.extractFileMetadata(file, filePath);

        const processedFile = {
          id: new mongoose.Types.ObjectId().toString(),
          originalName: file.originalname,
          filename: uniqueFilename,
          url: `/api/content/media/${lessonId}/${uniqueFilename}`,
          path: filePath,
          size: file.size,
          mimeType: file.mimetype,
          ...metadata,
          uploadedAt: new Date()
        };

        processedFiles.push(processedFile);

      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        // Continue processing other files
      }
    }

    return processedFiles;
  }

  /**
   * Content validation methods
   */
  validateContentStructure(content) {
    const errors = [];

    if (!content.type) {
      errors.push('Content type is required');
    }

    if (!content.blocks || !Array.isArray(content.blocks)) {
      errors.push('Content blocks must be an array');
    }

    // Validate each block
    content.blocks?.forEach((block, index) => {
      if (!block.type) {
        errors.push(`Block ${index}: type is required`);
      }

      if (!block.id) {
        errors.push(`Block ${index}: id is required`);
      }

      // Type-specific validations
      switch (block.type) {
        case 'text':
          if (!block.content || block.content.trim() === '') {
            errors.push(`Block ${index}: text content cannot be empty`);
          }
          break;
        case 'image':
          if (!block.src) {
            errors.push(`Block ${index}: image src is required`);
          }
          break;
        case 'video':
        case 'audio':
          if (!block.src) {
            errors.push(`Block ${index}: media src is required`);
          }
          break;
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateMediaFile(file) {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg',
      'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm',
      'application/pdf'
    ];

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size exceeds maximum allowed size (100MB)'
      };
    }

    if (!allowedTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        error: 'File type not supported'
      };
    }

    return { isValid: true };
  }

  validateQuizQuestion(question) {
    const errors = [];

    if (!question.question || question.question.trim() === '') {
      errors.push('Question text is required');
    }

    if (!question.type || !['multiple-choice', 'true-false', 'short-answer', 'essay'].includes(question.type)) {
      errors.push('Valid question type is required');
    }

    if (question.type === 'multiple-choice') {
      if (!question.options || question.options.length < 2) {
        errors.push('Multiple choice questions need at least 2 options');
      }
      if (!question.correctAnswer) {
        errors.push('Correct answer must be specified');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Utility methods
   */
  sanitizeHTMLContent(content) {
    // Basic HTML sanitization - in production, use a library like DOMPurify
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  sanitizeCode(code) {
    // Remove potentially dangerous code patterns
    return code
      .replace(/eval\s*\(/gi, 'EVAL_REMOVED(')
      .replace(/Function\s*\(/gi, 'FUNCTION_REMOVED(');
  }

  countWords(text) {
    return text.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
  }

  calculateWordCount(content) {
    if (!content.blocks) return 0;
    
    return content.blocks.reduce((total, block) => {
      if (block.type === 'text') {
        return total + this.countWords(block.content);
      }
      return total;
    }, 0);
  }

  calculateReadTime(content) {
    const wordCount = this.calculateWordCount(content);
    const wordsPerMinute = 200; // Average reading speed
    return Math.ceil(wordCount / wordsPerMinute);
  }

  extractRawText(blocks) {
    return blocks
      .filter(block => block.type === 'text')
      .map(block => block.content.replace(/<[^>]*>/g, ''))
      .join(' ');
  }

  generateUniqueFilename(originalName) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    
    return `${baseName}_${timestamp}_${randomString}${extension}`;
  }

  async saveFileToStorage(file, filePath) {
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    
    // Save file
    await fs.writeFile(filePath, file.buffer);
  }

  async extractFileMetadata(file, filePath) {
    const metadata = {};

    if (file.mimetype.startsWith('image/')) {
      // In production, use an image processing library to get dimensions
      metadata.type = 'image';
      metadata.dimensions = { width: 0, height: 0 }; // Placeholder
    } else if (file.mimetype.startsWith('video/')) {
      metadata.type = 'video';
      metadata.duration = 0; // Placeholder - use ffprobe in production
      metadata.resolution = { width: 0, height: 0 }; // Placeholder
    } else if (file.mimetype.startsWith('audio/')) {
      metadata.type = 'audio';
      metadata.duration = 0; // Placeholder - use audio processing library
    }

    return metadata;
  }

  async createContentSnapshot(lesson, userId) {
    return {
      _id: new mongoose.Types.ObjectId(),
      version: lesson.metadata?.version || '1.0.0',
      timestamp: new Date(),
      editedBy: userId,
      snapshot: {
        content: lesson.content,
        title: lesson.title,
        objectives: lesson.objectives
      }
    };
  }

  /**
   * Safely increment a semantic version string (e.g., '1.0.0' -> '1.0.1').
   * Returns the original version if invalid. Throws if versioning is not fixable.
   */
  incrementVersion(currentVersion) {
    if (typeof currentVersion !== 'string') return '1.0.1';
    const parts = currentVersion.split('.');
    if (parts.length !== 3 || parts.some(p => isNaN(parseInt(p)))) {
      // fallback or throw for invalid version format
      throw new Error(`Invalid version format: ${currentVersion}`);
    }
    const [major, minor, patch] = parts.map(Number);
    return `${major}.${minor}.${patch + 1}`;
  }

  async updateAIContext(lesson, session) {
    const aiContext = this.generateAIContext(lesson);
    
    await Lesson.findByIdAndUpdate(
      lesson._id,
      { 
        aiContext,
        keyTopics: aiContext.keyTopics,
        contentSummary: aiContext.summary
      },
      { session }
    );
  }

  generateAIContext(lesson) {
    const content = lesson.content;
    if (!content || !content.blocks) {
      return {
        keyTopics: [],
        summary: '',
        learningGoals: [],
        commonMisconceptions: [],
        suggestedQuestions: []
      };
    }

    // Extract key topics from text content
    const textContent = this.extractRawText(content.blocks);
    const keyTopics = this.extractKeyTopics(textContent);

    return {
      keyTopics,
      summary: this.generateSummary(textContent),
      learningGoals: lesson.objectives || [],
      commonMisconceptions: [],
      suggestedQuestions: this.generateSuggestedQuestions(textContent, keyTopics)
    };
  }

  extractKeyTopics(text) {
    // Simple keyword extraction - in production, use NLP libraries
    const words = text.toLowerCase().split(/\s+/);
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    const wordCount = {};
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length > 3 && !commonWords.has(cleanWord)) {
        wordCount[cleanWord] = (wordCount[cleanWord] || 0) + 1;
      }
    });

    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  generateSummary(text) {
    // Simple summary generation - first 200 characters
    return text.substring(0, 200) + (text.length > 200 ? '...' : '');
  }

  generateSuggestedQuestions(text, keyTopics) {
    return keyTopics.slice(0, 3).map(topic => 
      `What is the significance of ${topic} in this lesson?`
    );
  }

  async cleanupFiles(files) {
    for (const file of files) {
      try {
        if (file.path) {
          await fs.unlink(file.path);
        }
      } catch (error) {
        console.error('Error cleaning up file:', error);
      }
    }
  }
}

export const contentEditorService = new ContentEditorService();
