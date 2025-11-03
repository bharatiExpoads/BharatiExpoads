import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import FormField from '../../components/FormField';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getVendors, getVendorById, createVendor, updateVendor, deleteVendor } from '../../services/api';

const ASSET_TYPES = [
  'Designing',
  'Printing',
  'Mounting Photos',
  'Monitoring Photos',
  'Demounting Photos',
];

const CampaignAssets = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [assets, setAssets] = useState({}); // { type: [files] }
  const [uploading, setUploading] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState({}); // { type: [File, ...] }

  // Fetch campaigns on mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const { data } = await getVendors('/admin/campaigns');
        setCampaigns(data);
      } catch {
        toast.error('Failed to fetch campaigns');
      }
    };
    fetchCampaigns();
  }, []);

  // Fetch assets for selected campaign
  useEffect(() => {
    if (!selectedCampaign) return;
    const fetchAssets = async () => {
      const newAssets = {};
      for (const type of ASSET_TYPES) {
        try {
          const { data } = await getVendors(`/admin/campaign-assets?campaignId=${selectedCampaign}&type=${encodeURIComponent(type)}`);
          newAssets[type] = data;
        } catch {
          newAssets[type] = [];
        }
      }
      setAssets(newAssets);
    };
    fetchAssets();
  }, [selectedCampaign]);

  // Handle file input change
  const handleFileChange = (type, e) => {
    setFilesToUpload({ ...filesToUpload, [type]: Array.from(e.target.files) });
  };

  // Upload files for a section
  const handleUpload = async (type) => {
    if (!selectedCampaign || !filesToUpload[type] || filesToUpload[type].length === 0) {
      toast.error('Select campaign and files to upload');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('campaignId', selectedCampaign);
    formData.append('type', type);
    filesToUpload[type].forEach(file => {
      formData.append('files', file);
    });
    try {
      await getVendors('/admin/campaign-assets/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`${type} files uploaded successfully`);
      setFilesToUpload(f => ({ ...f, [type]: [] }));
      // Refresh assets
      const { data } = await getVendors(`/admin/campaign-assets?campaignId=${selectedCampaign}&type=${encodeURIComponent(type)}`);
      setAssets(a => ({ ...a, [type]: data }));
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to upload ${type} files`);
    } finally {
      setUploading(false);
    }
  };

  // Delete asset
  const handleDelete = async (type, assetId) => {
    try {
      await getVendors(`/admin/campaign-assets/${assetId}`);
      toast.success('Asset deleted');
      // Refresh assets
      const { data } = await getVendors(`/admin/campaign-assets?campaignId=${selectedCampaign}&type=${encodeURIComponent(type)}`);
      setAssets(a => ({ ...a, [type]: data }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete asset');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">Campaign Execution Assets</h1>
        <div className="mb-4">
          <FormField
            label="Select Campaign"
            id="campaign"
            name="campaign"
            type="select"
            value={selectedCampaign}
            onChange={e => setSelectedCampaign(e.target.value)}
            options={campaigns.map(c => ({ value: c.id, label: c.campaignNumber }))}
            required
          />
        </div>
        {selectedCampaign && ASSET_TYPES.map(type => (
          <div key={type} className="mb-8 bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">{type}</h2>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={e => handleFileChange(type, e)}
              className="mb-2"
              disabled={uploading}
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-4 rounded mb-2"
              onClick={() => handleUpload(type)}
              disabled={uploading || !filesToUpload[type] || filesToUpload[type].length === 0}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            {/* Preview selected files before upload */}
            {filesToUpload[type] && filesToUpload[type].length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {filesToUpload[type].map((file, idx) => (
                  <div key={idx} className="w-24 h-24 border rounded overflow-hidden flex items-center justify-center">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}
            {/* Show uploaded assets */}
            <div className="flex flex-wrap gap-2">
              {assets[type] && assets[type].map(asset => (
                <div key={asset.id} className="relative w-24 h-24 border rounded overflow-hidden">
                  <img
                    src={`/${asset.fileUrl.replace(/\\/g, '/')}`}
                    alt={type}
                    className="object-cover w-full h-full"
                  />
                  <button
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs"
                    onClick={() => handleDelete(type, asset.id)}
                    title="Delete"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default CampaignAssets; 