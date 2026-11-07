import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { labDb } from '../db/mockDb.ts';
import { JWT_SECRET, verifyToken, AuthRequest } from '../middleware/authMiddleware.ts';

const router = Router();

// POST /api/auth/register - Register a new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Simple college student level validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.'
      });
    }

    // Check if email already exists
    const existingUser = labDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.'
      });
    }

    // Hash password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      _id: `usr_${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'Patient',
      phone: phone || '',
      createdAt: new Date().toISOString()
    };

    labDb.users.push(newUser);

    // If role is Patient, also auto-create Patient record
    if (newUser.role === 'Patient') {
      const newPatient = {
        _id: `pat_${Date.now()}`,
        patientId: `PAT-${Math.floor(100 + Math.random() * 900)}`,
        name: newUser.name,
        age: 25,
        gender: 'Male' as const,
        phone: newUser.phone || '9999999999',
        email: newUser.email,
        address: 'Registered Online',
        bloodGroup: 'Unknown',
        createdAt: new Date().toISOString()
      };
      labDb.patients.push(newPatient);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Server error during registration: ' + (error.message || 'Unknown error')
    });
  }
});

// POST /api/auth/login - Authenticate user & return JWT
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // Find user in database
    const user = labDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    // Compare bcrypt password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password is incorrect.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Server error during login: ' + (error.message || 'Unknown error')
    });
  }
});

// GET /api/auth/me - Get current logged-in user details
router.get('/me', verifyToken, (req: AuthRequest, res: Response) => {
  const user = labDb.users.find(u => u._id === req.user?.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User record not found' });
  }

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    }
  });
});

export default router;
