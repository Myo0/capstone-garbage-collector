function AddressDisplay({ address }) {
  return (
    <div className="address-display">
      <h2>Your address:</h2>
      <p>
        {address
          ? address
          : "You have not given us your address."}
      </p>
    </div>
  );
}

export default AddressDisplay;