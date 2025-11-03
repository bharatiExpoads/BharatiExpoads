import React, { useState, useEffect } from 'react';
import { AiOutlineUser } from 'react-icons/ai';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import * as masterService from '../../services/masterService';
import Layout from '../../components/Layout';

const DesignerMaster = () => {
  const [designers, setDesigners] = useState([]);
  const [selectedDesigner, setSelectedDesigner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const initialFormData = {
    personName: '',
    companyName: '',
    type: 'designer',
    address: '',
    hasGST: 'Yes',   // New field for GST dropdown (default Yes)
    gstNo: '',
    bankDetails: '',
    panNumber: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});

  const fetchDesigners = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await masterService.getAllDesigners();
      setDesigners(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch designer data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigners();
  }, []);

  const isValidGST = (gst) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'gstNo') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
      if (formErrors[name]) {
        setFormErrors(prev => ({ ...prev, [name]: '' }));
      }
    } else if (name === 'hasGST') {
      // If user selects No, clear gstNo and its error
      setFormData(prev => ({ ...prev, hasGST: value, gstNo: value === 'No' ? '' : prev.gstNo }));
      setFormErrors(prev => ({ ...prev, gstNo: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (formErrors[name]) {
        setFormErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.personName) errors.personName = 'Person Name is required';
    if (!formData.companyName) errors.companyName = 'Company Name is required';
    if (!formData.type) errors.type = 'Type is required';
    if (!formData.address) errors.address = 'Address is required';

    if (formData.hasGST === 'Yes') {
      if (!formData.gstNo) {
        errors.gstNo = 'GST Number is required';
      } else if (!isValidGST(formData.gstNo)) {
        errors.gstNo = 'Invalid GST Number format';
      }
    }

    if (!formData.bankDetails) errors.bankDetails = 'Bank Details are required';
    if (!formData.panNumber) errors.panNumber = 'PAN Number is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = () => {
    setSelectedDesigner(null);
    setFormData(initialFormData);
    setIsFormModalOpen(true);
  };

  const handleEdit = (designer) => {
    setSelectedDesigner(designer);
    setFormData({
      personName: designer.personName || '',
      companyName: designer.companyName || '',
      type: designer.type || 'designer',
      address: designer.address || '',
      hasGST: designer.gstNo && designer.gstNo !== 'Unregistered' ? 'Yes' : 'No',
      gstNo: designer.gstNo && designer.gstNo !== 'Unregistered' ? designer.gstNo.toUpperCase() : '',
      bankDetails: designer.bankDetails || '',
      panNumber: designer.panNumber || ''
    });
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (designer) => {
    setSelectedDesigner(designer);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const cleanData = { ...formData };

      // If hasGST is No, pass 'Unregistered' to backend
      if (cleanData.hasGST === 'No') {
        cleanData.gstNo = 'Unregistered';
      }

      // Remove helper field before sending
      delete cleanData.hasGST;

      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === '') cleanData[key] = null;
      });

      if (selectedDesigner) {
        await masterService.updateDesigner(selectedDesigner.id, cleanData);
      } else {
        await masterService.createDesigner(cleanData);
      }

      setIsFormModalOpen(false);
      fetchDesigners();
    } catch (err) {
      setError(err.message || 'Failed to save designer');
    }
  };

  const handleDelete = async () => {
    if (!selectedDesigner) return;
    try {
      await masterService.deleteDesigner(selectedDesigner.id);
      fetchDesigners();
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to delete designer');
    }
  };

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
          <AiOutlineUser size={28} className="text-blue-700 mr-2" />
          <h2 className="text-2xl font-bold">Designer Master</h2>
        </div>
        {error && <div className="alert alert-danger mb-4">{error}</div>}
        <Table
          columns={columns}
          data={designers}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onAdd={handleAdd}
        />
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={selectedDesigner ? 'Edit Designer' : 'Add Designer'}
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

            {/* Dropdown for Has GST */}
            <div className="mb-4">
              <label htmlFor="hasGST" className="block font-medium mb-1">
                Has GST Number?
              </label>
              <select
                id="hasGST"
                name="hasGST"
                value={formData.hasGST}
                onChange={handleChange}
                className="form-select w-full border rounded px-3 py-2"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Show GST No input only if hasGST === "Yes" */}
            {formData.hasGST === 'Yes' && (
              <FormField
                label="GST No"
                id="gstNo"
                name="gstNo"
                value={formData.gstNo}
                onChange={handleChange}
                error={formErrors.gstNo}
                required
                maxLength={15}
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
            <FormField
              label="PAN Number"
              id="panNumber"
              name="panNumber"
              value={formData.panNumber}
              onChange={handleChange}
              error={formErrors.panNumber}
              required
            />
            <div className="flex justify-end mt-4">
              <button
                type="button"
                className="btn btn-secondary mr-2"
                onClick={() => setIsFormModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {selectedDesigner ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete Designer"
          message="Are you sure you want to delete this designer?"
        />
      </div>
    </Layout>
  );
};

export default DesignerMaster;
