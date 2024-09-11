import express from 'express';
import { verifyToken } from '../middleware/jwt';
import { registerUser, loginUser, getUser, updateUserProfile } from '../controllers/auth';

const userProfileRouter = express.Router();

// Middleware to verify JWT for protected routes
//userProfileRouter.use(verifyToken);

// Register user
userProfileRouter.post('/register', registerUser);

// Login user 
userProfileRouter.post('/login', loginUser);

// Get user profile
userProfileRouter.get('/profile',verifyToken, getUser);

// Update user profile
userProfileRouter.patch('/updateprofile',verifyToken, updateUserProfile);

//verify-token endpoint --> To be called by other services
userProfileRouter.post('/verify-token', verifyToken);

export default userProfileRouter;