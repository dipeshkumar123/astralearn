/**
 * Enhanced Course Management Routes - Phase 3 Step 1
 * Advanced course management with hierarchy builder, content editor, and version control
 */

import express from 'express';
import multer from 'multer';
import { body, validationResult, param, query } from 'express-validator';
import { courseManagementService } from '../services/courseManagementService.js';
import { contentEditorService } from '../services/contentEditorService.js';
import { flexibleAuthenticate, flexibleAuthorize } from '../middleware/devAuth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 10 // Max 10 files per request
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg',
      'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm',
      'application/pdf'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  }
});

/**
 * Course Hierarchy Management
 */

// Create complete course with hierarchy
router.post('/', 
  flexibleAuthenticate, 
  flexibleAuthorize(['instructor', 'admin']),
  [
    body('courseInfo.title').notEmpty().trim().isLength({ min: 3, max: 200 }),
    body('courseInfo.description').notEmpty().trim().isLength({ min: 10, max: 2000 }),
    body('courseInfo.difficulty').isIn(['beginner', 'intermediate', 'advanced']),
    body('courseInfo.estimatedDuration').isNumeric().isInt({ min: 1 }),
    body('courseInfo.objectives').isArray({ min: 1 }),
    body('modules').optional().isArray()
  ],  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const result = await courseManagementService.createCourseHierarchy(
        req.body,
        req.user._id
      );

      res.status(201).json({
        message: 'Course hierarchy created successfully',
        ...result
      });

    } catch (error) {
      console.error('Create course hierarchy error:', error);
      res.status(500).json({ 
        message: 'Failed to create course hierarchy',
        error: error.message 
      });
    }
  }
);

// Get course with complete hierarchy
router.get('/:id/hierarchy',
  flexibleAuthenticate,
  [param('id').isMongoId()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Invalid course ID',
          details: errors.array()
        });
      }

      const includeContent = req.query.includeContent === 'true';
      const course = await courseManagementService.getCourseWithHierarchy(
        req.params.id,
        includeContent
      );

      res.json({
        success: true,
        course
      });

    } catch (error) {
      console.error('Get course hierarchy error:', error);
      if (error.message === 'Course not found') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ 
        message: 'Failed to retrieve course hierarchy',
        error: error.message 
      });
    }
  }
);

// Update course with version control
router.put('/:id',
  flexibleAuthenticate,
  flexibleAuthorize(['instructor', 'admin']),
  [
    param('id').isMongoId(),
    body('versionNotes').optional().isString().isLength({ max: 500 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { versionNotes, ...updates } = req.body;
      
      const result = await courseManagementService.updateCourseContent(
        req.params.id,
        updates,
        req.user._id,
        versionNotes
      );

      res.json({
        message: 'Course updated successfully',
        ...result
      });

    } catch (error) {
      console.error('Update course error:', error);
      if (error.message === 'Course not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Unauthorized to edit this course') {
        return res.status(403).json({ message: error.message });
      }
      res.status(500).json({ 
        message: 'Failed to update course',
        error: error.message 
      });
    }
  }
);

// Add modules to existing course
router.post('/:id/modules',
  flexibleAuthenticate,
  flexibleAuthorize(['instructor', 'admin']),
  [
    param('id').isMongoId(),
    body('modules').isArray().withMessage('Modules must be an array'),
    body('modules.*.title').notEmpty().trim().isLength({ min: 3, max: 200 }),
    body('modules.*.description').optional().trim().isLength({ max: 1000 }),
    body('modules.*.lessons').optional().isArray(),
    body('modules.*.lessons.*.title').optional().notEmpty().trim().isLength({ min: 3, max: 200 }),
    body('modules.*.lessons.*.content').optional().isString(),
    body('modules.*.lessons.*.type').optional().isIn(['video', 'text', 'quiz', 'assignment', 'interactive']),
    body('modules.*.lessons.*.duration').optional().isNumeric()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { modules } = req.body;
      
      const result = await courseManagementService.addModulesToCourse(
        req.params.id,
        modules,
        req.user._id
      );

      res.json({
        message: 'Modules added successfully',
        ...result
      });

    } catch (error) {
      console.error('Add modules error:', error);
      if (error.message === 'Course not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Unauthorized to modify this course') {
        return res.status(403).json({ message: error.message });
      }
      res.status(500).json({ 
        message: 'Failed to add modules',
        error: error.message 
      });
    }
  }
);

