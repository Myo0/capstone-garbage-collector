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
        <button>Official Corner Brook Website</button>
        <button>Share</button>
        <button>Yearly Schedule</button>
      </div>
    </header>
  );
}

export default Header;
