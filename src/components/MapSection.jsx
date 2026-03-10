function MapSection({ address }) {
  if (!address) return null;

  return (
    <div className="map-container">
      <div className="map-placeholder">
        <img
          src="/placeholder.png"
          alt="Map placeholder"
        />
      </div>
    </div>
  );
}

export default MapSection;
