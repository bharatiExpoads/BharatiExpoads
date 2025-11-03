// middleware/checkPermission.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware to check if employee has permission on a given module
 * 
 * @param {string} module - Name of the module (e.g., "master", "campaign")
 * @param {string} action - One of "canCreate", "canRead", "canUpdate", "canDelete"
 */
const checkPermission = (module, action) => {
  return async (req, res, next) => {
    try {
      // Admins / Super Admins skip permission checks
      if (req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN') {
        return next();
      }

      // Make sure user is authenticated
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Unauthorized: no user found in request' });
      }

      // Look up employee permission for this module
      const permission = await prisma.employeePermission.findFirst({
        where: {
          employeeId: req.user.id,
          module: module,
        },
      });

      // No permission record at all
      if (!permission) {
        return res.status(403).json({ message: `Access denied: no permissions for module "${module}"` });
      }

      // Check if the required action is allowed
      if (!permission[action]) {
        return res.status(403).json({ message: `Access denied: missing "${action}" on module "${module}"` });
      }

      // ✅ Permission granted
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Internal server error during permission check' });
    }
  };
};

module.exports = checkPermission;
