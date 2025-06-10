/**
 * Phase 3 Step 3 Validation Script
 * Production Optimization & Advanced Features Validation
 * 
 * Tests all implemented features:
 * - Performance monitoring
 * - Cache integration
 * - ML services
 * - WebSocket services
 * - CDN services
 * - Monitoring dashboard
 */

import { promises as fs } from 'fs';
import path from 'path';

class Phase3Step3Validator {
  constructor() {
    this.results = {
      performance: false,
      cache: false,
      ml: false,
      websocket: false,
      cdn: false,
      monitoring: false,
      deployment: false,
      optimization: false
    };
    this.errors = [];
    this.warnings = [];
  }

  async validateAll() {
    console.log('🚀 Starting Phase 3 Step 3 Validation...\n');

    await this.validatePerformanceOptimization();
    await this.validateCacheIntegration();
    await this.validateMLIntegration();
    await this.validateWebSocketServices();
    await this.validateCDNServices();
    await this.validateMonitoringDashboard();
    await this.validateDeploymentInfrastructure();
    await this.validateCodeOptimization();

    this.generateReport();
  }

  async validatePerformanceOptimization() {
    console.log('🔧 Validating Performance Optimization...');

    try {
      // Check performance monitoring service
      const perfServicePath = path.join(process.cwd(), '../server/src/services/performanceMonitoringService.js');
      const perfServiceExists = await this.fileExists(perfServicePath);
      
      if (perfServiceExists) {
        const content = await fs.readFile(perfServicePath, 'utf8');        const requiredFeatures = [
          'PerformanceMonitoringService',
          'collectSystemMetrics',
          'trackRequest',
          'trackDatabaseQuery',
          'trackCacheOperation',
          'trackError',
          'checkThresholds',
          'getMetricsSnapshot'
        ];

        const allFeaturesPresent = requiredFeatures.every(feature => 
          content.includes(feature)
        );

        if (allFeaturesPresent) {
          this.results.performance = true;
          console.log('  ✅ Performance monitoring service validated');
        } else {
          this.errors.push('Performance monitoring service missing required features');
        }
      } else {
        this.errors.push('Performance monitoring service file not found');
      }

      // Check lazy loading utilities
      const lazyLoaderPath = path.join(process.cwd(), 'src/utils/lazyLoader.js');
      const lazyLoaderExists = await this.fileExists(lazyLoaderPath);
      
      if (lazyLoaderExists) {
        const content = await fs.readFile(lazyLoaderPath, 'utf8');
        
        if (content.includes('createLazyComponent') && content.includes('LazyImage')) {
          console.log('  ✅ Lazy loading utilities validated');
        } else {
          this.warnings.push('Lazy loading utilities incomplete');
        }
      }

    } catch (error) {
      this.errors.push(`Performance optimization validation failed: ${error.message}`);
    }
  }

  async validateCacheIntegration() {
    console.log('💾 Validating Cache Integration...');

    try {
      const cacheServicePath = path.join(process.cwd(), '../server/src/services/redisCacheService.js');
      const cacheServiceExists = await this.fileExists(cacheServicePath);
      
      if (cacheServiceExists) {
        const content = await fs.readFile(cacheServicePath, 'utf8');
        
        const requiredFeatures = [
          'cacheUserSession',
          'cacheAPIResponse',
          'cacheAnalyticsData',
          'getCacheStatistics',
          'invalidateCache',
          'healthCheck'
        ];

        const allFeaturesPresent = requiredFeatures.every(feature => 
          content.includes(feature)
        );

        if (allFeaturesPresent) {
          this.results.cache = true;
          console.log('  ✅ Redis cache integration validated');
        } else {
          this.errors.push('Cache service missing required features');
        }
      } else {
        this.errors.push('Cache service file not found');
      }

    } catch (error) {
      this.errors.push(`Cache integration validation failed: ${error.message}`);
    }
  }

