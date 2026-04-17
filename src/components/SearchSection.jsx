import { useEffect, useRef, useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

function SearchSection({ onAddressSelect, savedAddress }) {
  const [inputValue, setInputValue]       = useState(savedAddress || '');
  const [results, setResults]             = useState([]);
  const [noResults, setNoResults]         = useState(false);
  const [locating, setLocating]           = useState(false);
  const [locationError, setLocationError] = useState('');
  const searchTimeoutRef = useRef(null);
  const containerRef     = useRef(null);

  // Pre-populate input when a saved address is loaded on first render
  useEffect(() => {
    if (savedAddress && !inputValue) setInputValue(savedAddress);
  }, [savedAddress]);

  // Close dropdown when clicking outside the search container
  useEffect(() => {
    const handleClickOutside = e => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setResults([]);
        setNoResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchBackend = async (query) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setNoResults(false);
      return [];
    }
    try {
      const resp = await fetch(`${BACKEND_URL}/api/search?q=${encodeURIComponent(query.trim())}`);
      const data = await resp.json();
      setResults(data);
      setNoResults(data.length === 0);
      return data;
    } catch {
      setResults([]);
      setNoResults(false);
      return [];
    }
  };

  const handleInputChange = e => {
    const val = e.target.value;
    setInputValue(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchBackend(val), 300);
  };

  const handleSelect = result => {
    setInputValue(result.full_address);
    setResults([]);
    setNoResults(false);
    onAddressSelect(result.aid, result.full_address);
  };

  const handleSearch = async () => {
    const data = await searchBackend(inputValue);
    if (data.length === 1) handleSelect(data[0]);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') { setResults([]); setNoResults(false); }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await resp.json();

          // Build street address from house number + road name, uppercased to match DB
          const streetPart = [data.address?.house_number, data.address?.road]
            .filter(Boolean)
            .join(' ')
            .toUpperCase();

          if (!streetPart) {
            setLocationError('Could not determine your address.');
            return;
          }

          setInputValue(streetPart);
          const results = await searchBackend(streetPart);
          if (results.length === 1) handleSelect(results[0]);
          else if (results.length === 0) setLocationError('Your location is outside the Corner Brook service area.');
          // If multiple results, the dropdown will show for the user to pick
        } catch {
          setLocationError('Could not determine your address.');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setLocationError('Location access was denied.');
      },
      { timeout: 10000 }
    );
  };

  const handleSampleAddress = async () => {
    const sample = '1 BLANCHARDS AVE';
    setInputValue(sample);
    const data = await searchBackend(sample);
    if (data.length > 0) handleSelect(data[0]);
  };

  const showDropdown = results.length > 0 || noResults;

  return (
    <div className="search-section" ref={containerRef}>
      <div className="search-row">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter your address"
          />
          {showDropdown && (
            <ul className="search-dropdown">
              {results.length > 0
                ? results.map(r => (
                    <li key={r.aid} onMouseDown={() => handleSelect(r)}>
                      <span className="dropdown-address">{r.full_address}</span>
                      <span className="dropdown-zone">{r.collection_day}</span>
                    </li>
                  ))
                : <li className="dropdown-no-results">No addresses found</li>
              }
            </ul>
          )}
        </div>
        <button className="btn-primary" onClick={handleSearch}>
          Search
        </button>
      </div>
      <div className="search-secondary-row">
        <button className="btn-secondary" onClick={handleUseLocation} disabled={locating}>
          {locating ? 'Locating…' : '⊙ Use My Location'}
        </button>
        <button className="btn-secondary" onClick={handleSampleAddress}>
          Use Sample Address
        </button>
      </div>
      {locationError && <p className="location-error">{locationError}</p>}
    </div>
  );
}

export default SearchSection;
