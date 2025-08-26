import React, { useState, useEffect } from "react";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import Playlist from "./components/Playlist";
import Spotify from "./Spotify";
import "./App.css";

export default function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState("My Playlist");
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [token, setToken] = useState(null);

  // On mount, get access token
  useEffect(() => {
    const init = async () => {
      const accessToken = await Spotify.getAccessToken();
      if (accessToken) setToken(accessToken);
    };
    init();
  }, []);

  // Search Spotify
  const handleSearch = async (query) => {
    if (!query) return;
    const results = await Spotify.search(query);
    setSearchResults(results);
  };

  // Add track to playlist
  const addTrack = (track) => {
    if (!playlistTracks.find((t) => t.id === track.id)) {
      setPlaylistTracks([...playlistTracks, track]);
    }
  };

  // Remove track from playlist
  const removeTrack = (track) => {
    setPlaylistTracks(playlistTracks.filter((t) => t.id !== track.id));
  };

  // Save playlist to Spotify
  const savePlaylist = async () => {
    if (!token) {
      alert("Log in to Spotify to save your playlist");
      return;
    }
    if (!playlistTracks.length) {
      alert("Add tracks to your playlist first!");
      return;
    }

    const trackUris = playlistTracks.map((t) => t.uri);
    await Spotify.savePlaylist(playlistName || "New Playlist", trackUris);

    // Reset playlist
    setPlaylistTracks([]);
    setPlaylistName("My Playlist");
    alert("Playlist saved to Spotify!");
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Jammming</h1>

      <div className="main-content">
        {/* Left: Search */}
        <div className="left-column">
          <SearchBar onSearch={handleSearch} />
          <SearchResults searchResults={searchResults} onAdd={addTrack} />
        </div>

        {/* Right: Playlist */}
        <div className="right-column">
          <Playlist
            playlistName={playlistName}
            setPlaylistName={setPlaylistName}
            tracks={playlistTracks}
            onRemove={removeTrack}
            onSave={savePlaylist}
          />
        </div>
      </div>

      {/* Only show login button if no token */}
      {!token && (
        <div className="spotify-login-section">
          <button onClick={() => Spotify.getAccessToken()}>Log in to Spotify</button>
          <p>You need to log in to Spotify to save playlists.</p>
        </div>
      )}
    </div>
  );
}