  async validateMLIntegration() {
    console.log('🤖 Validating ML Integration...');

    try {
      const mlServicePath = path.join(process.cwd(), 'src/services/mlIntegrationService.js');
      const mlServiceExists = await this.fileExists(mlServicePath);
      
      if (mlServiceExists) {
        const content = await fs.readFile(mlServicePath, 'utf8');
          const requiredFeatures = [
          'predictStudentPerformance',
          'recommendContent',
          'assessContentDifficulty',
          'predictEngagement',
          'tensorflow',
          'processBatch'
        ];

        const allFeaturesPresent = requiredFeatures.every(feature => 
          content.includes(feature)
        );

        if (allFeaturesPresent) {
          this.results.ml = true;
          console.log('  ✅ ML integration service validated');
        } else {
          this.errors.push('ML service missing required features');
        }
      } else {
        this.errors.push('ML service file not found');
      }

      // Check package.json for TensorFlow dependency
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      
      if (packageJson.dependencies['@tensorflow/tfjs']) {
        console.log('  ✅ TensorFlow.js dependency found');
      } else {
        this.warnings.push('TensorFlow.js dependency not found in package.json');
      }

    } catch (error) {
      this.errors.push(`ML integration validation failed: ${error.message}`);
    }
  }

  async validateWebSocketServices() {
    console.log('🔄 Validating WebSocket Services...');

    try {
      const wsServicePath = path.join(process.cwd(), 'src/services/webSocketService.js');
      const wsServiceExists = await this.fileExists(wsServicePath);
      
      if (wsServiceExists) {
        const content = await fs.readFile(wsServicePath, 'utf8');
        
        const requiredFeatures = [
          'joinCollaborationSession',
          'updateCollaborativeContent',
          'sendMessage',
          'updateLearningProgress',
          'subscribeLiveAnalytics',
          'socket.io'
        ];

        const allFeaturesPresent = requiredFeatures.every(feature => 
          content.includes(feature)
        );

        if (allFeaturesPresent) {
          this.results.websocket = true;
          console.log('  ✅ WebSocket service validated');
        } else {
          this.errors.push('WebSocket service missing required features');
        }
      } else {
        this.errors.push('WebSocket service file not found');
      }

    } catch (error) {
      this.errors.push(`WebSocket services validation failed: ${error.message}`);
    }
  }

  async validateCDNServices() {
    console.log('🌐 Validating CDN Services...');

    try {
      const cdnServicePath = path.join(process.cwd(), 'src/services/cdnService.js');
      const cdnServiceExists = await this.fileExists(cdnServicePath);
      
      if (cdnServiceExists) {
        const content = await fs.readFile(cdnServicePath, 'utf8');
        
        const requiredFeatures = [
          'getOptimizedImageUrl',
          'getResponsiveSrcSet',
          'registerLazyImage',
          'getAssetUrl',
          'getPerformanceMetrics'
        ];

        const allFeaturesPresent = requiredFeatures.every(feature => 
          content.includes(feature)
        );

        if (allFeaturesPresent) {
          this.results.cdn = true;
          console.log('  ✅ CDN service validated');
        } else {
          this.errors.push('CDN service missing required features');
        }
      } else {
        this.errors.push('CDN service file not found');
      }

    } catch (error) {
      this.errors.push(`CDN services validation failed: ${error.message}`);
    }
  }

  async validateMonitoringDashboard() {
    console.log('📊 Validating Monitoring Dashboard...');

    try {
      const dashboardPath = path.join(process.cwd(), 'src/components/monitoring/ProductionMonitoringDashboard.jsx');
      const dashboardExists = await this.fileExists(dashboardPath);
      
      if (dashboardExists) {
        const content = await fs.readFile(dashboardPath, 'utf8');
        
        const requiredFeatures = [
          'ProductionMonitoringDashboard',
          'fetchAllMetrics',
          'MetricCard',
          'AlertItem',
          'LineChart',
          'checkAlerts'
        ];

        const allFeaturesPresent = requiredFeatures.every(feature => 
          content.includes(feature)
        );

        if (allFeaturesPresent) {
          this.results.monitoring = true;
          console.log('  ✅ Monitoring dashboard validated');
        } else {
          this.errors.push('Monitoring dashboard missing required features');
        }
      } else {
        this.errors.push('Monitoring dashboard file not found');
      }

    } catch (error) {
      this.errors.push(`Monitoring dashboard validation failed: ${error.message}`);
    }
  }

