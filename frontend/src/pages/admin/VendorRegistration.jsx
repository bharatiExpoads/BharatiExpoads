import React, { useState, useEffect } from 'react';
import { AiOutlineUser, AiOutlineBank } from 'react-icons/ai';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import Layout from '../../components/Layout';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getVendors, getVendorById, createVendor, updateVendor, deleteVendor } from '../../services/api';

const initialForm = {
  name: '',
  companyName: '',
  type: '',
  address: '',
  city: '',
  state: '',
  contactPerson: '',
  mobile: '',
  email: '',
  gstNumber: '',
  panNumber: '',
  bankName: '',
  branch: '',
  accountNumber: '',
  ifscCode: '',
  aadharNumber: '',
  notes: ''
};

const VendorRegistration = () => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch vendors
  const fetchVendors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getVendors();
      setVendors(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch vendor data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Vendor Name is required';
    if (!formData.companyName) errors.companyName = 'Company Name is required';
    if (!formData.type) errors.type = 'Type of Vendor is required';
    if (!formData.address) errors.address = 'Address is required';
    if (!formData.city) errors.city = 'City is required';
    if (!formData.state) errors.state = 'State is required';
    if (!formData.contactPerson) errors.contactPerson = 'Contact Person is required';
    if (!formData.mobile) errors.mobile = 'Mobile Number is required';
    if (!/^\d{10}$/.test(formData.mobile)) errors.mobile = 'Enter a valid 10-digit mobile number';
    if (!formData.email) errors.email = 'Email is required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) errors.email = 'Enter a valid email';
    if (!formData.gstNumber) errors.gstNumber = 'GST Number is required';
    if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(formData.gstNumber)) errors.gstNumber = 'Enter a valid GST number';
    if (!formData.panNumber) errors.panNumber = 'PAN Number is required';
    if (!/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(formData.panNumber)) errors.panNumber = 'Enter a valid PAN number';
    if (!formData.bankName) errors.bankName = 'Bank Name is required';
    if (!formData.branch) errors.branch = 'Branch is required';
    if (!formData.accountNumber) errors.accountNumber = 'Account Number is required';
    if (!formData.ifscCode) errors.ifscCode = 'IFSC Code is required';
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) errors.ifscCode = 'Enter a valid IFSC code';
    if (!formData.aadharNumber) errors.aadharNumber = 'Aadhar Number is required';
    if (!/^\d{12}$/.test(formData.aadharNumber)) errors.aadharNumber = 'Enter a valid 12-digit Aadhar number';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open form modal for adding
  const handleAdd = () => {
    setSelectedVendor(null);
    setFormData(initialForm);
    setIsFormModalOpen(true);
  };

  // Open form modal for editing
  const handleEdit = (vendor) => {
    setSelectedVendor(vendor);
    setFormData({ ...initialForm, ...vendor });
    setIsFormModalOpen(true);
  };

  // Open delete modal
  const handleDeleteClick = (vendor) => {
    setSelectedVendor(vendor);
    setIsDeleteModalOpen(true);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const cleanData = { ...formData };
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === '') cleanData[key] = null;
      });
      if (selectedVendor) {
        await updateVendor(selectedVendor.id, cleanData);
        toast.success('Vendor updated successfully');
      } else {
        await createVendor(cleanData);
        toast.success('Vendor added successfully');
      }
      setIsFormModalOpen(false);
      fetchVendors();
    } catch (err) {
      let errorMsg = err.data?.error || err.message || 'Failed to save vendor';
      // Try to parse backend error for field-specific errors
      let fieldError = null;
      if (errorMsg && errorMsg.endsWith('is required')) {
        const field = errorMsg.replace(' is required', '');
        setFormErrors(prev => ({ ...prev, [field]: errorMsg }));
        fieldError = true;
      } else if (errorMsg && errorMsg.startsWith('Invalid')) {
        // e.g., Invalid email format
        const field = errorMsg.split(' ')[1].toLowerCase();
        setFormErrors(prev => ({ ...prev, [field]: errorMsg }));
        fieldError = true;
      } else if (errorMsg && errorMsg.includes('Duplicate value for field')) {
        const match = errorMsg.match(/field: (\w+)/);
        if (match) {
          setFormErrors(prev => ({ ...prev, [match[1]]: 'Duplicate value' }));
          fieldError = true;
        }
      }
      if (!fieldError) {
        toast.error(errorMsg);
        setError(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete vendor
  const handleDelete = async () => {
    if (!selectedVendor) return;
    try {
      await deleteVendor(selectedVendor.id);
      toast.success('Vendor deleted successfully');
      fetchVendors();
      setIsDeleteModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete vendor');
    }
  };

  // Table columns configuration
  const columns = [
    { key: 'name', label: 'Vendor Name' },
    { key: 'companyName', label: 'Company Name' },
    { key: 'type', label: 'Type' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'contactPerson', label: 'Contact Person' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'email', label: 'Email' },
    { key: 'gstNumber', label: 'GST' },
    { key: 'panNumber', label: 'PAN' },
    { key: 'bankName', label: 'Bank' },
    { key: 'branch', label: 'Branch' },
    { key: 'accountNumber', label: 'A/c No' },
    { key: 'ifscCode', label: 'IFSC' },
    { key: 'aadharNumber', label: 'Aadhar' },
    { key: 'notes', label: 'Notes' }
  ];

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold flex items-center"><AiOutlineUser className="mr-2" />Vendor Registration</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded" onClick={handleAdd}>Add Vendor</button>
        </div>
        <Table
          title="Vendors"
          data={vendors}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          loading={isLoading}
          error={error}
        />
        <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedVendor ? 'Edit Vendor' : 'Add Vendor'} size="2xl">
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[70vh]">
            <FormField label="Vendor Name" id="name" name="name" value={formData.name} onChange={handleChange} required error={formErrors.name} />
            <FormField label="Company Name" id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} required error={formErrors.companyName} />
            <FormField label="Type of Vendor" id="type" name="type" value={formData.type} onChange={handleChange} required error={formErrors.type} />
            <FormField label="Address" id="address" name="address" value={formData.address} onChange={handleChange} required error={formErrors.address} />
            <FormField label="City" id="city" name="city" value={formData.city} onChange={handleChange} required error={formErrors.city} />
            <FormField label="State" id="state" name="state" value={formData.state} onChange={handleChange} required error={formErrors.state} />
            <FormField label="Contact Person" id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleChange} required error={formErrors.contactPerson} />
            <FormField label="Mobile Number" id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} required error={formErrors.mobile} />
            <FormField label="Email" id="email" name="email" value={formData.email} onChange={handleChange} required error={formErrors.email} />
            <FormField label="GST Number" id="gstNumber" name="gstNumber" value={formData.gstNumber} onChange={handleChange} required error={formErrors.gstNumber} />
            <FormField label="PAN Number" id="panNumber" name="panNumber" value={formData.panNumber} onChange={handleChange} required error={formErrors.panNumber} />
            <FormField label="Bank Name" id="bankName" name="bankName" value={formData.bankName} onChange={handleChange} required error={formErrors.bankName} />
            <FormField label="Branch" id="branch" name="branch" value={formData.branch} onChange={handleChange} required error={formErrors.branch} />
            <FormField label="Account Number" id="accountNumber" name="accountNumber" value={formData.accountNumber} onChange={handleChange} required error={formErrors.accountNumber} />
            <FormField label="IFSC Code" id="ifscCode" name="ifscCode" value={formData.ifscCode} onChange={handleChange} required error={formErrors.ifscCode} />
            <FormField label="Aadhar Number" id="aadharNumber" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} required error={formErrors.aadharNumber} />
            <FormField label="Additional Notes" id="notes" name="notes" value={formData.notes} onChange={handleChange} type="textarea" error={formErrors.notes} />
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : (selectedVendor ? 'Update' : 'Add')} Vendor</button>
            </div>
          </form>
        </Modal>
        <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onDelete={handleDelete} itemName="vendor" />
      </div>
    </Layout>
  );
};

export default VendorRegistration; 