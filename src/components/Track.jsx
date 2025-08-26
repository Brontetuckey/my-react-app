import React from "react";

export default function Track({ track, onAdd, onRemove, isRemoval }) {
  const handleAdd = () => onAdd && onAdd(track);
  const handleRemove = () => onRemove && onRemove(track);

  return (
    <div className="track-row">
      <span>
        {track.name} | {track.artist} | {track.album}
      </span>
      {isRemoval ? (
        <button className="track-button" onClick={handleRemove}>
          -
        </button>
      ) : (
        <button className="track-button" onClick={handleAdd}>
          +
        </button>
      )}
    </div>
  );
}
