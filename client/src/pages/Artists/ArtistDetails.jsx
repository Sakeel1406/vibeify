import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaPlay,
  FaPause,
  FaHeart,
  FaRegHeart,
  FaChevronLeft,
  FaShareAlt,
} from "react-icons/fa";
import { getSongs, getArtists, toggleLikeSong, getLikedSongs } from "../../services/api";
import { useMusic } from "../../context/PlayerContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext";
import {
  resolveArtistImage,
  normalizeArtistDisplayName,
} from "../../utils/artistPhotos";
import "./Artists.css";

const formatTitleCase = (str) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

const ArtistDetails = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t, theme } = useSettings();
  const { playSong, currentSong, isPlaying, togglePlay } = useMusic();

  const [artistData, setArtistData] = useState(null);
  const [artistSongs, setArtistSongs] = useState([]);
  const [likedIds, setLikedIds] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const rawDecodedName = decodeURIComponent(name || "").trim();
  const displayName = formatTitleCase(normalizeArtistDisplayName(rawDecodedName));

  // Sync initial follow state from localStorage
  useEffect(() => {
    try {
      const storedFollows = JSON.parse(
        localStorage.getItem("vibeify_followed_artists") || "[]"
      );
      const isArtistFollowed = storedFollows.some((a) => {
        const item = typeof a === "string" ? a : a.name;
        return item?.toLowerCase() === displayName.toLowerCase();
      });
      setIsFollowing(isArtistFollowed);
    } catch {
      setIsFollowing(false);
    }
  }, [displayName]);

  useEffect(() => {
    if (user) {
      getLikedSongs()
        .then((res) => setLikedIds(res.data.map((s) => s._id)))
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    setImgError(false);

    Promise.all([
      getArtists().catch(() => ({ data: [] })),
      getSongs().catch(() => ({ data: [] })),
    ]).then(([artistsRes, songsRes]) => {
      const allArtists = Array.isArray(artistsRes.data) ? artistsRes.data : [];
      const allSongs = Array.isArray(songsRes.data) ? songsRes.data : songsRes.data?.data || [];

      const matched = allArtists.find(
        (a) =>
          normalizeArtistDisplayName(a.name).toLowerCase() === displayName.toLowerCase()
      );

      const songs = allSongs.filter((s) => {
        if (!s.artist) return false;
        const artistParts = s.artist
          .split(/[,&/]| ft\. | feat\. /i)
          .map((p) => p.trim().toLowerCase());

        if (
          displayName.toLowerCase() === "vijay thalapathy" ||
          displayName.toLowerCase() === "vijay"
        ) {
          return (
            artistParts.includes("vijay") ||
            artistParts.includes("thalapathy") ||
            artistParts.includes("thalapathy vijay") ||
            artistParts.includes("vijay thalapathy")
          );
        }

        return artistParts.some(
          (part) =>
            part === displayName.toLowerCase() ||
            normalizeArtistDisplayName(part).toLowerCase() === displayName.toLowerCase()
        );
      });

      setArtistSongs(songs);

      const finalImage = resolveArtistImage(displayName, matched?.image, songs[0]?.image);

      setArtistData({
        name: displayName,
        image: finalImage,
        monthlyListeners: `${(songs.length * 480 + 120).toLocaleString()}K`,
      });
      setLoading(false);
    });
  }, [displayName]);

  // Handle Follow / Unfollow and persist across Library
  const handleToggleFollow = () => {
    const nextState = !isFollowing;
    setIsFollowing(nextState);

    try {
      let storedFollows = JSON.parse(
        localStorage.getItem("vibeify_followed_artists") || "[]"
      );
      let unfollowedList = JSON.parse(
        localStorage.getItem("vibeify_unfollowed_artists") || "[]"
      );

      if (nextState) {
        // Add to followed list
        const exists = storedFollows.some((a) => {
          const item = typeof a === "string" ? a : a.name;
          return item?.toLowerCase() === displayName.toLowerCase();
        });
        if (!exists) {
          storedFollows.push({
            name: displayName,
            image: artistData?.image,
          });
        }
        // Remove from blacklist if previously unfollowed
        unfollowedList = unfollowedList.filter(
          (n) => n.toLowerCase() !== displayName.toLowerCase()
        );
        showToast(`${t("followingArtist")} ${displayName}! ❤️`, "success");
      } else {
        // Remove from followed list
        storedFollows = storedFollows.filter((a) => {
          const item = typeof a === "string" ? a : a.name;
          return item?.toLowerCase() !== displayName.toLowerCase();
        });
        // Add to blacklist
        if (!unfollowedList.includes(displayName)) {
          unfollowedList.push(displayName);
        }
        showToast(`${t("unfollowedArtist")} ${displayName}`, "info");
      }

      localStorage.setItem("vibeify_followed_artists", JSON.stringify(storedFollows));
      localStorage.setItem("followed_artists", JSON.stringify(storedFollows));
      localStorage.setItem("vibeify_unfollowed_artists", JSON.stringify(unfollowedList));
    } catch (err) {
      console.error("Storage error:", err);
    }
  };

  const handlePlayArtist = () => {
    if (artistSongs.length === 0) return;
    const context = {
      type: "artist",
      name: artistData?.name,
      image: artistData?.image,
    };

    if (currentSong && artistSongs.some((s) => s._id === currentSong._id)) {
      togglePlay();
    } else {
      playSong(artistSongs[0], artistSongs, context);
    }
  };

  const handleTrackSelect = (song) => {
    const context = {
      type: "artist",
      name: artistData?.name,
      image: artistData?.image,
    };
    playSong(song, artistSongs, context);
  };

  const handleLikeSong = async (e, songId) => {
    e.stopPropagation();
    if (!user) {
      showToast("Please log in to like tracks", "info");
      return;
    }
    await toggleLikeSong(songId);
    const isLiked = likedIds.includes(songId);
    setLikedIds((prev) =>
      isLiked ? prev.filter((id) => id !== songId) : [...prev, songId]
    );
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast(t("artistLinkCopied"), "success");
  };

  const isCurrentArtistPlaying =
    isPlaying && currentSong && artistSongs.some((s) => s._id === currentSong._id);

  const initial = (displayName || "A").charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className={`artists-page theme-${theme}`}>
        <div className="artists-loading">
          <div className="loading-spinner" />
          <p>Loading {displayName}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`artists-page artist-details-page theme-${theme}`}>
      <button className="back-nav-btn" onClick={() => navigate("/artists")}>
        <FaChevronLeft size={12} /> {t("backToArtists")}
      </button>

      {/* HERO BANNER */}
      <div className="artist-hero-card">
        {artistData?.image && !imgError && (
          <div
            className="hero-backdrop-blur"
            style={{ backgroundImage: `url(${artistData.image})` }}
          />
        )}

        <div className="artist-hero-avatar-wrap">
          {artistData?.image && !imgError ? (
            <img
              src={artistData.image}
              alt={displayName}
              className="artist-hero-avatar"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="artist-hero-avatar artist-avatar-initial">{initial}</div>
          )}

          {isCurrentArtistPlaying && (
            <div className="hero-sound-wave" title="Playing">
              <span className="bar b1" />
              <span className="bar b2" />
              <span className="bar b3" />
              <span className="bar b4" />
            </div>
          )}
        </div>

        <div className="artist-hero-meta">
          <span className="artist-simple-tag">{t("artists") || "Artist"}</span>
          <h1 className="artist-hero-title">{displayName}</h1>

          <div className="artist-hero-stats">
            <span>{artistData?.monthlyListeners} {t("monthlyListeners")}</span>
            <span className="stat-dot">•</span>
            <span>{artistSongs.length} {t("tracksOnVibeify")}</span>
          </div>

          <div className="artist-hero-actions">
            <button
              className={`artist-main-play-btn ${isCurrentArtistPlaying ? "is-playing" : ""}`}
              onClick={handlePlayArtist}
              disabled={artistSongs.length === 0}
            >
              {isCurrentArtistPlaying ? <FaPause size={14} /> : <FaPlay size={13} style={{ marginLeft: "2px" }} />}
              <span>{isCurrentArtistPlaying ? (t("pauseBtn") || "Pause") : (t("playAll") || "Play All")}</span>
            </button>

            <button
              className={`artist-icon-btn ${isFollowing ? "active-follow" : ""}`}
              onClick={handleToggleFollow}
              title={isFollowing ? (t("following") || "Following") : "Follow"}
            >
              {isFollowing ? (
                <FaHeart size={15} color="#ff4ecd" />
              ) : (
                <FaRegHeart size={15} />
              )}
            </button>

            <button className="artist-icon-btn" onClick={handleShare} title="Share Profile">
              <FaShareAlt size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* TRACKS LIST HEADER */}
      <div className="artist-tabs-bar">
        <div className="artist-subtab active">
          {t("popularSongs")} <span className="tab-counter">({artistSongs.length})</span>
        </div>
      </div>

      {/* TRACKS TABLE */}
      <div className="artist-songs-table">
        {artistSongs.map((song, i) => {
          const isThisPlaying = currentSong?._id === song._id && isPlaying;
          const isLiked = likedIds.includes(song._id);

          return (
            <div
              key={song._id || i}
              className={`artist-song-row ${isThisPlaying ? "active-track" : ""}`}
              onClick={() => handleTrackSelect(song)}
            >
              <div className="track-idx">
                {isThisPlaying ? (
                  <div className="equalizer-mini">
                    <span className="eq-bar eq1" />
                    <span className="eq-bar eq2" />
                    <span className="eq-bar eq3" />
                  </div>
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </div>

              <div className="track-thumb-wrap">
                <img src={song.image} alt={song.title} className="track-thumb" />
                <div className="track-thumb-overlay">
                  {isThisPlaying ? <FaPause size={12} /> : <FaPlay size={12} style={{ marginLeft: "2px" }} />}
                </div>
              </div>

              <div className="track-info-col">
                <div className="track-title-txt">{song.title}</div>
                <div className="track-artist-txt">{song.artist}</div>
              </div>

              <div className="track-album-txt">{song.album || "Single"}</div>

              <button
                className="track-like-btn"
                onClick={(e) => handleLikeSong(e, song._id)}
                title="Like"
              >
                {isLiked ? <FaHeart color="#ff4ecd" size={15} /> : <FaRegHeart size={15} />}
              </button>

              <button
                className="track-play-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentSong?._id === song._id) {
                    togglePlay();
                  } else {
                    handleTrackSelect(song);
                  }
                }}
              >
                {isThisPlaying ? <FaPause size={13} /> : <FaPlay size={13} style={{ marginLeft: "2px" }} />}
              </button>
            </div>
          );
        })}

        {artistSongs.length === 0 && (
          <div className="artists-empty">
            <p>No songs found for this artist.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistDetails;