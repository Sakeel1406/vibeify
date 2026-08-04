import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { getSongs } from "../../services/api";
import SongCard from "../../components/SongCard/SongCard";
import "./Search.css";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSongs().then((res) => setAllSongs(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => {
      getSongs(query)
        .then((res) => setResults(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSearchParams(value ? { q: value } : {});
  };

  const artists = [...new Set(allSongs.map((s) => s.artist))].slice(0, 8);
  const albums = [...new Set(allSongs.map((s) => s.album))].slice(0, 8);

  return (
    <div className="search-page">
      <div className="search-input-wrap">
        <FaSearch className="search-page-icon" />
        <input
          type="text"
          placeholder="What do you want to listen to?"
          value={query}
          onChange={handleChange}
          className="search-page-input"
        />
      </div>

      {query.trim() ? (
        <section className="search-section">
          <h2>Songs</h2>
          {loading ? (
            <p className="muted">Searching...</p>
          ) : results.length === 0 ? (
            <p className="muted">No results found for "{query}"</p>
          ) : (
            <div className="song-grid">
              {results.map((song) => (
                <SongCard key={song._id} song={song} songList={results} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          <section className="search-section">
            <h2>Browse Artists</h2>
            <div className="chip-grid">
              {artists.length === 0 && <p className="muted">No artists yet.</p>}
              {artists.map((artist) => (
                <button key={artist} className="chip" onClick={() => handleChange({ target: { value: artist } })}>
                  {artist}
                </button>
              ))}
            </div>
          </section>

          <section className="search-section">
            <h2>Browse Albums</h2>
            <div className="chip-grid">
              {albums.length === 0 && <p className="muted">No albums yet.</p>}
              {albums.map((album) => (
                <button key={album} className="chip" onClick={() => handleChange({ target: { value: album } })}>
                  {album}
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Search;
