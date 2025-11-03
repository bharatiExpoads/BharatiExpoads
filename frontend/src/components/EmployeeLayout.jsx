import React from 'react';
import EmployeeSidebar from './EmployeeSidebar';

const EmployeeLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <EmployeeSidebar />
      <main className="flex-1 ml-0 md:ml-64 p-6">
        {children}
      </main>
    </div>
  );
};

export default EmployeeLayout;
