import mongoose from 'mongoose';
import { config } from './environment.js';

interface MongoConfig {
  uri: string;
  options: mongoose.ConnectOptions;
}

class DatabaseManager {
  private static instance: DatabaseManager;
  private connection: mongoose.Connection | null = null;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async connect(): Promise<void> {
    try {
      const config = this.getConfig();
      
      await mongoose.connect(config.uri, config.options);
      this.connection = mongoose.connection;

      console.log('✅ MongoDB connected successfully');
      if (this.connection.db) {
        console.log(`📍 Database: ${this.connection.db.databaseName}`);
      } else {
        console.log('📍 Database: (unknown, db is undefined)');
      }
      
      // Setup connection event listeners
      this.setupEventListeners();
      
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    if (this.connection) {
      await mongoose.disconnect();
      console.log('🔌 MongoDB disconnected');
    }
  }
  private getConfig(): MongoConfig {
    const uri = config.database.uri;

    if (!uri) {
      throw new Error('MongoDB URI not found in environment variables');
    }

    return {
      uri,
      options: {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4, skip trying IPv6
        retryWrites: true,
        writeConcern: {
          w: 'majority'
        }
      }
    };
  }

  private setupEventListeners(): void {
    if (!this.connection) return;

    this.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });

    this.connection.on('disconnected', () => {
      console.log('🔌 MongoDB disconnected');
    });

    this.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  public getConnection(): mongoose.Connection | null {
    return this.connection;
  }

  public isConnected(): boolean {
    return this.connection?.readyState === 1;
  }
}

export default DatabaseManager;
