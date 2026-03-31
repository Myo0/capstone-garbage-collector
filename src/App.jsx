import { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import AddressDisplay from "./components/AddressDisplay";
import MapSection from "./components/MapSection";
import SearchSection from "./components/SearchSection";
import Footer from "./components/Footer";
import { ZONE_COLORS } from "./lib/maps";

const STORAGE_KEY = 'cbgc_address';

function App() {
  const [address, setAddress] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  // TODO: populate userZone from backend response when address is searched
  const [userZone, setUserZone] = useState(null);

  // Persist address to localStorage whenever it changes
  useEffect(() => {
    if (address) localStorage.setItem(STORAGE_KEY, address);
  }, [address]);

  const zoneColor = userZone ? ZONE_COLORS[userZone] : null;
  const zoneDayLabel = userZone ? userZone.replace(" Garbage Collection Zone", "") : null;

  return (
    <div className="app">
      <Header />

      <div className="main-content">

        <div className="collection-date left">
          <div className="label">Last Collection</div>
          <div className="date-value">—</div>
          {userZone && (
            <div className="zone-badge">
              <span className="zone-dot" style={{ background: zoneColor }} />
              <span className="zone-badge-label" style={{ color: zoneColor }}>{zoneDayLabel}</span>
            </div>
          )}
        </div>

        <div className="center-panel">

          {address && <AddressDisplay address={address} />}

          <MapSection userZone={userZone} />

          <SearchSection setAddress={setAddress} savedAddress={address} />

        </div>

        <div className="collection-date right">
          <div className="label">Next Collection</div>
          <div className="date-value">—</div>
          {userZone && (
            <div className="zone-badge">
              <span className="zone-dot" style={{ background: zoneColor }} />
              <span className="zone-badge-label" style={{ color: zoneColor }}>{zoneDayLabel}</span>
            </div>
          )}
        </div>

      </div>
      <Footer />
    </div>
  );
}

export default App;
