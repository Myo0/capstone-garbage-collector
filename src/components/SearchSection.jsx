function SearchSection({ address, setAddress }) {
  return (
    <div className="search-section">
      <div className="search-row">
        <input type="text" placeholder="Enter your address" />
        <button className="btn-primary">Search</button>
      </div>
      <button
        className="btn-secondary"
        onClick={() => setAddress("123 Main Street, Corner Brook")}
      >
        Use Sample Address
      </button>
    </div>
  );
}

export default SearchSection;
