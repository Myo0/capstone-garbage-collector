function formatDate(dateStr) {
  if (!dateStr) return '—';
  const datePart = String(dateStr).slice(0, 10);
  const d = new Date(datePart + 'T12:00:00');
  return d.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' });
}

function UpcomingCollections({ upcoming, zoneColor }) {
  if (!upcoming || upcoming.length === 0) return null;

  return (
    <div className="upcoming-collections">
      <div className="upcoming-title">Upcoming Collections</div>
      <ul className="upcoming-list">
        {upcoming.map((item, idx) => (
          <li key={idx} className={idx === 0 ? 'upcoming-next' : ''}>
            <span className="upcoming-date">{formatDate(item.date)}</span>
            {item.rec_type && (
              <span className="upcoming-rec">{item.rec_type}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UpcomingCollections;
