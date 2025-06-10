import express from 'express';
import {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getQuizStatistics,
  getQuizLeaderboard,
  getUserQuizzes
} from '../controllers/quizController.js';
import { authenticateToken, requireCreator } from '../middleware/auth.js';

const router = express.Router();

// Public routes (with authentication)
router.get('/', authenticateToken, getQuizzes);
router.get('/my-quizzes', authenticateToken, getUserQuizzes);
router.get('/:id', authenticateToken, getQuizById);
router.get('/:id/leaderboard', authenticateToken, getQuizLeaderboard);

// Creator-only routes
router.post('/', authenticateToken, requireCreator, createQuiz);
router.put('/:id', authenticateToken, requireCreator, updateQuiz);
router.delete('/:id', authenticateToken, requireCreator, deleteQuiz);
router.get('/:id/statistics', authenticateToken, requireCreator, getQuizStatistics);

export default router; 