import mongoose from 'mongoose';

// Quiz Schema
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 255
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'live', 'archived'],
    default: 'draft'
  },
  timeLimit: {
    type: Number, // in minutes
    min: 1,
    max: 480 // 8 hours max
  },
  maxAttempts: {
    type: Number,
    min: 1,
    default: 1
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
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
quizSchema.index({ creatorId: 1 });
quizSchema.index({ status: 1 });
quizSchema.index({ isPublic: 1 });
quizSchema.index({ createdAt: -1 });

// Static methods
quizSchema.statics.findByCreator = function(creatorId) {
  return this.find({ creatorId }).sort({ createdAt: -1 });
};

quizSchema.statics.findPublicQuizzes = function() {
  return this.find({ status: 'live', isPublic: true }).sort({ createdAt: -1 });
};

quizSchema.statics.findLiveQuizzes = function() {
  return this.find({ status: 'live' }).sort({ createdAt: -1 });
};

// Instance methods
quizSchema.methods.updateStats = async function() {
  const Question = mongoose.model('Question');
  const questions = await Question.find({ quizId: this._id });
  
  this.totalQuestions = questions.length;
  this.totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
  
  return await this.save();
};

quizSchema.methods.canUserAccess = function(userId, userRole) {
  // Creator can always access their own quizzes
  if (this.creatorId.toString() === userId.toString()) {
    return true;
  }
  
  // Public live quizzes can be accessed by anyone
  if (this.status === 'live' && this.isPublic) {
    return true;
  }
  
  return false;
};

// Create and export the model
const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz; 