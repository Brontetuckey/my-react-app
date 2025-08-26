import React from "react";
import Tracklist from "./Tracklist";

export default function SearchResults({ searchResults, onAdd }) {
  return (
    <div className="search-results">
      <h2>Results</h2>
      <Tracklist tracks={searchResults} onAdd={onAdd} isRemoval={false} />
    </div>
  );
}
