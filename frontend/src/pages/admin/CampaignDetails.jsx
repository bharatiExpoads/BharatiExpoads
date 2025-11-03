import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import FormField from '../../components/FormField';
import { toast } from 'react-toastify';
import { fetchWithAuth } from '../../services/api';
import { FaEdit, FaSave, FaTimes, FaFileInvoice, FaUser, FaBuilding, FaImages, FaReceipt, FaDownload, FaMapMarkedAlt, FaShareAlt, FaCopy } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import CampaignMap from '../../components/CampaignMap';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoiceRef = useRef();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('customer');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [bill, setBill] = useState(null);
  const [billLoading, setBillLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapData, setMapData] = useState(null);
  const [shareableLink, setShareableLink] = useState(null);
  const [uploadingPO, setUploadingPO] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `Invoice-${bill?.billNumber || 'Draft'}`,
  });

  const handleDownload = () => {
    const element = invoiceRef.current;
    const opt = {
      margin: 1,
      filename: `Invoice-${bill?.billNumber || 'Draft'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  // Fetch campaign details
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const data = await fetchWithAuth(`/admin/campaigns/${id}`);
        setCampaign(data);
        setFormData(data);
      } catch (err) {
        toast.error('Failed to fetch campaign details');
        navigate('/admin/campaigns');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id, navigate]);

  // Fetch employees for assignment
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await fetchWithAuth('/admin/employees');
        setEmployees(data);
      } catch (err) {
        console.error('Failed to fetch employees');
      }
    };
    fetchEmployees();
  }, []);

  // Fetch assets
  useEffect(() => {
    if (campaign) {
      fetchAssets();
      fetchBill();
    }
  }, [campaign]);

  // Fetch bill for the campaign
  const fetchBill = async () => {
    setBillLoading(true);
    try {
      const bills = await fetchWithAuth('/admin/bills');
      const campaignBill = bills.find(b => b.campaignId === Number(id));
      setBill(campaignBill || null);
    } catch (err) {
      console.error('Failed to fetch bill');
    } finally {
      setBillLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const purchaseOrders = await fetchWithAuth(`/admin/campaign-assets?campaignId=${id}&type=PURCHASE_ORDER`);
      const completionPhotos = await fetchWithAuth(`/admin/campaign-assets?campaignId=${id}&type=COMPLETION_PHOTO`);
      setAssets([...purchaseOrders, ...completionPhotos]);
    } catch (err) {
      console.error('Failed to fetch assets');
    }
  };

  const handleSave = async () => {
    try {
      await fetchWithAuth(`/admin/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setCampaign(formData);
      setEditing(false);
      toast.success('Campaign updated successfully');
    } catch (err) {
      toast.error('Failed to update campaign');
    }
  };

  const handleAssignEmployee = async (employeeId) => {
    try {
      await fetchWithAuth('/admin/campaigns/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: id, employeeId }),
      });
      toast.success('Employee assigned successfully');
      // Refresh campaign data
      const data = await fetchWithAuth(`/admin/campaigns/${id}`);
      setCampaign(data);
    } catch (err) {
      toast.error('Failed to assign employee');
    }
  };

  const handleGenerateBill = async () => {
    try {
      const response = await fetchWithAuth('/admin/bills/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: id }),
      });
      
      if (response.error) {
        toast.error(response.error);
        return;
      }
      
      toast.success('Bill generated successfully');
      // Refresh bill data instead of navigating away
      fetchBill();
    } catch (err) {
      console.error('Bill generation error:', err);
      toast.error(err.message || 'Failed to generate bill');
    }
  };

  const handleViewOnMap = async () => {
    try {
      const data = await fetchWithAuth(`/admin/campaigns/${id}/map-data`);
      setMapData(data);
      setShowMapModal(true);
    } catch (err) {
      toast.error('Failed to load map data');
      console.error(err);
    }
  };

  const handleShareMapLink = async () => {
    try {
      const data = await fetchWithAuth(`/admin/campaigns/${id}/share-map-link`);
      setShareableLink(data);
      
      // Copy to clipboard
      if (data.shareableLink) {
        await navigator.clipboard.writeText(data.shareableLink);
        toast.success('Map link copied to clipboard!');
      }
    } catch (err) {
      toast.error('Failed to generate shareable link');
      console.error(err);
    }
  };

  const handleUploadPO = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPO(true);
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('campaignId', id);
    formData.append('type', 'PURCHASE_ORDER');

    try {
      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/campaign-assets/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      toast.success('Purchase orders uploaded successfully');
      fetchAssets(); // Refresh assets
    } catch (err) {
      toast.error('Failed to upload purchase orders');
      console.error(err);
    } finally {
      setUploadingPO(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleUploadPhoto = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhoto(true);
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('campaignId', id);
    formData.append('type', 'COMPLETION_PHOTO');

    try {
      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/campaign-assets/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      toast.success('Hoarding pictures uploaded successfully');
      fetchAssets(); // Refresh assets
    } catch (err) {
      toast.error('Failed to upload hoarding pictures');
      console.error(err);
    } finally {
      setUploadingPhoto(false);
      e.target.value = ''; // Reset file input
    }
  };

  if (loading) return <Layout><div className="text-center py-8">Loading...</div></Layout>;
  if (!campaign) return <Layout><div className="text-center py-8">Campaign not found</div></Layout>;

  const tabs = [
    { id: 'customer', label: 'Customer Details', icon: FaUser },
    { id: 'employee', label: 'Employee Section', icon: FaBuilding },
    { id: 'assets', label: 'Assets', icon: FaImages },
    { id: 'billing', label: 'Billing', icon: FaReceipt },
  ];

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Campaign Details: {campaign.campaignNumber}</h1>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2">
                  <FaSave /> Save
                </button>
                <button onClick={() => { setEditing(false); setFormData(campaign); }} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-2">
                  <FaTimes /> Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
                <FaEdit /> Edit
              </button>
            )}
            <button onClick={handleViewOnMap} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2">
              <FaMapMarkedAlt /> See on Map
            </button>
            <button onClick={handleShareMapLink} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded flex items-center gap-2">
              <FaShareAlt /> Share Map
            </button>
            <button onClick={handleGenerateBill} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2">
              <FaFileInvoice /> Generate Bill
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium ${
                activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'customer' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Campaign Number"
                value={formData.campaignNumber || ''}
                readOnly
              />
              <FormField
                label="Customer Name"
                value={editing ? formData.customerName : campaign.customerName}
                onChange={e => setFormData({...formData, customerName: e.target.value})}
                readOnly={!editing}
              />
              <FormField
                label="Phone Number"
                value={editing ? formData.phoneNumber : campaign.phoneNumber}
                onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                readOnly={!editing}
              />
              <FormField
                label="Vendor"
                value={campaign.vendor?.name || ''}
                readOnly
              />
              <FormField
                label="Start Date"
                type="date"
                value={editing ? formData.startDate?.split('T')[0] : campaign.startDate?.split('T')[0]}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
                readOnly={!editing}
              />
              <FormField
                label="End Date"
                type="date"
                value={editing ? formData.endDate?.split('T')[0] : campaign.endDate?.split('T')[0]}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
                readOnly={!editing}
              />
              <FormField
                label="Status"
                value={editing ? formData.status : campaign.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                readOnly={!editing}
              />

              {/* Hoardings Section */}
              <div className="md:col-span-2 mt-6">
                <h3 className="text-lg font-semibold mb-4">Assigned Hoardings ({campaign.hoardings?.length || 0})</h3>
                {campaign.hoardings && campaign.hoardings.length > 0 ? (
                  <div className="space-y-4">
                    {campaign.hoardings?.map((ch, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                              #{index + 1}
                            </span>
                            <h4 className="font-semibold text-gray-800">{ch.hoarding?.location || 'Location not specified'}</h4>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            ch.hoarding?.isIlluminated ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {ch.hoarding?.isIlluminated ? '💡 Illuminated' : '⚪ Not Lit'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Type</label>
                            <p className="text-sm font-medium">{ch.hoarding?.type || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Size</label>
                            <p className="text-sm font-medium">{ch.hoarding?.width}x{ch.hoarding?.height} ft</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Start Date</label>
                            <p className="text-sm font-medium">{new Date(ch.startDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">End Date</label>
                            <p className="text-sm font-medium">{ch.endDate ? new Date(ch.endDate).toLocaleDateString() : 'Ongoing'}</p>
                          </div>
                        </div>

                        {ch.hoarding?.latitude && ch.hoarding?.longitude && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <FaMapMarkedAlt className="text-blue-600" />
                              <span>GPS: {ch.hoarding.latitude.toFixed(4)}, {ch.hoarding.longitude.toFixed(4)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                    <p className="text-gray-500 text-lg">⚠️ No hoardings assigned to this campaign</p>
                    <p className="text-gray-400 text-sm mt-2">Add hoardings from Campaign Management</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'employee' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Assigned Employee</h3>
                {campaign.assignedTo ? (
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="font-medium">{campaign.assignedTo.employeeName}</p>
                    <p className="text-sm text-gray-600">{campaign.assignedTo.officialEmail}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">No employee assigned</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Assign Employee</h3>
                <div className="flex gap-2">
                  <select className="border rounded px-3 py-2 flex-1">
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.officialEmail}>{emp.employeeName} ({emp.officialEmail})</option>
                    ))}
                  </select>
                  <button
                    onClick={(e) => {
                      const select = e.target.previousElementSibling;
                      handleAssignEmployee(select.value);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Purchase Orders</h3>
                  <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer flex items-center gap-2">
                    <FaImages />
                    {uploadingPO ? 'Uploading...' : 'Upload PO'}
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      onChange={handleUploadPO}
                      className="hidden"
                      disabled={uploadingPO}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {assets.filter(a => a.type === 'PURCHASE_ORDER').map(asset => (
                    <div key={asset.id} className="border rounded p-4">
                      <img
                        src={`/${asset.fileUrl}`}
                        alt="Purchase Order"
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                      <p className="text-sm text-gray-600">
                        Uploaded: {new Date(asset.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {assets.filter(a => a.type === 'PURCHASE_ORDER').length === 0 && (
                    <p className="text-gray-500 col-span-3">No purchase orders uploaded</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Hoarding Pictures</h3>
                  <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded cursor-pointer flex items-center gap-2">
                    <FaImages />
                    {uploadingPhoto ? 'Uploading...' : 'Upload Photos'}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleUploadPhoto}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {assets.filter(a => a.type === 'COMPLETION_PHOTO').map(asset => (
                    <div key={asset.id} className="border rounded p-4">
                      <img
                        src={`/${asset.fileUrl}`}
                        alt="Hoarding Picture"
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                      <p className="text-sm text-gray-600">
                        Uploaded: {new Date(asset.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {assets.filter(a => a.type === 'COMPLETION_PHOTO').length === 0 && (
                    <p className="text-gray-500 col-span-3">No hoarding pictures uploaded</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              {billLoading ? (
                <div className="text-center py-8">Loading bill...</div>
              ) : bill ? (
                <div className="space-y-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handlePrint}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                      <FaReceipt /> Print Bill
                    </button>
                    <button
                      onClick={handleDownload}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                      <FaDownload /> Download Bill
                    </button>
                  </div>
                  <div ref={invoiceRef} className="invoice-container max-w-4xl mx-auto bg-white border border-gray-300 p-8">
                  {/* Header Section */}
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-800">{bill.companyName || 'Company Name'}</h2>
                      <p className="text-sm text-gray-600 mt-2">
                        {bill.companyName || 'Address Line 1'}<br />
                        {bill.companyName || 'City, State - PIN'}<br />
                        Phone: {bill.companyName || 'Phone Number'}<br />
                        Email: {bill.companyName || 'email@company.com'}<br />
                        GSTIN: {bill.gstNo || 'GSTIN Number'}
                      </p>
                    </div>
                    <div className="text-right">
                      <h1 className="text-4xl font-bold text-gray-800 mb-4">TAX INVOICE</h1>
                      <div className="text-sm">
                        <p><strong>Invoice No:</strong> {bill.billNumber}</p>
                        <p><strong>Dated:</strong> {new Date(bill.createdAt).toLocaleDateString()}</p>
                        <p><strong>Reference No:</strong> {bill.campaignNumber}</p>
                        <p><strong>From:</strong> {new Date(bill.startDate).toLocaleDateString()}</p>
                        <p><strong>To:</strong> {new Date(bill.endDate).toLocaleDateString()}</p>
                        <p><strong>Display/Project Name:</strong> {bill.campaignNumber}</p>
                      </div>
                    </div>
                  </div>

                  {/* Buyer Details */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Buyer Details</h3>
                    <div className="border border-gray-300 p-4">
                      <p><strong>{bill.customerName}</strong></p>
                      <p className="text-sm text-gray-600">
                        Address: Customer Address<br />
                        GSTIN/UIN: {bill.customerName || 'GSTIN'}<br />
                        State Name & Code: Maharashtra, 27
                      </p>
                    </div>
                  </div>

                  {/* Itemized Table */}
                  <div className="mb-8">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 p-2 text-left">Sr. No.</th>
                          <th className="border border-gray-300 p-2 text-left">Description of Services</th>
                          <th className="border border-gray-300 p-2 text-left">HSN/SAC</th>
                          <th className="border border-gray-300 p-2 text-left">Quantity</th>
                          <th className="border border-gray-300 p-2 text-left">Rate</th>
                          <th className="border border-gray-300 p-2 text-left">Per</th>
                          <th className="border border-gray-300 p-2 text-left">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bill.hoardings?.map((item, index) => (
                          <tr key={index}>
                            <td className="border border-gray-300 p-2">{index + 1}</td>
                            <td className="border border-gray-300 p-2">{item.location} – {item.size} ({item.days} Days)</td>
                            <td className="border border-gray-300 p-2">998366</td>
                            <td className="border border-gray-300 p-2">{item.size}</td>
                            <td className="border border-gray-300 p-2">₹{item.cost / (item.days / 30)}</td>
                            <td className="border border-gray-300 p-2">Per Sq.Ft.</td>
                            <td className="border border-gray-300 p-2">₹{item.cost}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Tax Calculation */}
                  <div className="flex justify-end mb-8">
                    <div className="w-1/2">
                      <div className="flex justify-between mb-2">
                        <span>Taxable Value:</span>
                        <span>₹{bill.subtotal}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>CGST @ 9%:</span>
                        <span>₹{bill.taxAmount / 2}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>SGST @ 9%:</span>
                        <span>₹{bill.taxAmount / 2}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2">
                        <span>Total Invoice Value:</span>
                        <span>₹{bill.totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Amount in Words */}
                  <div className="mb-8">
                    <p><strong>Amount in Words:</strong> {numberToWords(bill.totalAmount)} Only</p>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="mb-8">
                    <h4 className="font-semibold mb-2">Terms & Conditions:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Cheque should be in favor of {bill.companyName || 'Company Name'}</li>
                      <li>• Interest @ 18% p.a. will be charged on delayed payments after 15 days.</li>
                      <li>• Any complaint within 7 days from invoice date.</li>
                      <li>• Disputes subject to Kolhapur Jurisdiction.</li>
                    </ul>
                  </div>

                  {/* Company PAN & Bank Details */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <h4 className="font-semibold mb-2">Company PAN:</h4>
                      <p className="text-sm">ABKPM4784A</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Bank Details:</h4>
                      <p className="text-sm">
                        Bank Name: Bank of India<br />
                        Account No: 090320100005036<br />
                        Branch & IFSC: BKID0000922
                      </p>
                    </div>
                  </div>

                  {/* Signature */}
                  <div className="flex justify-end">
                    <div className="text-center">
                      <p className="mb-16">Authorized Signatory</p>
                      <p className="text-sm text-gray-600">Company Seal</p>
                      <p className="text-sm text-gray-600">Subject to Kolhapur Jurisdiction</p>
                      <p className="text-sm text-gray-600 mt-4">This is a Computer Generated Invoice</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No bill generated for this campaign yet.</p>
                  <button
                    onClick={handleGenerateBill}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded flex items-center gap-2 mx-auto"
                  >
                    <FaFileInvoice /> Generate Bill
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Map Modal */}
        <MapModal 
          isOpen={showMapModal}
          onClose={() => setShowMapModal(false)}
          mapData={mapData}
          shareableLink={shareableLink}
          onShare={handleShareMapLink}
        />
      </div>
    </Layout>
  );
};

// Helper function to convert number to words
function numberToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  function convertLessThanThousand(n) {
    if (n === 0) return '';
    let result = '';

    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }

    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    } else if (n >= 10) {
      result += teens[n - 10] + ' ';
      return result.trim();
    }

    if (n > 0) {
      result += ones[n] + ' ';
    }

    return result.trim();
  }

  if (num === 0) return 'Zero';

  let result = '';
  let crore = Math.floor(num / 10000000);
  let lakh = Math.floor((num % 10000000) / 100000);
  let thousand = Math.floor((num % 100000) / 1000);
  let remainder = num % 1000;

  if (crore > 0) result += convertLessThanThousand(crore) + ' Crore ';
  if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh ';
  if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand ';
  if (remainder > 0) result += convertLessThanThousand(remainder);

  return result.trim();
}

export default CampaignDetails;

// Map Modal Component (placed at the end of file for organization)
const MapModal = ({ isOpen, onClose, mapData, shareableLink, onShare }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaMapMarkedAlt className="mr-2 text-blue-600" />
            Campaign Locations Map
          </h2>
          <div className="flex gap-2">
            <button
              onClick={onShare}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm"
            >
              <FaShareAlt /> Share Link
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>
        <div className="p-6">
          <CampaignMap campaignId={mapData?.campaignId} mapData={mapData} />
          
          {shareableLink && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                <FaShareAlt className="mr-2 text-blue-600" />
                Shareable Map Link
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Share this link with anyone to view the campaign locations on Google Maps
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareableLink.shareableLink}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded bg-white text-sm"
                />
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(shareableLink.shareableLink);
                    toast.success('Link copied!');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <FaCopy /> Copy
                </button>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Total Locations: {shareableLink.totalLocations}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
