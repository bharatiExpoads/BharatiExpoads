import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import EmployeeLayout from '../../components/EmployeeLayout';
import FormField from '../../components/FormField';
import { toast } from 'react-toastify';
import { fetchWithAuth } from '../../services/api';
import { FaCalendarAlt, FaPlus, FaImages } from 'react-icons/fa';

const CampaignDetailsEmployee = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendData, setExtendData] = useState({
    newEndDate: '',
    deduction: ''
  });
  const [assets, setAssets] = useState([]);

  // Fetch campaign details
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const data = await fetchWithAuth(`/admin/campaigns/${id}`);
        setCampaign(data);
      } catch (err) {
        toast.error('Failed to fetch campaign details');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  // Fetch assets
  useEffect(() => {
    if (campaign) {
      fetchAssets();
    }
  }, [campaign]);

  const fetchAssets = async () => {
    try {
      const purchaseOrders = await fetchWithAuth(`/admin/campaign-assets?campaignId=${id}&type=PURCHASE_ORDER`);
      const completionPhotos = await fetchWithAuth(`/admin/campaign-assets?campaignId=${id}&type=COMPLETION_PHOTO`);
      setAssets([...purchaseOrders, ...completionPhotos]);
    } catch (err) {
      console.error('Failed to fetch assets');
    }
  };

  const handleExtendCampaign = async () => {
    if (!extendData.newEndDate || !extendData.deduction) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await fetchWithAuth('/admin/campaigns/extend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: id,
          newEndDate: extendData.newEndDate,
          deduction: parseFloat(extendData.deduction)
        }),
      });
      toast.success('Campaign extended successfully');
      setShowExtendModal(false);
      // Refresh campaign data
      const data = await fetchWithAuth(`/admin/campaigns/${id}`);
      setCampaign(data);
      setExtendData({ newEndDate: '', deduction: '' });
    } catch (err) {
      toast.error('Failed to extend campaign');
    }
  };

  if (loading) return <EmployeeLayout><div className="text-center py-8">Loading...</div></EmployeeLayout>;
  if (!campaign) return <EmployeeLayout><div className="text-center py-8">Campaign not found</div></EmployeeLayout>;

  return (
    <EmployeeLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6 p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Campaign: {campaign.campaignNumber}
            </h1>
            <button
              onClick={() => setShowExtendModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <FaCalendarAlt /> Extend Campaign
            </button>
          </div>
        </div>

        {/* Campaign Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                <p className="text-sm text-gray-900">{campaign.customerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <p className="text-sm text-gray-900">{campaign.phoneNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Vendor</label>
                <p className="text-sm text-gray-900">{campaign.vendor?.name}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Campaign Timeline</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <p className="text-sm text-gray-900">{new Date(campaign.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <p className="text-sm text-gray-900">{new Date(campaign.endDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  campaign.status === 'Active' ? 'bg-green-100 text-green-800' :
                  campaign.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {campaign.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hoardings */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Hoardings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaign.hoardings?.map((ch, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="text-sm">{ch.hoarding?.location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Size</label>
                    <p className="text-sm">{ch.hoarding?.width}x{ch.hoarding?.height}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Media Type</label>
                    <p className="text-sm">{ch.hoarding?.mediaType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Period</label>
                    <p className="text-sm">
                      {new Date(ch.startDate).toLocaleDateString()} - {ch.endDate ? new Date(ch.endDate).toLocaleDateString() : 'Ongoing'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assets */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Assets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium mb-3">Purchase Orders</h3>
              <div className="grid grid-cols-2 gap-2">
                {assets.filter(a => a.type === 'PURCHASE_ORDER').map(asset => (
                  <div key={asset.id} className="border rounded p-2">
                    <img
                      src={`/${asset.fileUrl}`}
                      alt="Purchase Order"
                      className="w-full h-20 object-cover rounded mb-1"
                    />
                    <p className="text-xs text-gray-600">
                      {new Date(asset.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {assets.filter(a => a.type === 'PURCHASE_ORDER').length === 0 && (
                  <p className="text-gray-500 text-sm col-span-2">No purchase orders</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-md font-medium mb-3">Hoarding Pictures</h3>
              <div className="grid grid-cols-2 gap-2">
                {assets.filter(a => a.type === 'COMPLETION_PHOTO').map(asset => (
                  <div key={asset.id} className="border rounded p-2">
                    <img
                      src={`/${asset.fileUrl}`}
                      alt="Hoarding Picture"
                      className="w-full h-20 object-cover rounded mb-1"
                    />
                    <p className="text-xs text-gray-600">
                      {new Date(asset.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {assets.filter(a => a.type === 'COMPLETION_PHOTO').length === 0 && (
                  <p className="text-gray-500 text-sm col-span-2">No hoarding pictures</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Extend Campaign Modal */}
        {showExtendModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Extend Campaign</h3>
                <div className="space-y-4">
                  <FormField
                    label="New End Date"
                    type="date"
                    value={extendData.newEndDate}
                    onChange={e => setExtendData({...extendData, newEndDate: e.target.value})}
                    required
                  />
                  <FormField
                    label="Deduction Amount"
                    type="number"
                    value={extendData.deduction}
                    onChange={e => setExtendData({...extendData, deduction: e.target.value})}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setShowExtendModal(false)}
                    className="px-4 py-2 text-gray-500 border rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExtendCampaign}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Extend
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
};

export default CampaignDetailsEmployee;