// Reorder course content (modules/lessons)
router.post('/:id/reorder',
  flexibleAuthenticate,
  flexibleAuthorize(['instructor', 'admin']),
  [
    param('id').isMongoId(),
    body('type').isIn(['modules', 'lessons']),
    body('items').isArray({ min: 1 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const result = await courseManagementService.reorderContent(
        req.params.id,
        req.body,
        req.user._id
      );

      res.json({
        message: 'Content reordered successfully',
        ...result
      });

    } catch (error) {
      console.error('Reorder content error:', error);
      if (error.message === 'Course not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Unauthorized to edit this course') {
        return res.status(403).json({ message: error.message });
      }
      res.status(500).json({ 
        message: 'Failed to reorder content',
        error: error.message 
      });
    }
  }
);

// Clone course
router.post('/:id/clone',
  flexibleAuthenticate,
  flexibleAuthorize(['instructor', 'admin']),
  [
    param('id').isMongoId(),
    body('title').notEmpty().trim().isLength({ min: 3, max: 200 }),
    body('description').optional().trim().isLength({ max: 2000 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const result = await courseManagementService.cloneCourse(
        req.params.id,
        req.body,
        req.user._id
      );

      res.status(201).json({
        message: 'Course cloned successfully',
        ...result
      });

    } catch (error) {
      console.error('Clone course error:', error);
      if (error.message === 'Course not found') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ 
        message: 'Failed to clone course',
        error: error.message 
      });
    }
  }
);

// Archive/Restore course
router.post('/:id/archive',
  flexibleAuthenticate,
  flexibleAuthorize(['instructor', 'admin']),
  [
    param('id').isMongoId(),
    body('archive').isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const result = await courseManagementService.archiveCourse(
        req.params.id,
        req.user._id,
        req.body.archive
      );

      res.json({
        message: result.message,
        ...result
      });

    } catch (error) {
      console.error('Archive course error:', error);
      if (error.message === 'Course not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Unauthorized to archive this course') {
        return res.status(403).json({ message: error.message });
      }
      res.status(500).json({ 
        message: 'Failed to archive/restore course',
        error: error.message 
      });
    }
  }
);

/**
 * Content Editor Routes
 */

// Save lesson content with rich text and media
router.post('/lessons/:lessonId/content',
  flexibleAuthenticate,
  flexibleAuthorize(['instructor', 'admin']),
  upload.array('mediaFiles', 10),
  [
    param('lessonId').isMongoId(),
    body('content.type').optional().isString(),
    body('content.blocks').optional().isArray()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const contentData = JSON.parse(req.body.content || '{}');
      const files = req.files || [];

      const result = await contentEditorService.saveLessonContent(
        req.params.lessonId,
        contentData,
        req.user._id,
        files
      );

      res.json({
        message: 'Lesson content saved successfully',
        ...result
      });

    } catch (error) {
      console.error('Save lesson content error:', error);
      if (error.message === 'Lesson not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.startsWith('Content validation failed')) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ 
        message: 'Failed to save lesson content',
        error: error.message 
      });
    }
  }
);

// Get lesson content for editing
router.get('/lessons/:lessonId/content',
  flexibleAuthenticate,
  [param('lessonId').isMongoId()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Invalid lesson ID',
          details: errors.array()
        });
      }

      const lesson = await Lesson.findById(req.params.lessonId)
        .select('content metadata title objectives');

      if (!lesson) {
        return res.status(404).json({ message: 'Lesson not found' });
      }

      res.json({
        success: true,
        lesson: {
          id: lesson._id,
          title: lesson.title,
          objectives: lesson.objectives,
          content: lesson.content,
          metadata: {
            version: lesson.metadata?.version,
            wordCount: lesson.metadata?.wordCount,
            estimatedReadTime: lesson.metadata?.estimatedReadTime,
            lastUpdated: lesson.metadata?.lastUpdated
          }
        }
      });

    } catch (error) {
      console.error('Get lesson content error:', error);
      res.status(500).json({ 
        message: 'Failed to retrieve lesson content',
        error: error.message 
      });
    }
  }
);

/**
 * Advanced Search and Analytics
 */

// Advanced course search with filters
router.get('/search',
  flexibleAuthenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const result = await courseManagementService.searchCourses(
        req.query,
        req.user._id,
        req.user.role
      );

      res.json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error('Search courses error:', error);
      res.status(500).json({ 
        message: 'Failed to search courses',
        error: error.message 
      });
    }
  }
);

// Get course analytics and statistics
router.get('/:id/analytics',
  flexibleAuthenticate,
  flexibleAuthorize(['instructor', 'admin']),
  [param('id').isMongoId()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Invalid course ID',
          details: errors.array()
        });
      }

      const statistics = await courseManagementService.getCourseStatistics(req.params.id);

      res.json({
        success: true,
        courseId: req.params.id,
        statistics
      });

    } catch (error) {
      console.error('Get course analytics error:', error);
      res.status(500).json({ 
        message: 'Failed to retrieve course analytics',
        error: error.message 
      });
    }
  }
);

/**
 * Content Versioning and History
 */

