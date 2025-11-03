import React, { useState } from 'react';
import { AiOutlineSearch, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';

const Table = ({ 
  title,
  data, 
  columns, 
  onEdit, 
  onDelete, 
  onAdd, 
  loading,
  error,
  actionColumn = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  // Filter data based on search term
  const filteredData = data.filter(item => {
    return Object.values(item).some(val => 
      val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  const sortedData = getSortedData(filteredData);

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 flex flex-wrap items-center justify-between border-b">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <div className="flex space-x-2 mt-2 sm:mt-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <AiOutlineSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={onAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Add New
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
          {error}
        </div>
      ) : sortedData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? "No results matching your search" : "No data available"}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, colIdx) => (
                  <th 
                    key={column.key || column.Header || colIdx} 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort(column.key)}
                  >
                    {column.label || column.Header}
                    {sortConfig.key === column.key && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '\u2191' : '\u2193'}
                      </span>
                    )}
                  </th>
                ))}
                {actionColumn && (
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50">
                  {columns.map((column, colIdx) => (
                    <td key={`${item.id || index}-${column.key || column.Header || colIdx}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {column.render ? column.render(item) : item[column.key]}
                    </td>
                  ))}
                  {actionColumn && (onEdit || onDelete) && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {onEdit && (
                        <button 
                          onClick={() => onEdit(item)} 
                          className="text-blue-600 hover:text-blue-900 mr-4"
                          key={`edit-${item.id || index}`}
                        >
                          <AiOutlineEdit className="inline-block h-5 w-5" />
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          onClick={() => onDelete(item)} 
                          className="text-red-600 hover:text-red-900"
                          key={`delete-${item.id || index}`}
                        >
                          <AiOutlineDelete className="inline-block h-5 w-5" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Table;