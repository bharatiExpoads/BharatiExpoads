import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

// Master pages
import MastersDashboard from './pages/MastersDashboard';
import HoardingMaster from './pages/masters/HoardingMaster';
import LandlordMaster from './pages/masters/LandlordMaster';
import LabourMaster from './pages/masters/LabourMaster';
import EmployeeMaster from './pages/masters/EmployeeMaster';
import ClientMaster from './pages/masters/ClientMaster';
import AgencyMaster from './pages/masters/AgencyMaster';
import CreditorMaster from './pages/masters/CreditorMaster';
import Enquiries from './pages/admin/Enquiries';
import Quotation from './pages/admin/Quotation';
import PrinterMaster from './pages/masters/PrinterMaster';
import VendorRegistration from './pages/admin/VendorRegistration';
import CampaignCreation from './pages/admin/CampaignCreation';
import CampaignAssets from './pages/admin/CampaignAssets';
import CampaignList from './pages/admin/CampaignList';
import CampaignDetails from './pages/admin/CampaignDetails';
import SeeQuotation from './pages/admin/SeeQuotation';
import DesignerMaster from './pages/masters/DesignerMaster';
import PaymentVoucherMaster from './pages/masters/PaymentVoucherMaster';
import DebitNoteMaster from './pages/masters/DebitNote';
import CreditNoteMaster from './pages/masters/CreditNote';
import ContraVoucherMaster from './pages/masters/ContraVoucher';
import JournalVoucherMaster from './pages/masters/JournalVoucher';
import ReceiptVoucherMaster from './pages/masters/RecieptVoucher';
import VouchersDashboard from './pages/VouchersDashboard';
import AdminProfile from './pages/AdminProfile';
import EmployeePage from './pages/admin/EmployeePage';
import EmployeeDashboard1 from './pages/EmployeeDashboard1';
import CampaignDashboard from './pages/CampaignDashboard';
import TaskManagement from './pages/admin/TaskManagement';
import MyTasks from './pages/employee/MyTasks';
 // Import the Designer Master page

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Employee routes */}
          <Route 
            path="/employee/dashboard1" 
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/employee/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <EmployeeDashboard1 />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employee/tasks" 
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <MyTasks />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/enquiries" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN','EMPLOYEE']}>
                <Enquiries />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/quotation" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN','EMPLOYEE']}>
                <Quotation />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/see-quotations" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN','EMPLOYEE']}>
                <SeeQuotation />
              </ProtectedRoute>
            } 
          />
                    <Route 
            path="/campaigns" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                <CampaignDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/campaign/create" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                <CampaignCreation />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/admin/campaign/list"
            element={
              <ProtectedRoute allowedRoles={['ADMIN','EMPLOYEE']}>
                <CampaignList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/campaigns/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN','EMPLOYEE']}>
                <CampaignDetails />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/admin/campaign/vendor" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN','EMPLOYEE']}>
                <VendorRegistration />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/campaign/assets" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <CampaignAssets />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/tasks" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <TaskManagement />
              </ProtectedRoute>
            } 
          />
          
          {/* Master data routes - accessible by Admin and active Employees */}
          <Route 
            path="/masters" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                <MastersDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/masters/hoarding" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                <HoardingMaster />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/masters/labour" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                <LabourMaster />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/masters/employee" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <EmployeeMaster />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/masters/landlord" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                <LandlordMaster />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/masters/client" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                <ClientMaster />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/masters/agency" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                <AgencyMaster />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/masters/creditor" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                <CreditorMaster />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/masters/printer" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                <PrinterMaster />
              </ProtectedRoute>
            } 
          />
          <Route 
  path="/masters/designer" 
  element={
    <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
      <DesignerMaster />
    </ProtectedRoute>
  } 
/>

{/* Vouchers */}
<Route 
  path="/vouchers" 
  element={
    <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
      <VouchersDashboard />
    </ProtectedRoute>
  }
/>

<Route 
  path="/vouchers/payment" 
  element={
    <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
      <PaymentVoucherMaster />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/vouchers/receipt" 
  element={
    <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
      <ReceiptVoucherMaster />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/vouchers/journal" 
  element={
    <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
      <JournalVoucherMaster />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/vouchers/contra" 
  element={
    <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
      <ContraVoucherMaster />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/vouchers/debit-note" 
  element={
    <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
      <DebitNoteMaster />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/vouchers/credit-note" 
  element={
    <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
      <CreditNoteMaster />
    </ProtectedRoute>
  } 
/>
{/* this line got added */}
<Route 
  path="/admin/profile" 
  element={
    <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
      <AdminProfile />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/admin/employees" 
  element={
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <EmployeePage />
    </ProtectedRoute>
  } 
/>

          
          {/* Super Admin routes */}
          <Route 
            path="/super-admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;