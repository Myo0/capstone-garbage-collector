import { useEffect, useRef, useState } from 'react';
import {
  hasApiKey,
  importLibrary,
  ZONE_COLORS,
  CORNER_BROOK_CENTER,
  DARK_MAP_STYLES,
} from '../lib/maps';

function styleZones(map, userZone) {
  map.data.setStyle(feature => {
    const layer = feature.getProperty('Layer');
    const color = ZONE_COLORS[layer] ?? '#888888';
    const isUserZone = layer === userZone;
    return {
      fillColor: color,
      fillOpacity: userZone ? (isUserZone ? 0.65 : 0.1) : 0.35,
      strokeColor: color,
      strokeOpacity: userZone ? (isUserZone ? 1.0 : 0.35) : 0.8,
      strokeWeight: isUserZone ? 3 : 1.5,
    };
  });
}

function MapSection({ userZone }) {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!hasApiKey || !mapDivRef.current || mapRef.current) return;

    importLibrary('maps').then(({ Map }) => {
      if (mapRef.current || !mapDivRef.current) return;

      const map = new Map(mapDivRef.current, {
        center: CORNER_BROOK_CENTER,
        zoom: 12,
        styles: DARK_MAP_STYLES,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: { position: 7 }, // RIGHT_CENTER
      });

      mapRef.current = map;

      fetch('/zones.geojson')
        .then(r => r.json())
        .then(data => {
          map.data.addGeoJson(data);
          styleZones(map, null);
          setMapReady(true);
        });
    });
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    styleZones(mapRef.current, userZone);
  }, [userZone, mapReady]);

  return (
    <div className="map-container">
      {hasApiKey ? (
        <div ref={mapDivRef} style={{ width: '100%', height: '100%' }} />
      ) : (
        <div className="map-placeholder">
          <img src="/placeholder.png" alt="Map placeholder" />
        </div>
      )}
    </div>
  );
}

export default MapSection;
