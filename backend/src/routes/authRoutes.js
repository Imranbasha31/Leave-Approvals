import express from 'express';
import { login, register, getCurrentUser, createUser, getAllUsers, deleteUser } from '../controllers/authController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authMiddleware, getCurrentUser);
router.post('/create-user', authMiddleware, adminMiddleware, createUser);
router.get('/users', authMiddleware, getAllUsers);
router.delete('/users/:userId', authMiddleware, adminMiddleware, deleteUser);

export default router;
