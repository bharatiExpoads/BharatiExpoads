import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Table from '../../components/Table';
import { quotationService } from '../../services/api';
import { toast } from 'react-toastify';
import { getAuthHeader } from '../../utils/auth';

const SeeQuotation = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [hoardingDetails, setHoardingDetails] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [allHoardings, setAllHoardings] = useState([]);

  useEffect(() => {
    const fetchQuotations = async () => {
      setLoading(true);
      try {
        const data = await quotationService.getAll();
        setQuotations(data);
      } catch (err) {
        setQuotations([]);
      }
      setLoading(false);
    };
    fetchQuotations();
  }, []);

  useEffect(() => {
    const fetchHoardingDetails = async () => {
      if (selectedQuotation && Array.isArray(selectedQuotation.hoardingIds) && selectedQuotation.hoardingIds.length > 0) {
        try {
          // Fetch all hoardings and filter by IDs (for demo, you may want a backend endpoint for this)
          const allHoardings = await quotationService.getHoardings({});
          setHoardingDetails(allHoardings.filter(h => selectedQuotation.hoardingIds.includes(h.id)));
        } catch {
          setHoardingDetails([]);
        }
      } else {
        setHoardingDetails([]);
      }
    };
    fetchHoardingDetails();
  }, [selectedQuotation]);

  useEffect(() => {
    if (editMode) {
      quotationService.getHoardings({}).then(setAllHoardings);
    }
  }, [editMode]);

  const startEdit = () => {
    setEditData({
      hoardingIds: selectedQuotation.hoardingIds || [],
      total: selectedQuotation.total,
    });
    setEditMode(true);
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleHoardingToggle = (id) => {
    setEditData(prev => {
      const exists = prev.hoardingIds.includes(id);
      return {
        ...prev,
        hoardingIds: exists ? prev.hoardingIds.filter(hid => hid !== id) : [...prev.hoardingIds, id]
      };
    });
  };

  const saveEdit = async () => {
    try {
      await quotationService.update(selectedQuotation.id, editData);
      setEditMode(false);
      setSelectedQuotation(null);
      // Refresh list
      const data = await quotationService.getAll();
      setQuotations(data);
      toast.success('Quotation updated');
    } catch (err) {
      toast.error('Failed to update quotation');
    }
  };

  const handleExport = async (quotationId, type) => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const url = `${API_URL}/admin/quotation/${quotationId}/${type}`;
    const headers = getAuthHeader();
    console.log('Frontend export token:', headers.Authorization);
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      if (response.status === 401) {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
        return;
      }
      if (!response.ok) throw new Error('Failed to download file');
      const blob = await response.blob();
      const fileName = type === 'pdf' ? `quotation_${quotationId}.pdf` : `quotation_${quotationId}.xlsx`;
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Exported ${type.toUpperCase()} successfully`);
    } catch (err) {
      toast.error(err.message || `Failed to export ${type}`);
    }
  };

  const columns = [
    { key: 'id', Header: 'Quotation No.', accessor: 'id' },
    { key: 'enquiryId', Header: 'Enquiry ID', accessor: 'enquiryId' },
    { key: 'total', Header: 'Total', accessor: 'total' },
    { key: 'createdAt', Header: 'Created At', accessor: row => new Date(row.createdAt).toLocaleString() },
    {
      key: 'actions', Header: 'Actions',
      render: (row) => (
        <>
          <button className="btn btn-sm btn-info mr-2" onClick={() => setSelectedQuotation(row)}>View Details</button>
          <button className="btn btn-outline btn-sm mr-1" onClick={() => handleExport(row.id, 'pdf')}>Export PDF</button>
          <button className="btn btn-outline btn-sm" onClick={() => handleExport(row.id, 'excel')}>Export Excel</button>
        </>
      )
    }
  ];

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">All Quotations</h1>
      <Table columns={columns} data={quotations} loading={loading} actionColumn={false} />
      {selectedQuotation && !editMode && (
        <div className="mt-6 p-4 bg-white rounded shadow">
          <h2 className="text-xl font-bold mb-2">Quotation Details</h2>
          <div><b>Quotation No.:</b> {selectedQuotation.id}</div>
          <div><b>Enquiry ID:</b> {selectedQuotation.enquiryId}</div>
          <div><b>Total:</b> ₹{selectedQuotation.total}</div>
          <div><b>Created At:</b> {new Date(selectedQuotation.createdAt).toLocaleString()}</div>
          <div><b>Selected Hoardings:</b></div>
          <ul className="list-disc ml-6">
            {hoardingDetails.length > 0 ? hoardingDetails.map((h, idx) => (
              <li key={h.id}>{h.location} ({h.mediaType})</li>
            )) : (
              Array.isArray(selectedQuotation.hoardingIds) && selectedQuotation.hoardingIds.map((hid, idx) => (
                <li key={idx}>{hid}</li>
              ))
            )}
          </ul>
          <div className="mt-2 flex gap-2">
            <button className="btn btn-sm btn-secondary" onClick={() => setSelectedQuotation(null)}>Close</button>
            <button className="btn btn-sm btn-primary" onClick={startEdit}>Edit</button>
          </div>
        </div>
      )}
      {selectedQuotation && editMode && (
        <div className="mt-6 p-4 bg-white rounded shadow">
          <h2 className="text-xl font-bold mb-2">Edit Quotation</h2>
          <div><b>Quotation No.:</b> {selectedQuotation.id}</div>
          <div><b>Enquiry ID:</b> {selectedQuotation.enquiryId}</div>
          <div className="mb-2">
            <label className="font-bold">Total:</label>
            <input type="number" className="input input-bordered ml-2" value={editData.total} onChange={e => handleEditChange('total', Number(e.target.value))} />
          </div>
          <div className="mb-2">
            <label className="font-bold">Select Hoardings:</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {allHoardings.map(h => (
                <label key={h.id} className="flex items-center gap-1">
                  <input type="checkbox" checked={editData.hoardingIds.includes(h.id)} onChange={() => handleHoardingToggle(h.id)} />
                  {h.location} ({h.mediaType})
                </label>
              ))}
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <button className="btn btn-sm btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
            <button className="btn btn-sm btn-success" onClick={saveEdit}>Save</button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SeeQuotation; 