import React, { useState } from 'react';
import { getEnquiryByNumber, createQuotation, quotationService } from '../../services/api';
import Layout from '../../components/Layout';
import Table from '../../components/Table';
import { FaSearch, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Quotation = () => {
  const [search, setSearch] = useState({ enquiryNumber: '' });
  const [enquiry, setEnquiry] = useState(null);
  const [enquirySaved, setEnquirySaved] = useState(false);
  const [savedEnquiryId, setSavedEnquiryId] = useState(null);
  const [hoardings, setHoardings] = useState([]);
  const [filters, setFilters] = useState({});
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [loadingHoardings, setLoadingHoardings] = useState(false);
  const [quotationSummary, setQuotationSummary] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.enquiryNumber) {
      toast.error('Please enter Enquiry Number to search.');
      return;
    }
    try {
      const data = await getEnquiryByNumber(search.enquiryNumber);
      setEnquiry(data);
      setEnquirySaved(false);
      setQuotationSummary(null);
      toast.success('Enquiry loaded');
    } catch (err) {
      setEnquiry(null);
      setEnquirySaved(false);
      setQuotationSummary(null);
      toast.error(err.message || 'Enquiry not found');
    }
  };

  const handleSaveEnquiry = () => {
    if (enquiry) {
      setEnquirySaved(true);
      setSavedEnquiryId(enquiry.id);
      toast.success('Enquiry saved for quotation. You can now filter and select hoardings.');
    }
  };

  const handleFilter = async () => {
    setLoadingHoardings(true);
    try {
      const data = await quotationService.getHoardings(filters);
      setHoardings(data);
    } catch (err) {
      toast.error(err.message);
    }
    setLoadingHoardings(false);
  };

  const handleSelect = (hoarding) => {
    setSelected((prev) => {
      const exists = prev.find((item) => item.id === hoarding.id);
      if (exists) return prev.filter((item) => item.id !== hoarding.id);
      return [...prev, hoarding];
    });
  };

  React.useEffect(() => {
    // Calculate total
    const sum = selected.reduce((acc, h) => acc + (h.totalCost || 0), 0);
    setTotal(sum);
  }, [selected]);

  const handleSaveProposal = async () => {
    if (!enquirySaved || !savedEnquiryId) return toast.error('Please save the enquiry for quotation first.');
    if (!Array.isArray(selected) || selected.length === 0) return toast.error('No hoardings selected');
    setSaving(true);
    try {
      const hoardingIds = selected.map(h => h.id);
      const result = await createQuotation({
        enquiryId: savedEnquiryId,
        hoardingIds
      });
      setQuotationSummary(result);
      setSelected([]);
      setFilters({});
      setHoardings([]);
      toast.success('Quotation saved and summary loaded.');
    } catch (err) {
      toast.error(err.message || 'Failed to save quotation');
    }
    setSaving(false);
  };

  const handleExport = async (type) => {
    if (!quotationSummary || !quotationSummary.quotationNumber) return toast.error('No quotation to export');
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const url = `${API_URL}/admin/quotation/${quotationSummary.quotationNumber}/${type}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...((window.localStorage.getItem('token')) ? { 'Authorization': 'Bearer ' + window.localStorage.getItem('token') } : {})
        }
      });
      if (!response.ok) throw new Error('Failed to download file');
      const blob = await response.blob();
      const fileName = type === 'pdf' ? `quotation_${quotationSummary.quotationNumber}.pdf` : `quotation_${quotationSummary.quotationNumber}.xlsx`;
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

  const hoardingColumns = [
    { key: 'location', Header: 'Location', accessor: 'location' },
    { key: 'mediaType', Header: 'Media Type', accessor: 'mediaType' },
    { key: 'size', Header: 'Size', accessor: row => `${row.width}x${row.height}` },
    { key: 'illumination', Header: 'Illumination', accessor: row => row.illumination ? 'Yes' : 'No' },
    { key: 'availability', Header: 'Availability', accessor: 'availability' },
    { key: 'displayChargesPerMonth', Header: 'Charges', accessor: 'displayChargesPerMonth' },
    { key: 'oneTimePrintingCost', Header: 'Printing', accessor: 'oneTimePrintingCost' },
    { key: 'oneTimeMountingCost', Header: 'Mounting', accessor: 'oneTimeMountingCost' },
    { key: 'totalCost', Header: 'Total', accessor: 'totalCost' },
    {
      key: 'select', Header: 'Select',
      render: (row) => (
        <input type="checkbox" checked={!!selected.find(item => item.id === row.id)} onChange={() => handleSelect(row)} />
      )
    }
  ];

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Quick Media Proposal / Quotation</h1>
      <form onSubmit={handleSearch} className="flex gap-4 mb-4 flex-wrap">
        <input
          placeholder="Enquiry Number"
          value={search.enquiryNumber}
          onChange={e => setSearch({ ...search, enquiryNumber: e.target.value })}
          className="input input-bordered"
        />
        <button type="submit" className="btn btn-primary flex items-center gap-2"><FaSearch /> Search</button>
      </form>
      {enquiry && (
        <div className="mb-4 p-4 bg-white rounded shadow flex flex-wrap gap-8 items-center">
          <div><b>Enquiry #:</b> {enquiry.id}</div>
          <div><b>Name:</b> {enquiry.name}</div>
          <div><b>Contact:</b> {enquiry.contactNumber}</div>
          <div><b>Company:</b> {enquiry.companyName}</div>
          <div><b>Type:</b> {enquiry.type}</div>
          <div><b>Media Requirement:</b> {enquiry.mediaRequirement}</div>
          <div><b>Campaign Objective:</b> {enquiry.campaignObjective || '-'}</div>
          {!enquirySaved && (
            <button className="btn btn-success ml-4" onClick={handleSaveEnquiry} type="button">Save Enquiry for Quotation</button>
          )}
        </div>
      )}
      {enquirySaved && (
        <div className="mb-2 flex flex-wrap gap-2 items-end bg-white p-4 rounded shadow">
          <input placeholder="Location" className="input input-bordered" onChange={e => setFilters(f => ({ ...f, location: e.target.value }))} />
          <input placeholder="Illumination (true/false)" className="input input-bordered" onChange={e => setFilters(f => ({ ...f, illumination: e.target.value }))} />
          <input placeholder="Width" className="input input-bordered" onChange={e => setFilters(f => ({ ...f, width: e.target.value }))} />
          <input placeholder="Height" className="input input-bordered" onChange={e => setFilters(f => ({ ...f, height: e.target.value }))} />
          <input placeholder="Hoarding Type" className="input input-bordered" onChange={e => setFilters(f => ({ ...f, hoardingType: e.target.value }))} />
          <button className="btn btn-secondary" onClick={handleFilter} type="button"><FaSearch /> Filter</button>
        </div>
      )}
      {enquirySaved && (
        loadingHoardings ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <Table columns={hoardingColumns} data={hoardings} loading={false} actionColumn={false} />
        )
      )}
      {enquirySaved && hoardings.length === 0 && !loadingHoardings && (
        <div className="text-center py-8 text-gray-500">No hoardings available. Please add some in Master Data.</div>
      )}
      {enquirySaved && (
        <div className="mt-4 p-4 bg-blue-50 rounded flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div className="font-bold">Selected Hoardings: {selected.length}</div>
            <div className="font-bold">Total: ₹{total.toLocaleString()}</div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary flex items-center gap-2" onClick={handleSaveProposal} disabled={saving}><FaSave /> Save Proposal</button>
          </div>
        </div>
      )}
      {quotationSummary && (
        <div className="mt-8 p-6 bg-green-50 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Quotation Summary</h2>
          <div><b>Quotation Number:</b> {quotationSummary.quotationNumber}</div>
          <div><b>Client Name:</b> {quotationSummary.clientName}</div>
          <div><b>Contact:</b> {quotationSummary.clientContact}</div>
          <div><b>Media (Hoardings):</b> {quotationSummary.mediaNames && quotationSummary.mediaNames.join(', ')}</div>
          <div className="mt-4 flex gap-2">
            <button className="btn btn-outline flex items-center gap-2" onClick={() => handleExport('pdf')}>Export PDF</button>
            <button className="btn btn-outline flex items-center gap-2" onClick={() => handleExport('excel')}>Export Excel</button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Quotation; 