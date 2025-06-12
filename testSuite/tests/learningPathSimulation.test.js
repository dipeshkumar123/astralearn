const TestEnvironment = require('../utils/testEnvironment');
const request = require('supertest');
const testConfig = require('../config/testConfig');

describe('🛤️ Learning Path Simulation Tests', () => {
  let testEnv;
  let app;
  let studentToken;
  let instructorToken;

  beforeAll(async () => {
    testEnv = new TestEnvironment();
    await testEnv.setupTestEnvironment();
    app = testEnv.app;
    
    studentToken = await testEnv.getAuthToken('student');
    instructorToken = await testEnv.getAuthToken('instructor');
  }, 30000);

  afterAll(async () => {
    await testEnv.cleanupTestEnvironment();
  });

  beforeEach(async () => {
    await testEnv.resetTestData();
  });

  describe('🧠 Adaptive Learning Algorithm Validation', () => {
    test('should generate personalized learning path', async () => {
      const response = await request(app)
        .post('/api/adaptive/generate-path')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: 1,
          userPreferences: {
            learningStyle: 'visual',
            difficultyPreference: 'moderate',
            timeAvailable: 120
          }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('learningPath');
      expect(response.body.learningPath).toHaveProperty('modules');
      expect(response.body.learningPath).toHaveProperty('estimatedDuration');
      expect(response.body.learningPath).toHaveProperty('difficultyProgression');
      
      // Path should be personalized
      expect(response.body.learningPath.estimatedDuration).toBeLessThanOrEqual(120);
      expect(response.body.learningPath.learningStyle).toBe('visual');
    });

    test('should adapt path based on performance', async () => {
      // Get initial path
      const initialResponse = await request(app)
        .post('/api/adaptive/generate-path')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: 1
        });

      const initialPath = initialResponse.body.learningPath;

      // Simulate poor performance
      await request(app)
        .post('/api/adaptive/update-performance')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: 1,
          moduleId: 1,
          score: 40,
          timeSpent: 60,
          strugglingConcepts: ['variables', 'functions']
        });

      // Get adapted path
      const adaptedResponse = await request(app)
        .post('/api/adaptive/generate-path')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: 1
        });

      const adaptedPath = adaptedResponse.body.learningPath;

      expect(adaptedResponse.status).toBe(200);
      
      // Adapted path should include remediation
      expect(adaptedPath.modules.length).toBeGreaterThan(initialPath.modules.length);
      expect(adaptedPath.remediationModules).toBeDefined();
      expect(adaptedPath.difficultyLevel).toBe('easier');
    });

    test('should validate difficulty progression logic', async () => {
      const response = await request(app)
        .get('/api/adaptive/path-analysis/1')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('difficultyProgression');
      
      const progression = response.body.difficultyProgression;
      
      // Difficulty should increase gradually
      for (let i = 1; i < progression.length; i++) {
        const currentDifficulty = progression[i].difficultyScore;
        const previousDifficulty = progression[i - 1].difficultyScore;
        
        // Allow for some variation but generally increasing
        expect(currentDifficulty).toBeLessThanOrEqual(previousDifficulty + 2);
      }
    });

    test('should handle prerequisite dependencies', async () => {
      const response = await request(app)
        .post('/api/adaptive/validate-prerequisites')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: 1,
          targetModuleId: 3
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('prerequisitesMet');
      expect(response.body).toHaveProperty('missingPrerequisites');
      
      if (!response.body.prerequisitesMet) {
        expect(response.body.missingPrerequisites.length).toBeGreaterThan(0);
        expect(response.body).toHaveProperty('recommendedPath');
      }
    });
  });

  describe('📝 Assessment Adaptation Validation', () => {
    test('should adapt assessment difficulty dynamically', async () => {
      // Start assessment
      const startResponse = await request(app)
        .post('/api/assessments/start')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          assessmentId: 1
        });

      const sessionId = startResponse.body.sessionId;

      // Submit easy questions with correct answers
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/assessments/submit-answer')
          .set('Authorization', `Bearer ${studentToken}`)
          .send({
            sessionId,
            questionId: i + 1,
            answer: 'correct_answer',
            timeSpent: 15
          });
      }

      // Get next question - should be harder
      const nextQuestionResponse = await request(app)
        .get(`/api/assessments/next-question/${sessionId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(nextQuestionResponse.status).toBe(200);
      expect(nextQuestionResponse.body.question.difficultyLevel).toBeGreaterThan(1);
    });

    test('should provide appropriate feedback based on performance', async () => {
      const response = await request(app)
        .post('/api/assessments/submit')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          assessmentId: 1,
          answers: [
            { questionId: 1, answer: 'wrong_answer' },
            { questionId: 2, answer: 'correct_answer' },
            { questionId: 3, answer: 'wrong_answer' }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('feedback');
      expect(response.body.feedback).toHaveProperty('overall');
      expect(response.body.feedback).toHaveProperty('perQuestion');
      expect(response.body.feedback).toHaveProperty('improvementSuggestions');
      
      // Should provide remediation for wrong answers
      expect(response.body.feedback.improvementSuggestions.length).toBeGreaterThan(0);
    });

    test('should detect knowledge gaps accurately', async () => {
      const response = await request(app)
        .post('/api/analytics/detect-knowledge-gaps')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: 1,
          assessmentResults: [
            { topic: 'variables', score: 40 },
            { topic: 'functions', score: 30 },
            { topic: 'loops', score: 80 }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('knowledgeGaps');
      expect(response.body.knowledgeGaps.length).toBeGreaterThan(0);
      
      // Should identify variables and functions as gaps
      const gapTopics = response.body.knowledgeGaps.map(gap => gap.topic);
      expect(gapTopics).toContain('variables');
      expect(gapTopics).toContain('functions');
      expect(gapTopics).not.toContain('loops');
    });
  });

  describe('📊 Progress Tracking Accuracy', () => {
    test('should track learning progress accurately', async () => {
      // Complete several learning activities
      await request(app)
        .post('/api/progress/complete-lesson')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          lessonId: 1,
          timeSpent: 30,
          comprehensionScore: 85
        });

      await request(app)
        .post('/api/progress/complete-assessment')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          assessmentId: 1,
          score: 78,
          timeSpent: 45
        });

      // Check progress
      const progressResponse = await request(app)
        .get('/api/progress/course/1')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(progressResponse.status).toBe(200);
      expect(progressResponse.body).toHaveProperty('overallProgress');
      expect(progressResponse.body).toHaveProperty('moduleProgress');
      expect(progressResponse.body).toHaveProperty('averageScore');
      expect(progressResponse.body).toHaveProperty('totalTimeSpent');
      
      expect(progressResponse.body.overallProgress).toBeGreaterThan(0);
      expect(progressResponse.body.averageScore).toBeCloseTo(81.5, 1); // (85 + 78) / 2
    });

    test('should calculate accurate completion rates', async () => {
      const response = await request(app)
        .get('/api/analytics/completion-rates/1')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('courseCompletionRate');
      expect(response.body).toHaveProperty('moduleCompletionRates');
      expect(response.body).toHaveProperty('averageTimeToComplete');
      
      expect(response.body.courseCompletionRate).toBeGreaterThanOrEqual(0);
      expect(response.body.courseCompletionRate).toBeLessThanOrEqual(100);
    });

    test('should track engagement metrics accurately', async () => {
      // Generate some engagement activities
      await request(app)
        .post('/api/analytics/track-engagement')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          activityType: 'video_watched',
          duration: 300,
          courseId: 1,
          lessonId: 1
        });

      await request(app)
        .post('/api/analytics/track-engagement')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          activityType: 'quiz_completed',
          duration: 120,
          courseId: 1,
          assessmentId: 1
        });

      const engagementResponse = await request(app)
        .get('/api/analytics/engagement/1')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(engagementResponse.status).toBe(200);
      expect(engagementResponse.body).toHaveProperty('engagementScore');
      expect(engagementResponse.body).toHaveProperty('activityBreakdown');
      expect(engagementResponse.body).toHaveProperty('timeDistribution');
      
      expect(engagementResponse.body.engagementScore).toBeGreaterThan(0);
    });
  });

  describe('🎯 Recommendation Engine Validation', () => {
    test('should provide relevant content recommendations', async () => {
      const response = await request(app)
        .get('/api/recommendations/content')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({
          courseId: 1,
          count: 5
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('recommendations');
      expect(response.body.recommendations.length).toBeLessThanOrEqual(5);
      
      response.body.recommendations.forEach(rec => {
        expect(rec).toHaveProperty('id');
        expect(rec).toHaveProperty('title');
        expect(rec).toHaveProperty('type');
        expect(rec).toHaveProperty('relevanceScore');
        expect(rec.relevanceScore).toBeGreaterThan(0);
        expect(rec.relevanceScore).toBeLessThanOrEqual(1);
      });
    });

    test('should recommend appropriate next steps', async () => {
      const response = await request(app)
        .get('/api/recommendations/next-steps')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({
          courseId: 1
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('nextSteps');
      expect(response.body.nextSteps.length).toBeGreaterThan(0);
      
      response.body.nextSteps.forEach(step => {
        expect(step).toHaveProperty('action');
        expect(step).toHaveProperty('priority');
        expect(step).toHaveProperty('estimatedTime');
        expect(['high', 'medium', 'low']).toContain(step.priority);
      });
    });

    test('should adapt recommendations based on learning style', async () => {
      // Set learning style to visual
      await request(app)
        .put('/api/users/learning-style')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          learningStyle: 'visual'
        });

      const visualResponse = await request(app)
        .get('/api/recommendations/content')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({
          courseId: 1
        });

      // Set learning style to auditory
      await request(app)
        .put('/api/users/learning-style')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          learningStyle: 'auditory'
        });

      const auditoryResponse = await request(app)
        .get('/api/recommendations/content')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({
          courseId: 1
        });

      expect(visualResponse.status).toBe(200);
      expect(auditoryResponse.status).toBe(200);

      // Visual learners should get more visual content
      const visualTypes = visualResponse.body.recommendations.map(r => r.type);
      const auditoryTypes = auditoryResponse.body.recommendations.map(r => r.type);

      expect(visualTypes.filter(t => t.includes('video') || t.includes('diagram')).length)
        .toBeGreaterThan(0);
      expect(auditoryTypes.filter(t => t.includes('audio') || t.includes('podcast')).length)
        .toBeGreaterThan(0);
    });
  });

  describe('⚡ Real-time Adaptation Performance', () => {
    test('should adapt learning path in real-time', async () => {
      const startTime = Date.now();

      const response = await request(app)
        .post('/api/adaptive/real-time-adaptation')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: 1,
          currentActivity: 'assessment',
          performance: 'struggling',
          newData: {
            timeSpent: 120,
            correctAnswers: 2,
            totalQuestions: 10
          }
        });

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(testConfig.performance.apiResponseTime);
      expect(response.body).toHaveProperty('adaptedPath');
      expect(response.body).toHaveProperty('recommendations');
      expect(response.body.adaptedPath.difficulty).toBe('easier');
    });

    test('should handle concurrent adaptation requests', async () => {
      const requests = Array(5).fill().map((_, index) =>
        request(app)
          .post('/api/adaptive/real-time-adaptation')
          .set('Authorization', `Bearer ${studentToken}`)
          .send({
            courseId: 1,
            currentActivity: `activity_${index}`,
            performance: index % 2 === 0 ? 'good' : 'struggling'
          })
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      expect(totalTime).toBeLessThan(3000); // Should handle 5 concurrent requests in 3 seconds
    });
  });

  describe('🔍 Learning Analytics Integration', () => {
    test('should integrate learning analytics into path decisions', async () => {
      const response = await request(app)
        .get('/api/adaptive/analytics-integration/1')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('analyticsData');
      expect(response.body).toHaveProperty('pathDecisions');
      expect(response.body).toHaveProperty('confidenceScore');

      expect(response.body.analyticsData).toHaveProperty('performanceMetrics');
      expect(response.body.analyticsData).toHaveProperty('engagementMetrics');
      expect(response.body.analyticsData).toHaveProperty('learningPatterns');

      expect(response.body.confidenceScore).toBeGreaterThan(0);
      expect(response.body.confidenceScore).toBeLessThanOrEqual(1);
    });
  });
});
