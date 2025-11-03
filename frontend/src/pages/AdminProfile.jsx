// src/pages/AdminProfile.jsx

import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import FormField from '../components/FormField';
import { adminService } from '../services/adminService';

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    gstNo: '',
    terms: '',
    instructions: '',
    logoUrl: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState(null);

  const fetchProfile = async () => {
    try {
      const data = await adminService.getAdminProfile();
      if (data && data.length && Array.isArray(data)) {
        const prof = data[0];
        setProfile(prof);
        setFormData({
          companyName: prof.companyName || '',
          gstNo: prof.gstNo || '',
          terms: prof.terms || '',
          instructions: prof.instructions || '',
          logoUrl: prof.logoUrl || ''
        });
      } else if (data && !Array.isArray(data)) {
        setProfile(data);
        setFormData({
          companyName: data.companyName || '',
          gstNo: data.gstNo || '',
          terms: data.terms || '',
          instructions: data.instructions || '',
          logoUrl: data.logoUrl || ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setMessage('Failed to load profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.companyName) errors.companyName = 'Company Name is required';
    // Add more validation if needed
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setMessage(null);
      console.log('Submitting form data:', formData);
      if (profile && profile.id) {
        console.log('Form data being sent:', formData);

        console.log('Updating profile with ID:', profile.id);
        await adminService.updateAdminProfile(profile.id, formData);
        setMessage('Profile updated successfully');
        fetchProfile();
      } else {
        // If create API exists, you can call it here
        await adminService.createAdminProfile(formData);
        setMessage('Profile created successfully');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setMessage('Error saving profile');
    }
  };

  if (isLoading) {
    return <Layout><div className="p-6">Loading...</div></Layout>;
  }

  return (
    <Layout>
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Admin Profile</h1>
        {message && <div className="mb-4 text-green-600">{message}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <FormField
            label="Company Name"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Enter your company name"
            required
            error={formErrors.companyName}
          />
          <FormField
            label="GST Number"
            id="gstNo"
            name="gstNo"
            value={formData.gstNo}
            onChange={handleChange}
            placeholder="Enter GST number"
            error={formErrors.gstNo}
          />
          <FormField
            label="Instructions"
            id="instructions"
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            type="textarea"
            placeholder="Any instructions"
          />
          <FormField
            label="Terms & Conditions"
            id="terms"
            name="terms"
            value={formData.terms}
            onChange={handleChange}
            type="textarea"
            placeholder="Enter terms & conditions"
          />
          <FormField
            label="Logo URL"
            id="logoUrl"
            name="logoUrl"
            value={formData.logoUrl}
            onChange={handleChange}
            placeholder="Enter / paste logo URL"
          />
          {formData.logoUrl && (
            <div className="mt-2">
              <label className="block font-semibold mb-1">Logo Preview:</label>
              <img src={formData.logoUrl} alt="Logo" className="h-20" />
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {profile && profile.id ? 'Update Profile' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AdminProfile;
