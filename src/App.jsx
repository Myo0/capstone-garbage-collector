import { useState } from "react";
import "./App.css";

import Header from "./components/Header";
import AddressDisplay from "./components/AddressDisplay";
import MapSection from "./components/MapSection";
import SearchSection from "./components/SearchSection";
import Footer from "./components/Footer";

function App() {
  const [address, setAddress] = useState("");

  return (
    <div className="app">
      <Header />

      <div className="main-content">

        <div className="collection-date left">
          <div className="label">Last Collection</div>
          <div className="date-value">XX Date</div>
        </div>

        <div className="center-panel">

          {address && <AddressDisplay address={address} />}

          <MapSection address={address} />

          <SearchSection address={address} setAddress={setAddress}/>
          
        </div>

        <div className="collection-date right">
          <div className="label">Next Collection</div>
          <div className="date-value">XX Date</div>
        </div>

      </div>
      <Footer />
    </div>
  );
}

export default App;
