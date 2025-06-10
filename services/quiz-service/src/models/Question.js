import mongoose from 'mongoose';

// Question Schema
const questionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Quiz'
  },
  type: {
    type: String,
    required: true,
    enum: ['mcq', 'true_false', 'short_answer'],
    default: 'mcq'
  },
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  options: {
    type: Map,
    of: String,
    validate: {
      validator: function(options) {
        if (this.type === 'mcq') {
          return options && options.size >= 2;
        }
        if (this.type === 'true_false') {
          return options && options.has('true') && options.has('false');
        }
        return true; // short_answer doesn't need options
      },
      message: 'MCQ questions need at least 2 options, True/False questions need true and false options'
    }
  },
  correctAnswer: {
    type: String,
    required: true,
    validate: {
      validator: function(answer) {
        if (this.type === 'mcq' && this.options) {
          return this.options.has(answer);
        }
        if (this.type === 'true_false') {
          return ['true', 'false'].includes(answer);
        }
        return true; // short_answer can have any answer
      },
      message: 'Correct answer must be one of the provided options'
    }
  },
  points: {
    type: Number,
    min: 1,
    max: 100,
    default: 1
  },
  explanation: {
    type: String,
    trim: true,
    maxlength: 500
  },
  orderIndex: {
    type: Number,
    required: true,
    min: 0
  },
  media: {
    type: {
      type: String,
      enum: ['image', 'video', 'audio']
    },
    url: String,
    description: String
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      
      // Convert Map to Object for JSON serialization
      if (ret.options) {
        if (ret.options instanceof Map) {
          ret.options = Object.fromEntries(ret.options);
        } else if (typeof ret.options === 'object' && ret.options.constructor === Object) {
          // Already a plain object, keep as is
          ret.options = ret.options;
        }
      }
      
      return ret;
    }
  }
});

// Indexes for performance
questionSchema.index({ quizId: 1, orderIndex: 1 });
questionSchema.index({ quizId: 1 });

// Static methods
questionSchema.statics.findByQuiz = function(quizId) {
  return this.find({ quizId }).sort({ orderIndex: 1 });
};

questionSchema.statics.getQuizStats = async function(quizId) {
  const questions = await this.find({ quizId });
  return {
    totalQuestions: questions.length,
    totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
    questionTypes: questions.reduce((types, q) => {
      types[q.type] = (types[q.type] || 0) + 1;
      return types;
    }, {})
  };
};

// Instance methods
questionSchema.methods.checkAnswer = function(userAnswer) {
  const isCorrect = this.correctAnswer.toLowerCase() === userAnswer.toLowerCase();
  return {
    isCorrect,
    points: isCorrect ? this.points : 0,
    correctAnswer: this.correctAnswer,
    explanation: this.explanation
  };
};

questionSchema.methods.getPublicData = function() {
  const publicData = this.toJSON();
  delete publicData.correctAnswer;
  delete publicData.explanation;
  return publicData;
};

// Pre-save middleware to auto-increment orderIndex
questionSchema.pre('save', async function(next) {
  if (this.isNew && this.orderIndex === undefined) {
    const lastQuestion = await this.constructor
      .findOne({ quizId: this.quizId })
      .sort({ orderIndex: -1 });
    
    this.orderIndex = lastQuestion ? lastQuestion.orderIndex + 1 : 0;
  }
  next();
});

// Create and export the model
const Question = mongoose.model('Question', questionSchema);

export default Question; 