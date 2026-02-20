import mongoose from 'mongoose';
import { config } from './environment.js';
import { logger } from '@/utils/logger.js';

export class DatabaseManager {
  private static instance: DatabaseManager;
  private isConnected = false;
  private connectionRetries = 0;
  private readonly maxRetries = 5;
  private readonly retryDelay = 5000; // 5 seconds

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('Database already connected');
      return;
    }

    try {
      // Configure mongoose
      mongoose.set('strictQuery', false);
      
      // Connection options
      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 3000, // Reduced timeout for testing
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4, skip trying IPv6
        retryWrites: true,
        connectTimeoutMS: 3000, // Add connection timeout
      };

      logger.info('🔌 Connecting to MongoDB...');
      
      await mongoose.connect(config.database.uri, options);
      
      this.isConnected = true;
      this.connectionRetries = 0;
      
      logger.info('✅ MongoDB connected successfully');
      
      // Set up event listeners
      this.setupEventListeners();
      
    } catch (error) {
      logger.error('❌ MongoDB connection failed:', error);
      await this.handleConnectionError();
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('🔌 MongoDB disconnected');
    } catch (error) {
      logger.error('❌ Error disconnecting from MongoDB:', error);
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  public async healthCheck(): Promise<{ status: string; details?: any }> {
    try {
      if (!this.isConnected) {
        return { status: 'disconnected' };
      }

      // Ping the database
      await mongoose.connection.db?.admin().ping();
      
      return {
        status: 'healthy',
        details: {
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          name: mongoose.connection.name,
        },
      };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  private setupEventListeners(): void {
    mongoose.connection.on('connected', () => {
      logger.info('📡 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (error) => {
      logger.error('❌ Mongoose connection error:', error);
      this.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ Mongoose disconnected from MongoDB');
      this.isConnected = false;
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  private async handleConnectionError(): Promise<void> {
    this.connectionRetries++;
    
    if (this.connectionRetries >= this.maxRetries) {
      logger.error(`❌ Failed to connect to MongoDB after ${this.maxRetries} attempts`);
      process.exit(1);
    }

    logger.warn(`⚠️ Retrying MongoDB connection (${this.connectionRetries}/${this.maxRetries}) in ${this.retryDelay}ms...`);
    
    setTimeout(() => {
      this.connect();
    }, this.retryDelay);
  }

  // Utility method for transactions
  public async withTransaction<T>(
    operation: (session: mongoose.ClientSession) => Promise<T>
  ): Promise<T> {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();
      const result = await operation(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}

// Export singleton instance
export const databaseManager = DatabaseManager.getInstance();
