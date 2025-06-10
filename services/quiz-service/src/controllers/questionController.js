import Question from '../models/Question.js';
import Quiz from '../models/Quiz.js';

// Add a question to a quiz
export const addQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { type, content, options, correctAnswer, points, explanation, orderIndex } = req.body;
    const userId = req.user.id;

    // Check if quiz exists and user owns it
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
        message: 'You can only add questions to your own quizzes'
      });
    }

    // Prepare options based on question type
    let processedOptions;
    if (type === 'mcq') {
      processedOptions = new Map(Object.entries(options || {}));
    } else if (type === 'true_false') {
      processedOptions = new Map([
        ['true', 'True'],
        ['false', 'False']
      ]);
    }

    const question = new Question({
      quizId,
      type,
      content,
      options: processedOptions,
      correctAnswer,
      points: points || 1,
      explanation,
      orderIndex
    });

    await question.save();

    // Update quiz stats
    await quiz.updateStats();

    res.status(201).json({
      success: true,
      message: 'Question added successfully',
      data: { question: question.toJSON() }
    });
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add question',
      error: error.message
    });
  }
};

// Get all questions for a quiz
export const getQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user._id;

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check access permissions
    if (!quiz.canUserAccess(userId, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this quiz'
      });
    }

    const questions = await Question.findByQuiz(quizId);
    
    // Hide answers if user is not the creator
    const questionsData = quiz.creatorId.toString() === userId.toString() 
      ? questions 
      : questions.map(q => q.getPublicData());

    res.json({
      success: true,
      data: { questions: questionsData }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch questions'
    });
  }
};

// Get a specific question
export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user owns the quiz
    const quiz = await Quiz.findById(question.quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Associated quiz not found'
      });
    }

    if (!quiz.canUserAccess(userId, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this question'
      });
    }

    // Return full data if creator, public data if taker
    const questionData = quiz.creatorId.toString() === userId.toString() 
      ? question.toJSON() 
      : question.getPublicData();

    res.json({
      success: true,
      data: { question: questionData }
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch question'
    });
  }
};

// Update a question
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, content, options, correctAnswer, points, explanation, orderIndex } = req.body;
    const userId = req.user._id;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user owns the quiz
    const quiz = await Quiz.findById(question.quizId);
    if (!quiz || quiz.creatorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update questions in your own quizzes'
      });
    }

    // Update fields
    if (type !== undefined) question.type = type;
    if (content !== undefined) question.content = content;
    if (correctAnswer !== undefined) question.correctAnswer = correctAnswer;
    if (points !== undefined) question.points = points;
    if (explanation !== undefined) question.explanation = explanation;
    if (orderIndex !== undefined) question.orderIndex = orderIndex;

    // Update options based on type
    if (options !== undefined) {
      if (type === 'mcq' || question.type === 'mcq') {
        question.options = new Map(Object.entries(options));
      } else if (type === 'true_false' || question.type === 'true_false') {
        question.options = new Map([
          ['true', 'True'],
          ['false', 'False']
        ]);
      }
    }

    await question.save();

    // Update quiz stats
    await quiz.updateStats();

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: { question: question.toJSON() }
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update question',
      error: error.message
    });
  }
};

// Delete a question
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user owns the quiz
    const quiz = await Quiz.findById(question.quizId);
    if (!quiz || quiz.creatorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete questions from your own quizzes'
      });
    }

    await Question.findByIdAndDelete(id);

    // Update quiz stats
    await quiz.updateStats();

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete question'
    });
  }
};

// Reorder questions in a quiz
export const reorderQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { questionOrders } = req.body; // Array of { questionId, orderIndex }
    const userId = req.user._id;

    // Check if user owns the quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz || quiz.creatorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only reorder questions in your own quizzes'
      });
    }

    // Update each question's order
    const updatePromises = questionOrders.map(({ questionId, orderIndex }) =>
      Question.findByIdAndUpdate(questionId, { orderIndex }, { new: true })
    );

    await Promise.all(updatePromises);

    const updatedQuestions = await Question.findByQuiz(quizId);

    res.json({
      success: true,
      message: 'Questions reordered successfully',
      data: { questions: updatedQuestions }
    });
  } catch (error) {
    console.error('Reorder questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder questions'
    });
  }
}; 