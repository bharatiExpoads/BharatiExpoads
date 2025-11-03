import React, { useState, useEffect } from 'react';
import { AiOutlineShop } from 'react-icons/ai';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import * as masterService from '../../services/masterService';
import Layout from '../../components/Layout';

const ClientMaster = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    address: '',
    gstStatus: 'Registered',
    gstNo: '',
    panNo: '',
    contactPerson: '',
    contactPersonNumber: '',
    whatsappNumber: '',
    landlineNumber: ''
  });

  const [formErrors, setFormErrors] = useState({});

  const fetchClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await masterService.getAllClients();
      setClients(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch client data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));

    if (formErrors[name]) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: ''
      }));
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
    if (!formData.panNo) errors.panNo = 'PAN Number is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = () => {
    setSelectedClient(null);
    setFormData({
      name: '',
      companyName: '',
      address: '',
      gstStatus: 'Registered',
      gstNo: '',
      panNo: '',
      contactPerson: '',
      contactPersonNumber: '',
      whatsappNumber: '',
      landlineNumber: ''
    });
    setIsFormModalOpen(true);
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name || '',
      companyName: client.companyName || '',
      address: client.address || '',
      gstStatus: client.gstNo === 'Unregistered' ? 'Unregistered' : 'Registered',
      gstNo: client.gstNo === 'Unregistered' ? '' : client.gstNo || '',
      panNo: client.panNo || '',
      contactPerson: client.contactPerson || '',
      contactPersonNumber: client.contactPersonNumber || '',
      whatsappNumber: client.whatsappNumber || '',
      landlineNumber: client.landlineNumber || ''
    });
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (client) => {
    setSelectedClient(client);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const cleanData = { ...formData };

      // Set gstNo to "Unregistered" if status is Unregistered
      if (cleanData.gstStatus === 'Unregistered') {
        cleanData.gstNo = 'Unregistered';
      }

      delete cleanData.gstStatus;

      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === '') cleanData[key] = null;
      });

      if (selectedClient) {
        await masterService.updateClient(selectedClient.id, cleanData);
      } else {
        await masterService.createClient(cleanData);
      }

      setIsFormModalOpen(false);
      fetchClients();
    } catch (err) {
      setError(err.message || 'Failed to save client');
    }
  };

  const handleDelete = async () => {
    if (!selectedClient) return;

    try {
      await masterService.deleteClient(selectedClient.id);
      fetchClients();
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to delete client');
    }
  };

  const columns = [
    { key: 'name', label: 'Client Name' },
    { key: 'companyName', label: 'Company Name', render: (client) => client.companyName || '-' },
    { key: 'contactPerson', label: 'Contact Person', render: (client) => client.contactPerson || '-' },
    { key: 'contactPersonNumber', label: 'Contact Person Number' },
    { key: 'whatsappNumber', label: 'WhatsApp Number', render: (client) => client.whatsappNumber || '-' },
    { key: 'landlineNumber', label: 'Landline Number', render: (client) => client.landlineNumber || '-' },
    { key: 'gstNo', label: 'GST Number', render: (client) => client.gstNo || '-' },
    { key: 'panNo', label: 'PAN Number', render: (client) => client.panNo || '-' },
    { key: 'address', label: 'Address', render: (client) => client.address || '-' }
  ];

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <AiOutlineShop className="mr-2" /> Client Master
          </h1>
          <p className="text-gray-600">Manage all your clients</p>
        </div>

        <Table
          title="Client List"
          data={clients}
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
          title={selectedClient ? 'Edit Client' : 'Add New Client'}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Client Name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter client name"
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

              <FormField
                label="GST Status"
                id="gstStatus"
                type="select"
                value={formData.gstStatus}
                onChange={handleChange}
                options={[
                  { label: 'Registered', value: 'Registered' },
                  { label: 'Unregistered', value: 'Unregistered' }
                ]}
                required
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

              <FormField
                label="PAN Number"
                id="panNo"
                value={formData.panNo}
                onChange={handleChange}
                placeholder="Enter PAN number"
                required
                error={formErrors.panNo}
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
                {selectedClient ? 'Update Client' : 'Add Client'}
              </button>
            </div>
          </form>
        </Modal>

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDelete}
          itemName="client"
        />
      </div>
    </Layout>
  );
};

export default ClientMaster;
