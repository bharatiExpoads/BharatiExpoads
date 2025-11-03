import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Table from '../../components/Table';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchWithAuth } from '../../services/api';

const CampaignList = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [employees, setEmployees] = useState([]); // all employees for assignment
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignments, setAssignments] = useState({});
  const [saving, setSaving] = useState({});

  // Fetch campaigns
  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWithAuth('/admin/campaigns');
        setCampaigns(data);

        // initialize assignments
        const initialAssignments = {};
        data.forEach(c => {
          initialAssignments[c.id] = c.assignedTo?.id || '';
        });
        setAssignments(initialAssignments);
      } catch (err) {
        setError(err.data?.error || err.message || 'Failed to fetch campaigns');
        toast.error(err.data?.error || err.message || 'Failed to fetch campaigns');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  // Fetch employees for assignment
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await fetchWithAuth('/admin/employees'); // replace with your employees endpoint
        setEmployees(data);
      } catch (err) {
        toast.error('Failed to fetch employees');
      }
    };
    fetchEmployees();
  }, []);

  const handleAssignmentChange = (campaignId, employeeId) => {
    setAssignments(prev => ({ ...prev, [campaignId]: employeeId }));
  };

const handleSaveAssignment = async (campaignId, employeeId) => {
  if (!employeeId) return toast.error('Please select an employee');
  console.log('Saving assignment', campaignId, employeeId);

  setSaving(prev => ({ ...prev, [campaignId]: true }));

  try {
    await fetchWithAuth(`/admin/campaigns/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: Number(campaignId),
        employeeId: (employeeId)
      })
    });

    toast.success('Assignment saved successfully');

    // update campaigns locally
    setCampaigns(prev =>
      prev.map(c =>
        c.id === campaignId ? { ...c, assignedTo: { id: Number(employeeId) } } : c
      )
    );
  } catch (err) {
    toast.error('Failed to save assignment');
  } finally {
    setSaving(prev => ({ ...prev, [campaignId]: false }));
  }
};

  const columns = [
    { key: 'campaignNumber', label: 'Campaign Number' },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'vendor', label: 'Vendor', render: c => c.vendor?.name || '-' },
    { key: 'startDate', label: 'Start Date', render: c => c.startDate ? new Date(c.startDate).toLocaleDateString() : '-' },
    { key: 'endDate', label: 'End Date', render: c => c.endDate ? new Date(c.endDate).toLocaleDateString() : '-' },
    { key: 'status', label: 'Status' },
    { key: 'assignedTo', label: 'Assigned To', render: c => c.assignedTo?.employeeName || '-' },
    {
      key: 'assign',
      label: 'Assign Employee',
      render: c => (
        <div className="flex gap-2 items-center">
          <select
            value={assignments[c.id] || ''}
            onChange={e => handleAssignmentChange(c.id, e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">-- Select Employee --</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.officialEmail}>{emp.name}</option>
            ))}
          </select>
          <button
            onClick={() => handleSaveAssignment(c.id, assignments[c.id])}
            disabled={saving[c.id]}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
          >
            {saving[c.id] ? 'Saving...' : 'Save'}
          </button>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: c => (
        <button
          onClick={() => navigate(`/admin/campaigns/${c.id}`)}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
        >
          View Detail
        </button>
      )
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">Campaigns</h1>
        <Table
          title="All Campaigns"
          data={campaigns}
          columns={columns}
          loading={loading}
          error={error}
          actionColumn={false}
        />
      </div>
    </Layout>
  );
};

export default CampaignList;
