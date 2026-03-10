import { useEffect, useRef, useState } from 'react';
import { hasApiKey, importLibrary, CORNER_BROOK_BOUNDS } from '../lib/maps';

function SearchSection({ setAddress }) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

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
      <button className="btn-secondary" onClick={handleSampleAddress}>
        Use Sample Address
      </button>
    </div>
  );
}

export default SearchSection;
