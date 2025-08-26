import React, { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleChange = (event) => setQuery(event.target.value);

  const handleSearch = () => {
    if (onSearch && query.trim() !== "") {
      onSearch(query.trim()); // calls Spotify.search() from App.jsx
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") handleSearch();
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Enter a song, album or artist"
        value={query}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        className="search-input"
      />
      <button onClick={handleSearch} className="search-button">
        Search
      </button>
    </div>
  );
}
