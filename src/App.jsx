import React, { useState, useEffect } from "react";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import Playlist from "./components/Playlist";
import Spotify from "./Spotify";
import "./App.css";

export default function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState("");
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [token, setToken] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Restore playlist state from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("playlistName");
    const savedTracks = JSON.parse(localStorage.getItem("playlistTracks")) || [];
    if (savedName) setPlaylistName(savedName);
    if (savedTracks.length) setPlaylistTracks(savedTracks);
  }, []);

  // Persist playlist state to localStorage
  useEffect(() => {
    localStorage.setItem("playlistName", playlistName);
    localStorage.setItem("playlistTracks", JSON.stringify(playlistTracks));
  }, [playlistName, playlistTracks]);

  // Get token on load
  useEffect(() => {
    const init = async () => {
      const accessToken = await Spotify.getAccessToken();
      if (accessToken) setToken(accessToken);

      // Restore last search after redirect
      const lastSearch = localStorage.getItem("lastSearch");
      if (lastSearch) {
        handleSearch(lastSearch);
        localStorage.removeItem("lastSearch");
      }
    };
    init();
  }, []);

  const handleSearch = async (query) => {
    localStorage.setItem("lastSearch", query); // save search before redirect
    const results = await Spotify.search(query);

    // Filter out duplicates already in playlist
    const filteredResults = results.filter(
      (track) => !playlistTracks.find((t) => t.id === track.id)
    );
    setSearchResults(filteredResults);
  };

  const addTrack = (track) => {
    if (!playlistTracks.find((t) => t.id === track.id)) {
      setPlaylistTracks([...playlistTracks, track]);
    }
  };

  const removeTrack = (track) => {
    setPlaylistTracks(playlistTracks.filter((t) => t.id !== track.id));
  };

  const savePlaylist = async () => {
    if (!token) {
      alert("Log in to Spotify to save your playlist");
      return;
    }
    setIsSaving(true);
    const trackUris = playlistTracks.map((t) => t.uri);
    await Spotify.savePlaylist(playlistName || "New Playlist", trackUris);
    setIsSaving(false);
    setPlaylistName("");
    setPlaylistTracks([]);
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Jammming</h1>

      <div className="main-content">
        <div className="left-column">
          <SearchBar onSearch={handleSearch} />
          <SearchResults searchResults={searchResults} onAdd={addTrack} />
        </div>

        <div className="right-column">
          <Playlist
            playlistName={playlistName}
            setPlaylistName={setPlaylistName}
            tracks={playlistTracks}
            onRemove={removeTrack}
            onSave={savePlaylist}
          />
          {isSaving && <div className="loading">🎵 Saving your playlist...</div>}
        </div>
      </div>

      {!token && (
        <div className="spotify-login-section">
          <button onClick={() => Spotify.getAccessToken()}>
            Log in to Spotify
          </button>
          <p>You need to log in to Spotify to save playlists.</p>
        </div>
      )}
    </div>
  );
}