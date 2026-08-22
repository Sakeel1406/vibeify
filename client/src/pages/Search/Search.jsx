import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaPlay,
  FaMusic,
  FaMicrophoneAlt,
  FaStar,
} from "react-icons/fa";
import { getSongs, getArtists } from "../../services/api";
import { useMusic } from "../../context/PlayerContext";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext";
import {
  resolveArtistImage,
  normalizeArtistDisplayName,
  ARTIST_LOCAL_MAP,
} from "../../utils/artistPhotos";
import SongCard from "../../components/SongCard/SongCard";
import "./Search.css";

const formatTitleCase = (str) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

// Check and normalize against known whitelist map
const matchAllowedArtistKey = (rawName) => {
  if (!rawName) return null;
  const clean = rawName.toLowerCase().trim();
  if (ARTIST_LOCAL_MAP[clean]) {
    return normalizeArtistDisplayName(clean);
  }
  for (const key of Object.keys(ARTIST_LOCAL_MAP)) {
    if (clean === key) {
      return normalizeArtistDisplayName(key);
    }
  }
  return null;
};

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const { playSong } = useMusic();
  const { showToast } = useToast();
  const { t, theme } = useSettings();

  const CATEGORIES = ["All", "Songs", "Artists", "Albums"];

  const [allSongs, setAllSongs] = useState([]);
  const [allArtists, setAllArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      getSongs().catch(() => ({ data: [] })),
      getArtists().catch(() => ({ data: [] })),
    ])
      .then(([songsRes, artistsRes]) => {
        if (!isMounted) return;
        const songList = Array.isArray(songsRes.data)
          ? songsRes.data
          : songsRes.data?.data || [];
        const artistList = Array.isArray(artistsRes.data) ? artistsRes.data : [];

        setAllSongs(songList);
        setAllArtists(artistList);
      })
      .catch((err) => {
        console.error("Search fetch error:", err);
        if (isMounted) showToast("Failed to load search catalog", "error");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const q = query.toLowerCase().trim();

  // 1. MATCH SONGS
  const filteredSongs = useMemo(() => {
    if (!q) return [];
    return allSongs.filter((song) => {
      const title = (song.title || song.songName || "").toLowerCase();
      const artist = (song.artist || "").toLowerCase();
      const album = (song.album || "").toLowerCase();
      return title.includes(q) || artist.includes(q) || album.includes(q);
    });
  }, [allSongs, q]);

  // 2. MATCH DEDUPLICATED INDIVIDUAL ARTISTS ONLY
  const matchedArtists = useMemo(() => {
    if (!q) return [];
    const map = new Map();

    // Scan DB Artists
    allArtists.forEach((a) => {
      if (!a.name) return;
      const canonical = matchAllowedArtistKey(a.name) || formatTitleCase(a.name.trim());
      const cleanKey = canonical.toLowerCase();

      if (cleanKey.includes(q) || q.includes(cleanKey)) {
        if (!map.has(cleanKey)) {
          map.set(cleanKey, {
            name: canonical,
            image: resolveArtistImage(canonical, a.image, null),
          });
        }
      }
    });

    // Scan songs & split individual collaborators
    allSongs.forEach((song) => {
      if (!song.artist) return;
      
      const contributors = song.artist
        .split(/[,&/]| ft\. | feat\. /i)
        .map((p) => p.trim())
        .filter(Boolean);

      contributors.forEach((part) => {
        const canonical = matchAllowedArtistKey(part);
        if (canonical) {
          const cleanKey = canonical.toLowerCase();
          if (cleanKey.includes(q) || q.includes(cleanKey)) {
            if (!map.has(cleanKey)) {
              map.set(cleanKey, {
                name: canonical,
                image: resolveArtistImage(canonical, null, song.image),
              });
            } else {
              const item = map.get(cleanKey);
              if (!item.image) {
                item.image = resolveArtistImage(canonical, null, song.image);
              }
            }
          }
        }
      });
    });

    return Array.from(map.values());
  }, [allArtists, allSongs, q]);

  // 3. MATCH ALBUMS
  const matchedAlbums = useMemo(() => {
    if (!q) return [];
    const map = new Map();

    allSongs.forEach((song) => {
      const albumTitle = song.album || "Single";
      const artistName = song.artist || "";

      if (
        albumTitle.toLowerCase().includes(q) ||
        artistName.toLowerCase().includes(q)
      ) {
        const albumKey = albumTitle.toLowerCase().trim();
        if (!map.has(albumKey)) {
          map.set(albumKey, {
            title: albumTitle,
            artist: artistName,
            image: song.image,
            trackCount: 1,
            songs: [song],
          });
        } else {
          const current = map.get(albumKey);
          current.trackCount += 1;
          current.songs.push(song);
        }
      }
    });

    return Array.from(map.values());
  }, [allSongs, q]);

  // 4. TOP RESULT SELECTION
  const topResult = useMemo(() => {
    if (!q) return null;
    const exactArtist = matchedArtists.find(
      (a) => a.name.toLowerCase() === q || q.includes(a.name.toLowerCase())
    );
    if (exactArtist) {
      return { type: "artist", ...exactArtist };
    }
    if (filteredSongs.length > 0) {
      return { type: "song", ...filteredSongs[0] };
    }
    if (matchedArtists.length > 0) {
      return { type: "artist", ...matchedArtists[0] };
    }
    return null;
  }, [q, matchedArtists, filteredSongs]);

  const handlePlayTopResult = () => {
    if (!topResult) return;
    if (topResult.type === "song") {
      playSong(topResult, filteredSongs);
      showToast(`Playing ${topResult.title} 🎵`, "success");
    } else {
      navigate(`/artist/${encodeURIComponent(topResult.name)}`);
    }
  };

  const handlePlayArtistTracks = (e, artist) => {
    e.stopPropagation();
    const artistTracks = allSongs.filter((s) => {
      if (!s.artist) return false;
      const parts = s.artist.split(/[,&/]| ft\. | feat\. /i).map((p) => p.trim().toLowerCase());
      return parts.some((p) => p === artist.name.toLowerCase() || p.includes(artist.name.toLowerCase()));
    });

    if (artistTracks.length > 0) {
      playSong(artistTracks[0], artistTracks, {
        type: "artist",
        name: artist.name,
        image: artist.image,
      });
    }
  };

  const getCategoryLabel = (cat) => {
    if (cat === "All") return t("all") || "All";
    if (cat === "Songs") return t("songsTab") || "Songs";
    if (cat === "Artists") return t("artists") || "Artists";
    if (cat === "Albums") return t("albums") || "Albums";
    return cat;
  };

  return (
    <div className={`search-page theme-${theme}`}>
      <div className="search-ambient-glow" />

      {/* FILTER PILLS */}
      <div className="search-header-container">
        <div className="search-filter-pills">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-pill ${activeFilter === cat ? "active" : ""}`}
              onClick={() => setActiveFilter(cat)}
            >
              <span className="pill-glow" />
              <span>
                {getCategoryLabel(cat)}
                {cat === "Songs" && query && ` (${filteredSongs.length})`}
                {cat === "Artists" && query && ` (${matchedArtists.length})`}
                {cat === "Albums" && query && ` (${matchedAlbums.length})`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* STATES */}
      {!query.trim() ? (
        <div className="search-placeholder">
          <div className="placeholder-icon-wrap">
            <FaSearch className="placeholder-icon" />
          </div>
          <h2>{t("searchVibeify") || "Search Vibeify Universe"}</h2>
          <p>{t("searchSubtitle") || "Discover favorite tracks, artists, chart-topping hits, and albums"}</p>
          <div className="search-quick-tags">
            <span onClick={() => setSearchParams({ q: "Anirudh Ravichander" })}># Anirudh</span>
            <span onClick={() => setSearchParams({ q: "Vijay Thalapathy" })}># Vijay Thalapathy</span>
            <span onClick={() => setSearchParams({ q: "Sai Abhyankkar" })}># Sai Abhyankkar</span>
            <span onClick={() => setSearchParams({ q: "Remix" })}># Remix</span>
          </div>
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
      ) : filteredSongs.length === 0 && matchedArtists.length === 0 && matchedAlbums.length === 0 ? (
        <div className="search-empty">
          <FaMusic className="empty-music-icon" />
          <h3>{t("noResultsFor")} "{query}"</h3>
          <p>{t("checkSpelling")}</p>
        </div>
      ) : (
        <div className="search-results-container">
          
          {/* TAB 1: ALL */}
          {activeFilter === "All" && (
            <>
              <div className="search-top-layout">
                {topResult && (
                  <section className="top-result-section">
                    <h2 className="vibrant-section-title">
                      <FaStar className="section-title-icon text-amber-400" /> {t("topResult") || "Top Result"}
                    </h2>
                    <div className="top-result-card" onClick={handlePlayTopResult}>
                      <div className={`top-result-img-wrap ${topResult.type === "artist" ? "is-artist" : ""}`}>
                        {topResult.image ? (
                          <img
                            src={topResult.image || topResult.coverUrl}
                            alt={topResult.title || topResult.name}
                          />
                        ) : (
                          <div className="search-artist-initial-fallback">
                            {(topResult.name || "A").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="top-result-badge">
                        {topResult.type === "artist" ? (t("artists") || "Artist") : (t("songLabel") || "Track")}
                      </span>
                      <h3 className="top-result-title">
                        {formatTitleCase(topResult.type === "artist" ? topResult.name : topResult.title)}
                      </h3>
                      <p className="top-result-artist">
                        {topResult.type === "artist" ? "Verified Creator" : topResult.artist}
                      </p>
                      <button className="top-result-play-btn" aria-label="Play">
                        <FaPlay size={14} style={{ marginLeft: "2px" }} />
                      </button>
                    </div>
                  </section>
                )}

                {/* MATCHED CLEAN ARTIST PILLS */}
                {matchedArtists.length > 0 && (
                  <section className="matched-artists-section">
                    <h2 className="vibrant-section-title">
                      <FaMicrophoneAlt className="section-title-icon text-pink-500" /> {t("artists") || "Artists"}
                    </h2>
                    <div className="matched-artists-grid">
                      {matchedArtists.slice(0, 4).map((artist, idx) => {
                        const initial = (artist.name || "A").charAt(0).toUpperCase();
                        return (
                          <div
                            key={idx}
                            className="search-artist-pill"
                            onClick={() => navigate(`/artist/${encodeURIComponent(artist.name)}`)}
                          >
                            {artist.image ? (
                              <img src={artist.image} alt={artist.name} className="search-artist-thumb" />
                            ) : (
                              <div className="search-artist-thumb-initial">{initial}</div>
                            )}
                            <div className="search-artist-meta">
                              <span className="artist-pill-name">{formatTitleCase(artist.name)}</span>
                              <span className="artist-pill-tag">{t("artists") || "Artist"}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>

              {/* SONGS */}
              {filteredSongs.length > 0 && (
                <section className="search-section">
                  <h2 className="vibrant-section-title">
                    <FaMusic className="section-title-icon text-cyan-400" /> {t("songsTab") || "Songs"}
                  </h2>
                  <div className="song-grid">
                    {filteredSongs.slice(0, 10).map((song) => (
                      <SongCard key={song._id || song.id} song={song} songList={filteredSongs} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* TAB 2: SONGS */}
          {activeFilter === "Songs" && (
            <section className="search-section">
              <h2 className="vibrant-section-title">
                <FaMusic className="section-title-icon text-cyan-400" /> {t("songsTab") || "Songs"} ({filteredSongs.length})
              </h2>
              {filteredSongs.length === 0 ? (
                <p className="tab-empty-msg">{t("noSongsMatched") || `No songs found matching "${query}".`}</p>
              ) : (
                <div className="song-grid">
                  {filteredSongs.map((song) => (
                    <SongCard key={song._id || song.id} song={song} songList={filteredSongs} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* TAB 3: ARTISTS */}
          {activeFilter === "Artists" && (
            <section className="search-section">
              <h2 className="vibrant-section-title">
                <FaMicrophoneAlt className="section-title-icon text-pink-500" /> {t("artists") || "Artists"} ({matchedArtists.length})
              </h2>
              {matchedArtists.length === 0 ? (
                <p className="tab-empty-msg">{t("noArtistsMatched") || `No artists found matching "${query}".`}</p>
              ) : (
                <div className="artists-search-grid">
                  {matchedArtists.map((artist, idx) => {
                    const initial = (artist.name || "A").charAt(0).toUpperCase();
                    return (
                      <div
                        key={idx}
                        className="search-artist-circle-card"
                        onClick={() => navigate(`/artist/${encodeURIComponent(artist.name)}`)}
                      >
                        <div className="search-artist-avatar-wrap">
                          {artist.image ? (
                            <img
                              src={artist.image}
                              alt={artist.name}
                              className="search-artist-avatar-img"
                            />
                          ) : (
                            <div className="search-artist-initial-avatar">{initial}</div>
                          )}
                          <button
                            className="search-artist-play-hover"
                            onClick={(e) => handlePlayArtistTracks(e, artist)}
                            aria-label={`Play ${artist.name}`}
                          >
                            <FaPlay size={15} style={{ marginLeft: "2px" }} />
                          </button>
                        </div>
                        <span className="search-artist-circle-name">{formatTitleCase(artist.name)}</span>
                        <span className="search-artist-circle-sub">{t("artists") || "Artist"}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* TAB 4: ALBUMS */}
          {activeFilter === "Albums" && (
            <section className="search-section">
              <h2 className="vibrant-section-title">
                <svg 
                  viewBox="0 0 24 24" 
                  width="22" 
                  height="22" 
                  fill="currentColor"
                  style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
                  className="section-title-icon text-purple-400"
                >
                  <circle cx="9" cy="13" r="7.5" fill="currentColor" opacity="0.25"/>
                  <circle cx="9" cy="13" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
                  <circle cx="9" cy="13" r="3.5" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1 1"/>
                  <circle cx="9" cy="13" r="1.5" fill="currentColor"/>
                  <path d="M19 4v7.25c-.34-.15-.72-.25-1.12-.25-1.59 0-2.88 1.29-2.88 2.88s1.29 2.88 2.88 2.88 2.88-1.29 2.88-2.88V7h3V4h-4.76z" fill="currentColor"/>
                </svg> {t("albums") || "Albums"} ({matchedAlbums.length})
              </h2>
              {matchedAlbums.length === 0 ? (
                <p className="tab-empty-msg">{t("noAlbumsMatched") || `No albums found matching "${query}".`}</p>
              ) : (
                <div className="albums-search-grid">
                  {matchedAlbums.map((album, idx) => (
                    <div
                      key={idx}
                      className="search-album-card"
                      onClick={() => {
                        if (album.songs?.length > 0) {
                          playSong(album.songs[0], album.songs, {
                            type: "album",
                            name: album.title,
                          });
                          showToast(`Playing album: ${album.title} 💿`, "success");
                        }
                      }}
                    >
                      <div className="search-album-cover-wrap">
                        <img src={album.image} alt={album.title} className="search-album-img" />
                        <button className="search-album-play-btn" aria-label="Play Album">
                          <FaPlay size={14} style={{ marginLeft: "2px" }} />
                        </button>
                      </div>
                      <span className="search-album-title">{album.title}</span>
                      <span className="search-album-artist">{album.artist}</span>
                      <span className="search-album-badge">{album.trackCount} {t("tracks") || "Tracks"}</span>
                    </div>
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