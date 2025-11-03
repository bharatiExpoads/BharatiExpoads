import React, { useState, useEffect } from 'react';
import { AiOutlineApartment } from 'react-icons/ai';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import * as masterService from '../../services/masterService';
import Layout from '../../components/Layout';

const AgencyMaster = () => {
  const [agencies, setAgencies] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
    gstStatus: 'Registered',
    panStatus: 'Have PAN',
  });

  const [formErrors, setFormErrors] = useState({});

  const fetchAgencies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await masterService.getAllAgencies();
      setAgencies(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch agency data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.companyName) errors.companyName = 'Company Name is required';
    if (!formData.contactPerson) errors.contactPerson = 'Contact Person is required';
    if (!formData.contactPersonNumber) errors.contactPersonNumber = 'Contact Person Number is required';
    if (!formData.address) errors.address = 'Address is required';

    if (formData.gstStatus === 'Registered' && !formData.gstNo) {
      errors.gstNo = 'GST Number is required';
    }

    if (formData.panStatus === 'Have PAN' && !formData.panNo) {
      errors.panNo = 'PAN Number is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = () => {
    setSelectedAgency(null);
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
      gstStatus: 'Registered',
      panStatus: 'Have PAN',
    });
    setIsFormModalOpen(true);
  };

  const handleEdit = (agency) => {
    setSelectedAgency(agency);
    setFormData({
      name: agency.name || '',
      companyName: agency.companyName || '',
      address: agency.address || '',
      gstNo: agency.gstNo === 'Unregistered' ? '' : agency.gstNo || '',
      panNo: agency.panNo === 'noPan' ? '' : agency.panNo || '',
      contactPerson: agency.contactPerson || '',
      contactPersonNumber: agency.contactPersonNumber || '',
      whatsappNumber: agency.whatsappNumber || '',
      landlineNumber: agency.landlineNumber || '',
      gstStatus: agency.gstNo === 'Unregistered' ? 'Unregistered' : 'Registered',
      panStatus: agency.panNo === 'noPan' ? 'No PAN' : 'Have PAN',
    });
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (agency) => {
    setSelectedAgency(agency);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const cleanData = { ...formData };

      // Remove UI-only fields
      delete cleanData.gstStatus;
      delete cleanData.panStatus;

      // Assign GST / PAN values based on status
      if (formData.gstStatus === 'Unregistered') {
        cleanData.gstNo = 'Unregistered';
      }

      if (formData.panStatus === 'No PAN') {
        cleanData.panNo = 'noPan';
      }

      // Convert empty strings to null
      Object.keys(cleanData).forEach((key) => {
        if (cleanData[key] === '') cleanData[key] = null;
      });

      if (selectedAgency) {
        await masterService.updateAgency(selectedAgency.id, cleanData);
      } else {
        await masterService.createAgency(cleanData);
      }

      setIsFormModalOpen(false);
      fetchAgencies();
    } catch (err) {
      setError(err.message || 'Failed to save agency');
    }
  };

  const handleDelete = async () => {
    if (!selectedAgency) return;

    try {
      await masterService.deleteAgency(selectedAgency.id);
      fetchAgencies();
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to delete agency');
    }
  };

  const columns = [
    { key: 'name', label: 'Agency Name' },
    { key: 'companyName', label: 'Company Name', render: (a) => a.companyName || '-' },
    { key: 'contactPerson', label: 'Contact Person', render: (a) => a.contactPerson || '-' },
    { key: 'contactPersonNumber', label: 'Contact Person Number' },
    { key: 'whatsappNumber', label: 'WhatsApp Number', render: (a) => a.whatsappNumber || '-' },
    { key: 'landlineNumber', label: 'Landline Number', render: (a) => a.landlineNumber || '-' },
    { key: 'gstNo', label: 'GST Number', render: (a) => a.gstNo || '-' },
    { key: 'panNo', label: 'PAN Number', render: (a) => a.panNo || '-' },
    { key: 'address', label: 'Address', render: (a) => a.address || '-' },
  ];

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <AiOutlineApartment className="mr-2" /> Agency Master
          </h1>
          <p className="text-gray-600">Manage all your agencies</p>
        </div>

        <Table
          title="Agency List"
          data={agencies}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onAdd={handleAdd}
          loading={isLoading}
          error={error}
        />

        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={selectedAgency ? 'Edit Agency' : 'Add New Agency'}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Agency Name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter agency name"
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
                placeholder="Enter contact number"
                required
                error={formErrors.contactPersonNumber}
              />

              <FormField
                label="WhatsApp Number"
                id="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                placeholder="Enter WhatsApp number"
              />

              <FormField
                label="Landline Number"
                id="landlineNumber"
                value={formData.landlineNumber}
                onChange={handleChange}
                placeholder="Enter landline number"
              />

              {/* GST Status */}
              <FormField
                label="GST Status"
                id="gstStatus"
                type="select"
                value={formData.gstStatus}
                onChange={handleChange}
                options={[
                  { label: 'Registered', value: 'Registered' },
                  { label: 'Unregistered', value: 'Unregistered' },
                ]}
              />

              {formData.gstStatus === 'Registered' && (
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

              {/* PAN Status */}
              <FormField
                label="PAN Status"
                id="panStatus"
                type="select"
                value={formData.panStatus}
                onChange={handleChange}
                options={[
                  { label: 'Have PAN', value: 'Have PAN' },
                  { label: 'No PAN', value: 'No PAN' },
                ]}
              />

              {formData.panStatus === 'Have PAN' && (
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
                {selectedAgency ? 'Update Agency' : 'Add Agency'}
              </button>
            </div>
          </form>
        </Modal>

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDelete}
          itemName="agency"
        />
      </div>
    </Layout>
  );
};

export default AgencyMaster;
