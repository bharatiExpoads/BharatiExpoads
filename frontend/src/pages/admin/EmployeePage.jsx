import React, { useState, useEffect } from 'react';
import { AiOutlineTeam } from 'react-icons/ai';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import * as masterService from '../../services/masterService';
import Layout from '../../components/Layout';

// Define the modules available in system
const MODULES = [
  'Masters',
  'Campaigns',
  'Accounts',
  'Reports',
  'Vouchers'
];

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch employees
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await masterService.getAllEmployeeMasters();
      setEmployees(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch employees');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch permissions for one employee
  const fetchPermissions = async (employeeId) => {
    try {
      const data = await masterService.getEmployeePermissions(employeeId);
      setPermissions(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Open modal for managing permissions
  const handleManagePermissions = async (employee) => {
    setSelectedEmployee(employee);
    await fetchPermissions(employee.id);
    setIsPermissionModalOpen(true);
  };

  // Toggle permission checkbox
  const handleToggle = (module, field) => {
    setPermissions((prev) => {
      const existing = prev.find((p) => p.module === module);
      if (existing) {
        return prev.map((p) =>
          p.module === module ? { ...p, [field]: !p[field] } : p
        );
      } else {
        return [
          ...prev,
          {
            module,
            canCreate: false,
            canRead: false,
            canUpdate: false,
            canDelete: false,
            [field]: true
          }
        ];
      }
    });
  };

  // Save permissions
  const handleSavePermissions = async () => {
    try {
      for (let perm of permissions) {
        if (perm.id) {
          // update
          await masterService.updateEmployeePermission(perm.id, perm);
        } else {
          // create
          await masterService.createEmployeePermission(selectedEmployee.id, perm);
        }
      }
      setIsPermissionModalOpen(false);
    } catch (err) {
      console.error(err);
      setError('Failed to save permissions');
    }
  };

  // Delete employee
  const handleDeleteEmployee = async () => {
    try {
      await masterService.deleteEmployeeMaster(selectedEmployee.id);
      fetchEmployees();
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to delete employee');
    }
  };

  // Columns for employee list
  const columns = [
    { key: 'employeeName', label: 'Employee Name' },
    { key: 'officialEmail', label: 'Official Email' },
    { key: 'personalEmail', label: 'Personal Email' }
  ];

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <AiOutlineTeam className="mr-2" /> Employees
          </h1>
          <p className="text-gray-600">Manage employee permissions</p>
        </div>

        <Table
          title="Employee List"
          data={employees}
          columns={columns}
          onEdit={handleManagePermissions}
          onDelete={(emp) => {
            setSelectedEmployee(emp);
            setIsDeleteModalOpen(true);
          }}
          loading={isLoading}
          error={error}
        />

        {/* Permissions Modal */}
        <Modal
          isOpen={isPermissionModalOpen}
          onClose={() => setIsPermissionModalOpen(false)}
          title={
            selectedEmployee
              ? `Manage Permissions: ${selectedEmployee.employeeName}`
              : 'Manage Permissions'
          }
          size="lg"
        >
          <div className="space-y-4">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Module</th>
                  <th className="px-4 py-2">Create</th>
                  <th className="px-4 py-2">Read</th>
                  <th className="px-4 py-2">Update</th>
                  <th className="px-4 py-2">Delete</th>
                </tr>
              </thead>
              <tbody>
                {MODULES.map((mod) => {
                  const perm = permissions.find((p) => p.module === mod) || {};
                  return (
                    <tr key={mod}>
                      <td className="px-4 py-2 border">{mod}</td>
                      {['canCreate', 'canRead', 'canUpdate', 'canDelete'].map((field) => (
                        <td key={field} className="px-4 py-2 border text-center">
                          <input
                            type="checkbox"
                            checked={!!perm[field]}
                            onChange={() => handleToggle(mod, field)}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsPermissionModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDeleteEmployee}
          itemName="employee"
        />
      </div>
    </Layout>
  );
};

export default EmployeePage;
