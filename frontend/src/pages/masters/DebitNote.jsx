import React, { useState, useEffect } from 'react';
import { AiOutlineFileText } from 'react-icons/ai';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import * as masterService from '../../services/masterService';
import Layout from '../../components/Layout';

const DebitNoteMaster = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
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

  // Fetch all debit notes
  const fetchNotes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await masterService.getAllDebitNotes();
      setNotes(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch debit notes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.partyName) errors.partyName = 'Party Name is required';
    if (!formData.amount) errors.amount = 'Amount is required';
    else if (isNaN(parseFloat(formData.amount))) errors.amount = 'Amount must be a number';
    if (!formData.type) errors.type = 'Type is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add new note
  const handleAdd = () => {
    setSelectedNote(null);
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

  // Edit existing note
  const handleEdit = (note) => {
    setSelectedNote(note);
    setFormData({
      date: note.date ? note.date.split('T')[0] : '',
      partyName: note.partyName || '',
      amount: note.amount?.toString() || '',
      type: note.type || '',
      narration: note.narration || ''
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Delete confirmation modal open
  const handleDeleteClick = (note) => {
    setSelectedNote(note);
    setIsDeleteModalOpen(true);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const cleanData = {
        ...formData,
        amount: parseFloat(formData.amount),
        narration: formData.narration === '' ? null : formData.narration
      };

      if (selectedNote) {
        await masterService.updateDebitNote(selectedNote.id, cleanData);
      } else {
        await masterService.createDebitNote(cleanData);
      }
      setIsFormModalOpen(false);
      fetchNotes();
    } catch (err) {
      setError(err.message || 'Failed to save debit note');
    }
  };

  // Confirm delete
  const handleDelete = async () => {
    if (!selectedNote) return;
    try {
      await masterService.deleteDebitNote(selectedNote.id);
      fetchNotes();
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to delete debit note');
    }
  };

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
          <AiOutlineFileText size={28} className="text-red-700 mr-2" />
          <h2 className="text-2xl font-bold">Debit Note Master</h2>
        </div>
        {error && <div className="alert alert-danger mb-4">{error}</div>}
        <Table
          columns={columns}
          data={notes}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onAdd={handleAdd}
        />
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={selectedNote ? 'Edit Debit Note' : 'Add Debit Note'}
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
                {selectedNote ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete Debit Note"
          message="Are you sure you want to delete this debit note?"
        />
      </div>
    </Layout>
  );
};

export default DebitNoteMaster;
