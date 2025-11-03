import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const DashboardRedirect = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (loading) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Check if user status is pending
    if (user.status === 'PENDING') {
      navigate('/pending-approval');
      return;
    }
    
    // Redirect based on role
    switch (user.role) {
      case 'SUPER_ADMIN':
        navigate('/super-admin/dashboard');
        break;
      case 'ADMIN':
        navigate('/admin/dashboard');
        break;
      case 'EMPLOYEE':
        navigate('/employee/dashboard');
        break;
      default:
        navigate('/login');
    }
  }, [loading, isAuthenticated, user, navigate]);
  
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default DashboardRedirect;