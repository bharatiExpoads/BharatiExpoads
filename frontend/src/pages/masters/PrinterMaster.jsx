import React, { useState, useEffect } from 'react';
import { AiOutlinePrinter } from 'react-icons/ai';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import * as masterService from '../../services/masterService';
import Layout from '../../components/Layout';

const PrinterMaster = () => {
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    personName: '',
    companyName: '',
    type: 'printer',
    address: '',
    gstNo: '',
    bankDetails: '',
    panNumber: ''
  });

  // GST and PAN registered flags
  const [isGstRegistered, setIsGstRegistered] = useState(true);
  const [isPanAvailable, setIsPanAvailable] = useState(true);

  // Form errors
  const [formErrors, setFormErrors] = useState({});

  // Fetch printers
  const fetchPrinters = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await masterService.getAllPrinters();
      setPrinters(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch printer data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrinters();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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

    if (isGstRegistered && !formData.gstNo) errors.gstNo = 'GST Number is required';
    if (!isGstRegistered) {
      // no error for gstNo if not registered
    }

    if (!formData.bankDetails) errors.bankDetails = 'Bank Details are required';

    if (isPanAvailable && !formData.panNumber) errors.panNumber = 'PAN Number is required';
    if (!isPanAvailable) {
      // no error for panNumber if not available
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open form modal for adding
  const handleAdd = () => {
    setSelectedPrinter(null);
    setFormData({
      personName: '',
      companyName: '',
      type: 'printer',
      address: '',
      gstNo: '',
      bankDetails: '',
      panNumber: ''
    });
    setIsGstRegistered(true);
    setIsPanAvailable(true);
    setIsFormModalOpen(true);
  };

  // Open form modal for editing
  const handleEdit = (printer) => {
    setSelectedPrinter(printer);
    setFormData({
      personName: printer.personName || '',
      companyName: printer.companyName || '',
      type: printer.type || 'printer',
      address: printer.address || '',
      gstNo: printer.gstNo === 'Unregistered' ? '' : printer.gstNo || '',
      bankDetails: printer.bankDetails || '',
      panNumber: printer.panNumber === 'Unregistered' ? '' : printer.panNumber || ''
    });
    setIsGstRegistered(printer.gstNo !== 'Unregistered');
    setIsPanAvailable(printer.panNumber !== 'Unregistered');
    setIsFormModalOpen(true);
  };

  // Open delete modal
  const handleDeleteClick = (printer) => {
    setSelectedPrinter(printer);
    setIsDeleteModalOpen(true);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const cleanData = { ...formData };
      cleanData.gstNo = isGstRegistered ? formData.gstNo : 'Unregistered';
      cleanData.panNumber = isPanAvailable ? formData.panNumber : 'Unregistered';

      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === '') cleanData[key] = null;
      });

      if (selectedPrinter) {
        await masterService.updatePrinter(selectedPrinter.id, cleanData);
      } else {
        await masterService.createPrinter(cleanData);
      }
      setIsFormModalOpen(false);
      fetchPrinters();
    } catch (err) {
      setError(err.message || 'Failed to save printer');
    }
  };

  // Delete printer
  const handleDelete = async () => {
    if (!selectedPrinter) return;
    try {
      await masterService.deletePrinter(selectedPrinter.id);
      fetchPrinters();
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to delete printer');
    }
  };

  // Table columns configuration
  const columns = [
    { key: 'personName', label: 'Person Name' },
    { key: 'companyName', label: 'Company Name' },
    { key: 'type', label: 'Type' },
    { key: 'address', label: 'Address' },
    { key: 'gstNo', label: 'GST No' },
    { key: 'bankDetails', label: 'Bank Details' },
    { key: 'panNumber', label: 'PAN Number' }
  ];

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-4">
          <AiOutlinePrinter size={28} className="text-blue-700 mr-2" />
          <h2 className="text-2xl font-bold">Printer Master</h2>
        </div>
        {error && <div className="alert alert-danger mb-4">{error}</div>}
        <Table
          columns={columns}
          data={printers}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onAdd={handleAdd}
        />
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={selectedPrinter ? 'Edit Printer' : 'Add Printer'}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <FormField
              label="Person Name"
              id="personName"
              name="personName"
              value={formData.personName}
              onChange={handleChange}
              error={formErrors.personName}
              required
            />
            <FormField
              label="Company Name"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              error={formErrors.companyName}
              required
            />
            <FormField
              label="Type"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              error={formErrors.type}
              required
            />
            <FormField
              label="Address"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={formErrors.address}
              required
            />

            {/* GST Registered Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GST Registered?
              </label>
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
                label="GST No"
                id="gstNo"
                name="gstNo"
                value={formData.gstNo}
                onChange={handleChange}
                error={formErrors.gstNo}
                required
              />
            )}

            <FormField
              label="Bank Details"
              id="bankDetails"
              name="bankDetails"
              value={formData.bankDetails}
              onChange={handleChange}
              error={formErrors.bankDetails}
              required
            />

            {/* PAN Available Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PAN Available?
              </label>
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
                id="panNumber"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                error={formErrors.panNumber}
                required
              />
            )}

            <div className="flex justify-end mt-4 space-x-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsFormModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {selectedPrinter ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete Printer"
          message="Are you sure you want to delete this printer?"
        />
      </div>
    </Layout>
  );
};

export default PrinterMaster;
