import jwt_decode from 'jwt-decode';

const TOKEN_KEY = 'auth_token';

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Set token in localStorage
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Remove token from localStorage
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// Parse JWT token to get user info
export const parseToken = () => {
  const token = getToken();
  
  if (!token) return null;
  
  try {
    const decoded = jwt_decode(token);
    
    // Check if token is expired
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      removeToken();
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    removeToken();
    return null;
  }
};

// Check if user has a specific role
export const hasRole = (role) => {
  const decoded = parseToken();
  
  if (!decoded) return false;
  
  if (Array.isArray(role)) {
    return role.includes(decoded.role);
  }
  
  return decoded.role === role;
};

// Check if user is active
export const isActive = () => {
  const decoded = parseToken();
  
  if (!decoded) return false;
  
  return decoded.status === 'ACTIVE';
};

// Add getAuthHeader helper
export const getAuthHeader = () => {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};