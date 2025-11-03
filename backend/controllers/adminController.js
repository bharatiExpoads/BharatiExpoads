const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Create a new admin (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create admin user
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
      role: admin.role,
      status: admin.status
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get employees for an admin (GET /employees/my)
exports.getEmployees = async (req, res) => {
  try {
    const adminId = req.user.id;
    
    const employees = await prisma.user.findMany({
      where: {
        adminId,
        role: 'EMPLOYEE'
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc' // Most recent first
      }
    });
    
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Approve an employee (change status from PENDING to ACTIVE)
exports.approveEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Check if employee exists and belongs to this admin
    const employee = await prisma.user.findUnique({
      where: { id: employeeId }
    });
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    if (employee.adminId !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Not authorized to approve this employee' });
    }
    
    // Update employee status
    const updatedEmployee = await prisma.user.update({
      where: { id: employeeId },
      data: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        adminId: true
      }
    });
    
    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Deactivate an employee (change status to INACTIVE)
exports.deactivateEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Check if employee exists and belongs to this admin
    const employee = await prisma.user.findUnique({
      where: { id: employeeId }
    });
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    if (employee.adminId !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Not authorized to deactivate this employee' });
    }
    
    // Update employee status
    const updatedEmployee = await prisma.user.update({
      where: { id: employeeId },
      data: { status: 'INACTIVE' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        adminId: true
      }
    });
    
    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new employee (POST /employees/create)
exports.createEmployee = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { name, email, password } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create employee with PENDING status by default
    const employee = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'EMPLOYEE',
        status: 'PENDING',
        adminId: adminId
      }
    });
    
    res.status(201).json({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      status: employee.status,
      adminId: employee.adminId,
      createdAt: employee.createdAt
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Reject an employee (change status to REJECTED)
exports.rejectEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const adminId = req.user.id;
    
    // Check if employee exists and belongs to this admin
    const employee = await prisma.user.findFirst({
      where: { 
        id: employeeId,
        adminId: adminId
      }
    });
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found or not authorized to manage this employee' });
    }
    
    // Update employee status to REJECTED
    const updatedEmployee = await prisma.user.update({
      where: { id: employeeId },
      data: { status: 'REJECTED' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        adminId: true
      }
    });
    
    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error('Error rejecting employee:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete an employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const adminId = req.user.id;
    
    // Check if employee exists and belongs to this admin
    const employee = await prisma.user.findFirst({
      where: { 
        id: employeeId,
        adminId: adminId
      }
    });
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found or not authorized to delete this employee' });
    }
    
    // Delete the employee
    await prisma.user.delete({
      where: { id: employeeId }
    });
    
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Server error' });
  }
};