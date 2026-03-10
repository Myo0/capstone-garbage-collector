import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const hasApiKey = !!apiKey;

if (apiKey) {
  setOptions({ apiKey, version: 'weekly' });
}

// Use importLibrary('maps') or importLibrary('places') in components
export { importLibrary };

export const ZONE_COLORS = {
  'Day 1 Garbage Collection Zone': '#f87171',
  'Day 2 Garbage Collection Zone': '#c084fc',
  'Day 3 Garbage Collection Zone': '#60a5fa',
  'Day 4 Garbage Collection Zone': '#4ade80',
  'Day 5 Garbage Collection Zone': '#facc15',
};

// Corner Brook city center
export const CORNER_BROOK_CENTER = { lat: 48.9519, lng: -57.95 };

// Bounds used to bias autocomplete results to Corner Brook
export const CORNER_BROOK_BOUNDS = {
  north: 48.975,
  south: 48.920,
  east: -57.880,
  west: -58.060,
};

export const DARK_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#0d1b2a' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8fa3bf' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a1624' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1e3a5f' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#bfcfe8' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a3254' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0f1f38' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#7a90b0' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1e3f6e' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#152e52' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#071520' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d5a7a' }] },
];

/**
 * Returns today's estimated collection day (1–5).
 * Based on reference point: March 10, 2026 = Day 3.
 * NOTE: This is a placeholder calculation — it does not account for
 * holidays or schedule changes. Replace with backend data when available.
 */
export function getTodayCollectionDay() {
  const REF_DATE = new Date(2026, 2, 10); // March 10, 2026
  const REF_DAY = 3;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  REF_DATE.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today - REF_DATE) / (1000 * 60 * 60 * 24));
  return ((REF_DAY - 1 + diffDays) % 5 + 5) % 5 + 1;
}
