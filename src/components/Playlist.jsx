import React from "react";
import Tracklist from "./Tracklist";

export default function Playlist({ playlistName, setPlaylistName, tracks, onRemove, onSave }) {
  const handleNameChange = (event) => setPlaylistName(event.target.value);

  return (
    <div className="playlist">
      {/* Playlist Name Input */}
      <div className="playlist-header">
        <input
          type="text"
          onChange={handleNameChange}
          placeholder="Enter playlist name"
          className="playlist-input"
        />
        <button
          onClick={onSave}
          disabled={tracks.length === 0}
          className="playlist-save-button"
        >
          Save to Spotify
        </button>
      </div>

      {/* Playlist Tracklist Header */}
      <h2>My Playlist</h2>

      {/* Tracklist */}
      <Tracklist
        tracks={tracks}
        onRemove={onRemove}
        isRemoval={true}
      />
    </div>
  );
};
