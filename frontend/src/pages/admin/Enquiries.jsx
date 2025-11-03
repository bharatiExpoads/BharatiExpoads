import React, { useEffect, useState } from 'react';
import { enquiryService } from '../../services/api';
import Layout from '../../components/Layout';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const initialForm = {
  name: '',
  contactNumber: '',
  whatsappNumber: '',
  email: '',
  companyName: '',
  type: 'Agency',
  mediaRequirement: 'Hoarding',
  locationState: '',
  locationCity: '',
  manualLocation: '',
  tentativeStartDate: '',
  tentativeDuration: '',
  progressStatus: 'NotStarted',
};

const mediaOptions = [
  'Hoarding', 'LED', 'PromotionVehicle', 'BusQueShelter', 'BusBranding', 'PoleKiosk', 'ALL'
];
const progressOptions = [
  { value: 'NotStarted', label: 'Not Started' },
  { value: 'InProgress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' }
];

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const data = await enquiryService.getAll();
      setEnquiries(data);
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEnquiries();
    // eslint-disable-next-line
  }, [showModal, showDelete]);

  const handleOpenModal = (enquiry = null) => {
    if (enquiry) {
      setForm({ ...enquiry, tentativeStartDate: enquiry.tentativeStartDate?.slice(0,10) });
      setEditId(enquiry.id);
    } else {
      setForm(initialForm);
      setEditId(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm(initialForm);
    setEditId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate all required fields
    const requiredFields = [
      'name', 'contactNumber', 'type', 'mediaRequirement', 'locationState', 'locationCity', 'tentativeStartDate', 'tentativeDuration', 'progressStatus', 'email', 'companyName', 'whatsappNumber'
    ];
    for (const field of requiredFields) {
      if (!form[field] || form[field].toString().trim() === '') {
        toast.error(`Please fill the required field: ${field}`);
        return;
      }
    }
    // Format enums and date
    const payload = {
      ...form,
      type: form.type === 'Agency' ? 'Agency' : 'Client',
      mediaRequirement: form.mediaRequirement,
      progressStatus: form.progressStatus,
      tentativeStartDate: new Date(form.tentativeStartDate).toISOString()
    };
    console.log('Submitting payload:', payload);
    try {
      if (editId) {
        await enquiryService.update(editId, payload);
        toast.success('Enquiry updated');
      } else {
        await enquiryService.create(payload);
        toast.success('Enquiry created');
      }
      fetchEnquiries();
      handleCloseModal();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await enquiryService.delete(deleteId);
      toast.success('Enquiry deleted');
      fetchEnquiries();
    } catch (err) {
      toast.error(err.message);
    }
    setShowDelete(false);
    setDeleteId(null);
  };

  const columns = [
    { key: 'id', Header: 'Inquiry #', accessor: 'id' },
    { key: 'name', Header: 'Name', accessor: 'name' },
    { key: 'contactNumber', Header: 'Contact', accessor: 'contactNumber' },
    { key: 'type', Header: 'Type', accessor: 'type' },
    { key: 'mediaRequirement', Header: 'Media', accessor: 'mediaRequirement' },
    { key: 'location', Header: 'Location', render: (row) => `${row.locationCity}, ${row.locationState}` },
    { key: 'tentativeStartDate', Header: 'Start Date', render: (row) => row.tentativeStartDate?.slice(0,10) },
    { key: 'progressStatus', Header: 'Status', accessor: 'progressStatus' },
    {
      key: 'actions', Header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => handleOpenModal(row)} className="text-blue-500"><FaEdit /></button>
          <button onClick={() => { setDeleteId(row.id); setShowDelete(true); }} className="text-red-500"><FaTrash /></button>
        </div>
      )
    }
  ];

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Enquiries</h1>
        <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"><FaPlus /> Add Enquiry</button>
      </div>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Table columns={columns} data={enquiries} loading={loading} />
      )}
      {enquiries.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">No enquiries available. Please add one.</div>
      )}
      <Modal isOpen={showModal} onClose={handleCloseModal} title={editId ? 'Edit Enquiry' : 'Add Enquiry'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input name="name" value={form.name} onChange={handleChange} required className="input input-bordered w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium">Contact Number</label>
              <input name="contactNumber" value={form.contactNumber} onChange={handleChange} required className="input input-bordered w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium">WhatsApp Number</label>
              <input name="whatsappNumber" value={form.whatsappNumber} onChange={handleChange} className="input input-bordered w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input name="email" value={form.email} onChange={handleChange} className="input input-bordered w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium">Company Name</label>
              <input name="companyName" value={form.companyName} onChange={handleChange} className="input input-bordered w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium">Type</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-1">
                  <input type="radio" name="type" value="Agency" checked={form.type === 'Agency'} onChange={handleChange} /> Agency
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" name="type" value="Client" checked={form.type === 'Client'} onChange={handleChange} /> Client
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Media Requirement</label>
              <select name="mediaRequirement" value={form.mediaRequirement} onChange={handleChange} className="input input-bordered w-full">
                {mediaOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Location State</label>
              <input name="locationState" value={form.locationState} onChange={handleChange} className="input input-bordered w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium">Location City</label>
              <input name="locationCity" value={form.locationCity} onChange={handleChange} className="input input-bordered w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium">Manual Location (optional)</label>
              <input name="manualLocation" value={form.manualLocation} onChange={handleChange} className="input input-bordered w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium">Tentative Start Date</label>
              <input type="date" name="tentativeStartDate" value={form.tentativeStartDate} onChange={handleChange} className="input input-bordered w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium">Tentative Duration</label>
              <input name="tentativeDuration" value={form.tentativeDuration} onChange={handleChange} className="input input-bordered w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium">Progress Status</label>
              <select name="progressStatus" value={form.progressStatus} onChange={handleChange} className="input input-bordered w-full">
                {progressOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Inquiry Number</label>
              <input value={editId || ''} readOnly className="input input-bordered w-full bg-gray-100" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={handleCloseModal} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
      <DeleteConfirmationModal isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
    </Layout>
  );
};

export default Enquiries; 