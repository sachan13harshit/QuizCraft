import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import Response from '../models/Response.js';

// Create a new quiz
export const createQuiz = async (req, res) => {
  try {
    const { title, description, timeLimit, maxAttempts, isPublic, status } = req.body;
    
    const quiz = new Quiz({
      title,
      description,
      creatorId: req.user.id,
      timeLimit,
      maxAttempts,
      isPublic: isPublic || false,
      status: status || 'draft'
    });

    await quiz.save();

    console.log(`Quiz created: ${quiz.title}, Status: ${quiz.status}, Public: ${quiz.isPublic}`);

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: { quiz: quiz.toJSON() }
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz'
    });
  }
};

// Get all quizzes (with filters)
export const getQuizzes = async (req, res) => {
  try {
    const { status, isPublic, creatorId, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let filter = {};

    // Build filter based on user role and query params
    if (userRole === 'creator') {
      // Creators see their own quizzes + public quizzes
      if (creatorId) {
        filter.creatorId = creatorId;
      } else {
        filter.$or = [
          { creatorId: userId },
          { status: 'live', isPublic: true }
        ];
      }
    } else {
      // Takers see only public live quizzes
      filter = { status: 'live', isPublic: true };
    }

    // Apply additional filters
    if (status) filter.status = status;
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';

    console.log(`getQuizzes filter for ${userRole}:`, JSON.stringify(filter));

    const skip = (page - 1) * limit;
    
    const quizzes = await Quiz.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Quiz.countDocuments(filter);

    res.json({
      success: true,
      data: {
        quizzes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes'
    });
  }
};

// Get a specific quiz by ID
export const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if user can access this quiz
    if (!quiz.canUserAccess(userId, userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this quiz'
      });
    }

    // Get questions for the quiz
    const questions = await Question.findByQuiz(id);
    
    // Hide answers if user is taking the quiz (not the creator)
    const questionsData = quiz.creatorId.toString() === userId.toString() 
      ? questions 
      : questions.map(q => q.getPublicData());

    res.json({
      success: true,
      data: {
        quiz: quiz.toJSON(),
        questions: questionsData
      }
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz'
    });
  }
};

// Update a quiz
export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, timeLimit, maxAttempts, isPublic, status } = req.body;
    const userId = req.user.id;

    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if user owns this quiz
    if (quiz.creatorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own quizzes'
      });
    }

    // Update fields
    if (title !== undefined) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (timeLimit !== undefined) quiz.timeLimit = timeLimit;
    if (maxAttempts !== undefined) quiz.maxAttempts = maxAttempts;
    if (isPublic !== undefined) quiz.isPublic = isPublic;
    if (status !== undefined) quiz.status = status;

    // Update stats when publishing
    if (status === 'live') {
      await quiz.updateStats();
    }

    await quiz.save();

    res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: { quiz: quiz.toJSON() }
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quiz'
    });
  }
};

// Delete a quiz
export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if user owns this quiz
    if (quiz.creatorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own quizzes'
      });
    }

    // Delete associated questions and responses
    await Question.deleteMany({ quizId: id });
    await Response.deleteMany({ quizId: id });
    await Quiz.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz'
    });
  }
};

// Get quiz statistics
export const getQuizStatistics = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if user owns this quiz
    if (quiz.creatorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view statistics for your own quizzes'
      });
    }

    const statistics = await Response.getQuizStatistics(id);
    const questionStats = await Question.getQuizStats(id);

    res.json({
      success: true,
      data: {
        quiz: quiz.toJSON(),
        statistics: {
          ...statistics,
          ...questionStats
        }
      }
    });
  } catch (error) {
    console.error('Get quiz statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz statistics'
    });
  }
};

// Get quiz leaderboard
export const getQuizLeaderboard = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if quiz is public or user owns it
    if (!quiz.isPublic && quiz.creatorId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this quiz leaderboard'
      });
    }

    const leaderboard = await Response.getLeaderboard(id, parseInt(limit));

    res.json({
      success: true,
      data: {
        quiz: {
          id: quiz._id,
          title: quiz.title,
          totalQuestions: quiz.totalQuestions,
          totalPoints: quiz.totalPoints
        },
        leaderboard
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
};

// Get user's quizzes (for dashboard)
export const getUserQuizzes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let filter = { creatorId: userId };
    if (status) filter.status = status;

    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });

    // Get response count for each quiz
    const quizzesWithStats = await Promise.all(
      quizzes.map(async (quiz) => {
        const responseCount = await Response.countDocuments({ quizId: quiz._id });
        const statistics = await Response.getQuizStatistics(quiz._id);
        
        return {
          ...quiz.toJSON(),
          responseCount,
          averageScore: statistics.averageScore,
          averagePercentage: statistics.averagePercentage
        };
      })
    );

    res.json({
      success: true,
      data: { quizzes: quizzesWithStats }
    });
  } catch (error) {
    console.error('Get user quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user quizzes'
    });
  }
}; 