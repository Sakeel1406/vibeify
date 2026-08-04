import React from "react";
import { FaGlobe, FaLock } from "react-icons/fa";
import "./PlaylistBadge.css";

export const PlaylistBadge = ({ isPublic = true }) => {
  return (
    <span className={`playlist-privacy-badge ${isPublic ? "public" : "private"}`}>
      {isPublic ? (
        <FaGlobe className="badge-icon" />
      ) : (
        <FaLock className="badge-icon" />
      )}
      <span>{isPublic ? "Public" : "Private"}</span>
    </span>
  );
};

export default PlaylistBadge;