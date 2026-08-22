import React, { useEffect, useState, useRef } from "react";
import {
  FaChartBar,
  FaMusic,
  FaUsers,
  FaTrash,
  FaUpload,
  FaUserShield,
  FaSearch,
  FaListUl,
  FaSpinner,
  FaExclamationTriangle,
  FaFileAudio,
  FaFileImage,
  FaMicrophone,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext";
import {
  getSongs,
  uploadSong,
  deleteSong,
  getAdminStats,
  getAdminUsers,
  addArtist,
} from "../../services/api";
import "./Admin.css";

const DEFAULT_IMAGE = "https://via.placeholder.com/150/1e1e24/ffffff?text=Vibeify";

const Admin = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t, theme } = useSettings();

  const [tab, setTab] = useState("overview");

  const TABS = [
    { key: "overview", label: t("overview"), icon: <FaChartBar /> },
    { key: "songs", label: t("songsTab"), icon: <FaMusic /> },
    { key: "users", label: t("users"), icon: <FaUsers /> },
  ];

  useEffect(() => {
    if (user && user.role !== "admin") {
      showToast(t("adminAccessDenied"), "error");
    }
  }, [user, showToast, t]);

  const handleTabChange = (newTab, tabLabel) => {
    setTab(newTab);
    showToast(`${t("switchedToAdmin")} ${tabLabel}`, "info");
  };

  if (!user || user.role !== "admin") {
    return (
      <div className={`admin-page theme-${theme}`}>
        <div className="library-header" style={{ marginBottom: "28px" }}>
          <div className="library-title-group" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div className="header-icon-box" style={{ width: "56px", height: "56px", background: "var(--accent-gradient)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", boxShadow: "0 8px 25px var(--accent-glow)", flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" opacity="0.2"/>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="10" r="2.5" fill="currentColor" />
                <path d="M7.5 17c1.5-2 3-3 4.5-3s3 1 4.5 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h1>{t("adminDashboard")}</h1>
            </div>
          </div>
        </div>
        <div className="admin-access-denied">
          <FaExclamationTriangle className="denied-icon" />
          <p className="muted">{t("adminRequiredMsg")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-page theme-${theme}`}>
      <div className="library-header" style={{ marginBottom: "28px" }}>
        <div className="library-title-group" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className="header-icon-box" style={{ width: "56px", height: "56px", background: "var(--accent-gradient)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", boxShadow: "0 8px 25px var(--accent-glow)", flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" opacity="0.2"/>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="10" r="2.5" fill="currentColor" />
              <path d="M7.5 17c1.5-2 3-3 4.5-3s3 1 4.5 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h1 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 800, color: "#ffffff", background: "linear-gradient(135deg, #ffffff 20%, var(--accent-secondary) 80%, var(--accent-primary) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {t("adminDashboard")}
            </h1>
          </div>
        </div>
      </div>

      <div className="admin-tabs" role="tablist">
        {TABS.map((tItem) => (
          <button
            key={tItem.key}
            role="tab"
            aria-selected={tab === tItem.key}
            className={tab === tItem.key ? "admin-tab active" : "admin-tab"}
            onClick={() => handleTabChange(tItem.key, tItem.label)}
          >
            {tItem.icon} {tItem.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "songs" && <SongsTab />}
      {tab === "users" && <UsersTab currentUserId={user._id} />}
    </div>
  );
};

// ---------------- Overview Tab ----------------
const OverviewTab = () => {
  const { showToast } = useToast();
  const { t } = useSettings();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then((res) => setStats(res.data?.data || res.data))
      .catch(() => showToast(t("failedFetchMetrics"), "error"))
      .finally(() => setLoading(false));
  }, [showToast, t]);

  if (loading) return <div className="admin-loading-state"><FaSpinner className="spinner-icon" /><p className="muted">{t("loadingMetrics")}</p></div>;
  if (!stats) return <p className="muted">{t("failedLoadMetrics")}</p>;

  return (
    <div className="overview-tab">
      <div className="stat-cards">
        <div className="stat-card"><div className="stat-icon"><FaMusic /></div><div><div className="stat-value">{stats.totalSongs ?? 0}</div><div className="stat-label">{t("totalSongs")}</div></div></div>
        <div className="stat-card"><div className="stat-icon"><FaUsers /></div><div><div className="stat-value">{stats.totalUsers ?? 0}</div><div className="stat-label">{t("totalUsers")}</div></div></div>
        <div className="stat-card"><div className="stat-icon"><FaListUl /></div><div><div className="stat-value">{stats.totalPlaylists ?? 0}</div><div className="stat-label">{t("totalPlaylists")}</div></div></div>
        <div className="stat-card"><div className="stat-icon"><FaUserShield /></div><div><div className="stat-value">{stats.totalAdmins ?? 0}</div><div className="stat-label">{t("admins")}</div></div></div>
      </div>
    </div>
  );
};

// ---------------- Songs Tab ----------------
const SongsTab = () => {
  const { showToast } = useToast();
  const { t } = useSettings();
  const [songs, setSongs] = useState([]);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [category, setCategory] = useState("Tamil");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [artistImageFile, setArtistImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, song: null });

  const audioInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const artistImageInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadSongs = () => {
    getSongs()
      .then((res) => setSongs(Array.isArray(res.data) ? res.data : (res.data?.data || [])))
      .catch(() => showToast(t("failedFetchSongsCatalog"), "error"));
  };

  useEffect(() => { loadSongs(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!audioFile || !imageFile || !title.trim() || !artist.trim()) {
      showToast(t("completeRequiredFields"), "error");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("artist", artist.trim());
      formData.append("album", album.trim());
      formData.append("category", category);
      formData.append("genre", category);
      formData.append("audio", audioFile);
      formData.append("image", imageFile);

      await uploadSong(formData);

      if (artistImageFile) {
        try {
          const artistFormData = new FormData();
          artistFormData.append("name", artist.trim());
          artistFormData.append("role", "Composer / Artist");
          artistFormData.append("image", artistImageFile);
          await addArtist(artistFormData);
        } catch {
          showToast("Song published, but artist photo failed to save.", "error");
        }
      }

      showToast(`"${title.trim()}" ${t("publishedSuccessfully")}`, "success");
      setTitle(""); setArtist(""); setAlbum(""); setAudioFile(null); setImageFile(null); setArtistImageFile(null);
      if (audioInputRef.current) audioInputRef.current.value = "";
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (artistImageInputRef.current) artistImageInputRef.current.value = "";
      loadSongs();
    } catch {
      showToast(t("uploadFailed"), "error");
    } finally {
      setUploading(false);
    }
  };

  const filteredSongs = songs.filter(
    (s) =>
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.artist?.toLowerCase().includes(search.toLowerCase()) ||
      s.album?.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.toLowerCase().includes(search.toLowerCase())
  );
  const categories = ["Tamil", "English", "Malayalam", "Hindi", "Telugu", "Kannada", "Other"];

  return (
    <div>
      <form className="upload-form" onSubmit={handleUpload}>
        <div className="form-row">
          <input type="text" placeholder={t("songTitleForm")} value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input type="text" placeholder={t("artistNameForm")} value={artist} onChange={(e) => setArtist(e.target.value)} required />
        </div>

        <div className="form-row">
          <input type="text" placeholder={t("albumOptionalForm")} value={album} onChange={(e) => setAlbum(e.target.value)} />

          <div className="category-select-wrapper" ref={dropdownRef}>
            <label>{t("selectCategoryForm")}</label>
            <div
              className={`custom-select-trigger ${isDropdownOpen ? "open" : ""}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{t("filter" + category) !== "filter" + category ? t("filter" + category) : category}</span>
              <span className="select-arrow">▾</span>
            </div>

            {isDropdownOpen && (
              <div className="custom-options-container">
                {categories.map((cat) => (
                  <div
                    key={cat}
                    className={`custom-option ${category === cat ? "selected" : ""}`}
                    onClick={() => {
                      setCategory(cat);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {t("filter" + cat) !== "filter" + cat ? t("filter" + cat) : cat}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-row">
          <label className="file-label">
            <span>{t("audioTrackForm")}</span>
            <div className={`file-dropzone ${audioFile ? "has-file" : ""}`}>
              <FaFileAudio className="file-icon" />
              <span className="file-name">{audioFile ? audioFile.name : t("chooseAudio")}</span>
              <input ref={audioInputRef} type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} required />
            </div>
          </label>
          <label className="file-label">
            <span>{t("coverArtworkForm")}</span>
            <div className={`file-dropzone ${imageFile ? "has-file" : ""}`}>
              <FaFileImage className="file-icon" />
              <span className="file-name">{imageFile ? imageFile.name : t("chooseCover")}</span>
              <input ref={imageInputRef} type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} required />
            </div>
          </label>
        </div>

        <div className="form-row">
          <label className="file-label" style={{ width: "100%" }}>
            <span>
              <FaMicrophone style={{ marginRight: "6px", verticalAlign: "middle" }} />
              {t("artistPhotoForm") || "Artist Photo (optional)"}
            </span>
            <div className={`file-dropzone ${artistImageFile ? "has-file" : ""}`}>
              <FaFileImage className="file-icon" />
              <span className="file-name">{artistImageFile ? artistImageFile.name : (t("chooseArtistPhoto") || "Choose artist photo...")}</span>
              <input
                ref={artistImageInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setArtistImageFile(e.target.files[0])}
              />
            </div>
          </label>
        </div>

        <div className="upload-footer">
          <button type="submit" className="upload-btn" disabled={uploading}>
            {uploading ? <><FaSpinner className="spinner-icon" /> {t("uploadingTrack")}</> : <><FaUpload /> {t("publishSong")}</>}
          </button>
        </div>
      </form>

      <div className="admin-list-header">
        <h2>{t("existingCatalog")} ({filteredSongs.length})</h2>
        <div className="mini-search"><FaSearch /><input type="text" placeholder={t("searchCatalog")} value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      </div>

      <div className="admin-song-list">
        {filteredSongs.map((song) => (
          <div key={song._id} className="admin-song-row">
            <img src={song.image || DEFAULT_IMAGE} alt={song.title} onError={(e) => { e.target.src = DEFAULT_IMAGE; }} />
            <div className="admin-song-info">
              <div className="song-title">
                {song.title}
                {(song.category || song.genre) && (
                  <span style={{ fontSize: "11px", color: "var(--accent-secondary)", marginLeft: "8px", background: "var(--accent-glow)", padding: "2px 8px", borderRadius: "10px" }}>
                    {(() => {
                      const cat = song.category || song.genre;
                      return t("filter" + cat) !== "filter" + cat ? t("filter" + cat) : cat;
                    })()}
                  </span>
                )}
              </div>
              <div className="song-artist">
                {song.artist} {song.album ? `• ${song.album}` : ""}
              </div>
            </div>
            <button type="button" className="delete-btn" onClick={() => setDeleteModal({ isOpen: true, song })}><FaTrash /></button>
          </div>
        ))}
      </div>

      {deleteModal.isOpen && (
        <div className="vibeify-modal-overlay" onClick={() => setDeleteModal({ isOpen: false, song: null })}>
          <div className="vibeify-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t("deleteTrackTitle")}</h3>
            <p>{t("confirmDeleteTrack")} <strong>"{deleteModal.song?.title}"</strong>?</p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setDeleteModal({ isOpen: false, song: null })}>{t("cancel")}</button>
              <button className="modal-btn confirm" onClick={async () => { await deleteSong(deleteModal.song._id); loadSongs(); setDeleteModal({ isOpen: false, song: null }); }}>{t("deleteTrackBtn")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------- Users Tab ----------------
const UsersTab = ({ currentUserId }) => {
  const { showToast } = useToast();
  const { t } = useSettings();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAdminUsers(search)
      .then((res) => setUsers(Array.isArray(res.data) ? res.data : (res.data?.users || [])))
      .catch(() => showToast(t("failedFetchUsers"), "error"));
  }, [search, t, showToast]);

  return (
    <div>
      <div className="admin-list-header">
        <h2>{t("registeredUsers")}</h2>
        <div className="mini-search"><FaSearch /><input type="text" placeholder={t("searchUsers")} value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      </div>
      <div className="user-table-wrapper">
        <div className="user-table">
          <div className="user-table-head"><span>{t("userHeader")}</span><span>{t("emailHeader")}</span><span>{t("accessLevelHeader")}</span><span className="text-right">{t("actions")}</span></div>
          {users.map((u) => (
            <div key={u._id} className="user-row">
              <div className="user-cell-name"><div className="avatar-circle">{u.username?.[0]?.toUpperCase()}</div><span>{u.username}</span></div>
              <div className="user-cell-email">{u.email}</div>
              <div><span className={`role-pill role-${u.role}`}>{u.role}</span></div>
              <div className="cell-actions"><button className="delete-btn" disabled={u._id === currentUserId}><FaTrash /></button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;