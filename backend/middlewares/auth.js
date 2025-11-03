const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Base authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    console.log('Auth middleware hit');
    const authHeader = req.headers.authorization;
    // console.log('Backend received token:', authHeader);
    if (!authHeader) {
      // console.log('No Authorization header');
      return res.status(401).json({ error: 'No token, authorization denied' });
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.log('Malformed Authorization header:', authHeader);
      return res.status(401).json({ error: 'Malformed token' });
    }
    const token = parts[1];
    if (!token) {
      console.log('No token found after Bearer');
      return res.status(401).json({ error: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Check if user status is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Account is not active' });
    }
    
    // Set user in request with all details
    req.user = {
      id: user.id,
      role: user.role,
      status: user.status,
      adminId: user.adminId
    };
    // console.log('Authenticated user:', req.user); 
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Middleware to restrict access based on roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to access this resource' });
    }
    
    next();
  };
};

// Middleware to ensure user is Super Admin
const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Super Admin access required' });
  }
  next();
};

// Middleware to ensure user is Admin or Super Admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Middleware to ensure employee can only access their own resources
const isOwnResource = (req, res, next) => {
  // Super admins and admins can access any resource
  if (req.user.role === 'SUPER_ADMIN' || req.user.role === 'ADMIN') {
    return next();
  }
  
  // Check if the requested resource belongs to the user
  if (req.params.id && req.params.id !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized to access this resource' });
  }
  
  next();
};

module.exports = {
  auth,
  authorize,
  isSuperAdmin,
  isAdmin,
  isOwnResource
};