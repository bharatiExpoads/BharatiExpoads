import React, { useState, useEffect } from 'react';
import { AiOutlineTeam, AiOutlinePhone, AiOutlineDollar } from 'react-icons/ai';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import * as masterService from '../../services/masterService';
import { formatDate, formatCurrency } from '../../utils/formatters';
import Layout from '../../components/Layout';

const LabourMaster = () => {
  const [labours, setLabours] = useState([]);
  const [selectedLabour, setSelectedLabour] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    personName: '',
    companyName: '',
    type: '',
    address: '',
    gstNo: '',
    bankDetails: '',
    panNumber: '',
    labourType: 'Fabricator'
  });
  
  // Form errors
  const [formErrors, setFormErrors] = useState({});
  
  // Fetch labours
  const fetchLabours = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await masterService.getAllLabours();
      setLabours(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch labour data');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLabours();
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
    if (!formData.personName) errors.personName = 'Person Name is required';
    if (!formData.companyName) errors.companyName = 'Company Name is required';
    if (!formData.type) errors.type = 'Type is required';
    if (!formData.address) errors.address = 'Address is required';
    if (!formData.labourType) errors.labourType = 'Labour Type is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Open form modal for adding
  const handleAdd = () => {
    setSelectedLabour(null);
    setFormData({
      personName: '',
      companyName: '',
      type: '',
      address: '',
      gstNo: '',
      bankDetails: '',
      panNumber: '',
      labourType: 'Fabricator'
    });
    setIsFormModalOpen(true);
  };
  
  // Open form modal for editing
  const handleEdit = (labour) => {
    setSelectedLabour(labour);
    setFormData({
      personName: labour.personName || '',
      companyName: labour.companyName || '',
      type: labour.type || '',
      address: labour.address || '',
      gstNo: labour.gstNo || '',
      bankDetails: labour.bankDetails || '',
      panNumber: labour.panNumber || '',
      labourType: labour.labourType || 'Fabricator'
    });
    setIsFormModalOpen(true);
  };
  
  // Open delete modal
  const handleDeleteClick = (labour) => {
    setSelectedLabour(labour);
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
      if (selectedLabour) {
        // Update existing labour
        await masterService.updateLabour(selectedLabour.id, cleanData);
      } else {
        // Create new labour
        await masterService.createLabour(cleanData);
      }
      
      // Close modal and refresh data
      setIsFormModalOpen(false);
      fetchLabours();
    } catch (err) {
      setError(err.message || 'Failed to save labour data');
    }
  };
  
  // Delete labour
  const handleDelete = async () => {
    if (!selectedLabour) return;
    
    try {
      await masterService.deleteLabour(selectedLabour.id);
      fetchLabours();
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to delete labour');
    }
  };
  
  // Table columns configuration
  const columns = [
    {
      key: 'personName',
      label: 'Person Name'
    },
    {
      key: 'companyName',
      label: 'Company Name'
    },
    {
      key: 'type',
      label: 'Type',
      render: (labour) => labour.type || '-'
    },
    {
      key: 'labourType',
      label: 'Labour Type',
      render: (labour) => labour.labourType || '-'
    },
    {
      key: 'address',
      label: 'Address',
      render: (labour) => labour.address || '-'
    },
    {
      key: 'gstNo',
      label: 'GST No',
      render: (labour) => labour.gstNo || '-'
    },
    {
      key: 'bankDetails',
      label: 'Bank Details',
      render: (labour) => labour.bankDetails || '-'
    },
    {
      key: 'panNumber',
      label: 'PAN Number',
      render: (labour) => labour.panNumber || '-'
    }
  ];
  
  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <AiOutlineTeam className="mr-2" /> Labour Master
          </h1>
          <p className="text-gray-600">Manage all your labour workforce</p>
        </div>
        
        <Table
          title="Labour List"
          data={labours}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onAdd={handleAdd}
          loading={isLoading}
          error={error}
        />
        
        {/* Form Modal */}
        <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedLabour ? 'Edit Labour' : 'Add Labour'}>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Person Name" id="personName" name="personName" value={formData.personName} onChange={handleChange} error={formErrors.personName} required />
              <FormField label="Company Name" id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} error={formErrors.companyName} required />
              <FormField label="Type" id="type" name="type" value={formData.type} onChange={handleChange} error={formErrors.type} required />
              <FormField label="Labour Type" id="labourType" name="labourType" value={formData.labourType} onChange={handleChange} error={formErrors.labourType} required type="select" options={[
                { value: 'Fabricator', label: 'Fabricator' },
                { value: 'Mounter', label: 'Mounter' }
              ]} />
              <FormField label="Address" id="address" name="address" value={formData.address} onChange={handleChange} error={formErrors.address} required />
              <FormField label="GST No" id="gstNo" name="gstNo" value={formData.gstNo} onChange={handleChange} error={formErrors.gstNo} />
              <FormField label="Bank Details" id="bankDetails" name="bankDetails" value={formData.bankDetails} onChange={handleChange} error={formErrors.bankDetails} />
              <FormField label="PAN Number" id="panNumber" name="panNumber" value={formData.panNumber} onChange={handleChange} error={formErrors.panNumber} />
            </div>
            <div className="flex justify-end mt-4">
              <button type="button" className="btn btn-secondary mr-2" onClick={() => setIsFormModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {selectedLabour ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
        
        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDelete}
          itemName="labour"
        />
      </div>
    </Layout>
  );
};

export default LabourMaster;