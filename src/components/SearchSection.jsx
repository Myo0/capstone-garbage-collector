import { useEffect, useRef, useState } from 'react';
import { hasApiKey, importLibrary, CORNER_BROOK_BOUNDS } from '../lib/maps';

function SearchSection({ setAddress, savedAddress }) {
  const [inputValue, setInputValue] = useState(savedAddress || '');
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const inputRef = useRef(null);

  // Pre-populate input when a saved address is loaded on first render
  useEffect(() => {
    if (savedAddress && !inputValue) setInputValue(savedAddress);
  }, [savedAddress]);

  useEffect(() => {
    if (!hasApiKey || !inputRef.current) return;

    importLibrary('places').then(({ Autocomplete }) => {
      if (!inputRef.current) return;

      const bounds = {
        north: CORNER_BROOK_BOUNDS.north,
        south: CORNER_BROOK_BOUNDS.south,
        east: CORNER_BROOK_BOUNDS.east,
        west: CORNER_BROOK_BOUNDS.west,
      };

      const autocomplete = new Autocomplete(inputRef.current, {
        bounds,
        strictBounds: true,
        componentRestrictions: { country: 'ca' },
        fields: ['formatted_address'],
        types: ['address'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          setInputValue(place.formatted_address);
          setAddress(place.formatted_address);
        }
      });
    });
  }, [setAddress]);

  const handleSearch = () => {
    const trimmed = inputValue.trim();
    if (trimmed) setAddress(trimmed);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSampleAddress = () => {
    const sample = '123 Main Street, Corner Brook, NL';
    setInputValue(sample);
    setAddress(sample);
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
          const { Geocoder } = await importLibrary('geocoding');
          const geocoder = new Geocoder();
          const result = await geocoder.geocode({
            location: { lat: coords.latitude, lng: coords.longitude },
          });

          if (result.results[0]) {
            const addr = result.results[0].formatted_address;
            setInputValue(addr);
            setAddress(addr);
          } else {
            setLocationError('Could not determine your address.');
          }
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

  return (
    <div className="search-section">
      <div className="search-row">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your address"
        />
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
