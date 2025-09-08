import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { logEvent } from '../../utils/logger';
import { useTheme } from '../../contexts/ThemeContext';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom EV charging icon
const createChargingIcon = () => new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// User location icon
const createUserLocationIcon = () => new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to update map view and handle map initialization
function MapController({ center, zoom, filteredBunks, userLocation }) {
  const map = useMap();
  const chargingIcon = createChargingIcon();
  const userLocationIcon = createUserLocationIcon();
  
  // Update map view when center or zoom changes
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  // Fix map rendering issues
  useEffect(() => {
    // Timeout to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [map, filteredBunks]);

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {userLocation && (
        <Marker position={userLocation} icon={userLocationIcon}>
          <Popup>
            <div>
              <h6>Your Location</h6>
              <p>Lat: {userLocation[0].toFixed(4)}, Lng: {userLocation[1].toFixed(4)}</p>
            </div>
          </Popup>
        </Marker>
      )}
      
      {filteredBunks.map(bunk => (
        <Marker 
          key={bunk.id} 
          position={bunk.coordinates}
          icon={chargingIcon}
        >
          <Popup>
            <div>
              <h6>{bunk.name}</h6>
              <p>{bunk.address}</p>
              <p>{bunk.city}, {bunk.state}</p>
              <p>Available: {bunk.availableSlots}/{bunk.totalSlots}</p>
              <p>Distance: {bunk.distance}</p>
              <p>Price: {bunk.pricing}</p>
              <Link to={`/bunk/${bunk.id}`} className="btn btn-sm btn-primary">
                View Details
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

// Custom searchable dropdown component
const SearchableDropdown = ({ options, value, onChange, placeholder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (value) => {
    onChange(value);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button
        className="form-control text-start d-flex align-items-center justify-content-between"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value || placeholder}
        <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`}></i>
      </button>
      {isOpen && (
        <div className="dropdown-menu show w-100" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          <div className="p-2">
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Search location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option}
                className="dropdown-item"
                type="button"
                onClick={() => handleSelect(option)}
              >
                {option}
              </button>
            ))
          ) : (
            <div className="dropdown-item text-muted">No locations found</div>
          )}
        </div>
      )}
    </div>
  );
};

const NearbyBunks = ({ user }) => {
  const [bunks, setBunks] = useState([]);
  const [filteredBunks, setFilteredBunks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);
  const [locationError, setLocationError] = useState(null);
  const [filters, setFilters] = useState({
    location: 'All Locations',
    chargerType: 'All Types',
    availableNow: true,
    fastCharging: false,
    twentyFourSeven: false
  });
  const [sortBy, setSortBy] = useState('distance');
  const { isDarkMode } = useTheme();
  const mapRef = useRef(null);

  // Indian cities coordinates
  const indianCities = {
    'New Delhi': [28.6139, 77.2090],
    'Mumbai': [19.0760, 72.8777],
    'Bangalore': [12.9716, 77.5946],
    'Chennai': [13.0827, 80.2707],
    'Kolkata': [22.5726, 88.3639],
    'Hyderabad': [17.3850, 78.4867],
    'Pune': [18.5204, 73.8567],
    'Ahmedabad': [23.0225, 72.5714],
    'Jaipur': [26.9124, 75.7873],
    'Lucknow': [26.8467, 80.9462],
  };

  // Indian states coordinates (approximate centers)
  const indianStates = {
    'Delhi': [28.6139, 77.2090],
    'Maharashtra': [19.7515, 75.7139],
    'Karnataka': [15.3173, 75.7139],
    'Tamil Nadu': [11.1271, 78.6569],
    'West Bengal': [22.9868, 87.8550],
    'Telangana': [17.1232, 79.2088],
    'Gujarat': [22.2587, 71.1924],
    'Rajasthan': [27.0238, 74.2179],
    'Uttar Pradesh': [26.8467, 80.9462],
  };

  // Indian EV Charging Stations Data
  const indianBunks = [
    {
      id: 1,
      name: "Delhi EV Charging Hub",
      address: "Connaught Place, New Delhi",
      availableSlots: 4,
      totalSlots: 10,
      distance: "0.8 km",
      city: "New Delhi",
      state: "Delhi",
      coordinates: [28.6315, 77.2167],
      amenities: ["Fast Charging", "Cafe", "Restrooms", "Wi-Fi"],
      pricing: "₹5.00/kWh",
      connectorTypes: ["CCS", "Type 2", "Bharat DC-001"],
      operatingHours: "24/7"
    },
    {
      id: 2,
      name: "Mumbai Power Station",
      address: "Bandra Kurla Complex, Mumbai",
      availableSlots: 2,
      totalSlots: 8,
      distance: "1.5 km",
      city: "Mumbai",
      state: "Maharashtra",
      coordinates: [19.0662, 72.8640],
      amenities: ["Fast Charging", "Covered Parking", "Convenience Store"],
      pricing: "₹5.50/kWh",
      connectorTypes: ["CCS", "CHAdeMO"],
      operatingHours: "6:00 AM - 11:00 PM"
    },
    {
      id: 3,
      name: "Bangalore EV Point",
      address: "MG Road, Bangalore",
      availableSlots: 6,
      totalSlots: 12,
      distance: "2.3 km",
      city: "Bangalore",
      state: "Karnataka",
      coordinates: [12.9758, 77.6045],
      amenities: ["Standard Charging", "Coffee Shop", "Wi-Fi"],
      pricing: "₹4.80/kWh",
      connectorTypes: ["Type 2", "Bharat AC-001"],
      operatingHours: "24/7"
    },
    {
      id: 4,
      name: "Chennai EV Hub",
      address: "Anna Nagar, Chennai",
      availableSlots: 3,
      totalSlots: 6,
      distance: "3.2 km",
      city: "Chennai",
      state: "Tamil Nadu",
      coordinates: [13.0850, 80.2101],
      amenities: ["Fast Charging", "Restrooms"],
      pricing: "₹5.20/kWh",
      connectorTypes: ["CCS", "Type 2"],
      operatingHours: "7:00 AM - 10:00 PM"
    },
    {
      id: 5,
      name: "Kolkata Charging Point",
      address: "Park Street, Kolkata",
      availableSlots: 5,
      totalSlots: 8,
      distance: "1.7 km",
      city: "Kolkata",
      state: "West Bengal",
      coordinates: [22.5515, 88.3510],
      amenities: ["Fast Charging", "Cafe", "Wi-Fi"],
      pricing: "₹5.10/kWh",
      connectorTypes: ["CCS", "CHAdeMO", "Type 2"],
      operatingHours: "24/7"
    },
  ];

  // Get all unique cities and states for the filter dropdown
  const allCities = [...new Set(indianBunks.map(bunk => bunk.city))];
  const allStates = [...new Set(indianBunks.map(bunk => bunk.state))];
  const allLocations = ['All Locations', ...allCities, ...allStates];

  // Get user's current location
  useEffect(() => {
    logEvent('PAGE_VIEW', { page: 'NearbyBunks', user: user?.email, searchQuery });
    
    const getUserLocation = () => {
      if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported by this browser.");
        setLocationLoading(false);
        setMapCenter([20.5937, 78.9629]);
        setMapZoom(5);
        return;
      }

      setLocationLoading(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = [position.coords.latitude, position.coords.longitude];
          setUserLocation(userCoords);
          setMapCenter(userCoords);
          setMapZoom(12);
          setLocationLoading(false);
          logEvent('LOCATION_ACCESS_GRANTED', { coordinates: userCoords });
        },
        (error) => {
          let errorMessage = "Unable to retrieve your location.";
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Showing Indian charging stations.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable. Showing Indian charging stations.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Showing Indian charging stations.";
              break;
            default:
              errorMessage = "An unknown error occurred. Showing Indian charging stations.";
              break;
          }
          
          setLocationError(errorMessage);
          setLocationLoading(false);
          setMapCenter([20.5937, 78.9629]);
          setMapZoom(5);
          logEvent('LOCATION_ACCESS_ERROR', { error: errorMessage });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    };

    getUserLocation();
  }, [user, searchQuery]);

  // Load station data
  useEffect(() => {
    setTimeout(() => {
      let stations = [...indianBunks];
      
      if (userLocation) {
        stations = stations.map(station => {
          const R = 6371;
          const dLat = (station.coordinates[0] - userLocation[0]) * Math.PI / 180;
          const dLon = (station.coordinates[1] - userLocation[1]) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(userLocation[0] * Math.PI / 180) * Math.cos(station.coordinates[0] * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          
          return {
            ...station,
            distance: `${distance.toFixed(1)} km`
          };
        });
        
        stations.sort((a, b) => {
          const aDist = parseFloat(a.distance);
          const bDist = parseFloat(b.distance);
          return aDist - bDist;
        });
      }
      
      setBunks(stations);
      setFilteredBunks(stations);
      setLoading(false);
    }, 1500);
  }, [userLocation]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...bunks];
    
    if (searchQuery) {
      result = result.filter(bunk => 
        bunk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bunk.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bunk.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bunk.state.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filters.location !== 'All Locations') {
      // Check if it's a city or state filter
      if (allCities.includes(filters.location)) {
        result = result.filter(bunk => bunk.city === filters.location);
        
        if (indianCities[filters.location]) {
          setMapCenter(indianCities[filters.location]);
          setMapZoom(12);
        }
      } else if (allStates.includes(filters.location)) {
        result = result.filter(bunk => bunk.state === filters.location);
        
        if (indianStates[filters.location]) {
          setMapCenter(indianStates[filters.location]);
          setMapZoom(8);
        }
      }
    } else if (userLocation) {
      setMapCenter(userLocation);
      setMapZoom(12);
    } else {
      setMapCenter([20.5937, 78.9629]);
      setMapZoom(5);
    }
    
    if (filters.chargerType !== 'All Types') {
      result = result.filter(bunk => 
        bunk.connectorTypes.includes(filters.chargerType)
      );
    }
    
    if (filters.availableNow) {
      result = result.filter(bunk => bunk.availableSlots > 0);
    }
    
    if (filters.fastCharging) {
      result = result.filter(bunk => 
        bunk.connectorTypes.some(type => 
          ['CCS', 'CHAdeMO', 'Tesla Supercharger'].includes(type)
        )
      );
    }
    
    if (filters.twentyFourSeven) {
      result = result.filter(bunk => bunk.operatingHours === '24/7');
    }
    
    switch(sortBy) {
      case 'distance':
        result.sort((a, b) => {
          const aDist = parseFloat(a.distance);
          const bDist = parseFloat(b.distance);
          return aDist - bDist;
        });
        break;
      case 'availability':
        result.sort((a, b) => (b.availableSlots / b.totalSlots) - (a.availableSlots / a.totalSlots));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'city':
        result.sort((a, b) => a.city.localeCompare(b.city));
        break;
      default:
        break;
    }
    
    setFilteredBunks(result);
  }, [bunks, searchQuery, filters, sortBy, userLocation]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const retryLocation = () => {
    setLocationError(null);
    setLocationLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = [position.coords.latitude, position.coords.longitude];
          setUserLocation(userCoords);
          setMapCenter(userCoords);
          setMapZoom(12);
          setLocationLoading(false);
          logEvent('LOCATION_RETRY_SUCCESS', { coordinates: userCoords });
        },
        (error) => {
          setLocationError("Still unable to access your location. Showing Indian charging stations.");
          setLocationLoading(false);
          logEvent('LOCATION_RETRY_ERROR', { error: error.message });
        }
      );
    }
  };

  // Fix for map rendering issues
  useEffect(() => {
    // Force map to update its size after a short delay
    const timer = setTimeout(() => {
      if (mapRef.current) {
        const map = mapRef.current;
        if (map && typeof map.invalidateSize === 'function') {
          map.invalidateSize();
        }
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [filteredBunks, mapCenter, mapZoom]);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">
            {locationLoading ? "Detecting your location..." : "Loading Indian charging stations..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>
              {userLocation ? "Nearby EV Charging Stations" : "Indian EV Charging Stations"}
            </h1>
            {user && (
              <Link to="/dashboard" className="btn btn-outline-primary btn-hover-effect">
                <i className="bi bi-speedometer2 me-2"></i>
                My Dashboard
              </Link>
            )}
          </div>

          {locationError && (
            <div className="alert alert-warning fade-in">
              <i className="bi bi-geo-alt me-2"></i>
              {locationError}
              <button 
                className="btn btn-sm btn-outline-warning ms-3 btn-hover-effect"
                onClick={retryLocation}
              >
                Try Again
              </button>
            </div>
          )}

          {userLocation && !locationError && (
            <div className="alert alert-info fade-in">
              <i className="bi bi-geo-alt-fill me-2"></i>
              Showing stations near your current location in India
            </div>
          )}

          {searchQuery && (
            <div className="alert alert-info fade-in">
              <i className="bi bi-search me-2"></i>
              Showing results for: <strong>"{searchQuery}"</strong>
              {filteredBunks.length === 0 && ' - No stations found'}
            </div>
          )}
          
          <div className="row">
            {/* Map Section */}
            <div className="col-lg-8 col-md-7 mb-4">
              <div className="card">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Indian EV Stations Map</h5>
                  {userLocation && (
                    <span className="badge bg-info">
                      <i className="bi bi-geo me-1"></i>
                      Your Location
                    </span>
                  )}
                </div>
                <div className="card-body p-0">
                  <div style={{ height: '400px', width: '100%' }}>
                    <MapContainer
                      center={mapCenter}
                      zoom={mapZoom}
                      style={{ height: '100%', width: '100%' }}
                      whenCreated={(mapInstance) => {
                        mapRef.current = mapInstance;
                        // Fix for initial rendering
                        setTimeout(() => {
                          mapInstance.invalidateSize();
                        }, 100);
                      }}
                    >
                      <MapController 
                        center={mapCenter} 
                        zoom={mapZoom}
                        filteredBunks={filteredBunks}
                        userLocation={userLocation}
                      />
                    </MapContainer>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Filters Section */}
            <div className="col-lg-4 col-md-5">
              <div className="card mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Filters</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">Location (City/State)</label>
                    <SearchableDropdown
                      options={allLocations}
                      value={filters.location}
                      onChange={(value) => handleFilterChange('location', value)}
                      placeholder="Select location..."
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Charger Type</label>
                    <select 
                      className="form-control"
                      value={filters.chargerType}
                      onChange={(e) => handleFilterChange('chargerType', e.target.value)}
                    >
                      <option value="All Types">All Types</option>
                      <option value="CCS">CCS</option>
                      <option value="CHAdeMO">CHAdeMO</option>
                      <option value="Type 2">Type 2</option>
                      <option value="Bharat DC-001">Bharat DC-001</option>
                      <option value="Bharat AC-001">Bharat AC-001</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Availability</label>
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="availableNow" 
                        checked={filters.availableNow}
                        onChange={(e) => handleFilterChange('availableNow', e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="availableNow">
                        Available now
                      </label>
                    </div>
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="fastCharging" 
                        checked={filters.fastCharging}
                        onChange={(e) => handleFilterChange('fastCharging', e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="fastCharging">
                        Fast charging only
                      </label>
                    </div>
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="twentyFourSeven" 
                        checked={filters.twentyFourSeven}
                        onChange={(e) => handleFilterChange('twentyFourSeven', e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="twentyFourSeven">
                        24/7 operation
                      </label>
                    </div>
                  </div>
                  
                  <button 
                    className="btn btn-outline-secondary w-100 btn-hover-effect"
                    onClick={() => {
                      setFilters({
                        location: 'All Locations',
                        chargerType: 'All Types',
                        availableNow: true,
                        fastCharging: false,
                        twentyFourSeven: false
                      });
                      if (userLocation) {
                        setMapCenter(userLocation);
                        setMapZoom(12);
                      } else {
                        setMapCenter([20.5937, 78.9629]);
                        setMapZoom(5);
                      }
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>

              {locationError && (
                <div className="card">
                  <div className="card-body">
                    <h6 className="card-title">
                      <i className="bi bi-info-circle text-primary me-2"></i>
                      Location Help
                    </h6>
                    <p className="card-text small">
                      To see stations near you, please enable location services in your browser settings.
                    </p>
                    <button className="btn btn-sm btn-outline-primary w-100 btn-hover-effect" onClick={retryLocation}>
                      <i className="bi bi-geo me-1"></i>
                      Enable Location
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Stations List */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>
                  {filteredBunks.length} Station{filteredBunks.length !== 1 ? 's' : ''} Found
                  {userLocation && " Near You"}
                  {filters.location !== 'All Locations' && ` in ${filters.location}`}
                  {searchQuery && ` for "${searchQuery}"`}
                </h4>
                <div className="text-muted small">
                  Sorted by: 
                  <select 
                    className="form-control form-control-sm d-inline-block w-auto ms-2"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="distance">Distance (nearest first)</option>
                    <option value="availability">Availability (most available)</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="city">City</option>
                  </select>
                </div>
              </div>
            </div>
            
            {filteredBunks.length > 0 ? (
              filteredBunks.map(bunk => (
                <div key={bunk.id} className="col-xl-6 col-lg-12 mb-4 fade-in">
                  <div className="card station-card h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <h5 className="card-title">{bunk.name}</h5>
                        <span className="badge bg-primary">
                          <i className="bi bi-geo me-1"></i>
                          {bunk.distance}
                        </span>
                      </div>
                      
                      <p className="card-text text-muted">
                        <i className="bi bi-geo-alt me-1"></i>
                        {bunk.address}, {bunk.city}, {bunk.state}
                      </p>
                      
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className={bunk.availableSlots > 2 ? "text-success" : "text-warning"}>
                          <i className="bi bi-ev-station me-1"></i>
                          {bunk.availableSlots} of {bunk.totalSlots} slots available
                        </span>
                        <span className="text-info">
                          <i className="bi bi-currency-rupee me-1"></i>
                          {bunk.pricing}
                        </span>
                      </div>
                      
                      <div className="progress mb-3" style={{height: '8px'}}>
                        <div 
                          className={`progress-bar ${bunk.availableSlots > 2 ? 'bg-success' : bunk.availableSlots > 0 ? 'bg-warning' : 'bg-danger'}`} 
                          style={{width: `${(bunk.availableSlots / bunk.totalSlots) * 100}%`}}
                        ></div>
                      </div>
                      
                      <div className="row mb-3">
                        <div className="col-sm-6">
                          <strong>Operating Hours:</strong> {bunk.operatingHours}
                        </div>
                      </div>
                      
                      {bunk.connectorTypes && (
                        <div className="mb-3">
                          <strong>Connectors:</strong>
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {bunk.connectorTypes.map((type, index) => (
                              <span key={index} className="badge bg-info text-dark">
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {bunk.amenities && bunk.amenities.length > 0 && (
                        <div className="mb-3">
                          <small className="text-muted d-block mb-1">Amenities:</small>
                          <div className="d-flex flex-wrap gap-1">
                            {bunk.amenities.slice(0, 3).map((amenity, index) => (
                              <span key={index} className="badge bg-light text-dark border">
                                {amenity}
                              </span>
                            ))}
                            {bunk.amenities.length > 3 && (
                              <span className="badge bg-light text-dark border">
                                +{bunk.amenities.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="d-flex gap-2">
                        <Link 
                          to={`/bunk/${bunk.id}`}
                          className="btn btn-primary flex-fill btn-hover-effect"
                          onClick={() => logEvent('BUNK_DETAILS_VIEW', { bunkId: bunk.id, bunkName: bunk.name })}
                        >
                          <i className="bi bi-info-circle me-2"></i>
                          View Details
                        </Link>
                        {user && bunk.availableSlots > 0 && (
                          <button className="btn btn-outline-success btn-hover-effect">
                            <i className="bi bi-lightning-charge"></i>
                            Book Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="card">
                  <div className="card-body text-center py-5">
                    <i className="bi bi-search fs-1 text-muted"></i>
                    <h4 className="mt-3">No Stations Found</h4>
                    <p className="text-muted">
                      {searchQuery 
                        ? `No charging stations found for "${searchQuery}". Try a different search term.`
                        : 'No charging stations found with the current filters.'
                      }
                    </p>
                    <button 
                      className="btn btn-primary mt-2 btn-hover-effect"
                      onClick={() => {
                        setFilters({
                          location: 'All Locations',
                          chargerType: 'All Types',
                          availableNow: true,
                          fastCharging: false,
                          twentyFourSeven: false
                        });
                        if (userLocation) {
                          setMapCenter(userLocation);
                          setMapZoom(12);
                        } else {
                          setMapCenter([20.5937, 78.9629]);
                          setMapZoom(5);
                        }
                      }}
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyBunks;