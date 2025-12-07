import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  console.log('[authMiddleware] Request to:', req.method, req.path);
  console.log('[authMiddleware] Auth header:', authHeader ? 'Present' : 'Missing');

  if (!token) {
    console.log('[authMiddleware] No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    console.log('[authMiddleware] Invalid or expired token');
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.userId = decoded.userId;
  console.log('[authMiddleware] ✓ Auth successful for userId:', req.userId);
  next();
};

export const adminMiddleware = async (req, res, next) => {
  try {
    const { User } = await import('../models/User.js');
    const user = await User.findById(req.userId);

    if (!user) {
      console.log('[adminMiddleware] User not found:', req.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'admin') {
      console.log('[adminMiddleware] ✗ Access denied - user role:', user.role);
      return res.status(403).json({ error: 'Admin access required' });
    }

    console.log('[adminMiddleware] ✓ Admin access granted for:', user.email);
    next();
  } catch (error) {
    console.error('[adminMiddleware] Error:', error);
    res.status(500).json({ error: 'Authorization check failed' });
  }
};
