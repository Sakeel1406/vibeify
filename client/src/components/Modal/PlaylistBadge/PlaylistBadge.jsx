import React from "react";
import { FaGlobe, FaLock } from "react-icons/fa";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext"; // 👈 Import Settings Context
import "./PlaylistBadge.css";

export const PlaylistBadge = ({ isPublic = true, onClick, interactive = false }) => {
  const { showToast } = useToast();
  const { t } = useSettings(); //  Extract translation function

  const handleClick = (e) => {
    e.stopPropagation();

    // If an external click handler is provided (e.g. to toggle privacy)
    if (onClick) {
      onClick(e);
      return;
    }

    // Informational toast on click when interactive
    if (interactive) {
      if (isPublic) {
        showToast(t("publicPlaylistToastDesc"), "info");
      } else {
        showToast(t("privatePlaylistToastDesc"), "info");
      }
    }
  };

  return (
    <span
      className={`playlist-privacy-badge ${isPublic ? "public" : "private"} ${
        interactive ? "interactive" : ""
      }`}
      onClick={handleClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {isPublic ? (
        <FaGlobe className="badge-icon" />
      ) : (
        <FaLock className="badge-icon" />
      )}
      <span>{isPublic ? t("public") : t("private")}</span>
    </span>
  );
};

export default PlaylistBadge;