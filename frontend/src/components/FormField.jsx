import React from 'react';

const FormField = ({ 
  label, 
  id, 
  name, // add name prop
  type = 'text', 
  value, 
  onChange, 
  placeholder = '', 
  required = false,
  error = null,
  options = null,
  disabled = false,
  min = null,
  step = null
}) => {
  const fieldName = name || id;
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={id}
          name={fieldName}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${disabled ? 'bg-gray-100' : ''}`}
          rows={4}
        />
      ) : type === 'select' ? (
        <select
          id={id}
          name={fieldName}
          value={value || ''}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${disabled ? 'bg-gray-100' : ''}`}
        >
          <option value="">{placeholder || 'Select an option'}</option>
          {options && options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label || option}
            </option>
          ))}
        </select>
      ) : type === 'date' ? (
        <input
          id={id}
          name={fieldName}
          type="date"
          value={value || ''}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${disabled ? 'bg-gray-100' : ''}`}
        />
      ) : (
        <input
          id={id}
          name={fieldName}
          type={type}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          step={step}
          className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${disabled ? 'bg-gray-100' : ''}`}
        />
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FormField;