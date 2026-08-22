import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlay,
  FaFireAlt,
  FaMusic,
  FaHistory,
  FaCompass,
  FaTrash,
  FaMicrophone,
  FaChevronRight,
} from "react-icons/fa";
import {
  getSongs,
  getRecentlyPlayed,
  clearRecentlyPlayed,
  getArtists,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useMusic } from "../../context/PlayerContext";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext";
import {
  resolveArtistImage,
  normalizeArtistDisplayName,
  ARTIST_LOCAL_MAP,
} from "../../utils/artistPhotos";
import SongCard from "../../components/SongCard/SongCard";
import logo from "../../assets/vibeify-logo.png";
import "./Home.css";

const fallbackSongs = [
  {
    _id: "1",
    title: "Enakenna Yaarum Illaye",
    artist: "Anirudh Ravichander ft. Yuvan Shankar Raja, Udit Narayan, Na. Muthukumar",
    image:
      "https://res.cloudinary.com/dxbabd7aq/image/upload/v1785925370/vibeify_uploads/images/dlfsdz1qyxzihu59dgoa.jpg",
    genre: "Tamil",
    category: "Tamil",
    featured: true,
    plays: 85,
  },
  {
    _id: "2",
    title: "Adi Podi",
    artist: "Hiphop Tamizha",
    image:
      "https://res.cloudinary.com/dxbabd7aq/image/upload/v1785926432/vibeify_uploads/images/song_img_2.jpg",
    genre: "Tamil",
    category: "Tamil",
    featured: false,
    plays: 60,
  },
  {
    _id: "3",
    title: "God Mode",
    artist: "Vishnu Edavan",
    image:
      "https://res.cloudinary.com/dxbabd7aq/image/upload/v1785926432/vibeify_uploads/images/song_img_4.jpg",
    genre: "Trending",
    category: "Trending",
    featured: true,
    plays: 95,
  },
];

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

