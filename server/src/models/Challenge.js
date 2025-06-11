import mongoose, { Schema } from 'mongoose';

// Challenge Schema - For time-limited competitions and group challenges
const challengeSchema = new Schema({
  challengeId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['individual', 'group', 'course', 'global'],
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['learning', 'consistency', 'collaboration', 'performance', 'social'],
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    required: true
  },
  
  // Time constraints
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    required: true,
    index: true
  },
  duration: {
    type: Number, // Duration in hours
    required: true
  },
  
  // Challenge objectives and criteria
  objectives: [{
    type: {
      type: String,
      enum: ['points', 'lessons', 'assessments', 'streak', 'collaboration', 'custom'],
      required: true
    },
    target: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    weight: {
      type: Number,
      default: 1,
      min: 0.1,
      max: 5
    }
  }],
  
  // Participation rules
  participation: {
    maxParticipants: {
      type: Number,
      default: null // null means unlimited
    },
    minParticipants: {
      type: Number,
      default: 1
    },
    eligibility: {
      minLevel: { type: Number, default: 1 },
      maxLevel: { type: Number, default: null },
      requiredBadges: [{ type: String }],
      courseRestrictions: [{ type: Schema.Types.ObjectId, ref: 'Course' }]
    },
    autoJoin: {
      type: Boolean,
      default: false
    }
  },
  
  // Rewards and incentives
  rewards: {
    winner: {
      points: { type: Number, default: 0 },
      badges: [{ type: String }],
      title: { type: String },
      specialRewards: [{ type: String }]
    },
    participation: {
      points: { type: Number, default: 0 },
      badges: [{ type: String }]
    },
    milestone: [{
      threshold: { type: Number, required: true },
      points: { type: Number, default: 0 },
      badges: [{ type: String }],
      description: { type: String }
    }]
  },
  
  // Challenge state
  status: {
    type: String,
    enum: ['draft', 'upcoming', 'active', 'completed', 'cancelled'],
    default: 'draft',
    index: true
  },
  
  // Participants tracking
  participants: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      currentScore: { type: Number, default: 0 },
      objectives: [{
        objectiveIndex: { type: Number, required: true },
        currentValue: { type: Number, default: 0 },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date }
      }],
      rank: { type: Number },
      lastActivity: { type: Date }
    },
    status: {
      type: String,
      enum: ['active', 'withdrawn', 'disqualified'],
      default: 'active'
    }
  }],
  
  // Leaderboard and results
  leaderboard: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    finalScore: {
      type: Number,
      required: true
    },
    rank: {
      type: Number,
      required: true
    },
    achievements: [{
      objectiveIndex: { type: Number },
      value: { type: Number },
      completedAt: { type: Date }
    }],
    rewardsEarned: {
      points: { type: Number, default: 0 },
      badges: [{ type: String }],
      title: { type: String }
    }
  }],
  
  // Social features
  social: {
    allowTeams: { type: Boolean, default: false },
    maxTeamSize: { type: Number, default: 1 },
    allowChat: { type: Boolean, default: true },
    allowProgress: { type: Boolean, default: true }, // Show progress to others
    featured: { type: Boolean, default: false }
  },
  
  // Meta information
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [{
    type: String,
    trim: true,
    index: true
  }],
  
  // Analytics
  analytics: {
    totalParticipants: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    engagement: {
      dailyActiveUsers: [{ date: Date, count: Number }],
      retentionRate: { type: Number, default: 0 }
    }
  },
  
  // Additional settings
  settings: {
    autoRewards: { type: Boolean, default: true },
    publicLeaderboard: { type: Boolean, default: true },
    allowLateJoin: { type: Boolean, default: false },
    notificationsEnabled: { type: Boolean, default: true }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Challenge Activity Schema - For tracking individual challenge activities
const challengeActivitySchema = new Schema({
  challengeId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  activityType: {
    type: String,
    enum: ['join', 'progress', 'complete_objective', 'withdraw', 'complete_challenge'],
    required: true
  },
  data: {
    objectiveIndex: { type: Number },
    previousValue: { type: Number },
    newValue: { type: Number },
    pointsEarned: { type: Number },
    metadata: { type: Schema.Types.Mixed }
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Challenge Team Schema - For group challenges
const challengeTeamSchema = new Schema({
  challengeId: {
    type: String,
    required: true,
    index: true
  },
  teamName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  teamId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Team members
  members: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['leader', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    contribution: {
      points: { type: Number, default: 0 },
      objectives: [{ 
        objectiveIndex: Number, 
        value: Number 
      }]
    }
  }],
  
  // Team progress
  progress: {
    totalScore: { type: Number, default: 0 },
    objectives: [{
      objectiveIndex: { type: Number, required: true },
      currentValue: { type: Number, default: 0 },
      completed: { type: Boolean, default: false },
      completedAt: { type: Date }
    }],
    rank: { type: Number },
    lastActivity: { type: Date }
  },
  
  // Team settings
  settings: {
    isPrivate: { type: Boolean, default: false },
    allowRequests: { type: Boolean, default: true },
    description: { type: String, maxlength: 500 }
  },
  
  status: {
    type: String,
    enum: ['active', 'disbanded'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance
challengeSchema.index({ status: 1, startDate: 1, endDate: 1 });
challengeSchema.index({ type: 1, category: 1, status: 1 });
challengeSchema.index({ 'participants.userId': 1, status: 1 });
challengeSchema.index({ createdBy: 1, status: 1 });
challengeSchema.index({ tags: 1, status: 1 });

challengeActivitySchema.index({ challengeId: 1, timestamp: -1 });
challengeActivitySchema.index({ userId: 1, timestamp: -1 });

challengeTeamSchema.index({ challengeId: 1, status: 1 });
challengeTeamSchema.index({ 'members.userId': 1 });

// Pre-save middleware to update analytics
challengeSchema.pre('save', function(next) {
  if (this.isModified('participants')) {
    this.analytics.totalParticipants = this.participants.length;
    
    const completedParticipants = this.participants.filter(p => 
      p.progress.objectives.every(obj => obj.completed)
    ).length;
    
    this.analytics.completionRate = this.participants.length > 0 
      ? (completedParticipants / this.participants.length) * 100 
      : 0;
      
    const totalScore = this.participants.reduce((sum, p) => sum + p.progress.currentScore, 0);
    this.analytics.averageScore = this.participants.length > 0 
      ? totalScore / this.participants.length 
      : 0;
  }
  next();
});

// Static method to find active challenges
challengeSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gte: now }
  });
};

// Static method to find upcoming challenges
challengeSchema.statics.findUpcoming = function() {
  const now = new Date();
  return this.find({
    status: 'upcoming',
    startDate: { $gt: now }
  });
};

// Instance method to check if user can join
challengeSchema.methods.canUserJoin = function(user, userGamification) {
  const now = new Date();
  
  // Check if challenge is open for joining
  if (this.status !== 'upcoming' && this.status !== 'active') return false;
  if (this.endDate <= now) return false;
  if (!this.settings.allowLateJoin && this.status === 'active') return false;
  
  // Check participation limits
  if (this.participation.maxParticipants && 
      this.participants.length >= this.participation.maxParticipants) return false;
  
  // Check if user already joined
  if (this.participants.some(p => p.userId.toString() === user._id.toString())) return false;
  
  // Check eligibility criteria
  const eligibility = this.participation.eligibility;
  
  if (eligibility.minLevel && userGamification.level < eligibility.minLevel) return false;
  if (eligibility.maxLevel && userGamification.level > eligibility.maxLevel) return false;
  
  if (eligibility.requiredBadges.length > 0) {
    const userBadges = userGamification.badges.map(b => b.badgeId);
    const hasAllBadges = eligibility.requiredBadges.every(badge => userBadges.includes(badge));
    if (!hasAllBadges) return false;
  }
  
  return true;
};

// Instance method to calculate user progress
challengeSchema.methods.calculateUserProgress = function(userId, activities) {
  const participant = this.participants.find(p => p.userId.toString() === userId.toString());
  if (!participant) return null;
  
  const progress = {
    currentScore: 0,
    objectives: [],
    completionPercentage: 0
  };
  
  // Calculate progress for each objective
  this.objectives.forEach((objective, index) => {
    let currentValue = 0;
    
    // Calculate based on objective type and user activities
    switch (objective.type) {
      case 'points':
        currentValue = activities
          .filter(a => a.challengeId === this.challengeId)
          .reduce((sum, a) => sum + (a.data.pointsEarned || 0), 0);
        break;
      case 'lessons':
        currentValue = activities
          .filter(a => a.activityType === 'lesson_complete')
          .length;
        break;
      case 'assessments':
        currentValue = activities
          .filter(a => a.activityType === 'assessment_complete')
          .length;
        break;
      // Add more objective types as needed
    }
    
    const objectiveProgress = {
      objectiveIndex: index,
      currentValue: Math.min(currentValue, objective.target),
      completed: currentValue >= objective.target,
      completedAt: currentValue >= objective.target ? new Date() : null
    };
    
    progress.objectives.push(objectiveProgress);
    progress.currentScore += Math.min(currentValue / objective.target, 1) * objective.weight * 100;
  });
  
  progress.completionPercentage = this.objectives.length > 0 
    ? (progress.objectives.filter(obj => obj.completed).length / this.objectives.length) * 100
    : 0;
  
  return progress;
};

export const Challenge = mongoose.model('Challenge', challengeSchema);
export const ChallengeActivity = mongoose.model('ChallengeActivity', challengeActivitySchema);
export const ChallengeTeam = mongoose.model('ChallengeTeam', challengeTeamSchema);
