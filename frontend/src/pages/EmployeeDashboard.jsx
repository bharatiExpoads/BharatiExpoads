import React, { useState, useEffect } from 'react';
import { AiOutlineUser, AiOutlineLogout } from 'react-icons/ai';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const [adminInfo, setAdminInfo] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // In a real app, you would fetch this from the API
    // using the adminId from the user object
    setAdminInfo({
      name: "Admin User",
      email: "admin@example.com"
    });
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
          <div className="flex items-center">
            <span className="mr-4 text-gray-700">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <AiOutlineLogout className="mr-2" /> Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome card */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              Welcome, {user?.name}!
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              You are logged in as an Employee.
            </p>
          </div>
        </div>
        
        {/* Profile section */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Your Profile</h2>
            <div className="mt-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <AiOutlineUser className="h-10 w-10 text-gray-500" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{user?.name}</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Status:{' '}
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Admin info section */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Your Admin</h2>
            <div className="mt-4">
              {adminInfo ? (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">Name:</span> {adminInfo.name}
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">Email:</span> {adminInfo.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading admin information...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;