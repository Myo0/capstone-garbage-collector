function SearchSection({ address, setAddress }) {
  const hasAddress = address !== "";

  return (
    <div
      className={`search-section ${address ? "shifted" : ""}`}>
      <input type="text" placeholder="Enter your address"/>

      {}
      <button onClick={() =>setAddress("123 Main Street, Corner Brook")}>
        Use Sample Address
      </button>
    </div>
  );
}

export default SearchSection;