const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Base controller with common CRUD operations for all master data
 */
class BaseController {
  constructor(model) {
    this.model = model;
    this.prisma = prisma;
  }

  // Get all records for the current admin
  getAll = async (req, res) => {
    try {
    //    console.log('Incoming body:', req.body);
    // console.log('User:', req.user);
      const adminId = req.user.id;
      const records = await this.prisma[this.model].findMany({
        where: { adminId },
        orderBy: { createdAt: 'desc' }
      });
      
      res.status(200).json(records);
    } catch (error) {
      console.error(`Error fetching ${this.model}:`, error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  // Get a single record by ID
  getById = async (req, res) => {
    try {
    //    console.log('Incoming body:', req.body);
    // console.log('User:', req.user);
      const { id } = req.params;
      const adminId = req.user.id;
      
      const record = await this.prisma[this.model].findFirst({
        where: { 
          id,
          adminId 
        }
      });
      
      if (!record) {
        return res.status(404).json({ error: `${this.model} not found` });
      }
      
      res.status(200).json(record);
    } catch (error) {
      console.error(`Error fetching ${this.model}:`, error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  // Create a new record
  create = async (req, res) => {
    try {
    //    console.log('Incoming body:', req.body);
    // console.log('User:', req.user);
      const adminId = req.user.id;
      const data = { ...req.body, adminId };
      
      // Sanitize: convert empty strings to null
      Object.keys(data).forEach(key => {
        if (data[key] === '') data[key] = null;
      });
      // For date fields, convert 'YYYY-MM-DD' to ISO string or set to null
      ['startDate', 'endDate', 'joiningDate'].forEach(field => {
        if (data[field]) {
          if (typeof data[field] === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data[field])) {
            data[field] = new Date(data[field]).toISOString();
          } else if (isNaN(Date.parse(data[field]))) {
            data[field] = null;
          }
        }
      });
      // Parse float fields for known models
      if (this.model === 'landlord') {
        if (data.rentAmount) data.rentAmount = parseFloat(data.rentAmount);
        if (data.hikeAfterYears) data.hikeAfterYears = parseInt(data.hikeAfterYears);
        if (data.hikePercentage) data.hikePercentage = parseFloat(data.hikePercentage);
        // Handle siteLocation as relation (array of hoarding IDs)
        if (data.siteLocation) {
          if (Array.isArray(data.siteLocation)) {
            data.siteLocation = { connect: data.siteLocation.map(id => ({ id })) };
          } else {
            delete data.siteLocation;
          }
        }
      }
      if (this.model === 'employeeMaster') {
        if (data.salary) data.salary = parseFloat(data.salary);
        if (data.joiningDate && typeof data.joiningDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.joiningDate)) {
          data.joiningDate = new Date(data.joiningDate).toISOString();
        }
      }
      if (this.model === 'creditor' || this.model === 'client' || this.model === 'agency') {
        // No float fields, skip
      }
      const record = await this.prisma[this.model].create({ data });
      res.status(201).json(record);
    } catch (error) {
      console.error(`Error creating ${this.model}:`, error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  };

  // Update an existing record
  update = async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.user.id;
      // Check if record exists and belongs to this admin
      const existingRecord = await this.prisma[this.model].findFirst({
        where: { 
          id,
          adminId 
        }
      });
      if (!existingRecord) {
        return res.status(404).json({ error: `${this.model} not found` });
      }
      // Sanitize: convert empty strings to null
      const data = { ...req.body };
      Object.keys(data).forEach(key => {
        if (data[key] === '') data[key] = null;
      });
      // For date fields, convert 'YYYY-MM-DD' to ISO string or set to null
      ['startDate', 'endDate', 'joiningDate'].forEach(field => {
        if (data[field]) {
          if (typeof data[field] === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data[field])) {
            // Convert to ISO string
            data[field] = new Date(data[field]).toISOString();
          } else if (isNaN(Date.parse(data[field]))) {
            data[field] = null;
          }
        }
      });
      // Update the record
      const updatedRecord = await this.prisma[this.model].update({
        where: { id },
        data
      });
      res.status(200).json(updatedRecord);
    } catch (error) {
      console.error(`Error updating ${this.model}:`, error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  };

  // Delete a record
  delete = async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.user.id;
      
      // Check if record exists and belongs to this admin
      const existingRecord = await this.prisma[this.model].findFirst({
        where: { 
          id,
          adminId 
        }
      });
      
      if (!existingRecord) {
        return res.status(404).json({ error: `${this.model} not found` });
      }
      
      // Delete the record
      await this.prisma[this.model].delete({
        where: { id }
      });
      
      res.status(200).json({ message: `${this.model} deleted successfully` });
    } catch (error) {
      console.error(`Error deleting ${this.model}:`, error);
      res.status(500).json({ error: 'Server error' });
    }
  };
}

module.exports = BaseController;