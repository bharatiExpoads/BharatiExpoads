import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineExclamationCircle, AiOutlineLogout } from 'react-icons/ai';
import useAuth from '../hooks/useAuth';

const PendingApprovalPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        <div className="text-center">
          <AiOutlineExclamationCircle className="mx-auto h-16 w-16 text-yellow-500" />
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">Account Pending Approval</h2>
          <p className="mt-2 text-gray-600">
            Your account is waiting for admin approval. You'll be able to access the system once approved.
          </p>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Account Information</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-900">
                <span className="font-semibold">Name:</span> {user?.name}
              </p>
              <p className="text-sm text-gray-900">
                <span className="font-semibold">Email:</span> {user?.email}
              </p>
              <p className="text-sm text-gray-900">
                <span className="font-semibold">Status:</span>{' '}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 text-center mb-6">
            Please contact your administrator if you believe this is a mistake.
          </p>
          <button
            onClick={handleLogout}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <AiOutlineLogout className="h-5 w-5 text-red-500 group-hover:text-red-400" />
            </span>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;