import React, { useState, useEffect } from 'react';
import { AiOutlineUser, AiOutlinePhone, AiOutlineMail, AiOutlineBank } from 'react-icons/ai';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import * as masterService from '../../services/masterService';
import Layout from '../../components/Layout';

const LandlordMaster = () => {
  const [landlords, setLandlords] = useState([]);
  const [selectedLandlord, setSelectedLandlord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    landlordName: '',
    address: '',
    bankDetails: '',
    rentAmount: '',
    hikeAfterYears: '',
    hikePercentage: '',
    siteLocation: ''
  });
  
  // Form errors
  const [formErrors, setFormErrors] = useState({});
  
  // Fetch landlords
  const fetchLandlords = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await masterService.getAllLandlords();
      setLandlords(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch landlords');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLandlords();
  }, []);
  
  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
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
    if (!formData.landlordName) errors.landlordName = 'Landlord Name is required';
    if (!formData.address) errors.address = 'Address is required';
    if (!formData.bankDetails) errors.bankDetails = 'Bank Details are required';
    if (!formData.rentAmount) errors.rentAmount = 'Rent Amount is required';
    if (!formData.hikeAfterYears) errors.hikeAfterYears = 'Hike After Years is required';
    if (!formData.hikePercentage) errors.hikePercentage = 'Hike Percentage is required';
    if (!formData.siteLocation) errors.siteLocation = 'Site Location is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Open form modal for adding
  const handleAdd = () => {
    setSelectedLandlord(null);
    setFormData({
      landlordName: '',
      address: '',
      bankDetails: '',
      rentAmount: '',
      hikeAfterYears: '',
      hikePercentage: '',
      siteLocation: ''
    });
    setIsFormModalOpen(true);
  };
  
  // Open form modal for editing
  const handleEdit = (landlord) => {
    setSelectedLandlord(landlord);
    setFormData({
      landlordName: landlord.landlordName || '',
      address: landlord.address || '',
      bankDetails: landlord.bankDetails || '',
      rentAmount: landlord.rentAmount || '',
      hikeAfterYears: landlord.hikeAfterYears || '',
      hikePercentage: landlord.hikePercentage || '',
      siteLocation: landlord.siteLocation || ''
    });
    setIsFormModalOpen(true);
  };
  
  // Open delete modal
  const handleDeleteClick = (landlord) => {
    setSelectedLandlord(landlord);
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
      if (selectedLandlord) {
        // Update existing landlord
        await masterService.updateLandlord(selectedLandlord.id, cleanData);
      } else {
        // Create new landlord
        await masterService.createLandlord(cleanData);
      }
      
      // Close modal and refresh data
      setIsFormModalOpen(false);
      fetchLandlords();
    } catch (err) {
      setError(err.message || 'Failed to save landlord');
    }
  };
  
  // Delete landlord
  const handleDelete = async () => {
    if (!selectedLandlord) return;
    
    try {
      await masterService.deleteLandlord(selectedLandlord.id);
      fetchLandlords();
    } catch (err) {
      setError(err.message || 'Failed to delete landlord');
    }
  };
  
  // Table columns configuration
  const columns = [
    {
      key: 'landlordName',
      label: 'Landlord Name'
    },
    {
      key: 'address',
      label: 'Address',
      render: (landlord) => landlord.address || '-'
    },
    {
      key: 'rentAmount',
      label: 'Rent Amount',
      render: (landlord) => landlord.rentAmount || '-'
    },
    {
      key: 'hikeAfterYears',
      label: 'Hike After Years',
      render: (landlord) => landlord.hikeAfterYears || '-'
    },
    {
      key: 'hikePercentage',
      label: 'Hike Percentage',
      render: (landlord) => landlord.hikePercentage || '-'
    },
    {
      key: 'siteLocation',
      label: 'Site Location',
      render: (landlord) => Array.isArray(landlord.siteLocation) && landlord.siteLocation.length > 0
        ? landlord.siteLocation.map(h => h.location).join(', ')
        : '-'
    },
    {
      key: 'hoardings',
      label: 'Hoardings',
      render: (landlord) => landlord.hoardings ? landlord.hoardings.length : 0
    }
  ];
  
  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <AiOutlineUser className="mr-2" /> Landlord Master
          </h1>
          <p className="text-gray-600">Manage all your landlords</p>
        </div>
        
        <Table
          title="Landlord List"
          data={landlords}
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
          title={selectedLandlord ? 'Edit Landlord' : 'Add New Landlord'}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Landlord Name"
                id="landlordName"
                value={formData.landlordName}
                onChange={handleChange}
                placeholder="Enter landlord name"
                required
                error={formErrors.landlordName}
              />
              
              <FormField
                label="Address"
                id="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                required
                error={formErrors.address}
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
                label="Rent Amount"
                id="rentAmount"
                value={formData.rentAmount}
                onChange={handleChange}
                placeholder="Enter rent amount"
                required
                error={formErrors.rentAmount}
              />
              
              <FormField
                label="Hike After Years"
                id="hikeAfterYears"
                value={formData.hikeAfterYears}
                onChange={handleChange}
                placeholder="Enter hike after years"
                required
                error={formErrors.hikeAfterYears}
              />
              
              <FormField
                label="Hike Percentage"
                id="hikePercentage"
                value={formData.hikePercentage}
                onChange={handleChange}
                placeholder="Enter hike percentage"
                required
                error={formErrors.hikePercentage}
              />
              
              <FormField
                label="Site Location"
                id="siteLocation"
                value={formData.siteLocation}
                onChange={handleChange}
                placeholder="Select site location"
                required
                error={formErrors.siteLocation}
              >
                <select id="siteLocation" name="siteLocation" className="form-select">
                  <option value="">Select a site location</option>
                  {/* This dropdown will be populated with hoarding locations */}
                </select>
              </FormField>
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
                {selectedLandlord ? 'Update Landlord' : 'Add Landlord'}
              </button>
            </div>
          </form>
        </Modal>
        
        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDelete}
          itemName="landlord"
        />
      </div>
    </Layout>
  );
};

export default LandlordMaster;