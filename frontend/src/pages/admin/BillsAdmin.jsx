import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Table from '../../components/Table';
import { toast } from 'react-toastify';
import { fetchWithAuth } from '../../services/api';
import { FaEye, FaCheck, FaTimes, FaFileInvoice } from 'react-icons/fa';

const BillsAdmin = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch bills
  useEffect(() => {
    const fetchBills = async () => {
      try {
        const data = await fetchWithAuth('/admin/bills');
        setBills(data);
      } catch (err) {
        toast.error('Failed to fetch bills');
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  const handleApprove = async (billId) => {
    try {
      await fetchWithAuth(`/admin/bills/${billId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      toast.success('Bill approved successfully');
      // Refresh bills
      const data = await fetchWithAuth('/admin/bills');
      setBills(data);
    } catch (err) {
      toast.error('Failed to approve bill');
    }
  };

  const handleReject = async (billId) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await fetchWithAuth(`/admin/bills/${billId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason }),
      });
      toast.success('Bill rejected');
      setShowModal(false);
      setRejectionReason('');
      // Refresh bills
      const data = await fetchWithAuth('/admin/bills');
      setBills(data);
    } catch (err) {
      toast.error('Failed to reject bill');
    }
  };

  const handleViewBill = async (billId) => {
    try {
      const bill = await fetchWithAuth(`/admin/bills/${billId}`);
      setSelectedBill(bill);
      setShowModal(true);
    } catch (err) {
      toast.error('Failed to fetch bill details');
    }
  };

  const columns = [
    { key: 'billNumber', label: 'Bill Number' },
    { key: 'campaignNumber', label: 'Campaign', render: b => b.campaign?.campaignNumber || '-' },
    { key: 'customerName', label: 'Customer' },
    { key: 'totalAmount', label: 'Total Amount', render: b => `₹${b.totalAmount?.toFixed(2)}` },
    { key: 'status', label: 'Status', render: b => (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
        b.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
        b.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        {b.status}
      </span>
    )},
    { key: 'createdAt', label: 'Created', render: b => new Date(b.createdAt).toLocaleDateString() },
    {
      key: 'actions',
      label: 'Actions',
      render: b => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewBill(b.id)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
          >
            <FaEye /> View
          </button>
          {b.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleApprove(b.id)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
              >
                <FaCheck /> Approve
              </button>
              <button
                onClick={() => {
                  setSelectedBill(b);
                  setShowModal(true);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
              >
                <FaTimes /> Reject
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">Bill Management</h1>
        <Table
          title="All Bills"
          data={bills}
          columns={columns}
          loading={loading}
          error={null}
          actionColumn={false}
        />

        {/* Bill Details Modal */}
        {showModal && selectedBill && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-4 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Bill Details: {selectedBill.billNumber}</h3>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedBill(null);
                      setRejectionReason('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>

                {/* Company Header */}
                <div className="border-b pb-4 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-lg">{selectedBill.companyName}</h4>
                      {selectedBill.gstNo && <p className="text-sm">GST: {selectedBill.gstNo}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">Bill Number: {selectedBill.billNumber}</p>
                      <p className="text-sm">Date: {new Date(selectedBill.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Bill To:</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">{selectedBill.customerName}</p>
                    <p>Phone: {selectedBill.customerPhone}</p>
                    <p>Vendor: {selectedBill.vendorName}</p>
                    <p>Campaign: {selectedBill.campaignNumber}</p>
                    <p>Period: {new Date(selectedBill.startDate).toLocaleDateString()} - {new Date(selectedBill.endDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Hoardings Table */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Hoardings:</h4>
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Location</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Size</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Media Type</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Period</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBill.hoardings?.map((hoarding, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-4 py-2">{hoarding.location}</td>
                          <td className="border border-gray-300 px-4 py-2">{hoarding.size}</td>
                          <td className="border border-gray-300 px-4 py-2">{hoarding.mediaType}</td>
                          <td className="border border-gray-300 px-4 py-2">
                            {new Date(hoarding.startDate).toLocaleDateString()} - {hoarding.endDate ? new Date(hoarding.endDate).toLocaleDateString() : 'Ongoing'}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">₹{hoarding.cost?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="border-t pt-4">
                  <div className="flex justify-end">
                    <div className="w-64">
                      <div className="flex justify-between py-1">
                        <span>Subtotal:</span>
                        <span>₹{selectedBill.subtotal?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Tax (18%):</span>
                        <span>₹{selectedBill.taxAmount?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1 font-bold border-t">
                        <span>Total:</span>
                        <span>₹{selectedBill.totalAmount?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                {selectedBill.terms && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <h4 className="font-semibold mb-2">Terms & Conditions:</h4>
                    <p className="text-sm">{selectedBill.terms}</p>
                  </div>
                )}

                {/* Status and Actions */}
                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold">Status: </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedBill.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        selectedBill.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedBill.status}
                      </span>
                      {selectedBill.status === 'REJECTED' && selectedBill.rejectionReason && (
                        <div className="mt-2">
                          <span className="font-semibold">Rejection Reason: </span>
                          <span className="text-red-600">{selectedBill.rejectionReason}</span>
                        </div>
                      )}
                    </div>

                    {selectedBill.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(selectedBill.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
                        >
                          <FaCheck /> Approve
                        </button>
                        <div className="flex gap-2">
                          <textarea
                            placeholder="Rejection reason..."
                            value={rejectionReason}
                            onChange={e => setRejectionReason(e.target.value)}
                            className="border rounded px-3 py-2 text-sm"
                            rows={2}
                          />
                          <button
                            onClick={() => handleReject(selectedBill.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
                          >
                            <FaTimes /> Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BillsAdmin;
