import React from "react";
import Track from "./Track";

export default function Tracklist({ tracks, onAdd, onRemove, isRemoval }) {
  return (
    <div className="tracklist">
      {tracks.map((track) => (
        <Track
          key={track.id}
          track={track}
          onAdd={onAdd ? onAdd : () => {}}
          onRemove={onRemove ? onRemove : () => {}}
          isRemoval={isRemoval}
        />
      ))}
    </div>
  );
}
