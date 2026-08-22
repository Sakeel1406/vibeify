import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaMicrophone, FaSearch, FaPlay } from "react-icons/fa";
import { getArtists, getSongs } from "../../services/api";
import { useSettings } from "../../context/SettingsContext";
import { useMusic } from "../../context/PlayerContext";
import {
  resolveArtistImage,
  normalizeArtistDisplayName,
  ARTIST_LOCAL_MAP,
} from "../../utils/artistPhotos";
import "./Artists.css";

const ArtistAvatar = ({ image, name }) => {
  const [hasError, setHasError] = useState(false);
  const initial = (name || "A").charAt(0).toUpperCase();

  if (!image || hasError) {
    return <div className="artist-avatar-initial">{initial}</div>;
  }

  return (
    <img
      src={image}
      alt={name}
      className="artist-avatar-img"
      onError={() => setHasError(true)}
    />
  );
};

// Check if raw name corresponds to an allowed artist key
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

const Artists = () => {
  const navigate = useNavigate();
  const { t, theme } = useSettings();
  const { playSong } = useMusic();
  const [artists, setArtists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getArtists().catch(() => ({ data: [] })),
      getSongs().catch(() => ({ data: [] })),
    ])
      .then(([artistsRes, songsRes]) => {
        const dbArtists = Array.isArray(artistsRes.data) ? artistsRes.data : [];
        const allSongs = Array.isArray(songsRes.data) ? songsRes.data : (songsRes.data?.data || []);

        setSongs(allSongs);

        const uniqueArtistsMap = new Map();

        // 1. Pre-populate allowed artists registered in DB
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

        // 2. Count ALL songs where artist is either primary or collaborator
        allSongs.forEach((song) => {
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

        // 3. Sort by track count descending
        const list = Array.from(uniqueArtistsMap.values()).sort(
          (a, b) => (b.trackCount || 0) - (a.trackCount || 0)
        );

        setArtists(list);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredArtists = artists.filter((a) =>
    a.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handlePlayArtist = (e, artist) => {
    e.stopPropagation();
    const artistTracks = songs.filter((s) => {
      if (!s.artist) return false;
      const parts = s.artist.split(/[,&/]| ft\. | feat\. /i).map((p) => p.trim().toLowerCase());
      return parts.some((p) => {
        const canonical = matchAllowedArtistKey(p);
        return canonical && canonical.toLowerCase() === artist.name.toLowerCase();
      });
    });

    if (artistTracks.length > 0) {
      playSong(artistTracks[0], artistTracks, {
        type: "artist",
        name: artist.name,
        image: artist.image,
      });
    }
  };

  return (
    <div className={`artists-page theme-${theme}`}>
      <div className="artists-header">
        <div className="artists-title-group">
          <div className="header-icon-box">
            <FaMicrophone size={26} />
          </div>
          <div>
            <h1 className="artists-title">{t("topArtists") || "Top Artists"}</h1>
            <p className="artists-subtitle">{t("artistsSubtitle") || "Explore chart-topping creators and music icons"}</p>
          </div>
        </div>

        <div className="artists-search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={t("searchArtistsPlaceholder") || "Search artists..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="artists-loading">
          <div className="loading-spinner" />
          <p>{t("loadingTopArtists") || "Loading Top Artists..."}</p>
        </div>
      ) : (
        <div className="artists-grid">
          {filteredArtists.map((artist, idx) => (
            <div
              key={artist.id || artist.name || idx}
              className="artist-circle-card"
              onClick={() => navigate(`/artist/${encodeURIComponent(artist.name)}`)}
            >
              <div className="artist-avatar-wrap">
                <ArtistAvatar image={artist.image} name={artist.name} />

                <button
                  className="artist-play-hover"
                  aria-label={`Play ${artist.name}`}
                  onClick={(e) => handlePlayArtist(e, artist)}
                >
                  <FaPlay />
                </button>
              </div>

              <div className="artist-card-info">
                <h3 className="artist-card-name">{artist.name}</h3>
                <p className="artist-card-listeners">
                  {artist.trackCount > 0 ? `${artist.trackCount} ${t("tracks") || "Tracks"}` : (t("trendingArtist") || "Trending Artist")}
                </p>
              </div>
            </div>
          ))}

          {filteredArtists.length === 0 && (
            <div className="artists-empty">
              <p>{t("noArtistsFound") || "No artists found matching"} "{search}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Artists;