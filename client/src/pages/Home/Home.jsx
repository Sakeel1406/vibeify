import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay, FaFireAlt, FaMusic, FaHistory, FaCompass } from "react-icons/fa";
import { getSongs, getRecentlyPlayed } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useMusic } from "../../context/PlayerContext";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext"; 
import SongCard from "../../components/SongCard/SongCard";
import logo from "../../assets/vibeify-logo.png";
import "./Home.css";

const fallbackSongs = [
  {
    _id: "1",
    title: "Enakenna Yaarum Illaye",
    artist: "Anirudh Ravichander ft. Yuvan Shankar Raja, Udit Narayan, Na. Muthukumar",
    image: "https://res.cloudinary.com/dxbabd7aq/image/upload/v1785925370/vibeify_uploads/images/dlfsdz1qyxzihu59dgoa.jpg",
    genre: "Tamil",
    category: "Tamil",
    featured: true,
    plays: 85,
  },
  {
    _id: "2",
    title: "Adi Podi",
    artist: "Hiphop Tamizha",
    image: "https://res.cloudinary.com/dxbabd7aq/image/upload/v1785926432/vibeify_uploads/images/song_img_2.jpg",
    genre: "Tamil",
    category: "Tamil",
    featured: false,
    plays: 60,
  },
  {
    _id: "3",
    title: "God Mode",
    artist: "Vishnu Edavan",
    image: "https://res.cloudinary.com/dxbabd7aq/image/upload/v1785926432/vibeify_uploads/images/song_img_4.jpg",
    genre: "Trending",
    category: "Trending",
    featured: true,
    plays: 95,
  },
];

const Home = () => {
  const { user } = useAuth();
  const { playSong } = useMusic();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const { t, theme } = useSettings(); 

  const [songs, setSongs] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 5) return { text: t("goodNight"), icon: "🌌" };
    if (hour < 12) return { text: t("goodMorning"), icon: "🌅" };
    if (hour < 18) return { text: t("goodAfternoon"), icon: "☀️" };
    return { text: t("goodEvening"), icon: "🌙" };
  };

  useEffect(() => {
    getSongs()
      .then((res) => {
        const fetchedSongs = res.data && res.data.length > 0 ? res.data : fallbackSongs;
        setSongs(fetchedSongs);
      })
      .catch(() => {
        setSongs(fallbackSongs);
        showToast("Using offline track catalog", "info");
      })
      .finally(() => setLoading(false));

    if (user) {
      getRecentlyPlayed()
        .then((res) => setRecent(res.data))
        .catch(() => {});
    }
  }, [user, showToast]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    const displayFilterName = filter === "All" ? t("all") : t(`filter${filter}`);
    showToast(`Switched filter to [${displayFilterName}] vibe`, "info");
  };

  const heroSong = songs[0];
  const currentGreeting = getGreeting();

  const filteredSongs = songs.filter((song) => {
    if (activeFilter === "All") return true;

    const filterKey = activeFilter.toLowerCase();
    const songGenre = song.genre?.toLowerCase() || "";
    const songCategory = song.category?.toLowerCase() || "";

    if (activeFilter === "Trending") {
      const sortedByRecent = [...songs].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      const top10NewestIds = sortedByRecent.slice(0, 10).map(s => s._id || s.id);
      
      return top10NewestIds.includes(song._id || song.id) || songGenre.includes("trending") || songCategory.includes("trending");
    }

    return (
      songGenre.includes(filterKey) ||
      songCategory.includes(filterKey)
    );
  });

  const filterCategories = ["All", "Trending", "Tamil", "English", "Malayalam", "Hindi", "Telugu"];

  return (
    <div className={`home-page theme-${theme}`}>
      <div className="ambient-glow glow-top-left" />
      <div className="ambient-glow glow-top-right" />

      <div className="home-content-wrapper">
        
        <div className="greeting-container">
          <div className="home-brand-row">
            <img src={logo} alt="Vibeify Logo" className="home-brand-logo" />
            <span className="home-brand-title">Vibeify</span>
          </div>
          <h1 className="greeting">
            <span className="greeting-icon">{currentGreeting.icon}</span>{" "}
            <span className="sakeel07-username">
              {currentGreeting.text}{user ? `, ${user.username}` : ""}
            </span>
          </h1>
          <p className="greeting-subtitle">{t("exploreUniverse")}</p>
        </div>

        {recent.length > 0 && (
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
        )}

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
                  <FaFireAlt className="badge-fire-icon np-icon-pulse" /> {t("featuredTrack")}
                </span>
                <div className="hero-live-bars">
                  <span /><span /><span />
                </div>
              </div>

              <div className="hero-text-group">
                <h2 className="hero-title">{heroSong.title}</h2>
                <p className="hero-artist">
                  {heroSong.artist || "Anirudh Ravichander ft. Yuvan Shankar Raja, Udit Narayan, Na. Muthukumar"}
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

        {user && recent.length > 0 && (
          <section className="home-section">
            <div className="home-section-header">
              <h2 className="vibrant-section-title">
                <FaHistory className="section-title-icon history-spin" /> {t("recentlyPlayed")}
              </h2>
            </div>
            <div className="song-grid">
              {recent.map((song) => (
                <SongCard key={song._id || song.id} song={song} songList={recent} />
              ))}
            </div>
          </section>
        )}

        <section className="home-section">
          <div className="home-section-header">
            <h2 className="vibrant-section-title">
              <FaCompass className="section-title-icon compass-spin" /> {t("discoverVibez")}
            </h2>
          </div>
          
          <div className="filter-track-container">
            <div className="filter-chips-wrapper">
              {filterCategories.map((filter) => (
                <button
                  key={filter}
                  className={`filter-chip ${activeFilter === filter ? "active" : ""}`}
                  onClick={() => handleFilterChange(filter)}
                >
                  <span className="chip-bg-glow" />
                  {filter === "All" ? t("all") : t(`filter${filter}`)}
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
                <SongCard key={song._id || song.id} song={song} songList={filteredSongs} />
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
            onClick={() => navigate('/login')}
          >
            {t("signupFree")}
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;