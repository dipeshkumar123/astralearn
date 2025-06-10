// filepath: c:\Users\panji\OneDrive\Desktop\Sem 7\Projects\AstraLearn\server\src\routes\modules.js
import express from 'express';
import mongoose from 'mongoose';
import { Module } from '../models/Module.js';
import { Course } from '../models/Course.js';
import { Lesson } from '../models/Lesson.js';
const router = express.Router();

// GET /api/modules - Get all modules with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      courseId,
      difficulty,
      tags,
      category,
      isPublished,
      search,
      page = 1,
      limit = 10,
      sortBy = 'position',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (courseId) filter.courseId = courseId;
    if (difficulty) filter.difficulty = difficulty;
    if (isPublished !== undefined) filter.isPublished = isPublished === 'true';
    if (category) filter['metadata.category'] = category;
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter['metadata.tags'] = { $in: tagArray };
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with population
    const modules = await Module.find(filter)
      .populate('courseId', 'title description')
      .populate('metadata.createdBy', 'name email')
      .populate('metadata.lastEditedBy', 'name email')
      .populate('lessonCount')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Module.countDocuments(filter);

    res.json({
      success: true,
      data: {
        modules,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: modules.length,
          totalDocuments: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch modules',
      details: error.message
    });
  }
});

// GET /api/modules/:id - Get a specific module
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid module ID format'
      });
    }

    const module = await Module.findById(id)
      .populate('courseId', 'title description instructor')
      .populate('metadata.createdBy', 'name email avatar')
      .populate('metadata.lastEditedBy', 'name email avatar')
      .populate('lessonCount');

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    // Get lessons for this module
    const lessons = await Lesson.find({ 
      moduleId: id, 
      isActive: true 
    })
    .sort({ position: 1 })
    .select('title description position estimatedDuration difficulty isPublished')
    .lean();

    res.json({
      success: true,
      data: {
        module,
        lessons
      }
    });
  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch module',
      details: error.message
    });
  }
});

// POST /api/modules - Create a new module
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      courseId,
      objectives = [],
      estimatedDuration,
      difficulty,
      prerequisites = [],
      learningOutcomes = [],
      metadata = {},
      content = {},
      resources = [],
      aiContext = {}
    } = req.body;

    // Validate required fields
    if (!title || !description || !courseId || !estimatedDuration || !difficulty) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, courseId, estimatedDuration, difficulty'
      });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Get the next position for this course
    const lastModule = await Module.findOne({ courseId })
      .sort({ position: -1 })
      .select('position');
    
    const position = lastModule ? lastModule.position + 1 : 1;

    // Create module with user context (assuming middleware sets req.user)
    const userId = req.user?.id || new mongoose.Types.ObjectId(); // Fallback for testing

    const moduleData = {
      title,
      description,
      courseId,
      position,
      objectives,
      estimatedDuration,
      difficulty,
      prerequisites,
      learningOutcomes,
      metadata: {
        ...metadata,
        createdBy: userId,
        lastEditedBy: userId,
        version: '1.0.0',
        lastUpdated: new Date()
      },
      content: {
        introduction: content.introduction || '',
        summary: content.summary || '',
        keyTopics: content.keyTopics || []
      },
      resources,
      aiContext: {
        learningGoals: aiContext.learningGoals || [],
        commonMisconceptions: aiContext.commonMisconceptions || [],
        suggestedQuestions: aiContext.suggestedQuestions || [],
        relatedConcepts: aiContext.relatedConcepts || [],
        teachingStrategies: aiContext.teachingStrategies || []
      }
    };

    const module = new Module(moduleData);
    const savedModule = await module.save();

    // Populate the saved module for response
    await savedModule.populate([
      { path: 'courseId', select: 'title description' },
      { path: 'metadata.createdBy', select: 'name email' },
      { path: 'metadata.lastEditedBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      data: savedModule,
      message: 'Module created successfully'
    });
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create module',
      details: error.message
    });
  }
});

// PUT /api/modules/:id - Update a module
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid module ID format'
      });
    }

    const module = await Module.findById(id);
    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    // Track changes for version control
    const changes = [];
    const fieldsToTrack = ['title', 'description', 'objectives', 'learningOutcomes', 'content'];
    
    fieldsToTrack.forEach(field => {
      if (req.body[field] !== undefined) {
        changes.push(`Updated ${field}`);
      }
    });

    // Update metadata
    const userId = req.user?.id || new mongoose.Types.ObjectId();
    if (req.body.metadata) {
      req.body.metadata.lastEditedBy = userId;
      req.body.metadata.lastUpdated = new Date();
    }

    // Add change log entry if there are significant changes
    if (changes.length > 0) {
      const currentVersion = module.versionControl.version;
      const versionParts = currentVersion.split('.').map(Number);
      versionParts[2]++; // Increment patch version
      const newVersion = versionParts.join('.');

      req.body.versionControl = {
        ...module.versionControl.toObject(),
        version: newVersion,
        changeLog: [
          ...module.versionControl.changeLog,
          {
            version: newVersion,
            date: new Date(),
            changes,
            changedBy: userId
          }
        ]
      };
    }

    const updatedModule = await Module.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
    .populate('courseId', 'title description')
    .populate('metadata.createdBy', 'name email')
    .populate('metadata.lastEditedBy', 'name email');

    res.json({
      success: true,
      data: updatedModule,
      message: 'Module updated successfully'
    });
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update module',
      details: error.message
    });
  }
});