const Home = () => {
  const { user } = useAuth();
  const { playSong } = useMusic();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const { t, theme } = useSettings();

  const [songs, setSongs] = useState([]);
  const [recent, setRecent] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  const [showClearModal, setShowClearModal] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 5) return { text: t("goodNight") || "Good Night", icon: "🌌" };
    if (hour < 12) return { text: t("goodMorning") || "Good Morning", icon: "🌅" };
    if (hour < 18) return { text: t("goodAfternoon") || "Good Afternoon", icon: "☀️" };
    return { text: t("goodEvening") || "Good Evening", icon: "🌙" };
  };

  useEffect(() => {
    Promise.all([
      getSongs().catch(() => ({ data: [] })),
      getArtists().catch(() => ({ data: [] })),
    ])
      .then(([songsRes, artistsRes]) => {
        const fetchedSongs =
          Array.isArray(songsRes.data) && songsRes.data.length > 0
            ? songsRes.data
            : songsRes.data?.data || fallbackSongs;

        const dbArtists = Array.isArray(artistsRes.data) ? artistsRes.data : [];
        setSongs(fetchedSongs);

        // Build Top Artists Map
        const uniqueArtistsMap = new Map();

        dbArtists.forEach((a) => {
          const canonical = matchAllowedArtistKey(a.name);
          if (!canonical) return;
          const cleanKey = canonical.toLowerCase();

          if (!uniqueArtistsMap.has(cleanKey)) {
            uniqueArtistsMap.set(cleanKey, {
              id: a._id,
              name: canonical,
              image: resolveArtistImage(canonical, a.image, null),
              trackCount: 0,
            });
          }
        });

        fetchedSongs.forEach((song) => {
          if (!song.artist) return;

          const contributors = song.artist
            .split(/[,&/]| ft\. | feat\. /i)
            .map((p) => p.trim())
            .filter(Boolean);

          const matchedInSong = new Set();

          contributors.forEach((part) => {
            const canonical = matchAllowedArtistKey(part);
            if (!canonical) return;
            const cleanKey = canonical.toLowerCase();

            if (matchedInSong.has(cleanKey)) return;
            matchedInSong.add(cleanKey);

            if (!uniqueArtistsMap.has(cleanKey)) {
              uniqueArtistsMap.set(cleanKey, {
                name: canonical,
                image: resolveArtistImage(canonical, null, song.image),
                trackCount: 1,
              });
            } else {
              const current = uniqueArtistsMap.get(cleanKey);
              current.trackCount += 1;
              if (!current.image) {
                current.image = resolveArtistImage(canonical, null, song.image);
              }
            }
          });
        });

        const sortedArtists = Array.from(uniqueArtistsMap.values())
          .sort((a, b) => (b.trackCount || 0) - (a.trackCount || 0))
          .slice(0, 10);

        setTopArtists(sortedArtists);
      })
      .catch(() => {
        setSongs(fallbackSongs);
        showToast("Using offline track catalog", "info");
      })
      .finally(() => setLoading(false));

    if (user) {
      getRecentlyPlayed()
        .then((res) => setRecent(res.data || []))
        .catch(() => {});
    }
  }, [user, showToast]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    const displayFilterName =
      filter === "All"
        ? t("all")
        : t(`filter${filter}`) !== `filter${filter}`
        ? t(`filter${filter}`)
        : filter;

    showToast(`Switched filter to [${displayFilterName}] vibe`, "info");
  };

  const handleOpenClearModal = () => setShowClearModal(true);
  const handleCloseClearModal = () => setShowClearModal(false);

  const handleConfirmClearHistory = async () => {
    try {
      await clearRecentlyPlayed();
      setRecent([]);
      showToast("Recently played history cleared 🗑️", "info");
    } catch (err) {
      console.error("Clear history error:", err);
      showToast("Failed to clear listening history", "error");
    } finally {
      setShowClearModal(false);
    }
  };

  const heroSong = songs[0];
  const currentGreeting = getGreeting();

  const filteredSongs = songs.filter((song) => {
    if (activeFilter === "All") return true;

    const filterKey = activeFilter.toLowerCase();
    const songGenre = song.genre?.toLowerCase() || "";
    const songCategory = song.category?.toLowerCase() || "";

    if (activeFilter === "Trending") {
      const sortedByRecent = [...songs].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      const top10NewestIds = sortedByRecent.slice(0, 10).map((s) => s._id || s.id);

      return (
        top10NewestIds.includes(song._id || song.id) ||
        songGenre.includes("trending") ||
        songCategory.includes("trending")
      );
    }

    return songGenre.includes(filterKey) || songCategory.includes(filterKey);
  });

  const filterCategories = [
    "All",
    "Trending",
    "Tamil",
    "Telugu",
    "Malayalam",
    "Kannada",
    "Hindi",
    "English",
  ];

  return (
    <div className={`home-page theme-${theme}`}>
      <div className="ambient-glow glow-top-left" />
      <div className="ambient-glow glow-top-right" />

      <div className="home-content-wrapper">
        {/* BRAND & GREETING */}
        <div className="greeting-container">
          <div className="home-brand-row">
            <img src={logo} alt="Vibeify Logo" className="home-brand-logo" />
            <span className="home-brand-title">Vibeify</span>
          </div>
          <h1 className="greeting">
            <span className="greeting-icon">{currentGreeting.icon}</span>{" "}
            <span className="sakeel07-username">
              {currentGreeting.text}
              {user ? `, ${user.username}` : ""}
            </span>
          </h1>
          <p className="greeting-subtitle">{t("exploreUniverse")}</p>
        </div>

        {/* 1. RECENTLY PLAYED PILL GRID */}
        {user && recent.length > 0 && (
          <section className="home-quick-section">
            <div className="home-section-header">
              <h2 className="vibrant-section-title">
                <FaHistory className="section-title-icon history-spin" />{" "}
                {t("recentlyPlayed")}
              </h2>
              <button
                type="button"
                className="clear-history-btn"
                onClick={handleOpenClearModal}
                title={t("clearHistoryBtn")}
              >
                <FaTrash className="clear-btn-icon" />
                <span>{t("clear")}</span>
              </button>
            </div>

            <div className="home-quick-grid">
              {recent.slice(0, 6).map((song) => (
                <div
                  key={song._id || song.id}
                  className="quick-card"
                  onClick={() => playSong(song, recent)}
                >
                  <img src={song.image} alt={song.title} />
                  <div className="quick-card-text">
                    <span>{song.title}</span>
                  </div>
                  <button className="quick-play-btn" aria-label="Play">
                    <FaPlay />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. POPULAR ARTISTS SHELF */}
        {topArtists.length > 0 && (
          <section className="home-section">
            <div className="home-section-header">
              <div className="section-title-wrap">
                <FaMicrophone className="section-title-icon text-amber-400" />
                <h2 className="vibrant-section-title">{t("topArtists") || "Top Artists"}</h2>
              </div>
              <button className="see-all-btn" onClick={() => navigate("/artists")}>
                <span>{t("seeAll") || "See All"}</span>
                <FaChevronRight size={12} />
              </button>
            </div>

            <div className="artists-shelf">
              {topArtists.map((artist, idx) => {
                const initial = (artist.name || "A").charAt(0).toUpperCase();

                return (
                  <div
                    key={artist.id || idx}
                    className="home-artist-card"
                    onClick={() =>
                      navigate(`/artist/${encodeURIComponent(artist.name)}`)
                    }
                  >
                    <div className="home-artist-avatar-wrap">
                      {artist.image ? (
                        <img
                          src={artist.image}
                          alt={artist.name}
                          className="home-artist-img"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fallback =
                              e.currentTarget.parentElement.querySelector(
                                ".home-artist-initial"
                              );
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                      ) : null}

                      <div
                        className="home-artist-initial"
                        style={{ display: artist.image ? "none" : "flex" }}
                      >
                        {initial}
                      </div>

                      <button
                        className="home-artist-play-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          const artistTracks = songs.filter((s) => {
                            if (!s.artist) return false;
                            const parts = s.artist
                              .split(/[,&/]| ft\. | feat\. /i)
                              .map((p) => p.trim().toLowerCase());
                            return parts.some((p) => {
                              const canonical = matchAllowedArtistKey(p);
                              return (
                                canonical &&
                                canonical.toLowerCase() === artist.name.toLowerCase()
                              );
                            });
                          });

                          if (artistTracks.length > 0) {
                            playSong(artistTracks[0], artistTracks, {
                              type: "artist",
                              name: artist.name,
                              image: artist.image,
                            });
                          }
                        }}
                        aria-label={`Play songs by ${artist.name}`}
                      >
                        <FaPlay style={{ marginLeft: "2px" }} />
                      </button>
                    </div>
                    <span className="home-artist-name">{artist.name}</span>
                    <span className="home-artist-tag">{t("artists") || "Artist"}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. HERO BANNER */}
        {heroSong && !loading && (
          <section className="hero-banner">
            <div className="hero-glow-fx" />

            <div className="hero-image-wrap">
              <img src={heroSong.image} alt={heroSong.title} />
              <div className="hero-img-badge">{t("liveBadge")}</div>
            </div>

            <div className="hero-content">
              <div className="hero-top-row">
                <span className="hero-badge">
                  <FaFireAlt className="badge-fire-icon np-icon-pulse" />{" "}
                  {t("featuredTrack")}
                </span>
                <div className="hero-live-bars">
                  <span />
                  <span />
                  <span />
                </div>
              </div>

              <div className="hero-text-group">
                <h2 className="hero-title">{heroSong.title}</h2>
                <p className="hero-artist">
                  {heroSong.artist ||
                    "Anirudh Ravichander ft. Yuvan Shankar Raja, Udit Narayan, Na. Muthukumar"}
                </p>
              </div>

              <div className="hero-action-row">
                <button
                  className="hero-play-btn"
                  onClick={() => {
                    playSong(heroSong, songs);
                    showToast(`Now playing: ${heroSong.title} 🎵`, "success");
                  }}
                >
                  <span className="hero-btn-glow-layer" />
                  <FaPlay className="hero-play-icon-anim" /> {t("listenNow")}
                </button>
                <span className="hero-sub-note">{t("trendingVibeToday")}</span>
              </div>
            </div>
          </section>
        )}

        {/* 4. DISCOVER TRACKS & GENRE CHIPS */}
        <section className="home-section">
          <div className="home-section-header">
            <h2 className="vibrant-section-title">
              <FaCompass className="section-title-icon compass-spin" />{" "}
              {t("discoverVibez")}
            </h2>
          </div>

          <div className="filter-track-container">
            <div className="filter-chips-wrapper">
              {filterCategories.map((filter) => (
                <button
                  key={filter}
                  className={`filter-chip ${
                    activeFilter === filter ? "active" : ""
                  }`}
                  onClick={() => handleFilterChange(filter)}
                >
                  <span className="chip-bg-glow" />
                  {filter === "All"
                    ? t("all")
                    : t(`filter${filter}`) !== `filter${filter}`
                    ? t(`filter${filter}`)
                    : filter}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="song-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-img" />
                  <div className="skeleton-text short" />
                  <div className="skeleton-text" />
                </div>
              ))}
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="home-empty">
              <FaMusic className="empty-icon np-icon-pulse" />
              <p>{t("noSongsMatched")}</p>
            </div>
          ) : (
            <div className="song-grid">
              {filteredSongs.map((song) => (
                <SongCard
                  key={song._id || song.id}
                  song={song}
                  songList={filteredSongs}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {!user && (
        <div className="vibeify-guest-compact-card">
          <div className="guest-glow-orb" />
          <div className="guest-compact-left">
            <span className="preview-glow-badge"> {t("guestExplorerMode")}</span>
            <h3>{t("unlockUniverse")}</h3>
            <p>{t("signupPromo")}</p>
          </div>
          <button
            className="preview-signup-action-btn"
            onClick={() => navigate("/login")}
          >
            {t("signupFree")}
          </button>
        </div>
      )}

      {/* CLEAR HISTORY MODAL */}
      {showClearModal && (
        <div className="vibeify-modal-overlay" onClick={handleCloseClearModal}>
          <div
            className="vibeify-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-icon-wrapper">
              <FaTrash className="modal-icon error-icon" />
            </div>
            <h3>{t("clearHistoryTitle")}</h3>
            <p>{t("clearHistoryDesc")}</p>
            <div className="modal-actions">
              <button
                className="modal-btn cancel"
                onClick={handleCloseClearModal}
              >
                {t("cancel")}
              </button>
              <button
                className="modal-btn confirm"
                onClick={handleConfirmClearHistory}
              >
                {t("clearHistoryBtn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;