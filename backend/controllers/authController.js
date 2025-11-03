const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, adminId } = req.body;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Admin can't register - must be created by Super Admin
    if (role === 'ADMIN') {
      return res.status(403).json({ error: 'Admin accounts can only be created by Super Admin' });
    }
    
    // Employees must choose their Admin
    if (role === 'EMPLOYEE' || !role) {
      if (!adminId) {
        return res.status(400).json({ error: 'Employee must select an Admin' });
      }
      
      // Verify that adminId belongs to an ADMIN user
      const admin = await prisma.user.findUnique({
        where: { id: adminId }
      });
      
      if (!admin || admin.role !== 'ADMIN') {
        return res.status(400).json({ error: 'Invalid Admin ID' });
      }
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create the user with default status PENDING for employees
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'EMPLOYEE',
        status: role === 'SUPER_ADMIN' ? 'ACTIVE' : 'PENDING',
        adminId: role === 'EMPLOYEE' ? adminId : null
      }
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        role: user.role,
        status: user.status
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    console.log("JWT token sent:", token);
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      adminId: user.adminId,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Hardcoded Super Admin login
    if (email === 'nitesh@gmail.com' && password === 'nitesh@123') {
      let superAdmin = null;
      
      try {
        // Check if Super Admin exists in DB
        superAdmin = await prisma.user.findUnique({
          where: { email: 'nitesh@gmail.com' }
        });
        
        // Create Super Admin if not exists
        if (!superAdmin) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash('nitesh@123', salt);
          
          superAdmin = await prisma.user.create({
            data: {
              name: 'Super Admin',
              email: 'nitesh@gmail.com',
              password: hashedPassword,
              role: 'SUPER_ADMIN',
              status: 'ACTIVE'
            }
          });
        }
      } catch (error) {
        if (error.code === 'P2021') {
          // If the tables don't exist, return a helpful error message
          return res.status(500).json({ 
            error: 'Database tables not found. Please run migrations first.',
            details: 'Run: npm run prisma:migrate'
          });
        }
        throw error;
      }
      
      // Generate JWT for Super Admin
      const token = jwt.sign(
        { 
          id: superAdmin.id,
          role: 'SUPER_ADMIN',
          status: 'ACTIVE'
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      
      console.log("JWT token sent:", token);
      return res.status(200).json({
        id: superAdmin.id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        token
      });
    }
    
    // Regular login flow for other users
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Check if account is pending
    if (user.status === 'PENDING') {
      return res.status(403).json({ error: 'Account is pending approval' });
    }
    
    // Check if account is inactive
    if (user.status === 'INACTIVE') {
      return res.status(403).json({ error: 'Account is inactive' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token with role and status
    const token = jwt.sign(
      { 
        id: user.id,
        role: user.role,
        status: user.status
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    console.log("JWT token sent:", token);
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      adminId: user.adminId,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};