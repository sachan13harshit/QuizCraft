import mongoose from 'mongoose';

// Response Schema
const responseSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Quiz'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  answers: {
    type: Map,
    of: String,
    required: true,
    validate: {
      validator: function(answers) {
        return answers && answers.size > 0;
      },
      message: 'At least one answer is required'
    }
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  totalPoints: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  timeTaken: {
    type: Number, // in seconds
    min: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  isCompleted: {
    type: Boolean,
    default: true
  },
  feedback: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    userAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean,
    points: Number,
    explanation: String
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      
      // Convert Map to Object for JSON serialization
      if (ret.answers) {
        if (ret.answers instanceof Map) {
          ret.answers = Object.fromEntries(ret.answers);
        } else if (typeof ret.answers === 'object' && ret.answers.constructor === Object) {
          // Already a plain object, keep as is
          ret.answers = ret.answers;
        }
      }
      
      return ret;
    }
  }
});

// Compound index for performance (removed unique constraint to allow multiple attempts)
responseSchema.index({ quizId: 1, userId: 1 });

// Indexes for performance
responseSchema.index({ quizId: 1 });
responseSchema.index({ userId: 1 });
responseSchema.index({ score: -1 });
responseSchema.index({ percentage: -1 });
responseSchema.index({ submittedAt: -1 });

// Static methods
responseSchema.statics.findByQuiz = function(quizId) {
  return this.find({ quizId })
    .sort({ score: -1, timeTaken: 1 });
};

responseSchema.statics.findByUser = function(userId) {
  return this.find({ userId })
    .populate('quizId', 'title description')
    .sort({ submittedAt: -1 });
};

responseSchema.statics.getLeaderboard = function(quizId, limit = 10) {
  return this.find({ quizId, isCompleted: true })
    .sort({ score: -1, timeTaken: 1 })
    .limit(limit)
    .select('userId score totalPoints percentage timeTaken submittedAt');
};

responseSchema.statics.getQuizStatistics = async function(quizId) {
  const responses = await this.find({ quizId, isCompleted: true });
  
  if (responses.length === 0) {
    return {
      totalResponses: 0,
      averageScore: 0,
      averagePercentage: 0,
      averageTime: 0,
      highestScore: 0,
      lowestScore: 0
    };
  }

  const scores = responses.map(r => r.score);
  const percentages = responses.map(r => r.percentage);
  const times = responses.map(r => r.timeTaken).filter(t => t != null);

  return {
    totalResponses: responses.length,
    averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    averagePercentage: percentages.reduce((a, b) => a + b, 0) / percentages.length,
    averageTime: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
    passRate: (responses.filter(r => r.percentage >= 60).length / responses.length) * 100
  };
};

// Instance methods
responseSchema.methods.calculateScore = async function() {
  const Question = mongoose.model('Question');
  const questions = await Question.find({ quizId: this.quizId });
  
  let totalScore = 0;
  let totalPoints = 0;
  const feedback = [];

  for (const question of questions) {
    totalPoints += question.points;
    const userAnswer = this.answers.get(question._id.toString());
    
    if (userAnswer) {
      const result = question.checkAnswer(userAnswer);
      totalScore += result.points;
      
      feedback.push({
        questionId: question._id,
        userAnswer,
        correctAnswer: result.correctAnswer,
        isCorrect: result.isCorrect,
        points: result.points,
        explanation: result.explanation
      });
    } else {
      feedback.push({
        questionId: question._id,
        userAnswer: '',
        correctAnswer: question.correctAnswer,
        isCorrect: false,
        points: 0,
        explanation: question.explanation
      });
    }
  }

  this.score = totalScore;
  this.totalPoints = totalPoints;
  this.percentage = totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0;
  this.feedback = feedback;

  return await this.save();
};

responseSchema.methods.calculateTimeTaken = function(startTime) {
  if (startTime) {
    this.timeTaken = Math.floor((this.submittedAt - new Date(startTime)) / 1000);
  }
  return this;
};

responseSchema.methods.getRank = async function() {
  const betterResponses = await this.constructor.countDocuments({
    quizId: this.quizId,
    $or: [
      { score: { $gt: this.score } },
      { 
        score: this.score,
        timeTaken: { $lt: this.timeTaken }
      }
    ]
  });
  
  return betterResponses + 1;
};

// Pre-save middleware to calculate percentage
responseSchema.pre('save', function(next) {
  if (this.totalPoints > 0) {
    this.percentage = Math.round((this.score / this.totalPoints) * 100 * 100) / 100; // Round to 2 decimals
  } else {
    this.percentage = 0;
  }
  next();
});

// Create and export the model
const Response = mongoose.model('Response', responseSchema);

export default Response; 