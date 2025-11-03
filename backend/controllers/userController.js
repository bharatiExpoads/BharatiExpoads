const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all users based on role
exports.getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const currentUserRole = req.user.role;
    
    let where = {};
    
    // Filter users based on requesting user's role
    if (currentUserRole === 'SUPER_ADMIN') {
      // Super Admin can see all users or filter by role
      if (role) {
        where.role = role;
      }
    } else if (currentUserRole === 'ADMIN') {
      // Admins can only see their own employees
      if (role === 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Not authorized to view Super Admins' });
      }
      
      if (role === 'ADMIN') {
        where.role = 'ADMIN';
      } else {
        // By default, admin sees their employees
        where = {
          role: 'EMPLOYEE',
          adminId: req.user.id
        };
      }
    } else {
      // Employees can only see themselves
      return res.status(403).json({ error: 'Not authorized to view other users' });
    }
    
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        adminId: true,
        createdAt: true
      }
    });
    
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if updating their own profile
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        name,
        email
      },
      select: {
        id: true,
        name: true,
        email: true,
        updatedAt: true
      }
    });
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if deleting their own profile
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await prisma.user.delete({
      where: { id: req.params.id }
    });
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};