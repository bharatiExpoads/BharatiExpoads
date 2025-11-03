import React, { useState, useEffect } from 'react';
import { AiOutlineDatabase, AiOutlineCalendar, AiOutlineDollar } from 'react-icons/ai';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import * as masterService from '../../services/masterService';
import { formatDate } from '../../utils/formatters';
import Layout from '../../components/Layout';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const HoardingMaster = () => {
  const [hoardings, setHoardings] = useState([]);
  const [selectedHoarding, setSelectedHoarding] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [landlords, setLandlords] = useState([]);
  const [filteredLandlords, setFilteredLandlords] = useState([]);
  // Form state
  const [formData, setFormData] = useState({
    location: '',
    width: '',
    height: '',
    illumination: false,
    displayChargesPerMonth: '',
    oneTimePrintingCost: '',
    oneTimeMountingCost: '',
    availability: 'IMMEDIATELY',
    landlordId: '',
    hoardingType: 'Hoarding'
  });
  
  // Form errors
  const [formErrors, setFormErrors] = useState({});
  
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  

  // Redirect to login if no token
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);
  // for filtering the landlords based on location input

  useEffect(() => {
  if (!formData.location) {
    setFilteredLandlords([]); // or set to landlords if you want to show all
    return;
  }

  const filtered = landlords.filter(
    landlord =>
      landlord.address &&
      landlord.address.toLowerCase().includes(formData.location.toLowerCase())
  );

  setFilteredLandlords(filtered);

  // Optional: reset selected landlord when location changes
  setFormData(prev => ({
    ...prev,
    landlordId: ''
  }));
}, [formData.location, landlords]);

  
  // Fetch hoardings
  const fetchHoardings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/master/hoardings`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('Fetch hoardings failed:', text);
        throw new Error('Failed to fetch hoardings');
      }
      const data = await res.json();
      setHoardings(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch hoardings');
      console.error('Error fetching hoardings:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch landlords for dropdown
  const fetchLandlords = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/master/landlords-dropdown`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('Fetch landlords failed:', text);
        throw new Error('Failed to fetch landlords');
      }
      const data = await res.json();
      setLandlords(data);
    } catch (err) {
      console.error('Error fetching landlords:', err);
    }
  };
  
  useEffect(() => {
    fetchHoardings();
    fetchLandlords();
  }, []);
  
  // Handle form input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value // keep as string for backend parsing
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.location) errors.location = 'Location is required';
    if (!formData.width) errors.width = 'Width is required';
    if (!formData.height) errors.height = 'Height is required';
    if (formData.illumination === null) errors.illumination = 'Illumination is required';
    if (!formData.displayChargesPerMonth) errors.displayChargesPerMonth = 'Display Charges Per Month is required';
    if (!formData.oneTimePrintingCost) errors.oneTimePrintingCost = 'One Time Printing Cost is required';
    if (!formData.oneTimeMountingCost) errors.oneTimeMountingCost = 'One Time Mounting Cost is required';
    if (!formData.availability) errors.availability = 'Availability is required';
    if (!formData.hoardingType) errors.hoardingType = 'Hoarding Type is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Open form modal for adding
  const handleAdd = () => {
    setSelectedHoarding(null);
    setFormData({
      location: '',
      width: '',
      height: '',
      illumination: false,
      displayChargesPerMonth: '',
      oneTimePrintingCost: '',
      oneTimeMountingCost: '',
      availability: 'IMMEDIATELY',
      landlordId: '',
      hoardingType: 'Hoarding'
    });
    setIsFormModalOpen(true);
  };
  
  // Open form modal for editing
  const handleEdit = (hoarding) => {
    setSelectedHoarding(hoarding);
    setFormData({
      location: hoarding.location || '',
      width: hoarding.width || '',
      height: hoarding.height || '',
      illumination: hoarding.illumination || false,
      displayChargesPerMonth: hoarding.displayChargesPerMonth || '',
      oneTimePrintingCost: hoarding.oneTimePrintingCost || '',
      oneTimeMountingCost: hoarding.oneTimeMountingCost || '',
      availability: hoarding.availability || 'IMMEDIATELY',
      landlordId: hoarding.landlordId || '',
      hoardingType: hoarding.hoardingType || 'Hoarding'
    });
    setIsFormModalOpen(true);
  };
  
  // Open delete modal
  const handleDeleteClick = (hoarding) => {
    setSelectedHoarding(hoarding);
    setIsDeleteModalOpen(true);
  };
  
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const cleanData = { ...formData };
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === '') cleanData[key] = null;
      });
      if (!cleanData.landlordId) cleanData.landlordId = null;
      if (selectedHoarding) {
        // Update existing hoarding
        await masterService.updateHoarding(selectedHoarding.id, cleanData);
      } else {
        // Create new hoarding
        await masterService.createHoarding(cleanData);
      }
      
      // Close modal and refresh data
      setIsFormModalOpen(false);
      fetchHoardings();
    } catch (err) {
      setError(err.message || 'Failed to save hoarding');
    }
  };
  
  // Delete hoarding
  const handleDelete = async () => {
    if (!selectedHoarding) return;
    
    try {
      await masterService.deleteHoarding(selectedHoarding.id);
      fetchHoardings();
    } catch (err) {
      setError(err.message || 'Failed to delete hoarding');
    }
  };
  
  // Add derived values for totalSqFt and totalCost
  useEffect(() => {
    const width = parseFloat(formData.width) || 0;
    const height = parseFloat(formData.height) || 0;
    const displayChargesPerMonth = parseFloat(formData.displayChargesPerMonth) || 0;
    const oneTimePrintingCost = parseFloat(formData.oneTimePrintingCost) || 0;
    const oneTimeMountingCost = parseFloat(formData.oneTimeMountingCost) || 0;
    const totalSqFt = width * height;
    const totalCost = oneTimePrintingCost + oneTimeMountingCost + displayChargesPerMonth;
    setFormData((prev) => ({
      ...prev,
      totalSqFt,
      totalCost
    }));
  }, [formData.width, formData.height, formData.displayChargesPerMonth, formData.oneTimePrintingCost, formData.oneTimeMountingCost]);
  
  // Table columns configuration
  const columns = [
    { key: 'location', label: 'Location' },
    { key: 'width', label: 'Width' },
    { key: 'height', label: 'Height' },
    { key: 'totalSqFt', label: 'Total SqFt' },
    { key: 'illumination', label: 'Illumination', render: (h) => h.illumination ? 'Yes' : 'No' },
    { key: 'displayChargesPerMonth', label: 'Display Charges/Month' },
    { key: 'oneTimePrintingCost', label: 'One Time Printing Cost' },
    { key: 'oneTimeMountingCost', label: 'One Time Mounting Cost' },
    { key: 'totalCost', label: 'Total Cost' },
    { key: 'availability', label: 'Availability' },
    { key: 'hoardingType', label: 'Hoarding Type' },
    { key: 'landlord', label: 'Landlord', render: (h) => h.landlord?.landlordName || '-' }
  ];
  
  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <AiOutlineDatabase className="mr-2" /> Hoarding Master
          </h1>
          <p className="text-gray-600">Manage all your hoarding sites</p>
        </div>
        
        <Table
          title="Hoarding List"
          data={hoardings}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onAdd={handleAdd}
          loading={isLoading}
          error={error}
        />
        
        {/* Form Modal */}
        <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedHoarding ? 'Edit Hoarding' : 'Add Hoarding'}>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Location" id="location" name="location" value={formData.location} onChange={handleChange} error={formErrors.location} required />
              <FormField label="Width" id="width" name="width" value={formData.width} onChange={handleChange} error={formErrors.width} required type="number" />
              <FormField label="Height" id="height" name="height" value={formData.height} onChange={handleChange} error={formErrors.height} required type="number" />
              <FormField label="Illumination" id="illumination" name="illumination" value={formData.illumination} onChange={handleChange} error={formErrors.illumination} type="checkbox" />
              <FormField label="Display Charges Per Month" id="displayChargesPerMonth" name="displayChargesPerMonth" value={formData.displayChargesPerMonth} onChange={handleChange} error={formErrors.displayChargesPerMonth} required type="number" />
              <FormField label="One Time Printing Cost" id="oneTimePrintingCost" name="oneTimePrintingCost" value={formData.oneTimePrintingCost} onChange={handleChange} error={formErrors.oneTimePrintingCost} required type="number" />
              <FormField label="One Time Mounting Cost" id="oneTimeMountingCost" name="oneTimeMountingCost" value={formData.oneTimeMountingCost} onChange={handleChange} error={formErrors.oneTimeMountingCost} required type="number" />
              <FormField label="Availability" id="availability" name="availability" value={formData.availability} onChange={handleChange} error={formErrors.availability} required type="select" options={[
                { value: 'IMMEDIATELY', label: 'Immediately' },
                { value: 'FURTHER_DATE', label: 'Further Date' }
              ]} />
              <FormField label="Hoarding Type" id="hoardingType" name="hoardingType" value={formData.hoardingType} onChange={handleChange} error={formErrors.hoardingType} required type="select" options={[
                { value: 'Hoarding', label: 'Hoarding' },
                { value: 'LED', label: 'LED' },
                { value: 'PromotionVehicle', label: 'Promotion Vehicle' },
                { value: 'BusQueShelter', label: 'Bus Que Shelter' },
                { value: 'BusBranding', label: 'Bus Branding' },
                { value: 'PoleKiosk', label: 'Pole Kiosk' }
              ]} />
             <FormField
  label="Landlord"
  id="landlordId"
  name="landlordId"
  value={formData.landlordId}
  onChange={handleChange}
  error={formErrors.landlordId}
  required
  type="select"
  disabled={!formData.location} // Optional: disable until location entered
  options={[
    { value: '', label: 'Select Landlord' },
    ...filteredLandlords.map(l => ({
      value: l.id,
      label: l.landlordName
    }))
  ]}
/>

            </div>
            {/* Show computed fields below the grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <FormField label="Total SqFt" id="totalSqFt" name="totalSqFt" value={formData.totalSqFt || 0} type="number" disabled />
              <FormField label="Total Cost" id="totalCost" name="totalCost" value={formData.totalCost || 0} type="number" disabled />
            </div>
            <div className="flex justify-end mt-4">
              <button type="button" className="btn btn-secondary mr-2" onClick={() => setIsFormModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {selectedHoarding ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
        
        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDelete}
          itemName="hoarding"
        />
      </div>
    </Layout>
  );
};

export default HoardingMaster;