function MapSection({ address }) {
  if (!address) return null;

  return (
    <div className="map-placeholder">
      <img
        src="/placeholder.png"
        alt="Map placeholder"
      />
    </div>
  );
}

export default MapSection;