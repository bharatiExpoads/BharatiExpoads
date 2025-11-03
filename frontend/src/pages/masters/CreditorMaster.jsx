import React, { useState, useEffect } from 'react';
import { AiOutlineBank } from 'react-icons/ai';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import * as masterService from '../../services/masterService';
import Layout from '../../components/Layout';

const CreditorMaster = () => {
  const [creditors, setCreditors] = useState([]);
  const [selectedCreditor, setSelectedCreditor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    address: '',
    gstNo: '',
    panNo: '',
    contactPerson: '',
    contactPersonNumber: '',
    whatsappNumber: '',
    landlineNumber: '',
    bankDetails: ''
  });

  // GST and PAN registered flags
  const [isGstRegistered, setIsGstRegistered] = useState(true);
  const [isPanAvailable, setIsPanAvailable] = useState(true);

  // Form errors
  const [formErrors, setFormErrors] = useState({});

  // Fetch creditors
  const fetchCreditors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await masterService.getAllCreditors();
      setCreditors(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch creditor data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditors();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value, type } = e.target;

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
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.companyName) errors.companyName = 'Company Name is required';
    if (!formData.contactPerson) errors.contactPerson = 'Contact Person is required';
    if (!formData.contactPersonNumber) errors.contactPersonNumber = 'Contact Person Number is required';
    if (!formData.address) errors.address = 'Address is required';

    if (isGstRegistered && !formData.gstNo) errors.gstNo = 'GST Number is required';
    if (isPanAvailable && !formData.panNo) errors.panNo = 'PAN Number is required';

    if (!formData.bankDetails) errors.bankDetails = 'Bank Details are required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open form modal for adding
  const handleAdd = () => {
    setSelectedCreditor(null);
    setFormData({
      name: '',
      companyName: '',
      address: '',
      gstNo: '',
      panNo: '',
      contactPerson: '',
      contactPersonNumber: '',
      whatsappNumber: '',
      landlineNumber: '',
      bankDetails: ''
    });
    setIsGstRegistered(true);
    setIsPanAvailable(true);
    setIsFormModalOpen(true);
  };

  // Open form modal for editing
  const handleEdit = (creditor) => {
    setSelectedCreditor(creditor);
    setFormData({
      name: creditor.name || '',
      companyName: creditor.companyName || '',
      address: creditor.address || '',
      gstNo: creditor.gstNo === 'Unregistered' ? '' : creditor.gstNo || '',
      panNo: creditor.panNo === 'Unregistered' ? '' : creditor.panNo || '',
      contactPerson: creditor.contactPerson || '',
      contactPersonNumber: creditor.contactPersonNumber || '',
      whatsappNumber: creditor.whatsappNumber || '',
      landlineNumber: creditor.landlineNumber || '',
      bankDetails: creditor.bankDetails || ''
    });
    setIsGstRegistered(creditor.gstNo !== 'Unregistered');
    setIsPanAvailable(creditor.panNo !== 'Unregistered');
    setIsFormModalOpen(true);
  };

  // Open delete modal
  const handleDeleteClick = (creditor) => {
    setSelectedCreditor(creditor);
    setIsDeleteModalOpen(true);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const cleanData = { ...formData };

      cleanData.gstNo = isGstRegistered ? formData.gstNo : 'Unregistered';
      cleanData.panNo = isPanAvailable ? formData.panNo : 'Unregistered';

      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === '') cleanData[key] = null;
      });

      if (selectedCreditor) {
        await masterService.updateCreditor(selectedCreditor.id, cleanData);
      } else {
        await masterService.createCreditor(cleanData);
      }

      setIsFormModalOpen(false);
      fetchCreditors();
    } catch (err) {
      setError(err.message || 'Failed to save creditor');
    }
  };

  // Delete creditor
  const handleDelete = async () => {
    if (!selectedCreditor) return;

    try {
      await masterService.deleteCreditor(selectedCreditor.id);
      fetchCreditors();
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to delete creditor');
    }
  };

  // Table columns configuration
  const columns = [
    { key: 'name', label: 'Creditor Name' },
    { key: 'companyName', label: 'Company Name', render: (c) => c.companyName || '-' },
    { key: 'contactPerson', label: 'Contact Person', render: (c) => c.contactPerson || '-' },
    { key: 'contactPersonNumber', label: 'Contact Person Number' },
    { key: 'whatsappNumber', label: 'WhatsApp Number', render: (c) => c.whatsappNumber || '-' },
    { key: 'landlineNumber', label: 'Landline Number', render: (c) => c.landlineNumber || '-' },
    { key: 'gstNo', label: 'GST Number', render: (c) => c.gstNo || '-' },
    { key: 'panNo', label: 'PAN Number', render: (c) => c.panNo || '-' },
    { key: 'bankDetails', label: 'Bank Details', render: (c) => c.bankDetails || '-' }
  ];

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <AiOutlineBank className="mr-2" /> Creditor Master
          </h1>
          <p className="text-gray-600">Manage all your creditors</p>
        </div>

        <Table
          title="Creditor List"
          data={creditors}
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
          title={selectedCreditor ? 'Edit Creditor' : 'Add New Creditor'}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Creditor Name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter creditor name"
                required
                error={formErrors.name}
              />

              <FormField
                label="Company Name"
                id="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter company name"
                required
                error={formErrors.companyName}
              />

              <FormField
                label="Contact Person"
                id="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="Enter contact person name"
                required
                error={formErrors.contactPerson}
              />

              <FormField
                label="Contact Person Number"
                id="contactPersonNumber"
                value={formData.contactPersonNumber}
                onChange={handleChange}
                placeholder="Enter contact person number"
                required
                error={formErrors.contactPersonNumber}
              />

              <FormField
                label="WhatsApp Number"
                id="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                placeholder="Enter WhatsApp number"
                error={formErrors.whatsappNumber}
              />

              <FormField
                label="Landline Number"
                id="landlineNumber"
                value={formData.landlineNumber}
                onChange={handleChange}
                placeholder="Enter landline number"
                error={formErrors.landlineNumber}
              />

              {/* GST Registered Dropdown */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Registered?</label>
                <select
                  value={isGstRegistered ? 'yes' : 'no'}
                  onChange={(e) => setIsGstRegistered(e.target.value === 'yes')}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {/* Conditionally show GST Number input */}
              {isGstRegistered && (
                <FormField
                  label="GST Number"
                  id="gstNo"
                  value={formData.gstNo}
                  onChange={handleChange}
                  placeholder="Enter GST number"
                  required
                  error={formErrors.gstNo}
                />
              )}

              {/* PAN Available Dropdown */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">PAN Available?</label>
                <select
                  value={isPanAvailable ? 'yes' : 'no'}
                  onChange={(e) => setIsPanAvailable(e.target.value === 'yes')}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {/* Conditionally show PAN Number input */}
              {isPanAvailable && (
                <FormField
                  label="PAN Number"
                  id="panNo"
                  value={formData.panNo}
                  onChange={handleChange}
                  placeholder="Enter PAN number"
                  required
                  error={formErrors.panNo}
                />
              )}

              <FormField
                label="Bank Details"
                id="bankDetails"
                value={formData.bankDetails}
                onChange={handleChange}
                placeholder="Enter bank details"
                required
                error={formErrors.bankDetails}
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
                {selectedCreditor ? 'Update Creditor' : 'Add Creditor'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDelete}
          itemName="creditor"
        />
      </div>
    </Layout>
  );
};

export default CreditorMaster;
