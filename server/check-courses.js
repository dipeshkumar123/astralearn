/**
 * Check Published Courses in Database
 */

import './src/config/database.js';
import { Course } from './src/models/Course.js';

async function checkPublishedCourses() {
  try {
    console.log('🔍 Checking published courses in database...\n');
    
    const courses = await Course.find({ isPublished: true })
      .populate('instructor', 'firstName lastName')
      .lean();
    
    console.log(`Found ${courses.length} published courses:\n`);
    
    courses.forEach((course, index) => {
      console.log(`${index + 1}. "${course.title}"`);
      console.log(`   Instructor: ${course.instructor?.firstName} ${course.instructor?.lastName || 'Unknown'}`);
      console.log(`   Category: ${course.category || 'Uncategorized'}`);
      console.log(`   Difficulty: ${course.difficulty || 'Not set'}`);
      console.log(`   Duration: ${course.estimatedDuration || 0} hours`);
      console.log(`   Enrolled: ${course.enrollmentCount || 0} students`);
      console.log(`   Description: ${course.description?.substring(0, 100)}...`);
      console.log('');
    });
    
    // Check categories distribution
    const categories = {};
    courses.forEach(course => {
      const cat = course.category || 'uncategorized';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    
    console.log('📊 Course Categories:');
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} courses`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking courses:', error.message);
    process.exit(1);
  }
}

checkPublishedCourses();
