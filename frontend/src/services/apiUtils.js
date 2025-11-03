import { getToken, getAuthHeader } from '../utils/auth';

// Base API call function
export const apiCall = async (endpoint, method = 'GET', data = null) => {
  const baseUrl = process.env.REACT_APP_API_URL || '';
  const url = `${baseUrl}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    }
  };
  
  // Add body for non-GET requests
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    // If response is not JSON, throw error
    const text = await response.text();
    try {
      const result = JSON.parse(text);
      if (!response.ok) {
        throw new Error(result.error || 'API request failed');
      }
      return result;
    } catch (jsonErr) {
      // If response is not JSON, log and throw
      console.error(`API Error (${endpoint}): Not valid JSON`, text);
      throw new Error('API did not return valid JSON');
    }
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};