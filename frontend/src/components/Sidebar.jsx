import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  AiOutlineDashboard, AiOutlineDatabase, AiOutlineUser, 
  AiOutlineTeam, AiOutlineLogout, AiOutlineMenu,
  AiOutlineClose, AiOutlineSetting,
  AiOutlinePrinter,
  AiOutlineBank,AiOutlineFileText, AiOutlineTransaction,
  AiOutlineCheckCircle,
} from 'react-icons/ai';
import { FaRegFileAlt, FaRegListAlt, FaTasks } from 'react-icons/fa';
import { BsMegaphone } from 'react-icons/bs';
import useAuth from '../hooks/useAuth';

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

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Check if current path matches the nav item path
  const isActive = (path) => {
    if (path === '/masters') {
      return location.pathname === '/masters' || location.pathname.startsWith('/masters/');
    }
    return location.pathname === path;
  };

  // Helper to check if any campaign sub-route is active
  const isCampaignActive = () => {
    return [
      '/admin/campaign/create',
      '/admin/campaign/vendor',
      '/admin/campaign/list',
    ].some((path) => location.pathname.startsWith(path));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when clicking a link (useful on mobile)
  const handleNavClick = () => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (user?.role === 'ADMIN') return '/admin/dashboard';
    if (user?.role === 'EMPLOYEE') return '/employee/dashboard';
    if (user?.role === 'SUPER_ADMIN') return '/super-admin/dashboard';
    return '/login';
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-md shadow-md text-gray-700"
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-white fixed md:relative inset-y-0 left-0 z-30 w-64 h-full border-r transition-transform duration-300 ease-in-out transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-center py-6 border-b">
          {/* in your sidebar component or nav */}
<Link to="/admin/profile">Admin Profile</Link>

          <Link to={getDashboardPath()} className="text-xl font-bold text-gray-800">
            OOH Manager
          </Link>
        </div>
        
        

        <div className="py-4 px-2">
          <div className="mb-4 px-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-full p-2">
                <AiOutlineUser className="text-blue-700" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-800">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Role'}</p>
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
          
          

          <div className="space-y-1">
            <NavItem
              to={getDashboardPath()}
              icon={<AiOutlineDashboard />}
              label="Dashboard"
              active={isActive(getDashboardPath())}
              onClick={handleNavClick}
            />

            {(user?.role === 'ADMIN' || user?.role === 'EMPLOYEE') && (
              <NavItem
                to="/masters"
                icon={<AiOutlineDatabase />}
                label="Master Data"
                active={isActive('/masters')}
                onClick={handleNavClick}
              />
            )}
            {/* Master sub-menu for individual masters */}
            {(user?.role === 'ADMIN' || user?.role === 'EMPLOYEE') && location.pathname.startsWith('/masters') && (
              <div className="ml-8 space-y-1">
                <NavItem to="/masters/hoarding" icon={<AiOutlineDatabase />} label="Hoarding Master" active={isActive('/masters/hoarding')} onClick={handleNavClick} />
                <NavItem to="/masters/labour" icon={<AiOutlineTeam />} label="Labour Master" active={isActive('/masters/labour')} onClick={handleNavClick} />
                <NavItem to="/masters/employee" icon={<AiOutlineUser />} label="Employee Master" active={isActive('/masters/employee')} onClick={handleNavClick} />
                <NavItem to="/masters/landlord" icon={<AiOutlineUser />} label="Landlord Master" active={isActive('/masters/landlord')} onClick={handleNavClick} />
                <NavItem to="/masters/client" icon={<AiOutlineUser />} label="Client Master" active={isActive('/masters/client')} onClick={handleNavClick} />
                <NavItem to="/masters/agency" icon={<AiOutlineUser />} label="Agency Master" active={isActive('/masters/agency')} onClick={handleNavClick} />
                <NavItem to="/masters/creditor" icon={<AiOutlineBank />} label="Creditor Master" active={isActive('/masters/creditor')} onClick={handleNavClick} />
                <NavItem to="/masters/printer" icon={<AiOutlinePrinter />} label="Printer Master" active={isActive('/masters/printer')} onClick={handleNavClick} />
                <NavItem to="/masters/designer" icon={<AiOutlineUser />} label="Designer Master" active={isActive('/masters/designer')} onClick={handleNavClick} />
              </div>
            )}

             {/* Voucher Section */}
      <NavItem
        to="/vouchers"
        icon={<AiOutlineFileText />}
        label="Vouchers"
        active={isActive('/vouchers')}
        onClick={handleNavClick}
      />

      {location.pathname.startsWith('/vouchers') && (
        <div className="ml-8 space-y-1">
          <NavItem to="/vouchers/payment" icon={<AiOutlineFileText />} label="Payment Voucher" active={isActive('/vouchers/payment')} onClick={handleNavClick} />
          <NavItem to="/vouchers/receipt" icon={<AiOutlineFileText />} label="Receipt Voucher" active={isActive('/vouchers/receipt')} onClick={handleNavClick} />
          <NavItem to="/vouchers/journal" icon={<AiOutlineFileText />} label="Journal Voucher" active={isActive('/vouchers/journal')} onClick={handleNavClick} />
          <NavItem to="/vouchers/contra" icon={<AiOutlineFileText />} label="Contra Voucher" active={isActive('/vouchers/contra')} onClick={handleNavClick} />
          <NavItem to="/vouchers/debit-note" icon={<AiOutlineFileText />} label="Debit Note" active={isActive('/vouchers/debit-note')} onClick={handleNavClick} />
          <NavItem to="/vouchers/credit-note" icon={<AiOutlineFileText />} label="Credit Note" active={isActive('/vouchers/credit-note')} onClick={handleNavClick} />
        </div>
      )}

            {user?.role === 'ADMIN' && (
              <NavItem
                to="/admin/employees"
                icon={<AiOutlineTeam />}
                label="Employees"
                active={isActive('/admin/employees')}
                onClick={handleNavClick}
              />
            )}

            {user?.role === 'ADMIN' && (
              <NavItem
                to="/admin/enquiries"
                icon={<FaRegListAlt />}
                label="Enquiries"
                active={isActive('/admin/enquiries')}
                onClick={handleNavClick}
              />
            )}

            {user?.role === 'ADMIN' && (
              <NavItem
                to="/admin/tasks"
                icon={<FaTasks />}
                label="Task Management"
                active={isActive('/admin/tasks')}
                onClick={handleNavClick}
              />
            )}

            {user?.role === 'EMPLOYEE' && (
              <NavItem
                to="/employee/tasks"
                icon={<FaTasks />}
                label="My Tasks"
                active={isActive('/employee/tasks')}
                onClick={handleNavClick}
              />
            )}

            {user?.role === 'ADMIN' && (
              <NavItem
                to="/admin/quotation"
                icon={<FaRegFileAlt />}
                label="Quotation"
                active={isActive('/admin/quotation')}
                onClick={handleNavClick}
              />
            )}

            {user?.role === 'ADMIN' && (
              <NavItem
                to="/admin/see-quotations"
                icon={<FaRegListAlt />}
                label="See Quotations"
                active={isActive('/admin/see-quotations')}
                onClick={handleNavClick}
              />
            )}

            {/* Campaign Management Section (Admin only) */}
            {user?.role === 'ADMIN' && (
              <div>
                <button
                  className={`flex items-center w-full px-4 py-3 text-gray-700 transition-colors duration-200 rounded-lg ${
                    isCampaignActive() ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setIsCampaignOpen((prev) => !prev)}
                  aria-expanded={isCampaignOpen}
                  aria-controls="campaign-management-menu"
                  type="button"
                >
                  <BsMegaphone className="mr-3" size={20} />
                  <span className="flex-1 text-left">Campaign Management</span>
                  <span className="ml-auto">{isCampaignOpen ? <AiOutlineClose size={16} /> : <AiOutlineMenu size={16} />}</span>
                </button>
                {(isCampaignOpen || isCampaignActive()) && (
                  <div id="campaign-management-menu" className="ml-8 space-y-1 mt-1">
                    <NavItem
                      to="/admin/campaign/create"
                      icon={<FaRegFileAlt />}
                      label="Create Campaign"
                      active={location.pathname.startsWith('/admin/campaign/create')}
                      onClick={handleNavClick}
                    />
                    <NavItem
                      to="/admin/campaign/vendor"
                      icon={<AiOutlineUser />}
                      label="Vendor Registration"
                      active={location.pathname.startsWith('/admin/campaign/vendor')}
                      onClick={handleNavClick}
                    />
                    <NavItem
                      to="/admin/campaign/list"
                      icon={<FaRegListAlt />}
                      label="View Campaigns"
                      active={location.pathname.startsWith('/admin/campaign/list')}
                      onClick={handleNavClick}
                    />
                  </div>
                )}
              </div>
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

        {/* <div className="absolute bottom-0 w-full border-t p-4">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors duration-200"
          >
            <AiOutlineLogout />
            <span className="mx-4">Logout</span>
          </button>
        </div> */}
      </div>
    </>
  );
};

export default Sidebar;