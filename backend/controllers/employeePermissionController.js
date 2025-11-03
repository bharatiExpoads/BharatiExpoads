const BaseController = require('./baseController');

class EmployeePermissionController extends BaseController {
  constructor() {
    super('employeePermission');
  }

  // Create a permission for an employee
  create = async (req, res) => {
    try {
      const adminId = req.user.id; // admin who assigns permissions
      const { id } = req.params;   // <-- employeeId comes from params
      const { module, canCreate, canRead, canUpdate, canDelete } = req.body;

    //   console.log('Admin ID from token:', adminId);
    //   console.log('Employee ID from params:', id);
    //   console.log('Request body:', req.body);

      // Check if employee exists under this admin
      const employee = await this.prisma.employeeMaster.findFirst({
        where: { id, adminId }
      });

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found for this admin' });
      }

      // Check if this module permission already exists for this employee
      const existingPermission = await this.prisma.employeePermission.findFirst({
        where: { employeeId: id, module }
      });

      if (existingPermission) {
        return res.status(400).json({
          error: 'Permission for this module already exists. Please update instead.'
        });
      }

      // Create permission
      const permission = await this.prisma.employeePermission.create({
        data: {
          employeeId: id,   // <-- Correctly use id from params
          module,
          canCreate: !!canCreate,
          canRead: !!canRead,
          canUpdate: !!canUpdate,
          canDelete: !!canDelete
        }
      });

      console.log('Created permission:', permission);
      res.status(201).json(permission);
    } catch (error) {
      console.error('Error creating permission:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  // Update permission (by permission id)
  update = async (req, res) => {
    try {
      const { id } = req.params; // permissionId
      const adminId = req.user.id;
      const { module, canCreate, canRead, canUpdate, canDelete } = req.body;

    //   console.log('Admin ID from token:', adminId);
    //   console.log('Permission ID from params:', id);
    //   console.log('Request body:', req.body);

      // Find permission and validate employee belongs to this admin
      const permission = await this.prisma.employeePermission.findUnique({
        where: { id }
      });

      if (!permission) {
        return res.status(404).json({ error: 'Permission not found' });
      }

      const employee = await this.prisma.employeeMaster.findFirst({
        where: { id: permission.employeeId, adminId }
      });

      if (!employee) {
        return res.status(403).json({ error: 'Not authorized to update this permission' });
      }

      const updated = await this.prisma.employeePermission.update({
        where: { id },
        data: {
          module,
          canCreate: !!canCreate,
          canRead: !!canRead,
          canUpdate: !!canUpdate,
          canDelete: !!canDelete
        }
      });

      console.log('Updated permission:', updated);
      res.status(200).json(updated);
    } catch (error) {
      console.error('Error updating permission:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  // Get all permissions for one employee
  getByEmployee = async (req, res) => {
    try {
      const { employeeId } = req.params;
      const adminId = req.user.id;

    //   console.log('Admin ID from token:', adminId);
    //   console.log('Employee ID from params:', employeeId);

      const employee = await this.prisma.employeeMaster.findFirst({
        where: { id: employeeId, adminId }
      });

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      const permissions = await this.prisma.employeePermission.findMany({
        where: { employeeId }
      });

      console.log('Fetched permissions:', permissions);
      res.status(200).json(permissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };
getForDashboard = async (req, res) => {
  try {
    console.log("hlo")
    const userId = req.user.id; // from JWT
    

    // Find employee and include permissions
    const employee = await this.prisma.employeeMaster.findFirst({
      where: { userId },
      include: { permissions: true }
    });

    if (!employee) {
        console.log('Employee not found for userId:', userId);
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Send permissions only
    console.log('Fetched dashboard permissions:', employee.permissions);
    res.status(200).json(employee.permissions);
  } catch (error) {
    console.error('Error fetching dashboard permissions:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
}
  


module.exports = new EmployeePermissionController();
