import { getTodayCollectionDay } from '../lib/maps';

const todayDay = getTodayCollectionDay();

function Header() {
  return (
    <header className="header">
      <h1>Corner Brook Garbage Collection</h1>

      <div className="today-pill">
        <span className="today-pill-label">Today</span>
        <span className="today-pill-day">Day {todayDay}</span>
      </div>

      <div className="header-buttons">
        <a href="https://www.cornerbrook.com/city-services-bak/garbage-and-recycling/" target="_blank" rel="noreferrer" className="btn-header-link">Official Corner Brook Website</a>

      </div>
    </header>
  );
}

export default Header;
