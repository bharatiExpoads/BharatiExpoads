import React, { useState, useEffect } from 'react';
import { AiOutlineUserAdd, AiOutlineMail, AiOutlinePhone } from 'react-icons/ai';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import * as masterService from '../../services/masterService';
import { formatDate, formatCurrency } from '../../utils/formatters';
import Layout from '../../components/Layout';

const EmployeeMaster = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    employeeName: '',
    officialEmail: '',
    personalEmail: '',
    address: '',
    panNumber: '',
    bankDetails: '',
    salary: '',
    joiningDate: ''
  });
  
  // Form errors
  const [formErrors, setFormErrors] = useState({});
  
  // Fetch employees
  const fetchEmployees = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await masterService.getAllEmployeeMasters();
      setEmployees(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch employee data');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEmployees();
  }, []);
  
  // Handle form input change
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : parseFloat(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.employeeName) errors.employeeName = 'Employee Name is required';
    if (!formData.officialEmail) errors.officialEmail = 'Official Email is required';
    if (!formData.personalEmail) errors.personalEmail = 'Personal Email is required';
    if (!formData.address) errors.address = 'Address is required';
    if (!formData.panNumber) errors.panNumber = 'PAN Number is required';
    if (!formData.bankDetails) errors.bankDetails = 'Bank Details are required';
    if (!formData.salary) errors.salary = 'Salary is required';
    if (!formData.joiningDate) errors.joiningDate = 'Joining Date is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Open form modal for adding
  const handleAdd = () => {
    setSelectedEmployee(null);
    setFormData({
      employeeName: '',
      officialEmail: '',
      personalEmail: '',
      address: '',
      panNumber: '',
      bankDetails: '',
      salary: '',
      joiningDate: ''
    });
    setIsFormModalOpen(true);
  };
  
  // Open form modal for editing
  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      employeeName: employee.employeeName || '',
      officialEmail: employee.officialEmail || '',
      personalEmail: employee.personalEmail || '',
      address: employee.address || '',
      panNumber: employee.panNumber || '',
      bankDetails: employee.bankDetails || '',
      salary: employee.salary || '',
      joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toISOString().split('T')[0] : ''
    });
    setIsFormModalOpen(true);
  };
  
  // Open delete modal
  const handleDeleteClick = (employee) => {
    setSelectedEmployee(employee);
    setIsDeleteModalOpen(true);
  };
  
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const cleanData = { ...formData };
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === '') cleanData[key] = null;
      });
      if (selectedEmployee) {
        // Update existing employee
        await masterService.updateEmployeeMaster(selectedEmployee.id, cleanData);
      } else {
        // Create new employee
        await masterService.createEmployeeMaster(cleanData);
      }
      
      // Close modal and refresh data
      setIsFormModalOpen(false);
      fetchEmployees();
    } catch (err) {
      if (err.message.includes('email')) {
        setFormErrors({
          ...formErrors,
          officialEmail: 'This official email is already in use'
        });
      } else {
        setError(err.message || 'Failed to save employee');
      }
    }
  };
  
  // Delete employee
  const handleDelete = async () => {
    if (!selectedEmployee) return;
    
    try {
      await masterService.deleteEmployeeMaster(selectedEmployee.id);
      fetchEmployees();
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to delete employee');
    }
  };
  
  // Table columns configuration
  const columns = [
    {
      key: 'employeeName',
      label: 'Employee Name'
    },
    {
      key: 'officialEmail',
      label: 'Official Email'
    },
    {
      key: 'personalEmail',
      label: 'Personal Email'
    },
    {
      key: 'address',
      label: 'Address'
    },
    {
      key: 'panNumber',
      label: 'PAN Number'
    },
    {
      key: 'bankDetails',
      label: 'Bank Details'
    },
    {
      key: 'salary',
      label: 'Salary',
      render: (employee) => employee.salary ? formatCurrency(employee.salary) : '-'
    },
    {
      key: 'joiningDate',
      label: 'Joining Date',
      render: (employee) => employee.joiningDate ? formatDate(employee.joiningDate) : '-'
    }
  ];
  
  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <AiOutlineUserAdd className="mr-2" /> Employee Master
          </h1>
          <p className="text-gray-600">Manage all your employee details</p>
        </div>
        
        <Table
          title="Employee List"
          data={employees}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onAdd={handleAdd}
          loading={isLoading}
          error={error}
        />
        
        {/* Form Modal */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Employee Name"
                id="employeeName"
                value={formData.employeeName}
                onChange={handleChange}
                placeholder="Enter employee name"
                required
                error={formErrors.employeeName}
              />
              
              <FormField
                label="Official Email"
                id="officialEmail"
                type="email"
                value={formData.officialEmail}
                onChange={handleChange}
                placeholder="Enter official email"
                required
                error={formErrors.officialEmail}
              />
              
              <FormField
                label="Personal Email"
                id="personalEmail"
                type="email"
                value={formData.personalEmail}
                onChange={handleChange}
                placeholder="Enter personal email"
                required
                error={formErrors.personalEmail}
              />
              
              <FormField
                label="Address"
                id="address"
                type="textarea"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                required
                error={formErrors.address}
              />
              
              <FormField
                label="PAN Number"
                id="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                placeholder="Enter PAN number"
                required
                error={formErrors.panNumber}
              />
              
              <FormField
                label="Bank Details"
                id="bankDetails"
                type="textarea"
                value={formData.bankDetails}
                onChange={handleChange}
                placeholder="Enter bank details"
                required
                error={formErrors.bankDetails}
              />
              
              <FormField
                label="Salary"
                id="salary"
                type="number"
                value={formData.salary}
                onChange={handleChange}
                placeholder="Enter salary"
                required
                error={formErrors.salary}
                min="0"
                step="0.01"
              />
              
              <FormField
                label="Joining Date"
                id="joiningDate"
                type="date"
                value={formData.joiningDate}
                onChange={handleChange}
                required
                error={formErrors.joiningDate}
              />
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {selectedEmployee ? 'Update Employee' : 'Add Employee'}
              </button>
            </div>
          </form>
        </Modal>
        
        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDelete}
          itemName="employee"
        />
      </div>
    </Layout>
  );
};

export default EmployeeMaster;