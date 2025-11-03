import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AiOutlineDashboard, AiOutlineDatabase, AiOutlineUser,
  AiOutlineLogout, AiOutlineMenu, AiOutlineClose, AiOutlineSetting,
  AiOutlineFileText, AiOutlineBank
} from 'react-icons/ai';
import { BsMegaphone } from 'react-icons/bs';
import useAuth from '../hooks/useAuth';
import { getMyPermissions } from '../services/masterService';

const NavItem = ({ to, icon, label, active, onClick }) => (
  <Link
    to={to}
    className={`flex items-center px-4 py-3 text-gray-700 transition-colors duration-200 ${
      active ? 'bg-blue-100 text-blue-700 font-medium rounded-lg' : 'hover:bg-gray-100 rounded-lg'
    }`}
    onClick={onClick}
  >
    {icon}
    <span className="mx-4">{label}</span>
  </Link>
);

const EmployeeSidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const { user, logout } = useAuth();
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleNavClick = () => isSidebarOpen && setIsSidebarOpen(false);
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  // Check if the employee has at least one true permission for a module
  const hasModule = (moduleName) =>
    permissions.some(
      (p) =>
        p.module.toLowerCase() === moduleName.toLowerCase() &&
        (p.canRead || p.canCreate || p.canUpdate || p.canDelete)
    );

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const data = await getMyPermissions(); // API returns full permission objects
        console.log('Fetched permissions from API:', data);
        setPermissions(data); // store full objects for hasModule check
      } catch (err) {
        console.error('Failed to fetch permissions:', err);
      }
    };
    fetchPermissions();
  }, []);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-md shadow-md text-gray-700"
      >
        {isSidebarOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
      </button>

      {isSidebarOpen && <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={toggleSidebar} />}

      <div className={`bg-white fixed md:relative inset-y-0 left-0 z-30 w-64 h-full border-r transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Header */}
        <div className="flex items-center justify-center py-6 border-b">
          <Link to="/employee/dashboard" className="text-xl font-bold text-gray-800">
            OOH Manager
          </Link>
        </div>

        {/* User info */}
        <div className="py-4 px-2 border-b mb-4">
          <div className="flex items-center space-x-3 px-4">
            <div className="bg-blue-100 rounded-full p-2">
              <AiOutlineUser className="text-blue-700" size={20} />
            </div>
            <div>
              <p className="font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
          <div className="mt-2 px-4">
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors duration-200"
            >
              <AiOutlineLogout />
              <span className="mx-4">Logout</span>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-2 space-y-1">
          <NavItem
            to="/employee/dashboard"
            icon={<AiOutlineDashboard />}
            label="Dashboard"
            active={isActive('/employee/dashboard')}
            onClick={handleNavClick}
          />

          {hasModule('master') && (
            <NavItem
              to="/masters"
              icon={<AiOutlineDatabase />}
              label="Master Data"
              active={isActive('/masters')}
              onClick={handleNavClick}
            />
          )}

          {hasModule('campaigns') && (
            <NavItem
              to="/campaigns"
              icon={<BsMegaphone />}
              label="Campaigns"
              active={isActive('/campaigns')}
              onClick={handleNavClick}
            />
          )}

          {hasModule('vouchers') && (
            <NavItem
              to="/vouchers"
              icon={<AiOutlineFileText />}
              label="Vouchers"
              active={isActive('/vouchers')}
              onClick={handleNavClick}
            />
          )}

          {hasModule('accounts') && (
            <NavItem
              to="/accounts"
              icon={<AiOutlineBank />}
              label="Accounts"
              active={isActive('/accounts')}
              onClick={handleNavClick}
            />
          )}

          {hasModule('reports') && (
            <NavItem
              to="/reports"
              icon={<AiOutlineFileText />}
              label="Reports"
              active={isActive('/reports')}
              onClick={handleNavClick}
            />
          )}

          <NavItem
            to="/settings"
            icon={<AiOutlineSetting />}
            label="Settings"
            active={isActive('/settings')}
            onClick={handleNavClick}
          />
        </div>
      </div>
    </>
  );
};

export default EmployeeSidebar;
