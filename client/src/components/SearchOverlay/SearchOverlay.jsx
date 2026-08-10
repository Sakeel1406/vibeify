import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiFire } from 'react-icons/hi';
import { IoClose } from 'react-icons/io5';
import { FiSearch } from 'react-icons/fi';
import { useMusic } from '../../context/PlayerContext';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext'; // Import Settings
import { getSongs } from '../../services/api';
import './SearchOverlay.css';

// LOCAL IMAGE IMPORTS
import anirudhImg from '../../assets/images/anirudh.jpg';
import dheemaImg from '../../assets/images/dheema.jpg';
import godModeImg from '../../assets/images/god-mode.jpg';
import hiphopImg from '../../assets/images/hiphop-tamizha.jpg';
import thalapathyImg from '../../assets/images/thalapathy-kacheri.jpg';

const DEFAULT_TRENDING = [
  { id: 't1', title: 'God Mode', type: 'Song', subtitle: 'Karuppu', image: godModeImg },
  { id: 't2', title: 'Dheema', type: 'Song', subtitle: 'Love Insurance Kompany', image: dheemaImg },
  { id: 't3', title: 'Anirudh Ravichander', type: 'Artist', subtitle: 'Artist', image: anirudhImg },
  { id: 't4', title: 'Thalapathy Kacheri', type: 'Song', subtitle: 'Single', image: thalapathyImg },
  { id: 't5', title: 'Hiphop Tamizha', type: 'Artist', subtitle: 'Artist', image: hiphopImg },
];

