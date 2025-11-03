import React, { useState, useEffect } from 'react';
import { AiOutlineFileText } from 'react-icons/ai';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import * as masterService from '../../services/masterService';
import Layout from '../../components/Layout';

const JournalVoucherMaster = () => {
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    date: '',
    partyName: '',
    amount: '',
    type: '',
    narration: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Fetch all journal vouchers
  const fetchVouchers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await masterService.getAllJournalVouchers();
      setVouchers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch journal vouchers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.partyName) errors.partyName = 'Party Name is required';
    if (!formData.amount || isNaN(formData.amount)) errors.amount = 'Valid amount is required';
    if (!formData.type) errors.type = 'Type is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open form modal for adding new voucher
  const handleAdd = () => {
    setSelectedVoucher(null);
    setFormData({
      date: '',
      partyName: '',
      amount: '',
      type: '',
      narration: ''
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open form modal for editing existing voucher
  const handleEdit = (voucher) => {
    setSelectedVoucher(voucher);
    setFormData({
      date: voucher.date ? voucher.date.split('T')[0] : '',
      partyName: voucher.partyName || '',
      amount: voucher.amount != null ? voucher.amount.toString() : '',
      type: voucher.type || '',
      narration: voucher.narration || ''
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (voucher) => {
    setSelectedVoucher(voucher);
    setIsDeleteModalOpen(true);
  };

  // Submit form for create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const cleanData = {
        ...formData,
        amount: parseFloat(formData.amount),
        narration: formData.narration === '' ? null : formData.narration
      };

      if (selectedVoucher) {
        await masterService.updateJournalVoucher(selectedVoucher.id, cleanData);
      } else {
        await masterService.createJournalVoucher(cleanData);
      }
      setIsFormModalOpen(false);
      fetchVouchers();
    } catch (err) {
      setError(err.message || 'Failed to save journal voucher');
    }
  };

  // Confirm delete voucher
  const handleDelete = async () => {
    if (!selectedVoucher) return;
    try {
      await masterService.deleteJournalVoucher(selectedVoucher.id);
      fetchVouchers();
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to delete journal voucher');
    }
  };

  // Table columns config
  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'partyName', label: 'Party Name' },
    { key: 'amount', label: 'Amount' },
    { key: 'type', label: 'Type' },
    { key: 'narration', label: 'Narration' }
  ];

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-4">
          <AiOutlineFileText size={28} className="text-purple-700 mr-2" />
          <h2 className="text-2xl font-bold">Journal Voucher Master</h2>
        </div>
        {error && <div className="alert alert-danger mb-4">{error}</div>}
        <Table
          columns={columns}
          data={vouchers}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onAdd={handleAdd}
        />
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={selectedVoucher ? 'Edit Journal Voucher' : 'Add Journal Voucher'}
        >
          <form onSubmit={handleSubmit}>
            <FormField
              label="Date"
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              error={formErrors.date}
              required
            />
            <FormField
              label="Party Name"
              id="partyName"
              name="partyName"
              value={formData.partyName}
              onChange={handleChange}
              error={formErrors.partyName}
              required
            />
            <FormField
              label="Amount"
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              error={formErrors.amount}
              required
            />
            <div className="mb-4">
              <label htmlFor="type" className="block font-medium mb-1">
                Type<span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="form-select w-full"
                required
              >
                <option value="">Select a type</option>
                <option value="DEBIT">Debit</option>
                <option value="CREDIT">Credit</option>
              </select>
              {formErrors.type && <p className="text-red-500 text-sm mt-1">{formErrors.type}</p>}
            </div>
            <FormField
              label="Narration"
              id="narration"
              name="narration"
              type="textarea"
              value={formData.narration}
              onChange={handleChange}
            />
            <div className="flex justify-end mt-4">
              <button type="button" className="btn btn-secondary mr-2" onClick={() => setIsFormModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {selectedVoucher ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete Journal Voucher"
          message="Are you sure you want to delete this journal voucher?"
        />
      </div>
    </Layout>
  );
};

export default JournalVoucherMaster;
