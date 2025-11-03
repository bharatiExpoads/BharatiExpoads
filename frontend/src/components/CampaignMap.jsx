import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { FaMapMarkerAlt, FaRuler, FaLightbulb, FaTimes, FaFilter, FaSearch } from 'react-icons/fa';

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '8px'
};

const CampaignMap = ({ campaignId, mapData }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [center, setCenter] = useState({ lat: 28.6139, lng: 77.2090 }); // Default: New Delhi
  const [zoom, setZoom] = useState(12);
  
  // Filter states
  const [filters, setFilters] = useState({
    type: 'all',
    illumination: 'all',
    minSize: 0,
    maxSize: 10000,
    searchTerm: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);

  useEffect(() => {
    if (mapData && mapData.locations && mapData.locations.length > 0) {
      // Calculate center based on all locations
      const avgLat = mapData.locations.reduce((sum, loc) => sum + loc.latitude, 0) / mapData.locations.length;
      const avgLng = mapData.locations.reduce((sum, loc) => sum + loc.longitude, 0) / mapData.locations.length;
      setCenter({ lat: avgLat, lng: avgLng });
      
      // Adjust zoom based on spread of locations
      if (mapData.locations.length === 1) {
        setZoom(15);
      } else {
        setZoom(11);
      }
      
      // Initialize filtered locations
      setFilteredLocations(mapData.locations);
    }
  }, [mapData]);

  // Filter locations based on active filters
  useEffect(() => {
    if (!mapData || !mapData.locations) return;

    let filtered = mapData.locations.filter(location => {
      // Type filter
      if (filters.type !== 'all' && location.type !== filters.type) {
        return false;
      }

      // Illumination filter
      if (filters.illumination === 'yes' && !location.illumination) {
        return false;
      }
      if (filters.illumination === 'no' && location.illumination) {
        return false;
      }

      // Size filter
      if (location.totalSqFt < filters.minSize || location.totalSqFt > filters.maxSize) {
        return false;
      }

      // Search term filter
      if (filters.searchTerm && !location.location.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }

      return true;
    });

    setFilteredLocations(filtered);

    // Recalculate center if locations changed
    if (filtered.length > 0) {
      const avgLat = filtered.reduce((sum, loc) => sum + loc.latitude, 0) / filtered.length;
      const avgLng = filtered.reduce((sum, loc) => sum + loc.longitude, 0) / filtered.length;
      setCenter({ lat: avgLat, lng: avgLng });
    }
  }, [filters, mapData]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      type: 'all',
      illumination: 'all',
      minSize: 0,
      maxSize: 10000,
      searchTerm: ''
    });
  };

  const getUniqueTypes = () => {
    if (!mapData || !mapData.locations) return [];
    return [...new Set(mapData.locations.map(loc => loc.type))];
  };

  if (!mapData || !mapData.locations || mapData.locations.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <FaMapMarkerAlt className="mx-auto text-yellow-500 text-4xl mb-3" />
        <p className="text-gray-700 font-medium">No location data available</p>
        <p className="text-gray-500 text-sm mt-2">
          Please add latitude and longitude coordinates to the hoardings in this campaign.
        </p>
      </div>
    );
  }

  // Custom marker icon colors based on hoarding type
  const getMarkerColor = (type) => {
    const colors = {
      Hoarding: 'red',
      LED: 'blue',
      PromotionVehicle: 'green',
      BusQueShelter: 'purple',
      BusBranding: 'orange',
      PoleKiosk: 'yellow'
    };
    return colors[type] || 'red';
  };

  return (
    <div className="space-y-4">
      {/* Map Header with Filter Toggle */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold flex items-center">
              <FaMapMarkerAlt className="mr-2" />
              Campaign: {mapData.campaignNumber}
            </h3>
            <p className="text-blue-100 text-sm mt-1">
              {mapData.customerName} • Showing {filteredLocations.length} of {mapData.locations.length} locations
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <FaFilter />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md animate-slideDown">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaSearch className="inline mr-1" /> Search Location
              </label>
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                placeholder="Search by location..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hoarding Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {getUniqueTypes().map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Illumination Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaLightbulb className="inline mr-1" /> Illumination
              </label>
              <select
                value={filters.illumination}
                onChange={(e) => handleFilterChange('illumination', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="yes">Illuminated</option>
                <option value="no">Non-Illuminated</option>
              </select>
            </div>

            {/* Size Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaRuler className="inline mr-1" /> Min Size (sq ft)
              </label>
              <input
                type="number"
                value={filters.minSize}
                onChange={(e) => handleFilterChange('minSize', Number(e.target.value))}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''} match your filters
            </span>
            <button
              onClick={resetFilters}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Google Map */}
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE'}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={zoom}
          options={{
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true,
            zoomControl: true,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          }}
        >
          {/* Markers for filtered hoarding locations */}
          {filteredLocations.map((location, index) => (
            <Marker
              key={location.id}
              position={{ lat: location.latitude, lng: location.longitude }}
              onClick={() => setSelectedMarker(location)}
              label={{
                text: `${index + 1}`,
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: getMarkerColor(location.type),
                fillOpacity: 1,
                strokeColor: 'white',
                strokeWeight: 2,
              }}
              animation={window.google?.maps?.Animation?.DROP}
            />
          ))}

          {/* Info Window for selected marker */}
          {selectedMarker && (
            <InfoWindow
              position={{ lat: selectedMarker.latitude, lng: selectedMarker.longitude }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-2 max-w-xs">
                <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-red-500" />
                  {selectedMarker.location}
                </h4>
                <div className="text-sm space-y-1">
                  <p className="flex items-center text-gray-600">
                    <FaRuler className="mr-2 text-blue-500" />
                    <span className="font-medium">Size:</span> 
                    <span className="ml-1">{selectedMarker.width}' × {selectedMarker.height}' ({selectedMarker.totalSqFt} sq ft)</span>
                  </p>
                  <p className="flex items-center text-gray-600">
                    <span className="font-medium mr-1">Type:</span> 
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                      {selectedMarker.type}
                    </span>
                  </p>
                  {selectedMarker.illumination && (
                    <p className="flex items-center text-yellow-600">
                      <FaLightbulb className="mr-2" />
                      <span className="font-medium">Illuminated</span>
                    </p>
                  )}
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Location List */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-bold text-gray-800">Hoarding Locations</h4>
          <span className="text-sm text-gray-500">
            {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''}
          </span>
        </div>
        {filteredLocations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaMapMarkerAlt className="mx-auto text-4xl mb-2 text-gray-300" />
            <p>No locations match your filters</p>
            <button
              onClick={resetFilters}
              className="mt-3 text-blue-600 hover:text-blue-700 text-sm underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredLocations.map((location, index) => (
              <div 
                key={location.id}
                className="border border-gray-200 rounded-lg p-3 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer bg-gradient-to-br from-white to-gray-50"
                onClick={() => {
                  setSelectedMarker(location);
                  setCenter({ lat: location.latitude, lng: location.longitude });
                  setZoom(16);
                }}
              >
                <div className="flex items-start">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 flex-shrink-0 shadow-md"
                    style={{ backgroundColor: getMarkerColor(location.type) }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm mb-1">{location.location}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                      <FaRuler className="text-blue-500" />
                      <span>{location.width}' × {location.height}' ({location.totalSqFt} sq ft)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                        {location.type}
                      </span>
                      {location.illumination && (
                        <FaLightbulb className="text-yellow-500 text-xs" title="Illuminated" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignMap;
