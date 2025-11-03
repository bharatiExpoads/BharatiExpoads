import React from 'react';
import Sidebar from './Sidebar';
import TaskNotification from './TaskNotification';
import useAuth from '../hooks/useAuth';

const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 overflow-x-hidden overflow-y-auto md:ml-64">
        {/* Top Navigation Bar with Notifications */}
        {(user?.role === 'ADMIN' || user?.role === 'EMPLOYEE') && (
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-end items-center sticky top-0 z-10">
            <TaskNotification />
          </div>
        )}
        
        <main>{children}</main>
      </div>
    </div>
  );
};

export default Layout;