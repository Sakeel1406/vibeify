import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiFire } from 'react-icons/hi';
import { IoClose } from 'react-icons/io5';
import { FiSearch, FiMusic, FiUser } from 'react-icons/fi';
import { useMusic } from '../../context/PlayerContext';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { getSongs, getRecentlyPlayed, getArtists } from '../../services/api';
import {
  resolveArtistImage,
  normalizeArtistDisplayName,
  ARTIST_LOCAL_MAP,
} from '../../utils/artistPhotos';
import './SearchOverlay.css';

const formatTitleCase = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

const matchAllowedArtistKey = (rawName) => {
  if (!rawName) return null;
  const clean = rawName.toLowerCase().trim();

  if (ARTIST_LOCAL_MAP[clean]) {
    return normalizeArtistDisplayName(clean);
  }

  for (const key of Object.keys(ARTIST_LOCAL_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return normalizeArtistDisplayName(key);
    }
  }

  return normalizeArtistDisplayName(rawName);
};

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
  const { user } = useAuth();
  const { t, theme } = useSettings();

  const [internalTerm, setInternalTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');
  const [localCatalog, setLocalCatalog] = useState([]);
  const [dbArtists, setDbArtists] = useState([]);
  const [userRecentTracks, setUserRecentTracks] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      propSongList.length > 0 ? Promise.resolve({ data: propSongList }) : getSongs().catch(() => ({ data: [] })),
      getArtists().catch(() => ({ data: [] })),
    ]).then(([songsRes, artistsRes]) => {
      if (!isMounted) return;
      setLocalCatalog(Array.isArray(songsRes.data) ? songsRes.data : songsRes.data?.data || []);
      setDbArtists(Array.isArray(artistsRes.data) ? artistsRes.data : []);
    });

    if (user) {
      getRecentlyPlayed()
        .then((res) => {
          if (!isMounted) return;
          const formattedRecent = (res.data || []).slice(0, 4).map((s) => ({
            id: s._id || s.id,
            title: s.title || s.songName || s.name,
            type: 'Song',
            subtitle: s.artist || s.album || 'Single',
            image: s.image || s.coverUrl || s.img,
            rawSong: s,
          }));
          setUserRecentTracks(formattedRecent);
        })
        .catch(() => setUserRecentTracks([]));
    }

    return () => {
      isMounted = false;
    };
  }, [propSongList, user]);

  const activeCatalog = propSongList.length > 0 ? propSongList : localCatalog;
  const searchTerm = externalQuery !== undefined ? externalQuery : internalTerm;
  const cleanQ = searchTerm.toLowerCase().trim();

  // Exactly 3 Top Artists from Catalog / Database
  const topArtistsList = useMemo(() => {
    const map = new Map();

    dbArtists.forEach((a) => {
      if (!a.name) return;
      const canonical = matchAllowedArtistKey(a.name);
      if (canonical) {
        map.set(canonical.toLowerCase(), {
          id: a._id || canonical,
          name: canonical,
          image: resolveArtistImage(canonical, a.image, null),
          count: 0,
        });
      }
    });

    activeCatalog.forEach((song) => {
      if (!song.artist) return;
      const parts = song.artist.split(/[,&/]| ft\. | feat\. /i).map((p) => p.trim()).filter(Boolean);
      parts.forEach((part) => {
        const canonical = matchAllowedArtistKey(part);
        if (canonical) {
          const key = canonical.toLowerCase();
          if (!map.has(key)) {
            map.set(key, {
              id: key,
              name: canonical,
              image: resolveArtistImage(canonical, null, song.image),
              count: 1,
            });
          } else {
            const item = map.get(key);
            item.count += 1;
            if (!item.image) {
              item.image = resolveArtistImage(canonical, null, song.image);
            }
          }
        }
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [dbArtists, activeCatalog]);

  // Search Results
  const filteredSongs = useMemo(() => {
    if (!cleanQ) return [];
    return activeCatalog.filter((song) => {
      const title = (song.title || song.songName || song.name || '').toLowerCase();
      const artist = (song.artist || song.artistName || song.singers || '').toLowerCase();
      const album = (song.album || song.movie || '').toLowerCase();
      return title.includes(cleanQ) || artist.includes(cleanQ) || album.includes(cleanQ);
    });
  }, [activeCatalog, cleanQ]);

  const matchedArtists = useMemo(() => {
    if (!cleanQ) return [];
    const map = new Map();

    dbArtists.forEach((a) => {
      if (!a.name) return;
      const canonical = matchAllowedArtistKey(a.name);
      if (canonical && (canonical.toLowerCase().includes(cleanQ) || cleanQ.includes(canonical.toLowerCase()))) {
        map.set(canonical.toLowerCase(), {
          id: a._id || canonical,
          name: canonical,
          image: resolveArtistImage(canonical, a.image, null),
        });
      }
    });

    activeCatalog.forEach((song) => {
      if (!song.artist) return;
      const parts = song.artist.split(/[,&/]| ft\. | feat\. /i).map((p) => p.trim()).filter(Boolean);
      parts.forEach((part) => {
        const canonical = matchAllowedArtistKey(part);
        if (canonical && (canonical.toLowerCase().includes(cleanQ) || cleanQ.includes(canonical.toLowerCase()))) {
          const key = canonical.toLowerCase();
          if (!map.has(key)) {
            map.set(key, {
              id: key,
              name: canonical,
              image: resolveArtistImage(canonical, null, song.image),
            });
          }
        }
      });
    });

    return Array.from(map.values()).slice(0, 3);
  }, [cleanQ, dbArtists, activeCatalog]);

  const displayRecentTracks = userRecentTracks.length > 0
    ? userRecentTracks
    : activeCatalog.slice(0, 4).map((s) => ({
        id: s._id || s.id,
        title: s.title || s.songName || s.name,
        type: 'Song',
        subtitle: s.artist || s.album || 'Single',
        image: s.image || s.coverUrl || s.img,
        rawSong: s,
      }));

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (onSearchChange) onSearchChange(val);
    else setInternalTerm(val);
  };

  const clearSearch = () => {
    if (onSearchChange) onSearchChange('');
    else setInternalTerm('');
  };

  const triggerPlay = (track) => {
    setIsFocused(false);
    const trackTitle = track.title || track.songName || track.name || 'Track';
    showToast(`${t("playingTrack")} "${trackTitle}" 🎵`, 'success');

    if (onSelectSong) {
      onSelectSong(track);
    } else if (playSong) {
      playSong(track, activeCatalog);
    }
  };

  const handleGlobalSearchNavigate = (queryToSearch) => {
    setIsFocused(false);
    const targetQuery = queryToSearch || searchTerm;
    if (targetQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(targetQuery.trim())}`);
    }
  };

  const handleArtistClick = (artistName) => {
    setIsFocused(false);
    navigate(`/artist/${encodeURIComponent(artistName)}`);
  };

  const handleKeyDownInput = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleGlobalSearchNavigate();
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
    <div ref={containerRef} className={`search-overlay-container theme-${theme}`}>
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
            type="button"
            onClick={clearSearch}
            className="search-clear-btn"
            aria-label="Clear Search"
          >
            ✕
          </button>
        )}
      </div>

      {isFocused && (
        <div className="search-dropdown-menu fade-slide-in">
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

              {/* Top Artists */}
              <div className="trending-section-label">{t("topArtists") || "Top Artists"}</div>
              <div className="song-results-list" style={{ marginBottom: '14px' }}>
                {topArtistsList.map((artist) => (
                  <div
                    key={artist.id}
                    onClick={() => handleArtistClick(artist.name)}
                    className="song-result-item"
                  >
                    <div className="song-meta">
                      <img
                        src={artist.image}
                        alt={artist.name}
                        className="artist-avatar"
                      />
                      <div className="song-meta-text">
                        <h4 className="song-title">{formatTitleCase(artist.name)}</h4>
                        <p className="song-subtitle">{t("artists") || "Artist"}</p>
                      </div>
                    </div>
                    <span className="play-tag explore-tag">{t("exploreTag") || "Explore ➔"}</span>
                  </div>
                ))}
              </div>

              {/* Recently Played */}
              <div className="trending-section-label">{t("recentlyPlayed")}</div>
              <div className="song-results-list">
                {displayRecentTracks.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => triggerPlay(item.rawSong || item)}
                    className="song-result-item"
                  >
                    <div className="song-meta">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="song-cover"
                      />
                      <div className="song-meta-text">
                        <h4 className="song-title">{item.title}</h4>
                        <p className="song-subtitle">{t("songLabel")} • {item.subtitle}</p>
                      </div>
                    </div>
                    <span className="play-tag">{t("playTag")}</span>
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

              <div className="search-sub-tabs">
                <button
                  type="button"
                  className={`sub-tab-chip ${activeCategoryTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveCategoryTab('all')}
                >
                  {t("all")}
                </button>
                <button
                  type="button"
                  className={`sub-tab-chip ${activeCategoryTab === 'songs' ? 'active' : ''}`}
                  onClick={() => setActiveCategoryTab('songs')}
                >
                  <FiMusic size={12} /> {t("songsTab")} ({filteredSongs.length})
                </button>
                <button
                  type="button"
                  className={`sub-tab-chip ${activeCategoryTab === 'artists' ? 'active' : ''}`}
                  onClick={() => setActiveCategoryTab('artists')}
                >
                  <FiUser size={12} /> {t("artists")} ({matchedArtists.length})
                </button>
              </div>

              {activeCategoryTab === 'artists' ? (
                matchedArtists.length > 0 ? (
                  <div className="song-results-list">
                    {matchedArtists.map((artist) => (
                      <div
                        key={artist.id}
                        onClick={() => handleArtistClick(artist.name)}
                        className="song-result-item"
                      >
                        <div className="song-meta">
                          <img
                            src={artist.image}
                            alt={artist.name}
                            className="artist-avatar"
                          />
                          <div className="song-meta-text">
                            <h4 className="song-title">{formatTitleCase(artist.name)}</h4>
                            <p className="song-subtitle">{t("artists") || "Artist"}</p>
                          </div>
                        </div>
                        <span className="play-tag explore-tag">View Profile ➔</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-search-state">
                    <p>No artists matched "{searchTerm}"</p>
                  </div>
                )
              ) : (
                filteredSongs.length > 0 || (activeCategoryTab === 'all' && matchedArtists.length > 0) ? (
                  <div className="song-results-list">
                    {activeCategoryTab === 'all' && matchedArtists.slice(0, 3).map((artist) => (
                      <div
                        key={`matched-art-${artist.id}`}
                        onClick={() => handleArtistClick(artist.name)}
                        className="song-result-item"
                      >
                        <div className="song-meta">
                          <img
                            src={artist.image}
                            alt={artist.name}
                            className="artist-avatar"
                          />
                          <div className="song-meta-text">
                            <h4 className="song-title">{formatTitleCase(artist.name)}</h4>
                            <p className="song-subtitle">{t("artists") || "Artist"}</p>
                          </div>
                        </div>
                        <span className="play-tag explore-tag">Explore ➔</span>
                      </div>
                    ))}

                    {filteredSongs.map((song) => (
                      <div
                        key={song._id || song.id}
                        onClick={() => {
                          setIsFocused(false);
                          triggerPlay(song);
                        }}
                        className="song-result-item"
                      >
                        <div className="song-meta">
                          <img
                            src={song.image || song.coverUrl || song.img}
                            alt={song.title}
                            className="song-cover"
                          />
                          <div className="song-meta-text">
                            <h4 className="song-title">{song.title}</h4>
                            <p className="song-subtitle">{t("songLabel")} • {song.artist}</p>
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
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}