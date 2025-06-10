/**
 * Course Management Service - Phase 3 Step 1
 * Advanced course management features including hierarchy builder, 
 * content editor, metadata management, and version control
 */

import { Course } from '../models/Course.js';
import { Module } from '../models/Module.js';
import { Lesson } from '../models/Lesson.js';
import { UserProgress } from '../models/UserProgress.js';
import mongoose from 'mongoose';

class CourseManagementService {
  
  /**
   * Create a complete course with modules and lessons hierarchy
   */  async createCourseHierarchy(courseData, userId) {
    // Check if we're in development and MongoDB doesn't support transactions
    const useTransactions = process.env.NODE_ENV === 'production';
    let session = null;
    
    if (useTransactions) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    try {
      // Create the main course
      const course = new Course({
        ...courseData.courseInfo,
        instructor: userId,
        metadata: {
          ...courseData.courseInfo.metadata,
          version: '1.0.0',
          createdBy: userId,
          lastEditedBy: userId,
          contentStatus: 'draft',
          totalModules: courseData.modules?.length || 0
        }
      });

      await course.save(session ? { session } : {});

      // Create modules with nested lessons
      const moduleIds = [];
      if (courseData.modules && courseData.modules.length > 0) {
        for (let i = 0; i < courseData.modules.length; i++) {
          const moduleData = courseData.modules[i];
          
          const module = new Module({
            ...moduleData,
            courseId: course._id,
            position: i + 1,
            metadata: {
              ...moduleData.metadata,
              version: '1.0.0',
              createdBy: userId,
              lastEditedBy: userId
            }
          });          await module.save(session ? { session } : {});
          moduleIds.push(module._id);

          // Create lessons for this module
          if (moduleData.lessons && moduleData.lessons.length > 0) {
            for (let j = 0; j < moduleData.lessons.length; j++) {
              const lessonData = moduleData.lessons[j];
              
              const lesson = new Lesson({
                ...lessonData,
                courseId: course._id,
                moduleId: module._id,
                position: j + 1,
                metadata: {
                  version: '1.0.0',
                  createdBy: userId,
                  lastEditedBy: userId
                }
              });

              await lesson.save(session ? { session } : {});
            }
          }
        }
      }

      // Update course with module references
      course.modules = moduleIds;
      course.metadata.totalModules = moduleIds.length;
      await course.save(session ? { session } : {});

      if (session) {
        await session.commitTransaction();
      }

      return {
        success: true,
        course: await this.getCourseWithHierarchy(course._id),
        message: 'Course hierarchy created successfully'
      };

    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  /**
   * Get complete course hierarchy with modules and lessons
   */
  async getCourseWithHierarchy(courseId, includeContent = false) {
    const populateOptions = includeContent 
      ? 'title content objectives estimatedDuration difficulty position metadata'
      : 'title objectives estimatedDuration difficulty position metadata';    const course = await Course.findById(courseId)
      .populate('instructor', 'firstName lastName email')
      .populate({
        path: 'modules',
        select: 'title description position objectives estimatedDuration difficulty metadata content',
        options: { sort: { position: 1 } },
        populate: {
          path: 'lessons',
          model: 'Lesson',
          select: populateOptions,
          options: { sort: { position: 1 } }
        }
      });

    if (!course) {
      throw new Error('Course not found');
    }

    // Add calculated fields
    const enrichedCourse = course.toObject();
    enrichedCourse.statistics = await this.getCourseStatistics(courseId);
    enrichedCourse.completionEstimate = this.calculateCompletionEstimate(enrichedCourse);

    return enrichedCourse;
  }

  /**
   * Update course content with version control
   */
  async updateCourseContent(courseId, updates, userId, versionNotes = '') {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const course = await Course.findById(courseId).session(session);
      if (!course) {
        throw new Error('Course not found');
      }      // Check permissions
      if (course.instructor.toString() !== userId.toString()) {
        throw new Error('Unauthorized to edit this course');
      }

      // Create version snapshot before updating
      const versionSnapshot = await this.createVersionSnapshot(course, userId, versionNotes);

      // Update course with new content
      const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        {
          ...updates,
          'metadata.version': this.incrementVersion(course.metadata.version),
          'metadata.lastEditedBy': userId,
          'metadata.lastUpdated': new Date(),
          $push: {
            'metadata.versionHistory': versionSnapshot
          }
        },
        { 
          new: true, 
          session,
          runValidators: true 
        }
      );

      await session.commitTransaction();

      return {
        success: true,
        course: await this.getCourseWithHierarchy(courseId),
        versionInfo: {
          newVersion: updatedCourse.metadata.version,
          snapshotId: versionSnapshot._id
        }
      };

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Reorder modules or lessons within a course
   */
  async reorderContent(courseId, reorderData, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const course = await Course.findById(courseId).session(session);
      if (!course) {
        throw new Error('Course not found');
      }      // Check permissions
      if (course.instructor.toString() !== userId.toString()) {
        throw new Error('Unauthorized to edit this course');
      }

      if (reorderData.type === 'modules') {
        // Reorder modules
        await this.reorderModules(courseId, reorderData.items, session);
      } else if (reorderData.type === 'lessons') {
        // Reorder lessons within a module
        await this.reorderLessons(reorderData.moduleId, reorderData.items, session);
      }

      // Update course metadata
      await Course.findByIdAndUpdate(
        courseId,
        {
          'metadata.lastEditedBy': userId,
          'metadata.lastUpdated': new Date()
        },
        { session }
      );

      await session.commitTransaction();

      return {
        success: true,
        course: await this.getCourseWithHierarchy(courseId),
        message: 'Content reordered successfully'
      };

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Clone a course with all its content
   */
  async cloneCourse(courseId, newCourseData, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const originalCourse = await this.getCourseWithHierarchy(courseId, true);
      if (!originalCourse) {
        throw new Error('Course not found');
      }

      // Create new course
      const clonedCourseData = {
        ...originalCourse,
        ...newCourseData,
        _id: undefined,
        instructor: userId,
        modules: [],
        enrollmentCount: 0,
        rating: 0,
        isPublished: false,
        metadata: {
          ...originalCourse.metadata,
          version: '1.0.0',
          createdBy: userId,
          lastEditedBy: userId,
          parentCourseId: courseId,
          clonedAt: new Date()
        }
      };

      const clonedCourse = new Course(clonedCourseData);
      await clonedCourse.save({ session });

      // Clone modules and lessons
      const moduleIds = [];
      for (const module of originalCourse.modules) {
        const clonedModule = new Module({
          ...module,
          _id: undefined,
          courseId: clonedCourse._id,
          metadata: {
            ...module.metadata,
            version: '1.0.0',
            createdBy: userId,
            lastEditedBy: userId,
            parentModuleId: module._id
          }
        });

        await clonedModule.save({ session });
        moduleIds.push(clonedModule._id);

        // Clone lessons
        if (module.lessons) {
          for (const lesson of module.lessons) {
            const clonedLesson = new Lesson({
              ...lesson,
              _id: undefined,
              courseId: clonedCourse._id,
              moduleId: clonedModule._id,
              metadata: {
                version: '1.0.0',
                createdBy: userId,
                lastEditedBy: userId,
                parentLessonId: lesson._id
              }
            });

            await clonedLesson.save({ session });
          }
        }
      }

      // Update cloned course with module references
      clonedCourse.modules = moduleIds;
      clonedCourse.metadata.totalModules = moduleIds.length;
      await clonedCourse.save({ session });

      await session.commitTransaction();

      return {
        success: true,
        course: await this.getCourseWithHierarchy(clonedCourse._id),
        message: 'Course cloned successfully'
      };

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Archive/Restore course
   */
  async archiveCourse(courseId, userId, archive = true) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }    // Check permissions
    if (course.instructor.toString() !== userId.toString()) {
      throw new Error('Unauthorized to archive this course');
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        isActive: !archive,
        'metadata.archivedAt': archive ? new Date() : null,
        'metadata.archivedBy': archive ? userId : null,
        'metadata.lastEditedBy': userId
      },
      { new: true }
    );

    return {
      success: true,
      course: updatedCourse,
      message: archive ? 'Course archived successfully' : 'Course restored successfully'
    };
  }

  /**
   * Get course analytics and statistics
   */
  async getCourseStatistics(courseId) {
    const [
      enrollmentStats,
      progressStats,
      moduleCount,
      lessonCount,
      avgRating
    ] = await Promise.all([
      this.getEnrollmentStatistics(courseId),
      this.getProgressStatistics(courseId),
      Module.countDocuments({ courseId, isActive: true }),
      Lesson.countDocuments({ courseId, isPublished: true }),
      this.getAverageRating(courseId)
    ]);

    return {
      enrollment: enrollmentStats,
      progress: progressStats,
      content: {
        totalModules: moduleCount,
        totalLessons: lessonCount
      },
      rating: avgRating,
      lastUpdated: new Date()
    };
  }

  /**
   * Private helper methods
   */
  async createVersionSnapshot(course, userId, notes) {
    return {
      _id: new mongoose.Types.ObjectId(),
      version: course.metadata.version,
      timestamp: new Date(),
      editedBy: userId,
      notes,
      snapshot: {
        title: course.title,
        description: course.description,
        objectives: course.objectives,
        difficulty: course.difficulty,
        estimatedDuration: course.estimatedDuration,
        tags: course.tags,
        prerequisites: course.prerequisites,
        metadata: course.metadata
      }
    };
  }

  incrementVersion(currentVersion) {
    const parts = currentVersion.split('.');
    const patch = parseInt(parts[2]) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  async reorderModules(courseId, moduleOrder, session) {
    for (let i = 0; i < moduleOrder.length; i++) {
      await Module.findByIdAndUpdate(
        moduleOrder[i].id,
        { position: i + 1 },
        { session }
      );
    }
  }

  async reorderLessons(moduleId, lessonOrder, session) {
    for (let i = 0; i < lessonOrder.length; i++) {
      await Lesson.findByIdAndUpdate(
        lessonOrder[i].id,
        { position: i + 1 },
        { session }
      );
    }
  }

  calculateCompletionEstimate(course) {
    if (!course.modules || course.modules.length === 0) {
      return { totalMinutes: 0, totalHours: 0 };
    }

    const totalMinutes = course.modules.reduce((total, module) => {
      return total + (module.estimatedDuration || 0);
    }, 0);

    return {
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10
    };
  }

  async getEnrollmentStatistics(courseId) {
    const enrollmentCount = await UserProgress.countDocuments({ courseId });
    const activeEnrollments = await UserProgress.countDocuments({ 
      courseId, 
      lastAccessDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
    });

    return {
      total: enrollmentCount,
      active: activeEnrollments,
      completionRate: enrollmentCount > 0 ? 
        (await UserProgress.countDocuments({ courseId, progress: 100 })) / enrollmentCount * 100 : 0
    };
  }

  async getProgressStatistics(courseId) {
    const progressData = await UserProgress.aggregate([
      { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
      {
        $group: {
          _id: null,
          avgProgress: { $avg: '$progress' },
          avgPerformance: { $avg: '$performance' },
          totalTimeSpent: { $sum: '$timeSpent' }
        }
      }
    ]);

    return progressData.length > 0 ? progressData[0] : {
      avgProgress: 0,
      avgPerformance: 0,
      totalTimeSpent: 0
    };
  }

  async getAverageRating(courseId) {
    // This would typically come from a ratings collection
    // For now, return the course's current rating
    const course = await Course.findById(courseId).select('rating');
    return course ? course.rating : 0;
  }

  /**
   * Advanced search and filtering
   */
  async searchCourses(filters, userId, userRole = 'student') {
    const {
      search,
      difficulty,
      tags,
      category,
      isPublished,
      instructorId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    // Build filter object
    const filter = { isActive: true };
      // Role-based filtering
    if (userRole === 'instructor') {
      filter.instructor = userId;
    } else if (userRole === 'student') {
      filter.isPublished = true;
    }

    if (difficulty) filter.difficulty = difficulty;
    if (isPublished !== undefined && userRole !== 'student') {
      filter.isPublished = isPublished === 'true';
    }    if (category) filter['metadata.category'] = category;
    if (instructorId) filter.instructor = instructorId;
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Pagination and sorting
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;    const [courses, totalCount] = await Promise.all([
      Course.find(filter)
        .populate('instructor', 'firstName lastName email')
        .select('title description difficulty estimatedDuration tags isPublished enrollmentCount rating thumbnail metadata')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Course.countDocuments(filter)
    ]);

    return {
      courses,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    };
  }
}

export const courseManagementService = new CourseManagementService();
