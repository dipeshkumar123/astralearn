import mongoose from 'mongoose';
import { config } from './environment.js';

class DatabaseManager {
  static instance = null;
  connection = null;

  constructor() {}

  static getInstance() {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async connect() {
    try {
      const dbConfig = this.getConfig();
      
      console.log('🔌 Attempting MongoDB connection...');
      console.log(`📍 URI: ${dbConfig.uri.replace(/:[^:@]*@/, ':***@')}`); // Hide password
      
      await mongoose.connect(dbConfig.uri, dbConfig.options);
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
      
      // In development, try alternative connection
      if (config.server.environment === 'development' && error.message.includes('ECONNREFUSED')) {
        console.log('🔄 Attempting fallback connection...');
        try {
          const fallbackUri = 'mongodb://localhost:27017/astralearn';
          await mongoose.connect(fallbackUri, this.getConfig().options);
          this.connection = mongoose.connection;
          console.log('✅ MongoDB connected via fallback');
          this.setupEventListeners();
          return;
        } catch (fallbackError) {
          console.error('❌ Fallback connection also failed:', fallbackError);
        }
      }
      
      process.exit(1);
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      console.log('🔌 MongoDB disconnected');
    }
  }

  getConfig() {
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

  setupEventListeners() {
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

  getConnection() {
    return this.connection;
  }

  isConnected() {
    return this.connection?.readyState === 1;
  }
}

export default DatabaseManager;
