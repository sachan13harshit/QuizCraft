import express from 'express';
import {
  submitQuizResponse,
  getUserQuizResponse,
  getQuizResponses,
  getUserResponses,
  getResponseDetail,
  deleteResponse
} from '../controllers/responseController.js';
import { authenticateToken, requireCreator } from '../middleware/auth.js';

const router = express.Router();

// Public routes (with authentication)
router.post('/quiz/:quizId/submit', authenticateToken, submitQuizResponse);
router.get('/quiz/:quizId/my-response', authenticateToken, getUserQuizResponse);
router.get('/my-responses', authenticateToken, getUserResponses);
router.get('/:id', authenticateToken, getResponseDetail);
router.delete('/:id', authenticateToken, deleteResponse);

// Creator-only routes
router.get('/quiz/:quizId', authenticateToken, requireCreator, getQuizResponses);

export default router; 