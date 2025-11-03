const BaseController = require('./baseController');

class EmployeeMasterController extends BaseController {
  constructor() {
    super('employeeMaster');
  }
  
  // Override create to check for unique officialEmail
create = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { officialEmail, joiningDate } = req.body;

    // ✅ Step 1: Find user with matching email
    const user = await this.prisma.user.findUnique({
      where: { email: officialEmail }
    });

    if (!user) {
      console.log('No user found with email:', officialEmail);
      return res.status(400).json({ error: 'No user found with this official email' });
    }

    const userId = user.id;

    // ✅ Step 2: Ensure that this user is not already linked to an employee
    const existingByUser = await this.prisma.employeeMaster.findUnique({
      where: { userId }
    });

    if (existingByUser) {
      return res.status(400).json({ error: 'An employee already exists for this user' });
    }

    // ✅ Step 3: Check if the email is already used in employeeMaster for this admin
    const existingEmployee = await this.prisma.employeeMaster.findFirst({
      where: { officialEmail, adminId }
    });

    if (existingEmployee) {
      return res.status(400).json({ error: 'Official Email already used in EmployeeMaster' });
    }

    // ✅ Step 4: Prepare sanitized data
    const data = { ...req.body, adminId, userId };

    if (data.salary) data.salary = parseFloat(data.salary);

    if (
      joiningDate &&
      typeof joiningDate === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(joiningDate)
    ) {
      data.joiningDate = new Date(joiningDate).toISOString();
    } else if (joiningDate && isNaN(Date.parse(joiningDate))) {
      return res.status(400).json({ error: 'Invalid joiningDate' });
    }

    // ✅ Step 5: Create the employee record
    const employee = await this.prisma.employeeMaster.create({ data });

    res.status(201).json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


  // Override update to check for unique officialEmail
  update = async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.user.id;
      const { officialEmail } = req.body;
      // Check if employee exists and belongs to this admin
      const existingEmployee = await this.prisma.employeeMaster.findFirst({
        where: { id, adminId }
      });
      if (!existingEmployee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      // If officialEmail is being updated, check if it's already in use
      if (officialEmail && officialEmail !== existingEmployee.officialEmail) {
        const emailExists = await this.prisma.employeeMaster.findFirst({
          where: { officialEmail, adminId }
        });
        if (emailExists) {
          return res.status(400).json({ error: 'Official Email already in use' });
        }
      }
      // Parse salary as float
      const data = { ...req.body };
      if (data.salary) data.salary = parseFloat(data.salary);
      // Update the employee
      const updatedEmployee = await this.prisma.employeeMaster.update({
        where: { id },
        data
      });
      res.status(200).json(updatedEmployee);
    } catch (error) {
      console.error('Error updating employee:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };
}

module.exports = new EmployeeMasterController();