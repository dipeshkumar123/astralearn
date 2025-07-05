// test-analytics.js
const { default: analyticsService } = require('./src/services/analyticsService.js');

// Mock user patterns data
const mockPatterns = {
  learningBehavior: {
    engagementTrends: {
      currentLevel: 'low',
      trend: 'decreasing',
      forecast: 'at_risk',
      stability: 'volatile',
      patterns: {
        consistencyPattern: 'occasional',
        sessionDuration: {
          distribution: [
            { range: 'very_short', percentage: 70 },
            { range: 'short', percentage: 20 },
            { range: 'medium', percentage: 10 }
          ]
        }
      }
    },
    performanceEvolution: {
      trend: 'declining',
      improvement: -20,
      stability: 'volatile'
    },
    contentPreferences: {
      diversityScore: 0.3,
      preferredFormats: ['video']
    }
  },
  adaptiveLearning: {
    personalizationAccuracy: 0.4,
    recommendationSuccess: 0.3
  },
  gamificationImpact: {
    motivationFactors: {
      sustainabilityScore: 0.3
    },
    socialLearningBehavior: {
      collaborationLevel: 'low'
    }
  }
};

// Test improvement areas
console.log('\n=== Testing identifyImprovementAreas ===');
const improvementAreas = analyticsService.identifyImprovementAreas(mockPatterns);
console.log(JSON.stringify(improvementAreas, null, 2));

// Test cognitive strengths
console.log('\n=== Testing identifyCognitiveStrengths ===');
const strengths = analyticsService.identifyCognitiveStrengths(mockPatterns);
console.log(JSON.stringify(strengths, null, 2));

// Test struggling areas
console.log('\n=== Testing identifyStrugglingAreas ===');
const strugglingAreas = analyticsService.identifyStrugglingAreas(mockPatterns);
console.log(JSON.stringify(strugglingAreas, null, 2));

console.log('\nAll tests completed successfully!');
