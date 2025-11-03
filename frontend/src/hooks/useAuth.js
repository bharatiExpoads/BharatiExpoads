import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Additional helper functions
  const hasRole = (requiredRole) => {
    if (!context.user) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(context.user.role);
    }
    
    return context.user.role === requiredRole;
  };
  
  const isActive = () => {
    if (!context.user) return false;
    return context.user.status === 'ACTIVE';
  };
  
  const isPending = () => {
    if (!context.user) return false;
    return context.user.status === 'PENDING';
  };
  
  // Return context with additional helpers
  return {
    ...context,
    user: context.user,
    token: context.user?.token,
    hasRole,
    isActive,
    isPending
  };
};

export default useAuth;