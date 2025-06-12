const TestEnvironment = require('../utils/testEnvironment');
const request = require('supertest');
const testConfig = require('../config/testConfig');

describe('🧠 Context-Aware AI Validation Suite', () => {
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

  describe('📝 Context Package Accuracy', () => {
    test('should generate accurate user context', async () => {
      const response = await request(app)
        .post('/api/ai/ask')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          question: 'What should I study next?',
          courseId: 1,
          lessonId: 1
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('response');
      expect(response.body).toHaveProperty('context');
      
      // Validate context structure
      const context = response.body.context;
      expect(context).toHaveProperty('user');
      expect(context.user).toHaveProperty('id');
      expect(context.user).toHaveProperty('learningStyle');
      expect(context.user).toHaveProperty('progress');
      
      expect(context).toHaveProperty('course');
      expect(context.course).toHaveProperty('id');
      expect(context.course).toHaveProperty('title');
      
      expect(context).toHaveProperty('lesson');
      expect(context.lesson).toHaveProperty('id');
      expect(context.lesson).toHaveProperty('title');
    });

    test('should include learning analytics in context', async () => {
      const response = await request(app)
        .post('/api/ai/ask')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          question: 'How am I performing?',
          courseId: 1
        });

      expect(response.status).toBe(200);
      
      const context = response.body.context;
      expect(context).toHaveProperty('analytics');
      expect(context.analytics).toHaveProperty('recentScores');
      expect(context.analytics).toHaveProperty('timeSpent');
      expect(context.analytics).toHaveProperty('engagementLevel');
    });

    test('should adapt context based on user role', async () => {
      // Student context
      const studentResponse = await request(app)
        .post('/api/ai/ask')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          question: 'Help me understand this concept',
          courseId: 1,
          lessonId: 1
        });

      // Instructor context
      const instructorResponse = await request(app)
        .post('/api/ai/ask')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          question: 'How is my class performing?',
          courseId: 1
        });

      expect(studentResponse.body.context.user.role).toBe('student');
      expect(instructorResponse.body.context.user.role).toBe('instructor');
      
      // Instructor should have class-wide analytics
      expect(instructorResponse.body.context).toHaveProperty('classAnalytics');
    });
  });

  describe('🎯 Learning Style Adaptation', () => {
    test('should adapt responses for visual learners', async () => {
      // Set user learning style to visual
      await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          learningStyle: 'visual'
        });

      const response = await request(app)
        .post('/api/ai/ask')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          question: 'Explain CSS flexbox',
          courseId: 1,
          lessonId: 1
        });

      expect(response.status).toBe(200);
      expect(response.body.context.user.learningStyle).toBe('visual');
      
      // Visual learners should get diagram/chart suggestions
      const responseText = response.body.response.toLowerCase();
      expect(
        responseText.includes('diagram') || 
        responseText.includes('chart') || 
        responseText.includes('visual') ||
        responseText.includes('example')
      ).toBe(true);
    });

    test('should adapt responses for auditory learners', async () => {
      // Set user learning style to auditory
      await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          learningStyle: 'auditory'
        });

      const response = await request(app)
        .post('/api/ai/ask')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          question: 'Explain JavaScript closures',
          courseId: 1,
          lessonId: 1
        });

      expect(response.status).toBe(200);
      expect(response.body.context.user.learningStyle).toBe('auditory');
      
      // Auditory learners should get verbal explanations
      const responseText = response.body.response.toLowerCase();
      expect(
        responseText.includes('listen') || 
        responseText.includes('explain') || 
        responseText.includes('discussion') ||
        responseText.includes('verbal')
      ).toBe(true);
    });

    test('should adapt responses for kinesthetic learners', async () => {
      // Set user learning style to kinesthetic
      await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          learningStyle: 'kinesthetic'
        });

      const response = await request(app)
        .post('/api/ai/ask')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          question: 'How do I practice React components?',
          courseId: 1,
          lessonId: 1
        });

      expect(response.status).toBe(200);
      expect(response.body.context.user.learningStyle).toBe('kinesthetic');
      
      // Kinesthetic learners should get hands-on activities
      const responseText = response.body.response.toLowerCase();
      expect(
        responseText.includes('practice') || 
        responseText.includes('exercise') || 
        responseText.includes('hands-on') ||
        responseText.includes('build')
      ).toBe(true);
    });
  });

  describe('📊 Performance-Based Routing', () => {
    test('should provide beginner-level responses for struggling students', async () => {
      // Simulate low performance
      await request(app)
        .post('/api/analytics/track-event')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          eventType: 'assessment_completed',
          data: {
            courseId: 1,
            score: 45,
            difficulty: 'easy'
          }
        });

      const response = await request(app)
        .post('/api/ai/ask')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          question: 'I\'m struggling with this topic',
          courseId: 1,
          lessonId: 1
        });

      expect(response.status).toBe(200);
      
      // Should provide foundational explanations
      const responseText = response.body.response.toLowerCase();
      expect(
        responseText.includes('basic') || 
        responseText.includes('fundamental') || 
        responseText.includes('start') ||
        responseText.includes('foundation')
      ).toBe(true);
    });

    test('should provide advanced responses for high performers', async () => {
      // Simulate high performance
      await request(app)
        .post('/api/analytics/track-event')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          eventType: 'assessment_completed',
          data: {
            courseId: 1,
            score: 95,
            difficulty: 'hard'
          }
        });

      const response = await request(app)
        .post('/api/ai/ask')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          question: 'What are advanced techniques?',
          courseId: 1,
          lessonId: 1
        });

      expect(response.status).toBe(200);
      
      // Should provide advanced explanations
      const responseText = response.body.response.toLowerCase();
      expect(
        responseText.includes('advanced') || 
        responseText.includes('complex') || 
        responseText.includes('optimization') ||
        responseText.includes('best practice')
      ).toBe(true);
    });
  });

  describe('🧩 Knowledge Gap Analysis Integration', () => {
    test('should identify and address knowledge gaps', async () => {
      const response = await request(app)
        .post('/api/ai/ask')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          question: 'I don\'t understand this at all',
          courseId: 1,
          lessonId: 1
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('context');
      expect(response.body.context).toHaveProperty('knowledgeGaps');
      
      // Should suggest prerequisite topics
      const responseText = response.body.response.toLowerCase();
      expect(
        responseText.includes('prerequisite') || 
        responseText.includes('foundation') || 
        responseText.includes('first') ||
        responseText.includes('review')
      ).toBe(true);
    });

    test('should provide personalized remediation suggestions', async () => {
      const response = await request(app)
        .post('/api/ai/ask')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          question: 'What should I review?',
          courseId: 1
        });

      expect(response.status).toBe(200);
      expect(response.body.context).toHaveProperty('recommendations');
      expect(Array.isArray(response.body.context.recommendations)).toBe(true);
    });
  });

  describe('⚡ Response Time Performance', () => {
    test('should respond within performance thresholds', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/ai/ask')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          question: 'Quick question about this topic',
          courseId: 1,
          lessonId: 1
        });

      const responseTime = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(testConfig.performance.apiResponseTime * 2); // Allow 2x for AI processing
    });

    test('should handle concurrent AI requests efficiently', async () => {
      const requests = Array(10).fill().map((_, index) => 
        request(app)
          .post('/api/ai/ask')
          .set('Authorization', `Bearer ${studentToken}`)
          .send({
            question: `Question ${index}`,
            courseId: 1,
            lessonId: 1
          })
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should handle concurrent requests efficiently
      expect(totalTime).toBeLessThan(10000); // 10 seconds max for 10 concurrent requests
    });
  });

  describe('🔒 AI Security Validation', () => {
    test('should sanitize user input', async () => {
      const maliciousInput = '<script>alert("xss")</script>What is this?';
      
      const response = await request(app)
        .post('/api/ai/ask')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          question: maliciousInput,
          courseId: 1,
          lessonId: 1
        });

      expect(response.status).toBe(200);
      expect(response.body.response).not.toContain('<script>');
      expect(response.body.response).not.toContain('alert');
    });

    test('should not expose sensitive information in context', async () => {
      const response = await request(app)
        .post('/api/ai/ask')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          question: 'Tell me about my account',
          courseId: 1
        });

      expect(response.status).toBe(200);
      
      const context = response.body.context;
      expect(context.user).not.toHaveProperty('password');
      expect(context.user).not.toHaveProperty('email');
      expect(JSON.stringify(context)).not.toContain('password');
    });

    test('should validate authorization for AI requests', async () => {
      const response = await request(app)
        .post('/api/ai/ask')
        .send({
          question: 'Unauthorized question',
          courseId: 1
        });

      expect(response.status).toBe(401);
    });
  });

  describe('📈 Context Accuracy Metrics', () => {
    test('should maintain 90%+ context accuracy', async () => {
      const testCases = [
        { question: 'What\'s my progress?', expectedContext: ['analytics', 'progress'] },
        { question: 'What should I study?', expectedContext: ['recommendations', 'course'] },
        { question: 'How difficult is this?', expectedContext: ['lesson', 'difficulty'] },
        { question: 'Am I ready for the test?', expectedContext: ['assessment', 'readiness'] }
      ];

      let accurateContexts = 0;

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/ai/ask')
          .set('Authorization', `Bearer ${studentToken}`)
          .send({
            question: testCase.question,
            courseId: 1,
            lessonId: 1
          });

        const contextKeys = Object.keys(response.body.context).join(' ').toLowerCase();
        const hasExpectedContext = testCase.expectedContext.some(expected => 
          contextKeys.includes(expected)
        );

        if (hasExpectedContext) {
          accurateContexts++;
        }
      }

      const accuracy = (accurateContexts / testCases.length) * 100;
      expect(accuracy).toBeGreaterThanOrEqual(90);
    });
  });
});
