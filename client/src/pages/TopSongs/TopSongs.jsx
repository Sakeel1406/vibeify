import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../../context/PlayerContext";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import * as api from "../../services/api";
import "./TopSongs.css";

export default function TopSongs() {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const { showToast } = useToast();
  const { user } = useAuth();
  
  const { t, theme } = useSettings(); 

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("global"); 
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTopSongs();
  }, []);

  const fetchTopSongs = async () => {
    try {
      setLoading(true);
      let res;

      try {
        if (api.getTopSongs) res = await api.getTopSongs();
      } catch (err) {
        console.warn("/songs/top endpoint unavailable, trying fallback...");
      }

      if (!res?.data || (Array.isArray(res.data) && res.data.length === 0)) {
        if (api.getSongs) res = await api.getSongs();
      }

      const songData = res?.data?.songs || res?.data || [];

      if (Array.isArray(songData) && songData.length > 0) {
        setSongs(songData);
      } else {
        setSongs([]);
      }
    } catch (err) {
      console.warn("Error fetching chart data:", err);
      showToast(t("failedToLoadTop"), "error");
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSongs = useMemo(() => {
    let result = songs.filter((song) => {
      const title = song.title || song.name || "";
      const artist = song.artist || song.artistName || "";
      const album = song.album || "";
      const q = searchQuery.toLowerCase();

      return (
        title.toLowerCase().includes(q) ||
        artist.toLowerCase().includes(q) ||
        album.toLowerCase().includes(q)
      );
    });

    if (activeTab === "trending") {
      const filtered = result.filter((s) => (s.plays || 0) > 1000 || s.isTrending);
      return filtered.length > 0 ? filtered : result.slice(0, Math.ceil(result.length / 2) || 1);
    }

    if (activeTab === "viral") {
      const filtered = result.filter((s) => s.isLiked || s.isViral);
      return filtered.length > 0 ? filtered : result.slice(1) || result;
    }

    return result;
  }, [songs, searchQuery, activeTab]);

  const getSongId = (s, idx) => {
    if (!s) return null;
    return String(s._id || s.id || s.songId || s.url || (idx !== undefined ? `track-${idx}` : ""));
  };

  const handlePlaySong = (e, song, index) => {
    if (e) e.stopPropagation();

    const normalizedSong = {
      ...song,
      _id: song._id || song.id || song.songId || `song-${index}`,
      id: song.id || song._id || song.songId || `song-${index}`,
      title: song.title || song.name || "Unknown Track",
      artist: song.artist || song.artistName || "Unknown Artist",
      album: song.album || "Single",
      coverUrl: song.coverUrl || song.imageUrl || song.image || `https://picsum.photos/200/200?random=${index}`,
      audioUrl: song.audioUrl || song.url || song.audio || song.songUrl || song.src,
      url: song.url || song.audioUrl || song.audio || song.songUrl || song.src
    };

    const activeId = getSongId(currentTrack);
    const targetId = getSongId(normalizedSong, index);

    if (activeId && targetId && activeId === targetId) {
      if (togglePlay) togglePlay();
      showToast(isPlaying ? `${t("pausedTrack")} "${normalizedSong.title}"` : `${t("resumedTrack")} "${normalizedSong.title}"`, "info");
    } else {
      if (playTrack) {
        const normalizedList = filteredSongs.map((s, i) => ({
          ...s,
          _id: s._id || s.id || s.songId || `song-${i}`,
          id: s.id || s._id || s.songId || `song-${i}`,
          title: s.title || s.name || "Unknown Track",
          artist: s.artist || s.artistName || "Unknown Artist",
          album: s.album || "Single",
          coverUrl: s.coverUrl || s.imageUrl || s.image || `https://picsum.photos/200/200?random=${i}`,
          audioUrl: s.audioUrl || s.url || s.audio || s.songUrl || s.src,
          url: s.url || s.audioUrl || s.audio || s.songUrl || s.src
        }));

        playTrack(normalizedSong, normalizedList, index);
        showToast(`${t("nowPlayingTrack")} ${normalizedSong.title}`, "info");
      }
    }
  };

  const handleLike = async (e, song, songId) => {
    e.stopPropagation();

    if (!user) {
      showToast(t("loginToSaveFav"), "error");
      return;
    }

    const currentlyLiked = Boolean(song.isLiked);
    const nextLikedState = !currentlyLiked;
    const songTitle = song?.title || song?.name || "Track";

    setSongs((prev) =>
      prev.map((s) => {
        const id = String(s._id || s.id);
        if (id === String(songId)) {
          return { ...s, isLiked: nextLikedState };
        }
        return s;
      })
    );

    try {
      if (api.toggleLikeSong) {
        await api.toggleLikeSong(songId);
      }

      if (nextLikedState) {
        showToast(`${t("addedTo")} "${songTitle}" ❤️`, "like");
      } else {
        showToast(`${t("removedFromLikedSongs")} "${songTitle}"`, "info");
      }
    } catch (err) {
      console.error("Like toggle failed:", err);

      setSongs((prev) =>
        prev.map((s) => {
          const id = String(s._id || s.id);
          if (id === String(songId)) {
            return { ...s, isLiked: currentlyLiked };
          }
          return s;
        })
      );

      if (err.response?.status === 401) {
        showToast(t("loginToSaveFav"), "error");
      } else {
        showToast(t("failedToAddTrack"), "error");
      }
    }
  };

  const handleShare = async (e, song) => {
    e.stopPropagation();
    const songId = song._id || song.id;
    const shareLink = `${window.location.origin}/song/${songId}`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareLink);
        showToast(t("linkCopied"), "share");
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        showToast(t("linkCopied"), "share");
      }
    } catch (err) {
      showToast(t("failedToCopy"), "error");
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "3:30";
    if (typeof seconds === "string" && seconds.includes(":")) return seconds;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className={`top-songs-container theme-${theme}`}>
      {/* Hero Banner */}
      <div className="top-songs-hero">
        <div className="hero-glow-orb" />
        <div className="hero-content">
          <div className="header-icon-box">
            {/* Custom Premium Music Star SVG (Clean) */}
            <svg className="header-fire-icon" viewBox="0 0 24 24" fill="currentColor" style={{ transform: "scale(1.15)" }}>
              <path d="M15.5 1.5l2.4 5.5 6.1.5-4.6 4 1.4 5.9-5.3-3.2-5.3 3.2 1.4-5.9-4.6-4 6.1-.5L15.5 1.5z" fill="currentColor" opacity="0.25"/>
              <path d="M14 6v8.5c0 1.4-1.1 2.5-2.5 2.5S9 15.9 9 14.5s1.1-2.5 2.5-2.5V9h-4v7.5c0 1.4-1.1 2.5-2.5 2.5S2.5 17.9 2.5 16.5 3.6 14 5 14v-8c0-.6.4-1 1-1h7c.6 0 1 .4 1 1z" fill="currentColor" />
            </svg>
          </div>
          <div className="header-details">
            <span className="header-badge">
              <svg className="badge-icon" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="currentColor" opacity="0.3"/>
                <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg> 
              {t("streamVibezz")}
            </span>
            <h1 className="header-title">{t("vibeifyTop")}</h1>
            <p className="header-subtitle">
              {t("discoverTop")}
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="charts-controls-bar">
        <div className="chart-tabs">
          <button 
            className={`tab-btn ${activeTab === "global" ? "active" : ""}`} 
            onClick={() => setActiveTab("global")}
          >
            {/* New Stylish Diamond Sparkle Star for Top Vibezz */}
            <svg className="tab-icon-inline cyan" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style={{ verticalAlign: "middle" }}>
              <path d="M12 1L14.5 9.5L23 12L14.5 14.5L12 23L9.5 14.5L1 12L9.5 9.5L12 1Z" fill="currentColor" opacity="0.2"/>
              <path d="M12 1L14.5 9.5L23 12L14.5 14.5L12 23L9.5 14.5L1 12L9.5 9.5L12 1Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
            </svg>
            {t("topVibezz")}
          </button>
          
          <button 
            className={`tab-btn ${activeTab === "trending" ? "active" : ""}`} 
            onClick={() => setActiveTab("trending")}
          >
            {/* New Stylish Bar Chart for Trending Vibezz */}
            <svg className="tab-icon-inline pink" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style={{ verticalAlign: "middle" }}>
              <rect x="4" y="14" width="4" height="6" rx="1" fill="currentColor" opacity="0.3"/>
              <rect x="10" y="9" width="4" height="11" rx="1" fill="currentColor" opacity="0.6"/>
              <rect x="16" y="4" width="4" height="16" rx="1" fill="currentColor"/>
            </svg>
            {t("trendingVibezz")}
          </button>
          
          <button 
            className={`tab-btn ${activeTab === "viral" ? "active" : ""}`} 
            onClick={() => setActiveTab("viral")}
          >
            <svg className="tab-icon-inline violet" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style={{ verticalAlign: "middle" }}>
              <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="currentColor" opacity="0.3"/>
              <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg> 
            {t("viralVibezz")}
          </button>
        </div>

        <div className="chart-search-box">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            type="text" 
            placeholder={t("filterVibezz")} 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="vibe-spinner" />
          <p>{t("fetchingVibezz")}</p>
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="empty-chart-state">
          <svg className="empty-icon" viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
            <path d="M9 18c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm12-11H12v6.61A3.984 3.984 0 0 0 9 10c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5V7h6v2z" opacity="0.3"/>
            <path d="M9 18c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm12-11H12v6.61A3.984 3.984 0 0 0 9 10c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5V7h6v2z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>{t("noVibezzFound")}</h3>
          <p>{t("adjustSearch")}</p>
        </div>
      ) : (
        <div className="songs-list-wrapper">
          <div className="songs-table-header">
            <span className="col-rank">#</span>
            <span className="col-title">{t("title")}</span>
            <span className="col-album hide-mobile">{t("album")}</span>
            <span className="col-duration hide-mobile">
              <svg viewBox="0 0 24 24" width="1.2em" height="1.2em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle" }}>
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </span>
            <span className="col-action">{t("actions")}</span>
          </div>

          <div className="songs-list">
            {filteredSongs.map((song, index) => {
              const songId = getSongId(song, index);
              const activeId = getSongId(currentTrack);
              const isCurrent = activeId !== null && activeId === songId;
              const isTrackPlaying = isCurrent && isPlaying;
              const rank = index + 1;

              return (
                <div
                  key={songId || index}
                  className={`song-row ${isCurrent ? "active-track" : ""} ${rank <= 3 ? `top-rank-${rank}` : ""}`}
                  onClick={(e) => handlePlaySong(e, song, index)}
                >
                  <div className="col-rank rank-cell" style={{ pointerEvents: "none" }}>
                    {rank <= 3 ? (
                      /* Custom Geometric Top Rank Shield SVG */
                      <svg 
                        className={`trophy-icon crown-icon ${rank === 1 ? "gold" : rank === 2 ? "silver" : "bronze"}`} 
                        viewBox="0 0 24 24" 
                        width="1.8em" 
                        height="1.8em"
                        style={{ 
                          filter: rank === 1 ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.7))' : 
                                  rank === 2 ? 'drop-shadow(0 0 8px rgba(148, 163, 184, 0.7))' : 
                                               'drop-shadow(0 0 8px rgba(217, 119, 6, 0.7))'
                        }}
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" opacity="0.2" />
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        <path d="M12 7l1.5 3 3 .5-2 2 .5 3-3-1.5-3 1.5.5-3-2-2 3-.5z" fill="currentColor" />
                      </svg>
                    ) : (
                      <span className="rank-number">{rank}</span>
                    )}

                    <div className="row-play-btn">
                      {isTrackPlaying ? (
                        <svg viewBox="0 0 24 24" width="1.2em" height="1.2em" fill="currentColor">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="1.2em" height="1.2em" fill="currentColor" style={{ marginLeft: "2px" }}>
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      )}
                    </div>
                  </div>

                  <div className="col-title song-info-cell" style={{ pointerEvents: "none" }}>
                    <div className="cover-wrapper">
                      <img
                        src={song.coverUrl || song.imageUrl || song.image || `https://picsum.photos/200/200?random=${index}`}
                        alt={song.title || song.name}
                        className="song-cover"
                      />
                      {isTrackPlaying && (
                        <div className="cyber-equalizer">
                          <span className="eq-bar bar-1" />
                          <span className="eq-bar bar-2" />
                          <span className="eq-bar bar-3" />
                        </div>
                      )}
                    </div>

                    <div className="song-text">
                      <span className={`song-name truncate ${isCurrent ? "text-pink" : ""}`}>
                        {song.title || song.name}
                      </span>
                      <span className="song-artist truncate">
                        {song.artist || song.artistName || "Unknown Artist"}
                      </span>
                    </div>
                  </div>

                  <div className="col-album hide-mobile song-album truncate" style={{ pointerEvents: "none" }}>
                    {song.album || "Single"}
                  </div>

                  <div className="col-duration hide-mobile song-duration" style={{ pointerEvents: "none" }}>
                    {formatDuration(song.duration)}
                  </div>

                  <div className="col-action song-actions-cell">
                    <button
                      className={`action-btn like-btn ${song.isLiked ? "liked" : ""}`}
                      onClick={(e) => handleLike(e, song, songId)}
                      type="button"
                    >
                      {song.isLiked ? (
                        <svg viewBox="0 0 24 24" width="1.2em" height="1.2em" fill="currentColor">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="1.2em" height="1.2em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      )}
                    </button>

                    <button
                      className="action-btn share-btn"
                      onClick={(e) => handleShare(e, song)}
                      type="button"
                    >
                      <svg viewBox="0 0 24 24" width="1.2em" height="1.2em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}