export default function SearchOverlay({
  songList: propSongList = [],
  query: externalQuery,
  onSearchChange,
  onSearchSubmit,
  onSelectSong,
}) {
  const navigate = useNavigate();
  const { playSong } = useMusic();
  const { showToast } = useToast();
  
  // Extract translation function and dynamic theme
  const { t, theme } = useSettings();

  const [internalTerm, setInternalTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [localCatalog, setLocalCatalog] = useState([]);
  const containerRef = useRef(null);

  // Auto fetch songs if parent passed empty propSongList
  useEffect(() => {
    if (propSongList && propSongList.length > 0) {
      setLocalCatalog(propSongList);
    } else {
      getSongs()
        .then((res) => setLocalCatalog(res.data || []))
        .catch(() => setLocalCatalog([]));
    }
  }, [propSongList]);

  const activeCatalog = propSongList.length > 0 ? propSongList : localCatalog;
  const searchTerm = externalQuery !== undefined ? externalQuery : internalTerm;

  // Flexible multi-field backend catalog filter
  const filteredResults = activeCatalog.filter((song) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return false;

    const title = (song.title || song.songName || song.name || '').toLowerCase();
    const artist = (song.artist || song.artistName || song.singers || '').toLowerCase();
    const album = (song.album || song.movie || '').toLowerCase();

    return title.includes(q) || artist.includes(q) || album.includes(q);
  });

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSelectedIndex(-1);
    if (onSearchChange) onSearchChange(val);
    else setInternalTerm(val);
  };

  const clearSearch = () => {
    setSelectedIndex(-1);
    if (onSearchChange) onSearchChange('');
    else setInternalTerm('');
  };

  // Track Play Function
  const triggerPlay = (track) => {
    setIsFocused(false);
    const trackTitle = track.title || track.songName || track.name || "Track";
    showToast(`${t("playingTrack")} "${trackTitle}" 🎵`, "info");
    
    if (onSelectSong) {
      onSelectSong(track);
    } else if (playSong) {
      playSong(track, activeCatalog);
    }
  };

  // Navigation Handler
  const handleGlobalSearchNavigate = (queryToSearch, silent = false) => {
    setIsFocused(false);
    const targetQuery = queryToSearch || searchTerm;
    if (targetQuery.trim()) {
      if (!silent) {
        showToast(`${t("searchingFor")} "${targetQuery.trim()}"`, "info");
      }
      navigate(`/search?q=${encodeURIComponent(targetQuery.trim())}`);
    }
  };

  const handleSongClick = (song) => {
    setIsFocused(false);
    triggerPlay(song);
  };

  const handleTrendingClick = (item) => {
    setIsFocused(false);

    if (item.type === 'Song') {
      const targetTitle = item.title.toLowerCase().trim();

      const backendSong = activeCatalog.find((s) => {
        const title = (s.title || s.songName || s.name || '').toLowerCase().trim();
        return title.includes(targetTitle) || targetTitle.includes(title);
      });

      if (backendSong) {
        triggerPlay(backendSong);
      } else {
        handleGlobalSearchNavigate(item.title);
      }
    } else {
      handleGlobalSearchNavigate(item.title);
    }
  };

  const handleKeyDownInput = (e) => {
    const activeList = !searchTerm.trim() ? DEFAULT_TRENDING : filteredResults;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < activeList.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : activeList.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && activeList[selectedIndex]) {
        const selected = activeList[selectedIndex];
        if (!searchTerm.trim()) {
          handleTrendingClick(selected);
        } else {
          handleSongClick(selected);
        }
      } else if (onSearchSubmit) {
        setIsFocused(false);
        onSearchSubmit(e);
      } else {
        handleGlobalSearchNavigate();
      }
    }
  };

  const handleKeyDownEvent = useCallback((e) => {
    if (e.key === 'Escape') setIsFocused(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDownEvent);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDownEvent);
    };
  }, [handleKeyDownEvent]);

  return (
    //  Apply active theme class
    <div ref={containerRef} className={`search-overlay-container theme-${theme}`}>
      {/* Search Input Box */}
      <div className={`search-input-box ${isFocused ? 'focused' : ''}`}>
        <FiSearch className="search-icon" />

        <input
          type="text"
          placeholder={t("searchOverlayPlaceholder")}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDownInput}
          className="search-input-field"
        />

        {searchTerm && (
          <button
            onClick={clearSearch}
            className="search-clear-btn"
            type="button"
            aria-label="Clear Search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Floating Dropdown Drawer */}
      {isFocused && (
        <div className="search-dropdown-menu">
          {!searchTerm.trim() ? (
            <div>
              <div className="dropdown-header">
                <span className="dropdown-header-title">
                  <HiFire className="fire-icon-animated" /> {t("trendingSearchesHeader")}
                </span>
                <button
                  type="button"
                  onClick={() => setIsFocused(false)}
                  className="dropdown-close-btn"
                >
                  {t("close")} <IoClose size={14} />
                </button>
              </div>

              <div className="song-results-list">
                {DEFAULT_TRENDING.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => handleTrendingClick(item)}
                    className={`song-result-item ${selectedIndex === idx ? 'selected' : ''}`}
                  >
                    <div className="song-meta">
                      <img
                        src={item.image}
                        alt={item.title}
                        className={item.type === 'Artist' ? 'artist-avatar' : 'song-cover'}
                      />
                      <div className="song-meta-text">
                        <h4 className="song-title">{item.title}</h4>
                        <p className="song-subtitle">
                          {item.type === 'Artist' ? t("artists") : `${t("songLabel")} • ${item.subtitle}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="dropdown-header">
                <span className="dropdown-header-title">
                  {t("resultsForHeader")} "<span className="highlight-query">{searchTerm}</span>"
                </span>
                <button
                  type="button"
                  onClick={() => handleGlobalSearchNavigate()}
                  className="view-all-link"
                >
                  {t("viewAllLink")}
                </button>
              </div>

              {filteredResults.length > 0 ? (
                <div className="song-results-list">
                  {filteredResults.map((song, index) => (
                    <div
                      key={song._id || song.id || index}
                      onClick={() => handleSongClick(song)}
                      className={`song-result-item ${selectedIndex === index ? 'selected' : ''}`}
                    >
                      <div className="song-meta">
                        <img
                          src={song.image || song.coverUrl || song.img}
                          alt={song.title || song.songName || 'Song'}
                          className={song.type === 'artist' ? 'artist-avatar' : 'song-cover'}
                        />
                        <div className="song-meta-text">
                          <h4 className="song-title">{song.title || song.songName || song.name}</h4>
                          <p className="song-subtitle">
                            {song.type === 'artist'
                              ? t("artists")
                              : `${t("songLabel")} • ${song.artist || song.artistName || song.singers || song.album || t("singleRelease")}`}
                          </p>
                        </div>
                      </div>
                      <span className="play-tag">{t("playTag")}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-search-state">
                  <p>{t("noLocalTracksMatch")} "{searchTerm}"</p>
                  <button
                    type="button"
                    onClick={() => handleGlobalSearchNavigate()}
                    className="global-search-btn"
                  >
                    {t("searchGlobalDb")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}