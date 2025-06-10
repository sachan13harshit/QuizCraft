import express from 'express';
import { 
  signup, 
  login, 
  getProfile, 
  updateProfile, 
  changePassword, 
  verifyToken,
  getAllUsers,
  getUserById 
} from '../controllers/authController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/signup', validate(schemas.signup), signup);
router.post('/login', validate(schemas.login), login);

// Protected routes
router.get('/me', authenticateToken, getProfile);
router.get('/verify', authenticateToken, verifyToken);
router.put('/profile', authenticateToken, validate(schemas.updateProfile), updateProfile);
router.put('/password', authenticateToken, validate(schemas.changePassword), changePassword);

// Admin routes
router.get('/users', authenticateToken, authorizeRoles('admin'), getAllUsers);

// Get user by ID (for other services)
router.get('/users/:id', authenticateToken, getUserById);

export default router; 