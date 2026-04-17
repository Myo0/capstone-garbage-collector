export const ZONE_COLORS = {
  'Day 1 Garbage Collection Zone': '#f87171',
  'Day 2 Garbage Collection Zone': '#c084fc',
  'Day 3 Garbage Collection Zone': '#60a5fa',
  'Day 4 Garbage Collection Zone': '#4ade80',
  'Day 5 Garbage Collection Zone': '#facc15',
};

// Corner Brook city center
export const CORNER_BROOK_CENTER = { lat: 48.9519, lng: -57.95 };

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
