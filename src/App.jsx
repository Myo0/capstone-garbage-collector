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
          <div>Last Collection Date</div>
          <span>XX Date</span>
        </div>

        <div className="center-panel">

          {address && <AddressDisplay address={address} />}

          <MapSection address={address} />

          <SearchSection address={address} setAddress={setAddress}/>
          
        </div>

        <div className="collection-date right">
          <div>Next Collection Date</div>
          <span>XX Date</span>
        </div>

      </div>
      <Footer />
    </div>
  );
}

export default App;
