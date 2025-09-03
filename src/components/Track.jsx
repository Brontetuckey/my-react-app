import React, { useState, useRef } from "react";

export default function Track({ track, onAdd, onRemove, isRemoval }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const renderAction = () => (
    isRemoval ? (
      <button className="track-button" onClick={() => onRemove(track)}>
        -
      </button>
    ) : (
      <button className="track-button" onClick={() => onAdd(track)}>
        +
      </button>
    )
  );

  return (
    <div className="track-row">
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Audio preview or Spotify embed */}
        {track.preview ? (
          <>
            <button className="audio-preview track-button" onClick={handlePlayPause}>
              {isPlaying ? "⏸" : "▶️"}
            </button>
            <audio
              ref={audioRef}
              src={track.preview}
              onEnded={() => setIsPlaying(false)}
            />
          </>
        ) : (
          <iframe
            title={`spotify-embed-${track.id}`}
            src={`https://open.spotify.com/embed/track/${track.id}`}
            width="700"
            height="80"
            frameBorder="0"
            allowtransparency="true"
            allow="encrypted-media"
            style={{ borderRadius: "5px" }}
          />
        )}
      </div>

      {/* Add/Remove button */}
      {renderAction()}
    </div>
  );
}