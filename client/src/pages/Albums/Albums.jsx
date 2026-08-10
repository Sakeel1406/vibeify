import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaMusic } from "react-icons/fa6";
import { getSongs } from "../../services/api";
import { useSettings } from "../../context/SettingsContext"; 
import "./Albums.css";

const Albums = () => {
  const navigate = useNavigate();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { t, theme } = useSettings();

  useEffect(() => {
    getSongs()
      .then((res) => setSongs(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const albumMap = {};
  songs.forEach((song) => {
    const albumName = song.album?.trim() || t("singleRelease");
    if (!albumMap[albumName]) {
      albumMap[albumName] = {
        name: albumName,
        image: song.image,
        artist: song.artist,
        songCount: 0,
      };
    }
    albumMap[albumName].songCount += 1;
  });

  const albums = Object.values(albumMap).sort((a, b) => b.songCount - a.songCount);

  return (
    <div className={`albums-page theme-${theme}`}>
      <div className="ambient-glow glow-top-left" />
      <div className="ambient-glow glow-top-right" />

      {/*  Header with matching Cyber Vinyl & Music Note Icon Box Style */}
      <div className="albums-header-wrap">
        <div className="library-title-group" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className="header-icon-box" style={{ 
            width: "56px", 
            height: "56px", 
            background: "var(--accent-gradient)", 
            borderRadius: "16px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            color: "#ffffff",
            boxShadow: "0 8px 25px var(--accent-glow)",
            flexShrink: 0
          }}>
            <svg 
              viewBox="0 0 24 24" 
              width="26" 
              height="26" 
              fill="currentColor"
            >
              <circle cx="9" cy="13" r="7.5" fill="currentColor" opacity="0.25"/>
              <circle cx="9" cy="13" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
              <circle cx="9" cy="13" r="3.5" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1 1"/>
              <circle cx="9" cy="13" r="1.5" fill="currentColor"/>
              <path d="M19 4v7.25c-.34-.15-.72-.25-1.12-.25-1.59 0-2.88 1.29-2.88 2.88s1.29 2.88 2.88 2.88 2.88-1.29 2.88-2.88V7h3V4h-4.76z" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <h1 className="albums-title" style={{ margin: 0 }}>
              <span className="title-text-gradient">{t("albums")}</span>
            </h1>
            <p className="albums-subtitle" style={{ margin: "4px 0 0 0" }}>Explore trending collections and curated artist discographies</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="albums-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="album-skeleton">
              <div className="skeleton-img" />
              <div className="skeleton-text short" />
            </div>
          ))}
        </div>
      ) : albums.length === 0 ? (
        <div className="albums-empty">
          <FaMusic className="empty-disc-icon" />
          <p>{t("noAlbumsYet")}</p>
          <span className="muted">{t("songsWillGroup")}</span>
        </div>
      ) : (
        <div className="albums-grid">
          {albums.map((album, index) => (
            <div
              key={album.name}
              className="album-card animate-stagger"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => navigate(`/album/${encodeURIComponent(album.name)}`)}
            >
              <div className="album-art-wrap">
                <img src={album.image} alt={album.name} />
                <div className="album-hover-overlay">
                  <span className="explore-tag">Explore</span>
                </div>
              </div>
              <div className="album-name" title={album.name}>{album.name}</div>
              <div className="album-meta">
                {album.songCount} {album.songCount === 1 ? t("song") : t("songs")} • {album.artist}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Albums;