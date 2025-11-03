const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Get all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        // Count number of employees under this admin
        employees: {
          select: {
            _count: true
          }
        }
      }
    });

    // Format the response
    const formattedAdmins = admins.map(admin => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      status: admin.status,
      employeeCount: admin.employees.length,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    }));

    res.status(200).json(formattedAdmins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new admin
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    // Check if admin with this email already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin
    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });

    res.status(201).json({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      status: admin.status
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update admin
exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { id }
    });

    if (!admin || admin.role !== 'ADMIN') {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Prepare update data
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Update admin
    const updatedAdmin = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        updatedAt: true
      }
    });

    res.status(200).json(updatedAdmin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete admin
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { id }
    });

    if (!admin || admin.role !== 'ADMIN') {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Check if admin has employees
    const employeeCount = await prisma.user.count({
      where: {
        adminId: id
      }
    });

    if (employeeCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete admin with employees',
        employeeCount
      });
    }

    // Delete admin
    await prisma.user.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Block admin
exports.blockAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { id }
    });

    if (!admin || admin.role !== 'ADMIN') {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Update admin status
    const updatedAdmin = await prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        updatedAt: true
      }
    });

    res.status(200).json(updatedAdmin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Unblock admin
exports.unblockAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { id }
    });

    if (!admin || admin.role !== 'ADMIN') {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Update admin status
    const updatedAdmin = await prisma.user.update({
      where: { id },
      data: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        updatedAt: true
      }
    });

    res.status(200).json(updatedAdmin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};