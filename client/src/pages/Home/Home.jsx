import { useEffect, useState } from "react";
import { FaPlay, FaFire } from "react-icons/fa";
import { getSongs, getRecentlyPlayed } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useMusic } from "../../context/MusicContext";
import SongCard from "../../components/SongCard/SongCard";
import "./Home.css";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const Home = () => {
  const { user } = useAuth();
  const { playSong } = useMusic();
  const [songs, setSongs] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSongs()
      .then((res) => setSongs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));

    if (user) {
      getRecentlyPlayed()
        .then((res) => setRecent(res.data))
        .catch(() => {});
    }
  }, [user]);

  // Featured track for Hero Banner (takes the first song as hero highlight)
  const heroSong = songs[0];

  return (
    <div className="home-page">
      {/* Ambient Neon Glow Backdrops */}
      <div className="ambient-glow glow-top-left" />
      <div className="ambient-glow glow-top-right" />

      {/* Greeting Header */}
      <h1 className="greeting">
        {getGreeting()}{user ? `, ${user.username}` : ""}
      </h1>

      {/* Quick-Access Top Row (Spotify Style Shortcuts) */}
      {recent.length > 0 && (
        <div className="home-quick-grid">
          {recent.slice(0, 6).map((song) => (
            <div
              key={song._id || song.id}
              className="quick-card"
              onClick={() => playSong(song, recent)}
            >
              <img src={song.image} alt={song.title} />
              <span>{song.title}</span>
              <button className="quick-play-btn" aria-label="Play">
                <FaPlay />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Featured Highlight Banner */}
      {heroSong && !loading && (
        <section className="hero-banner">
          <div className="hero-content">
            <span className="hero-badge">
              <FaFire /> Featured Track
            </span>
            <h2 className="hero-title">{heroSong.title}</h2>
            <p className="hero-artist">{heroSong.artist}</p>
            <button
              className="hero-play-btn"
              onClick={() => playSong(heroSong, songs)}
            >
              <FaPlay /> Listen Now
            </button>
          </div>
          <div className="hero-image-wrap">
            <img src={heroSong.image} alt={heroSong.title} />
          </div>
        </section>
      )}

      {/* Recently Played Section */}
      {user && recent.length > 0 && (
        <section className="home-section">
          <div className="home-section-header">
            <h2>Recently Played</h2>
          </div>
          <div className="song-grid">
            {recent.map((song) => (
              <SongCard key={song._id || song.id} song={song} songList={recent} />
            ))}
          </div>
        </section>
      )}

      {/* All Songs Section */}
      <section className="home-section">
        <div className="home-section-header">
          <h2>All Songs</h2>
        </div>

        {loading ? (
          /* Glassmorphism Skeleton Loading Grid */
          <div className="song-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-img" />
                <div className="skeleton-text short" />
                <div className="skeleton-text" />
              </div>
            ))}
          </div>
        ) : songs.length === 0 ? (
          <div className="home-empty">
            <p>No songs available yet.</p>
            <span className="muted">
              An admin can upload tracks from the Admin Panel to populate your library.
            </span>
          </div>
        ) : (
          <div className="song-grid">
            {songs.map((song) => (
              <SongCard key={song._id || song.id} song={song} songList={songs} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;