// DELETE /api/modules/:id - Soft delete a module
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid module ID format'
      });
    }

    const module = await Module.findById(id);
    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    // Check if module has lessons
    const lessonCount = await Lesson.countDocuments({ moduleId: id, isActive: true });
    if (lessonCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete module with active lessons. Please delete or move lessons first.',
        details: `Module has ${lessonCount} active lessons`
      });
    }

    // Soft delete
    await Module.findByIdAndUpdate(id, { 
      isActive: false,
      'metadata.lastUpdated': new Date(),
      'metadata.lastEditedBy': req.user?.id || new mongoose.Types.ObjectId()
    });

    res.json({
      success: true,
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete module',
      details: error.message
    });
  }
});

// POST /api/modules/:id/publish - Publish a module
router.post('/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid module ID format'
      });
    }

    const module = await Module.findById(id);
    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    // Validation for publishing
    if (!module.content.introduction || !module.content.summary) {
      return res.status(400).json({
        success: false,
        error: 'Module must have introduction and summary content before publishing'
      });
    }

    if (module.objectives.length === 0 || module.learningOutcomes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Module must have objectives and learning outcomes before publishing'
      });
    }

    // Update module to published
    const updatedModule = await Module.findByIdAndUpdate(
      id,
      {
        isPublished: true,
        'versionControl.isDraft': false,
        'versionControl.publishedVersion': module.versionControl.version,
        'metadata.lastUpdated': new Date(),
        'metadata.lastEditedBy': req.user?.id || new mongoose.Types.ObjectId()
      },
      { new: true }
    )
    .populate('courseId', 'title description')
    .populate('metadata.lastEditedBy', 'name email');

    res.json({
      success: true,
      data: updatedModule,
      message: 'Module published successfully'
    });
  } catch (error) {
    console.error('Error publishing module:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to publish module',
      details: error.message
    });
  }
});

// POST /api/modules/:id/unpublish - Unpublish a module
router.post('/:id/unpublish', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid module ID format'
      });
    }

    const updatedModule = await Module.findByIdAndUpdate(
      id,
      {
        isPublished: false,
        'versionControl.isDraft': true,
        'metadata.lastUpdated': new Date(),
        'metadata.lastEditedBy': req.user?.id || new mongoose.Types.ObjectId()
      },
      { new: true }
    )
    .populate('courseId', 'title description')
    .populate('metadata.lastEditedBy', 'name email');

    if (!updatedModule) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    res.json({
      success: true,
      data: updatedModule,
      message: 'Module unpublished successfully'
    });
  } catch (error) {
    console.error('Error unpublishing module:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unpublish module',
      details: error.message
    });
  }
});

// PUT /api/modules/:id/reorder - Reorder modules within a course
router.put('/:id/reorder', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPosition } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid module ID format'
      });
    }

    if (!newPosition || newPosition < 1) {
      return res.status(400).json({
        success: false,
        error: 'Valid new position is required'
      });
    }

    const module = await Module.findById(id);
    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    const oldPosition = module.position;
    const courseId = module.courseId;

    // Get all modules in the course
    const modules = await Module.find({ 
      courseId, 
      isActive: true 
    }).sort({ position: 1 });

    // Validate new position
    if (newPosition > modules.length) {
      return res.status(400).json({
        success: false,
        error: `New position cannot be greater than ${modules.length}`
      });
    }

    // Reorder logic
    if (newPosition > oldPosition) {
      // Moving down: shift modules up
      await Module.updateMany(
        {
          courseId,
          position: { $gt: oldPosition, $lte: newPosition },
          isActive: true
        },
        { $inc: { position: -1 } }
      );
    } else if (newPosition < oldPosition) {
      // Moving up: shift modules down
      await Module.updateMany(
        {
          courseId,
          position: { $gte: newPosition, $lt: oldPosition },
          isActive: true
        },
        { $inc: { position: 1 } }
      );
    }

    // Update the target module
    module.position = newPosition;
    module.metadata.lastUpdated = new Date();
    module.metadata.lastEditedBy = req.user?.id || new mongoose.Types.ObjectId();
    await module.save();

    // Return updated course structure
    const updatedModules = await Module.find({ 
      courseId, 
      isActive: true 
    })
    .sort({ position: 1 })
    .populate('metadata.lastEditedBy', 'name email')
    .select('title position estimatedDuration difficulty isPublished');

    res.json({
      success: true,
      data: updatedModules,
      message: 'Module reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering module:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reorder module',
      details: error.message
    });
  }
});

// GET /api/modules/:id/lessons - Get all lessons for a module
router.get('/:id/lessons', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      isPublished, 
      sortBy = 'position', 
      sortOrder = 'asc' 
    } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid module ID format'
      });
    }

    // Build filter
    const filter = { moduleId: id, isActive: true };
    if (isPublished !== undefined) {
      filter.isPublished = isPublished === 'true';
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const lessons = await Lesson.find(filter)
      .sort(sortOptions)
      .populate('instructor', 'name email avatar')
      .select('title description position estimatedDuration difficulty isPublished content.keyTopics createdAt updatedAt')
      .lean();

    res.json({
      success: true,
      data: lessons
    });
  } catch (error) {
    console.error('Error fetching module lessons:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch module lessons',
      details: error.message    });
  }
});

export default router;
