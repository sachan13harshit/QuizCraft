import Response from '../models/Response.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';

// Submit quiz response
export const submitQuizResponse = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers, startTime } = req.body;
    const userId = req.user.id;

    // Check if quiz exists and is accessible
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (!quiz.canUserAccess(userId, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this quiz'
      });
    }

    if (quiz.status !== 'live') {
      return res.status(400).json({
        success: false,
        message: 'Quiz is not live and cannot be submitted'
      });
    }

    // Check attempt limit
    const attemptCount = await Response.countDocuments({ quizId, userId });
    if (attemptCount >= quiz.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: `Maximum attempts (${quiz.maxAttempts}) reached for this quiz`
      });
    }

    // Convert answers object to Map
    const answersMap = new Map(Object.entries(answers || {}));

    // Create response
    const response = new Response({
      quizId,
      userId,
      answers: answersMap,
      score: 0,
      totalPoints: 0,
      startedAt: startTime ? new Date(startTime) : new Date(),
      submittedAt: new Date()
    });

    // Calculate time taken
    if (startTime) {
      response.calculateTimeTaken(startTime);
    }

    // Calculate score and feedback
    await response.calculateScore();

    res.status(201).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        response: {
          id: response._id,
          score: response.score,
          totalPoints: response.totalPoints,
          percentage: response.percentage,
          timeTaken: response.timeTaken,
          submittedAt: response.submittedAt,
          feedback: response.feedback
        }
      }
    });
  } catch (error) {
    console.error('Submit quiz response error:', error);
    
    // Handle duplicate submission error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this quiz'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz response'
    });
  }
};

// Get user's response to a specific quiz
export const getUserQuizResponse = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const response = await Response.findOne({ quizId, userId })
      .populate('quizId', 'title description totalQuestions totalPoints');

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'No response found for this quiz'
      });
    }

    // Get user's rank
    const rank = await response.getRank();

    res.json({
      success: true,
      data: {
        response: response.toJSON(),
        rank
      }
    });
  } catch (error) {
    console.error('Get user quiz response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz response'
    });
  }
};

// Get all responses for a quiz (for quiz creators)
export const getQuizResponses = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    // Check if user owns the quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (quiz.creatorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view responses for your own quizzes'
      });
    }

    const skip = (page - 1) * limit;
    
    const responses = await Response.find({ quizId })
      .sort({ score: -1, submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Response.countDocuments({ quizId });

    res.json({
      success: true,
      data: {
        responses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get quiz responses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz responses'
    });
  }
};

// Get user's all quiz responses (for user dashboard)
export const getUserResponses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const responses = await Response.find({ userId })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Response.countDocuments({ userId });

    // Add rank information for each response
    const responsesWithRank = await Promise.all(
      responses.map(async (response) => {
        const rank = await response.getRank();
        return {
          ...response.toJSON(),
          rank
        };
      })
    );

    res.json({
      success: true,
      data: {
        responses: responsesWithRank,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user responses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user responses'
    });
  }
};

// Get detailed response with feedback
export const getResponseDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const response = await Response.findById(id)
      .populate('quizId', 'title description creatorId');

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    // Check if user can access this response
    const canAccess = 
      response.userId.toString() === userId.toString() || // Own response
      response.quizId.creatorId.toString() === userId.toString(); // Quiz creator

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this response'
      });
    }

    // Get questions with user answers for detailed feedback
    const questions = await Question.find({ quizId: response.quizId._id }).sort({ orderIndex: 1 });
    
    const detailedFeedback = questions.map(question => {
      const userAnswer = response.answers.get(question._id.toString()) || '';
      const feedbackItem = response.feedback.find(f => 
        f.questionId.toString() === question._id.toString()
      );

      return {
        question: {
          id: question._id,
          content: question.content,
          type: question.type,
          options: question.options ? Object.fromEntries(question.options) : null,
          points: question.points
        },
        userAnswer,
        correctAnswer: feedbackItem?.correctAnswer || question.correctAnswer,
        isCorrect: feedbackItem?.isCorrect || false,
        pointsEarned: feedbackItem?.points || 0,
        explanation: feedbackItem?.explanation || question.explanation
      };
    });

    const rank = await response.getRank();

    res.json({
      success: true,
      data: {
        response: response.toJSON(),
        detailedFeedback,
        rank
      }
    });
  } catch (error) {
    console.error('Get response detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch response details'
    });
  }
};

// Delete a response (for users to retake if allowed)
export const deleteResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const response = await Response.findById(id);
    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    // Check if user owns this response
    if (response.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own responses'
      });
    }

    // Check if quiz allows retakes
    const quiz = await Quiz.findById(response.quizId);
    if (quiz && quiz.maxAttempts === 1) {
      return res.status(400).json({
        success: false,
        message: 'This quiz does not allow retakes'
      });
    }

    await Response.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Response deleted successfully'
    });
  } catch (error) {
    console.error('Delete response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete response'
    });
  }
}; 