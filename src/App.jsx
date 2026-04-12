import { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import AddressDisplay from "./components/AddressDisplay";
import MapSection from "./components/MapSection";
import SearchSection from "./components/SearchSection";
import UpcomingCollections from "./components/UpcomingCollections";
import Footer from "./components/Footer";
import { ZONE_COLORS } from "./lib/maps";

const STORAGE_KEY = 'cbgc_address';
const AID_KEY     = 'cbgc_aid';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const datePart = String(dateStr).slice(0, 10);
  const d = new Date(datePart + 'T12:00:00');
  return d.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getRecStyle(recType) {
  if (!recType) return {};
  const lower = recType.toLowerCase();
  if (lower.includes('blue'))  return { color: '#60a5fa', borderColor: 'rgba(96,165,250,0.35)',  background: 'rgba(96,165,250,0.1)'  };
  if (lower.includes('black')) return { color: '#94a3b8', borderColor: 'rgba(148,163,184,0.35)', background: 'rgba(148,163,184,0.1)' };
  return { color: '#a78bfa', borderColor: 'rgba(167,139,250,0.35)', background: 'rgba(167,139,250,0.1)' };
}

function App() {
  const [address, setAddress]               = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [userZone, setUserZone]             = useState(null);
  const [collectionData, setCollectionData] = useState(null);
  const [loading, setLoading]               = useState(() => !!localStorage.getItem(AID_KEY));

  // On page load, restore the saved session using the stored AID
  useEffect(() => {
    const savedAid = localStorage.getItem(AID_KEY);
    if (!savedAid) return;
    fetch(`${BACKEND_URL}/api/address/${savedAid}`)
      .then(r => r.json())
      .then(data => {
        setUserZone(`${data.address.collection_day} Garbage Collection Zone`);
        setCollectionData(data);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, []);

  // Called by SearchSection when the user selects an address from the dropdown
  const handleAddressSelect = async (aid, fullAddress) => {
    setAddress(fullAddress);
    setLoading(true);
    localStorage.setItem(STORAGE_KEY, fullAddress);
    localStorage.setItem(AID_KEY, String(aid));

    try {
      const resp = await fetch(`${BACKEND_URL}/api/address/${aid}`);
      const data = await resp.json();
      setUserZone(`${data.address.collection_day} Garbage Collection Zone`);
      setCollectionData(data);
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setAddress('');
    setUserZone(null);
    setCollectionData(null);
    setLoading(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(AID_KEY);
  };

  const zoneColor    = userZone ? ZONE_COLORS[userZone] : null;
  const zoneDayLabel = userZone ? userZone.replace(' Garbage Collection Zone', '') : null;

  const lastDate = collectionData?.lastCollection?.date;
  const nextDate = collectionData?.nextCollection?.date;
  const lastRec  = collectionData?.lastCollection?.rec_type;
  const nextRec  = collectionData?.nextCollection?.rec_type;

  const hasAddress = !!address;

  return (
    <div className="app">
      <Header />

      <div className="main-content">

        <div className="collection-date left">
          <div className="label">Last Collection</div>
          <div className="collection-date-content">
            {!hasAddress ? (
              <div className="date-empty">Search your address to see your schedule</div>
            ) : loading ? (
              <div className="date-skeleton" />
            ) : (
              <>
                <div className="date-value">{formatDate(lastDate)}</div>
                {lastRec && <div className="rec-type-pill" style={getRecStyle(lastRec)}>{lastRec}</div>}
                {userZone && (
                  <div className="zone-badge">
                    <span className="zone-dot" style={{ background: zoneColor }} />
                    <span className="zone-badge-label" style={{ color: zoneColor }}>{zoneDayLabel}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="center-panel">
          {address && <AddressDisplay address={address} onClear={handleClear} />}
          <MapSection userZone={userZone} />
          <SearchSection onAddressSelect={handleAddressSelect} savedAddress={address} />
          {collectionData?.upcomingCollections?.length > 0 && (
            <UpcomingCollections upcoming={collectionData.upcomingCollections} zoneColor={zoneColor} />
          )}
        </div>

        <div className="collection-date right">
          <div className="label">Next Collection</div>
          <div className="collection-date-content">
            {!hasAddress ? (
              <div className="date-empty">Search your address to see your schedule</div>
            ) : loading ? (
              <div className="date-skeleton" />
            ) : (
              <>
                <div className="date-value">{formatDate(nextDate)}</div>
                {nextRec && <div className="rec-type-pill" style={getRecStyle(nextRec)}>{nextRec}</div>}
                {userZone && (
                  <div className="zone-badge">
                    <span className="zone-dot" style={{ background: zoneColor }} />
                    <span className="zone-badge-label" style={{ color: zoneColor }}>{zoneDayLabel}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}

export default App;
