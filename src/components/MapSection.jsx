import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ZONE_COLORS, CORNER_BROOK_CENTER } from '../lib/maps';

const LEGEND_ITEMS = Object.entries(ZONE_COLORS).map(([zone, color]) => ({
  label: zone.replace(' Garbage Collection Zone', ''),
  color,
  zone,
}));

function getZoneStyle(layer, userZone) {
  const color = ZONE_COLORS[layer] ?? '#888888';
  const isUserZone = layer === userZone;
  return {
    fillColor: color,
    fillOpacity: userZone ? (isUserZone ? 0.65 : 0.1) : 0.35,
    color,
    opacity: userZone ? (isUserZone ? 1.0 : 0.35) : 0.8,
    weight: isUserZone ? 3 : 1.5,
  };
}

function MapSection({ userZone }) {
  const mapDivRef  = useRef(null);
  const mapRef     = useRef(null);
  const geoJsonRef = useRef(null);

  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const map = L.map(mapDivRef.current, {
      center: [CORNER_BROOK_CENTER.lat, CORNER_BROOK_CENTER.lng],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    mapRef.current = map;

    fetch('/zones.geojson')
      .then(r => r.json())
      .then(data => {
        const geoLayer = L.geoJSON(data, {
          style: feature => getZoneStyle(feature.properties.Layer, null),
        }).addTo(map);
        geoJsonRef.current = geoLayer;
      });

    return () => {
      map.remove();
      mapRef.current  = null;
      geoJsonRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!geoJsonRef.current) return;
    geoJsonRef.current.setStyle(feature => getZoneStyle(feature.properties.Layer, userZone));
  }, [userZone]);

  return (
    <div className="map-container">
      <div ref={mapDivRef} style={{ width: '100%', height: '100%' }} />
      <div className="map-legend">
        {LEGEND_ITEMS.map(({ label, color, zone }) => (
          <div
            key={label}
            className={`legend-item${userZone === zone ? ' legend-item--active' : ''}`}
          >
            <span className="legend-dot" style={{ background: color }} />
            <span className="legend-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MapSection;
