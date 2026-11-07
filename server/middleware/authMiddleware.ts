import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// In college projects, JWT secret is stored in .env or a default fallback
export const JWT_SECRET = process.env.JWT_SECRET || 'college_diagnostic_lab_secret_key_2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

/**
 * Middleware 1: verifyToken
 * Validates the JSON Web Token sent in Authorization Header
 * Header format: "Bearer <token>"
 */
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check if token was provided
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: No JWT token provided. Please log in.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token using secret key
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      name: string;
    };

    // Attach decoded user info to request object
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.'
    });
  }
};

/**
 * Middleware 2: checkRole
 * Enforces Role-Based Access Control (RBAC)
 * Example: checkRole(['Admin', 'Lab Technician'])
 */
export const checkRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Requires role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};
