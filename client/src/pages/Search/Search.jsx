import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { FaSearch, FaPlay, FaMusic, FaUser, FaCompactDisc, FaBolt } from "react-icons/fa";
import { getSongs } from "../../services/api";
import { useMusic } from "../../context/PlayerContext";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext"; // Connect to Global Settings
import SongCard from "../../components/SongCard/SongCard";
import "./Search.css";

const CATEGORIES = ["All", "Songs", "Artists", "Albums"];

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const { playSong } = useMusic();
  const { showToast } = useToast();
  
  // Extract the translation 't' and active 'theme'
  const { t, theme } = useSettings();

  const [allSongs, setAllSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  // Helper to map category names to translation keys
  const getCategoryTranslation = (cat) => {
    switch (cat) {
      case "All": return t("all");
      case "Songs": return t("songsTab");
      case "Artists": return t("artists");
      case "Albums": return t("albums");
      default: return cat;
    }
  };

  // Fetch all songs once on mount
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getSongs()
      .then((res) => {
        if (isMounted) setAllSongs(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching songs:", err);
        if (isMounted) showToast(t("failedFetchSearch"), "error");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [showToast, t]);

  const filteredSongs = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    return allSongs.filter((song) => {
      const title = (song.title || song.songName || song.name || "").toLowerCase();
      const artist = (song.artist || song.artistName || song.singers || "").toLowerCase();
      const album = (song.album || song.movie || "").toLowerCase();

      return title.includes(q) || artist.includes(q) || album.includes(q);
    });
  }, [allSongs, query]);

  const artistMatches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return allSongs.filter((song) => {
      const artist = (song.artist || song.artistName || song.singers || "").toLowerCase();
      return artist.includes(q);
    });
  }, [allSongs, query]);

  const albumMatches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return allSongs.filter((song) => {
      const album = (song.album || song.movie || "").toLowerCase();
      return album.includes(q);
    });
  }, [allSongs, query]);

  const topResult = filteredSongs.length > 0 ? filteredSongs[0] : null;

  const handlePlayTopResult = (song) => {
    if (playSong && song) {
      const songTitle = song.title || song.songName || song.name || "Track";
      playSong(song, filteredSongs);
      showToast(`${t("playingTrack")} "${songTitle}" 🎵`, "info");
    }
  };

  return (
    // Applied active global theme
    <div className={`search-page theme-${theme}`}>
      {/* Category Filter Pills */}
      <div className="search-filter-pills">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`filter-pill ${activeFilter === cat ? "active" : ""}`}
            onClick={() => setActiveFilter(cat)}
          >
            {getCategoryTranslation(cat)}
          </button>
        ))}
      </div>

      {!query.trim() ? (
        <div className="search-placeholder">
          <FaSearch className="placeholder-icon" />
          <h2>{t("searchVibeify")}</h2>
          <p>{t("searchSubtitle")}</p>
        </div>
      ) : loading ? (
        <div className="search-loading-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-img" />
              <div className="skeleton-text short" />
              <div className="skeleton-text" />
            </div>
          ))}
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="search-empty">
          <h3>{t("noResultsFor")} "{query}"</h3>
          <p>{t("checkSpelling")}</p>
        </div>
      ) : (
        <div className="search-results-container">
          
          {/* TAB: ALL */}
          {activeFilter === "All" && (
            <>
              {topResult && (
                <section className="top-result-section">
                  <h2>
                    <FaBolt className="section-icon" /> {t("topResult")}
                  </h2>
                  <div className="top-result-card" onClick={() => handlePlayTopResult(topResult)}>
                    <div className="top-result-img-wrap">
                      <img
                        src={topResult.image || topResult.coverUrl || topResult.img}
                        alt={topResult.title || topResult.songName}
                      />
                    </div>
                    <span className="top-result-badge">{t("songLabel")}</span>
                    <h3 className="top-result-title">
                      {topResult.title || topResult.songName || topResult.name}
                    </h3>
                    <p className="top-result-artist">
                      {topResult.artist || topResult.artistName || topResult.singers || "Artist"}
                    </p>
                    
                    <button className="top-result-play-btn" aria-label="Play">
                      <FaPlay size={14} />
                    </button>
                  </div>
                </section>
              )}

              <section className="search-section">
                <h2>
                  <FaMusic className="section-icon" /> {t("songsTab")}
                </h2>
                <div className="song-grid">
                  {filteredSongs.map((song) => (
                    <SongCard key={song._id || song.id} song={song} songList={filteredSongs} />
                  ))}
                </div>
              </section>
            </>
          )}

          {/* TAB: SONGS */}
          {activeFilter === "Songs" && (
            <section className="search-section">
              <h2>
                <FaMusic className="section-icon" /> {t("songsTab")}
              </h2>
              <div className="song-grid">
                {filteredSongs.map((song) => (
                  <SongCard key={song._id || song.id} song={song} songList={filteredSongs} />
                ))}
              </div>
            </section>
          )}

          {/* TAB: ARTISTS */}
          {activeFilter === "Artists" && (
            <section className="search-section">
              <h2>
                <FaUser className="section-icon" /> {t("artists")}
              </h2>
              {artistMatches.length === 0 ? (
                <p className="tab-empty-msg">{t("noArtistsMatched")}</p>
              ) : (
                <div className="song-grid">
                  {artistMatches.map((song) => (
                    <SongCard key={song._id || song.id} song={song} songList={artistMatches} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* TAB: ALBUMS */}
          {activeFilter === "Albums" && (
            <section className="search-section">
              <h2>
                <FaCompactDisc className="section-icon" /> {t("albums")}
              </h2>
              {albumMatches.length === 0 ? (
                <p className="tab-empty-msg">{t("noAlbumsMatched")}</p>
              ) : (
                <div className="song-grid">
                  {albumMatches.map((song) => (
                    <SongCard key={song._id || song.id} song={song} songList={albumMatches} />
                  ))}
                </div>
              )}
            </section>
          )}

        </div>
      )}
    </div>
  );
}