// Get content version history
router.get('/lessons/:lessonId/versions',
  flexibleAuthenticate,
  flexibleAuthorize(['instructor', 'admin']),
  [param('lessonId').isMongoId()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Invalid lesson ID',
          details: errors.array()
        });
      }

      const lesson = await Lesson.findById(req.params.lessonId)
        .select('metadata.contentHistory metadata.version title');

      if (!lesson) {
        return res.status(404).json({ message: 'Lesson not found' });
      }

      res.json({
        success: true,
        lessonId: req.params.lessonId,
        currentVersion: lesson.metadata?.version || '1.0.0',
        versionHistory: lesson.metadata?.contentHistory || []
      });

    } catch (error) {
      console.error('Get version history error:', error);
      res.status(500).json({ 
        message: 'Failed to retrieve version history',
        error: error.message 
      });
    }
  }
);

// Restore content from version
router.post('/lessons/:lessonId/versions/:versionId/restore',
  flexibleAuthenticate,
  flexibleAuthorize(['instructor', 'admin']),
  [
    param('lessonId').isMongoId(),
    param('versionId').isMongoId()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const lesson = await Lesson.findById(req.params.lessonId);
      if (!lesson) {
        return res.status(404).json({ message: 'Lesson not found' });
      }

      const version = lesson.metadata?.contentHistory?.find(
        v => v._id.toString() === req.params.versionId
      );

      if (!version) {
        return res.status(404).json({ message: 'Version not found' });
      }

      // Restore content from version snapshot
      const result = await contentEditorService.saveLessonContent(
        req.params.lessonId,
        version.snapshot.content,
        req.user._id
      );

      res.json({
        message: 'Content restored from version successfully',
        restoredFromVersion: version.version,
        ...result
      });

    } catch (error) {
      console.error('Restore version error:', error);
      res.status(500).json({ 
        message: 'Failed to restore content version',
        error: error.message 
      });
    }
  }
);

/**
 * Media Management
 */

// Serve media files
router.get('/media/:lessonId/:filename',
  async (req, res) => {
    try {
      const { lessonId, filename } = req.params;
      const filePath = path.join('uploads', 'lessons', lessonId, filename);
      
      // Check if file exists
      await fs.access(filePath);
      
      res.sendFile(path.resolve(filePath));

    } catch (error) {
      console.error('Serve media file error:', error);
      res.status(404).json({ message: 'Media file not found' });
    }
  }
);

// Delete media file
router.delete('/media/:lessonId/:filename',
  flexibleAuthenticate,
  flexibleAuthorize(['instructor', 'admin']),
  async (req, res) => {
    try {
      const { lessonId, filename } = req.params;
      const filePath = path.join('uploads', 'lessons', lessonId, filename);
      
      // Check if file exists and delete
      await fs.unlink(filePath);
      
      res.json({
        success: true,
        message: 'Media file deleted successfully'
      });

    } catch (error) {
      console.error('Delete media file error:', error);
      if (error.code === 'ENOENT') {
        return res.status(404).json({ message: 'Media file not found' });
      }
      res.status(500).json({ 
        message: 'Failed to delete media file',
        error: error.message 
      });
    }
  }
);

/**
 * Bulk Operations
 */

// Bulk update course settings
router.post('/bulk/update',
  flexibleAuthenticate,
  flexibleAuthorize(['instructor', 'admin']),
  [
    body('courseIds').isArray({ min: 1 }),
    body('updates').isObject()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { courseIds, updates } = req.body;
      const results = [];

      for (const courseId of courseIds) {
        try {
          const result = await courseManagementService.updateCourseContent(
            courseId,
            updates,
            req.user._id,
            'Bulk update operation'
          );
          results.push({ courseId, success: true, ...result });
        } catch (error) {
          results.push({ 
            courseId, 
            success: false, 
            error: error.message 
          });
        }
      }

      res.json({
        success: true,
        message: 'Bulk update completed',
        results
      });

    } catch (error) {
      console.error('Bulk update error:', error);
      res.status(500).json({ 
        message: 'Failed to complete bulk update',
        error: error.message 
      });
    }
  }
);

// Health check for course management service
router.get('/health',
  async (req, res) => {
    try {
      const Course = (await import('../models/Course.js')).Course;
      const courseCount = await Course.countDocuments();
      
      res.json({
        status: 'operational',
        service: 'Course Management',
        version: '3.1.0',
        features: [
          'Hierarchy Builder',
          'Content Editor',
          'Version Control',
          'Media Management',
          'Advanced Search',
          'Analytics'
        ],
        statistics: {
          totalCourses: courseCount,
          timestamp: new Date()
        },
        endpoints: {
          create: 'POST /',
          search: 'GET /search',
          getById: 'GET /:id',
          update: 'PUT /:id',
          delete: 'DELETE /:id',
          uploadContent: 'POST /:id/content'
        }
      });

    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({
        status: 'error',
        service: 'Course Management',
        error: error.message
      });
    }
  }
);

export default router;