  async validateDeploymentInfrastructure() {
    console.log('🚀 Validating Deployment Infrastructure...');

    try {
      const requiredFiles = [
        '../docker-compose.yml',
        'Dockerfile',
        '../server/Dockerfile',
        '../k8s/production-deployment.yaml',
        '../.github/workflows/ci-cd.yml'
      ];

      let foundFiles = 0;
      for (const file of requiredFiles) {
        const filePath = path.join(process.cwd(), file);
        if (await this.fileExists(filePath)) {
          foundFiles++;
        }
      }

      if (foundFiles >= 3) { // At least 3 deployment files should exist
        this.results.deployment = true;
        console.log(`  ✅ Deployment infrastructure validated (${foundFiles}/${requiredFiles.length} files found)`);
      } else {
        this.errors.push(`Deployment infrastructure incomplete (${foundFiles}/${requiredFiles.length} files found)`);
      }

    } catch (error) {
      this.errors.push(`Deployment infrastructure validation failed: ${error.message}`);
    }
  }

  async validateCodeOptimization() {
    console.log('⚡ Validating Code Optimization...');

    try {
      // Check if build was successful by looking for dist folder
      const distPath = path.join(process.cwd(), 'dist');
      const distExists = await this.fileExists(distPath);
      
      if (distExists) {
        console.log('  ✅ Production build validated');
        
        // Check for optimized App component
        const optimizedAppPath = path.join(process.cwd(), 'src/App-optimized.jsx');
        const optimizedAppExists = await this.fileExists(optimizedAppPath);
        
        if (optimizedAppExists) {
          const content = await fs.readFile(optimizedAppPath, 'utf8');
          
          if (content.includes('createLazyComponent') && content.includes('preloadComponent')) {
            this.results.optimization = true;
            console.log('  ✅ Code optimization validated');
          } else {
            this.warnings.push('Optimized App component missing lazy loading features');
          }
        } else {
          this.warnings.push('Optimized App component not found');
        }
      } else {
        this.warnings.push('Production build not found');
      }

    } catch (error) {
      this.errors.push(`Code optimization validation failed: ${error.message}`);
    }
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  generateReport() {
    console.log('\n📋 PHASE 3 STEP 3 VALIDATION REPORT');
    console.log('=====================================\n');

    const totalFeatures = Object.keys(this.results).length;
    const completedFeatures = Object.values(this.results).filter(Boolean).length;
    const completionPercentage = ((completedFeatures / totalFeatures) * 100).toFixed(1);

    console.log(`📊 Overall Completion: ${completedFeatures}/${totalFeatures} (${completionPercentage}%)\n`);

    // Feature status
    Object.entries(this.results).forEach(([feature, status]) => {
      const emoji = status ? '✅' : '❌';
      const statusText = status ? 'COMPLETED' : 'INCOMPLETE';
      console.log(`${emoji} ${feature.toUpperCase()}: ${statusText}`);
    });

    // Errors
    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.errors.forEach(error => {
        console.log(`  • ${error}`);
      });
    }

    // Warnings
    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => {
        console.log(`  • ${warning}`);
      });
    }

    // Summary
    console.log('\n🎯 SUMMARY:');
    if (completionPercentage >= 90) {
      console.log('  🎉 Phase 3 Step 3 implementation is EXCELLENT!');
    } else if (completionPercentage >= 75) {
      console.log('  👍 Phase 3 Step 3 implementation is GOOD!');
    } else if (completionPercentage >= 50) {
      console.log('  ⚠️  Phase 3 Step 3 implementation needs improvement.');
    } else {
      console.log('  ❌ Phase 3 Step 3 implementation is incomplete.');
    }

    console.log('\n🚀 Production Optimization & Advanced Features validation complete!\n');

    return {
      completionPercentage: parseFloat(completionPercentage),
      results: this.results,
      errors: this.errors,
      warnings: this.warnings
    };
  }
}

// Run validation
const validator = new Phase3Step3Validator();
validator.validateAll().catch(console.error);
