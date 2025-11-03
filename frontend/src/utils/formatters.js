// Format date from ISO string to localized date string
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-'; // Invalid date
  
  return date.toLocaleDateString();
};

// Format currency value
export const formatCurrency = (value, currency = '₹') => {
  if (value === undefined || value === null) return '-';
  
  return `${currency}${parseFloat(value).toLocaleString()}`;
};

// Format phone number
export const formatPhone = (phoneNumber) => {
  if (!phoneNumber) return '-';
  
  // Basic formatting - can be enhanced based on regional requirements
  return phoneNumber;
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
};