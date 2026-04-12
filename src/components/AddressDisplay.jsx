function AddressDisplay({ address, onClear }) {
  return (
    <div className="address-display">
      <h2>Your address:</h2>
      <div className="address-display-row">
        <p>{address}</p>
        <button className="address-clear-btn" onClick={onClear} title="Clear address">×</button>
      </div>
    </div>
  );
}

export default AddressDisplay;
