import express from 'express';
import {
  addQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  reorderQuestions
} from '../controllers/questionController.js';
import { authenticateToken, requireCreator } from '../middleware/auth.js';

const router = express.Router();

// Public routes (with authentication)
router.get('/quiz/:quizId', authenticateToken, getQuestions);
router.get('/:id', authenticateToken, getQuestionById);

// Creator-only routes
router.post('/quiz/:quizId', authenticateToken, requireCreator, addQuestion);
router.put('/:id', authenticateToken, requireCreator, updateQuestion);
router.delete('/:id', authenticateToken, requireCreator, deleteQuestion);
router.patch('/quiz/:quizId/reorder', authenticateToken, requireCreator, reorderQuestions);

export default router; 