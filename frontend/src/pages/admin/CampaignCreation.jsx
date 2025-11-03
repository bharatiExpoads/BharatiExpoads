import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import FormField from '../../components/FormField';
import { toast } from 'react-toastify';
import { getVendors, quotationService, createCampaign } from '../../services/api';

const CampaignCreation = () => {
  const [vendors, setVendors] = useState([]);
  const [quotationNumber, setQuotationNumber] = useState('');
  const [hoardings, setHoardings] = useState([]);
  const [selectedHoardings, setSelectedHoardings] = useState([]);
  const [bookingDetails, setBookingDetails] = useState({});
  const [formData, setFormData] = useState({
    campaignNumber: '',
    customerName: '',
    phoneNumber: '',
    vendorId: '',
    status: 'Active',
    purchaseOrder: null, // keep this if needed
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [quotationSummary, setQuotationSummary] = useState(null);
  const [hoardingFilters, setHoardingFilters] = useState({});

  // Generate campaign number CMP-YYYYMMDD-XXXX
  useEffect(() => {
    const generateCampaignNumber = () => {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const random = Math.floor(1000 + Math.random() * 9000);
      setFormData(f => ({ ...f, campaignNumber: `CMP-${dateStr}-${random}` }));
    };
    generateCampaignNumber();
  }, []);

  // Fetch vendors on mount
  useEffect(() => {
    getVendors().then(vs => setVendors(Array.isArray(vs) ? vs : []));
  }, []);

  // Search by Quotation Number
  const handleQuotationSearch = async () => {
    if (!quotationNumber) return toast.error('Enter a Quotation Number');
    try {
      const quotation = await quotationService.getById(quotationNumber);
      setQuotationSummary(quotation);
      setFormData(f => ({
        ...f,
        customerName: quotation.clientName || '',
        phoneNumber: quotation.clientContact || '',
      }));
      setHoardings(Array.isArray(quotation.items) ? quotation.items : []);
      setSelectedHoardings([]);
      setBookingDetails({});
      toast.success('Quotation loaded');
    } catch (err) {
      setQuotationSummary(null);
      setHoardings([]);
      toast.error('Quotation not found');
    }
  };

  // Filter hoardings from quotation
  const filteredHoardings = hoardings.filter(h => {
    let match = true;
    if (hoardingFilters.location && !h.location.toLowerCase().includes(hoardingFilters.location.toLowerCase())) match = false;
    if (hoardingFilters.size && `${h.width}x${h.height}` !== hoardingFilters.size) match = false;
    if (hoardingFilters.mediaType && h.mediaType !== hoardingFilters.mediaType) match = false;
    return match;
  });

  // Handle hoarding selection
  const handleSelectHoarding = (hoarding) => {
    setSelectedHoardings(prev => {
      const exists = prev.find(h => h.id === hoarding.id);
      if (exists) return prev.filter(h => h.id !== hoarding.id);
      return [...prev, hoarding];
    });
  };

  // Handle booking details
  const handleBookingDetailChange = (hoardingId, field, value) => {
    setBookingDetails(prev => ({
      ...prev,
      [hoardingId]: {
        ...prev[hoardingId],
        [field]: value
      }
    }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(f => ({ ...f, purchaseOrder: file }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.customerName) errors.customerName = 'Customer Name is required';
    if (!formData.phoneNumber) errors.phoneNumber = 'Phone Number is required';
    if (!formData.vendorId) errors.vendorId = 'Vendor is required';
    if (selectedHoardings.length === 0) errors.hoardings = 'Select at least one hoarding';
    selectedHoardings.forEach(h => {
      if (!bookingDetails[h.id] || !bookingDetails[h.id].startDate) errors[`startDate_${h.id}`] = 'Start Date required';
      if (h.availability === 'FURTHER_DATE' && (!bookingDetails[h.id] || !bookingDetails[h.id].endDate)) errors[`endDate_${h.id}`] = 'End Date required';
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        hoardings: selectedHoardings.map(h => ({
          id: h.id,
          startDate: bookingDetails[h.id]?.startDate,
          endDate: bookingDetails[h.id]?.endDate || null
        }))
      };
      await createCampaign(payload);
      toast.success('Campaign created successfully');
      setFormData(f => ({ ...f, customerName: '', phoneNumber: '', vendorId: '', purchaseOrder: null }));
      setSelectedHoardings([]);
      setBookingDetails({});
      setHoardings([]);
      setQuotationNumber('');
      setQuotationSummary(null);
    } catch (err) {
      toast.error('Failed to create campaign');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">Create Campaign</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded shadow">
          <div className="md:col-span-2 flex items-center mb-2">
            <span className="font-semibold mr-2">Campaign Number:</span>
            <span className="text-blue-700 font-mono">{formData.campaignNumber}</span>
          </div>

          <div className="md:col-span-2 flex items-center mb-2">
            <input type="text" placeholder="Search by Quotation Number" value={quotationNumber} onChange={e => setQuotationNumber(e.target.value)} className="border px-3 py-2 rounded mr-2" />
            <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleQuotationSearch}>Search</button>
          </div>

          <FormField label="Customer Name" id="customerName" name="customerName" value={formData.customerName} onChange={e => setFormData(f => ({ ...f, customerName: e.target.value }))} required error={formErrors.customerName} />
          <FormField label="Phone Number" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={e => setFormData(f => ({ ...f, phoneNumber: e.target.value }))} required error={formErrors.phoneNumber} />
          <FormField label="Vendor" id="vendorId" name="vendorId" type="select" value={formData.vendorId} onChange={e => setFormData(f => ({ ...f, vendorId: e.target.value }))} required error={formErrors.vendorId} options={(vendors || []).map(v => ({ value: v.id, label: v.name }))} />

          {hoardings.length > 0 && (
            <div className="md:col-span-2">
              <div className="font-semibold mb-2">Select Hoardings to Book:</div>
              <div className="flex flex-wrap gap-2 mb-2">
                <input placeholder="Location" className="input input-bordered" onChange={e => setHoardingFilters(f => ({ ...f, location: e.target.value }))} />
                <input placeholder="Size (e.g. 10x20)" className="input input-bordered" onChange={e => setHoardingFilters(f => ({ ...f, size: e.target.value }))} />
                <input placeholder="Media Type" className="input input-bordered" onChange={e => setHoardingFilters(f => ({ ...f, mediaType: e.target.value }))} />
              </div>
              {filteredHoardings.map(h => (
                <div key={h.id} className="border rounded p-2 mb-2 flex flex-col md:flex-row md:items-center gap-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!selectedHoardings.find(sh => sh.id === h.id)} onChange={() => handleSelectHoarding(h)} />
                    <span>{h.location} ({h.mediaType}) {h.width}x{h.height}</span>
                  </label>
                  {selectedHoardings.find(sh => sh.id === h.id) && (
                    <div className="flex flex-wrap gap-2 items-center ml-4">
                      <input type="date" value={bookingDetails[h.id]?.startDate || ''} onChange={e => handleBookingDetailChange(h.id, 'startDate', e.target.value)} className="input input-bordered" />
                      <input type="date" value={bookingDetails[h.id]?.endDate || ''} onChange={e => handleBookingDetailChange(h.id, 'endDate', e.target.value)} className="input input-bordered" />
                      {formErrors[`startDate_${h.id}`] && <span className="text-red-500 text-xs">{formErrors[`startDate_${h.id}`]}</span>}
                      {formErrors[`endDate_${h.id}`] && <span className="text-red-500 text-xs">{formErrors[`endDate_${h.id}`]}</span>}
                    </div>
                  )}
                </div>
              ))}
              {formErrors.hoardings && <div className="text-red-500 text-xs">{formErrors.hoardings}</div>}
            </div>
          )}

          {/* Purchase Order Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Order</label>
            <input type="file" accept=".pdf,.jpg,.png" onChange={handleFileChange} className="block w-full text-sm text-gray-500" />
            {formData.purchaseOrder && <span className="block mt-1 text-green-600 text-sm">{formData.purchaseOrder.name}</span>}
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CampaignCreation;
