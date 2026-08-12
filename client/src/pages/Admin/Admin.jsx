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
  FaCheckCircle,
  FaExclamationTriangle,
  FaFileAudio,
  FaFileImage,
  FaTimes,
  FaUserCog,
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
  updateUserRole,
  deleteUser,
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
            <div className="header-icon-box" style={{ 
              width: "56px", 
              height: "56px", 
              background: "var(--accent-gradient)", 
              borderRadius: "16px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              color: "#ffffff",
              boxShadow: "0 8px 25px var(--accent-glow)",
              flexShrink: 0
            }}>
              <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" opacity="0.2"/>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="10" r="2.5" fill="currentColor" />
                <path d="M7.5 17c1.5-2 3-3 4.5-3s3 1 4.5 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h1 className="library-title-group h1" style={{ margin: 0, background: "linear-gradient(135deg, #ffffff 20%, var(--accent-secondary) 80%, var(--accent-primary) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {t("adminDashboard")}
              </h1>
            </div>
          </div>
        </div>
        <div className="admin-access-denied">
          <FaExclamationTriangle className="denied-icon" />
          <p className="muted">
            {t("adminRequiredMsg")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-page theme-${theme}`}>
      <div className="library-header" style={{ marginBottom: "28px" }}>
        <div className="library-title-group" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className="header-icon-box" style={{ 
            width: "56px", 
            height: "56px", 
            background: "var(--accent-gradient)", 
            borderRadius: "16px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            color: "#ffffff",
            boxShadow: "0 8px 25px var(--accent-glow)",
            flexShrink: 0
          }}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" opacity="0.2"/>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="10" r="2.5" fill="currentColor" />
              <path d="M7.5 17c1.5-2 3-3 4.5-3s3 1 4.5 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontFamily: "'Outfit', sans-serif",
              fontSize: "clamp(32px, 4vw, 44px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              background: "linear-gradient(135deg, #ffffff 20%, var(--accent-secondary) 80%, var(--accent-primary) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 25px var(--accent-glow))"
            }}>
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
  const [error, setError] = useState(false);

  useEffect(() => {
    getAdminStats()
      .then((res) => {
        const payload = res.data?.data || res.data;
        setStats(payload);
        showToast(t("systemMetricsUpdated"), "info");
      })
      .catch((err) => {
        console.error("Admin stats fetch error:", err);
        setError(true);
        showToast(t("failedFetchMetrics"), "error");
      })
      .finally(() => setLoading(false));
  }, [showToast, t]);

  if (loading) {
    return (
      <div className="admin-loading-state">
        <FaSpinner className="spinner-icon" />
        <p className="muted">{t("loadingMetrics")}</p>
      </div>
    );
  }

  if (error || !stats) {
    return <p className="muted">{t("failedLoadMetrics")}</p>;
  }

  const uploadActivity = stats.uploadActivity || [];
  const maxCount = Math.max(
    1,
    ...uploadActivity.map((d) => Number(d.count) || 0)
  );

  return (
    <div className="overview-tab">
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-icon"><FaMusic /></div>
          <div>
            <div className="stat-value">{stats.totalSongs ?? 0}</div>
            <div className="stat-label">{t("totalSongs")}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaUsers /></div>
          <div>
            <div className="stat-value">{stats.totalUsers ?? 0}</div>
            <div className="stat-label">{t("totalUsers")}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaListUl /></div>
          <div>
            <div className="stat-value">{stats.totalPlaylists ?? 0}</div>
            <div className="stat-label">{t("totalPlaylists")}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaUserShield /></div>
          <div>
            <div className="stat-value">{stats.totalAdmins ?? 0}</div>
            <div className="stat-label">{t("admins")}</div>
          </div>
        </div>
      </div>

      <div className="overview-grid">
        <div className="overview-panel">
          <h3>{t("songUploads")}</h3>
          <div className="bar-chart">
            {uploadActivity.map((d) => {
              const countVal = Number(d.count) || 0;
              const calculatedHeight = (countVal / maxCount) * 100;
              const barHeight = countVal > 0 ? Math.max(12, calculatedHeight) : 6;

              return (
                <div key={d.date} className="bar-col">
                  <div
                    className="bar"
                    style={{ height: `${barHeight}%` }}
                    title={`${countVal} ${countVal === 1 ? t("song") : t("songs")} on ${d.date}`}
                  />
                  <span className="bar-label">{d.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="overview-panel">
          <h3>{t("recentlyAddedSongs")}</h3>
          {!stats.recentUploads || stats.recentUploads.length === 0 ? (
            <p className="muted">{t("noSongsUploaded")}</p>
          ) : (
            <ul className="mini-list">
              {stats.recentUploads.map((s) => (
                <li key={s._id}>
                  <img
                    src={s.image || DEFAULT_IMAGE}
                    alt={s.title}
                    loading="lazy"
                    onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                  />
                  <div>
                    <div className="mini-title">{s.title}</div>
                    <div className="mini-sub">{s.artist}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="overview-panel">
          <h3>{t("newestUsers")}</h3>
          {!stats.recentUsers || stats.recentUsers.length === 0 ? (
            <p className="muted">{t("noUsersRegistered")}</p>
          ) : (
            <ul className="mini-list">
              {stats.recentUsers.map((u) => (
                <li key={u._id}>
                  <div className="avatar-circle">
                    {u.username?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="mini-title">
                      {u.username}{" "}
                      {u.role === "admin" && <span className="tiny-badge">{t("adminRoleLabel")}</span>}
                    </div>
                    <div className="mini-sub">{u.email}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------------- Songs Tab with Custom Dropdown & Delete Modal ----------------
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
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Modal State for Songs
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, song: null });

  const audioInputRef = useRef(null);
  const imageInputRef = useRef(null);
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
      .then((res) => {
        const dataList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setSongs(dataList);
      })
      .catch((err) => {
        console.error("Load songs error:", err);
        showToast(t("failedFetchSongsCatalog"), "error");
      });
  };

  useEffect(() => {
    loadSongs();
  }, []);

  const resetForm = () => {
    setTitle("");
    setArtist("");
    setAlbum("");
    setCategory("Tamil");
    setAudioFile(null);
    setImageFile(null);
    if (audioInputRef.current) audioInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleAudioSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStatus({ type: "", msg: "" });
    setAudioFile(file);
    showToast(`${t("audioAttached")} "${file.name}"`, "info");
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStatus({ type: "", msg: "" });
    setImageFile(file);
    showToast(`${t("coverAttached")} "${file.name}"`, "info");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!audioFile || !imageFile || !title.trim() || !artist.trim()) {
      setStatus({ type: "error", msg: t("completeRequiredFields") });
      showToast(t("completeRequiredFields"), "error");
      return;
    }

    setUploading(true);
    setStatus({ type: "", msg: "" });
    showToast(t("publishingToCloud"), "info");

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

      const successMsg = `"${title.trim()}" ${t("publishedSuccessfully")}`;
      setStatus({ type: "success", msg: successMsg });
      showToast(successMsg, "success");

      resetForm();
      loadSongs();
    } catch (err) {
      const errMsg = err.response?.data?.message || t("uploadFailed");
      setStatus({ type: "error", msg: errMsg });
      showToast(errMsg, "error");
    } finally {
      setUploading(false);
    }
  };

  // Modal Handlers for Songs
  const handleDeleteClick = (song) => {
    setDeleteModal({ isOpen: true, song });
  };

  const handleCloseModal = () => {
    setDeleteModal({ isOpen: false, song: null });
  };

  const handleConfirmDelete = async () => {
    const { song } = deleteModal;
    if (!song) return;

    setDeletingId(song._id);
    try {
      await deleteSong(song._id);
      showToast(`${t("deletedTrack")} "${song.title}" 🗑️`, "info");
      loadSongs();
    } catch (err) {
      showToast(t("couldNotDeleteSong"), "error");
    } finally {
      setDeletingId(null);
      handleCloseModal();
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
          <input
            type="text"
            placeholder={t("songTitleForm")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder={t("artistNameForm")}
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <input
            type="text"
            placeholder={t("albumOptionalForm")}
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
          />

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
              <span className="file-name">
                {audioFile ? audioFile.name : t("chooseAudio")}
              </span>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioSelect}
                required
              />
              {audioFile && (
                <button
                  type="button"
                  className="clear-file-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAudioFile(null);
                    if (audioInputRef.current) audioInputRef.current.value = "";
                  }}
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </label>

          <label className="file-label">
            <span>{t("coverArtworkForm")}</span>
            <div className={`file-dropzone ${imageFile ? "has-file" : ""}`}>
              <FaFileImage className="file-icon" />
              <span className="file-name">
                {imageFile ? imageFile.name : t("chooseCover")}
              </span>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                required
              />
              {imageFile && (
                <button
                  type="button"
                  className="clear-file-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageFile(null);
                    if (imageInputRef.current) imageInputRef.current.value = "";
                  }}
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </label>
        </div>

        <div className="upload-footer">
          <button type="submit" className="upload-btn" disabled={uploading}>
            {uploading ? (
              <>
                <FaSpinner className="spinner-icon" /> {t("uploadingTrack")}
              </>
            ) : (
              <>
                <FaUpload /> {t("publishSong")}
              </>
            )}
          </button>

          {status.msg && (
            <p className={`upload-message ${status.type}`}>
              {status.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
              {status.msg}
            </p>
          )}
        </div>
      </form>

      <div className="admin-list-header">
        <h2>{t("existingCatalog")} ({filteredSongs.length})</h2>
        <div className="mini-search">
          <FaSearch />
          <input
            type="text"
            placeholder={t("searchCatalog")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-song-list">
        {filteredSongs.map((song) => (
          <div key={song._id} className="admin-song-row">
            <img
              src={song.image || DEFAULT_IMAGE}
              alt={song.title}
              loading="lazy"
              onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
            />
            <div className="admin-song-info">
              <div className="song-title">
                {song.title} 
                <span style={{ fontSize: "11px", color: "#ff4ecd", marginLeft: "8px", background: "rgba(255,78,205,0.1)", padding: "2px 8px", borderRadius: "10px" }}>
                  {t("filter" + (song.category || song.genre)) !== "filter" + (song.category || song.genre) 
                    ? t("filter" + (song.category || song.genre)) 
                    : (song.category || song.genre || "General")}
                </span>
              </div>
              <div className="song-artist">
                {song.artist} {song.album && `• ${song.album}`}
              </div>
            </div>
            <button
              type="button"
              className="delete-btn"
              onClick={() => handleDeleteClick(song)}
              disabled={deletingId === song._id}
              title={t("deleteTrackBtn")}
            >
              {deletingId === song._id ? (
                <FaSpinner className="spinner-icon" />
              ) : (
                <FaTrash />
              )}
            </button>
          </div>
        ))}

        {filteredSongs.length === 0 && (
          <p className="muted empty-list-notice">{t("noMatchingSongs")}</p>
        )}
      </div>

      {/* CUSTOM DELETE SONG MODAL */}
      {deleteModal.isOpen && (
        <div className="vibeify-modal-overlay" onClick={handleCloseModal}>
          <div className="vibeify-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-wrapper">
              <FaTrash className="modal-icon error-icon" />
            </div>
            {/* 👈 Dynamic Translation added to Modal Title */}
            <h3>{t("deleteTrackTitle")}</h3>
            <p>{t("confirmDeleteTrack")} <strong>"{deleteModal.song?.title}"</strong>?</p>
            <div className="modal-actions">
              {/* 👈 Dynamic Translation added to Modal Buttons */}
              <button className="modal-btn cancel" onClick={handleCloseModal}>
                {t("cancel")}
              </button>
              <button className="modal-btn confirm" onClick={handleConfirmDelete}>
                {t("deleteTrackBtn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------- Users Tab with Delete Modal ----------------
const UsersTab = ({ currentUserId }) => {
  const { showToast } = useToast();
  const { t } = useSettings();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionUserId, setActionUserId] = useState(null);

  // Modal State for Users
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, targetUser: null });

  const loadUsers = (query) => {
    getAdminUsers(query)
      .then((res) => {
        const userList = Array.isArray(res.data) 
          ? res.data 
          : (res.data?.users || res.data?.data || []);
        setUsers(userList);
      })
      .catch((err) => {
        console.error("Load users error:", err);
        showToast(t("failedFetchUsers"), "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      loadUsers(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleRoleToggle = async (u) => {
    const newRole = u.role === "admin" ? "user" : "admin";
    setActionUserId(u._id);

    try {
      const res = await updateUserRole(u._id, newRole);
      const updatedUser = res.data?.user || res.data;
      setUsers((prev) => prev.map((x) => (x._id === u._id ? updatedUser : x)));

      showToast(`"${u.username}" ${t("updatedAccessLevel")} ${newRole.toUpperCase()} 🛡️`, "success");
    } catch (err) {
      const errMsg = err.response?.data?.message || t("failedModifyRole");
      showToast(errMsg, "error");
    } finally {
      setActionUserId(null);
    }
  };

  // Modal Handlers for Users
  const handleDeleteClick = (u) => {
    setDeleteModal({ isOpen: true, targetUser: u });
  };

  const handleCloseModal = () => {
    setDeleteModal({ isOpen: false, targetUser: null });
  };

  const handleConfirmDelete = async () => {
    const { targetUser } = deleteModal;
    if (!targetUser) return;
    
    setActionUserId(targetUser._id);
    try {
      await deleteUser(targetUser._id);
      setUsers((prev) => prev.filter((x) => x._id !== targetUser._id));
      showToast(`${t("userAccountDeleted")} ("${targetUser.username}") 🗑️`, "info");
    } catch (err) {
      const errMsg = err.response?.data?.message || t("failedRemoveUser");
      showToast(errMsg, "error");
    } finally {
      setActionUserId(null);
      handleCloseModal();
    }
  };

  return (
    <div>
      <div className="admin-list-header">
        <h2>{t("registeredUsers")} {!loading && `(${users.length})`}</h2>
        <div className="mini-search">
          <FaSearch />
          <input
            type="text"
            placeholder={t("searchUsers")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="admin-loading-state">
          <FaSpinner className="spinner-icon" />
          <p className="muted">{t("fetchingUsers")}</p>
        </div>
      ) : (
        <div className="user-table-wrapper">
          <div className="user-table">
            <div className="user-table-head">
              <span>{t("userHeader")}</span>
              <span>{t("emailHeader")}</span>
              <span>{t("accessLevelHeader")}</span>
              <span className="text-right">{t("actions")}</span>
            </div>

            {users.map((u) => {
              const isSelf = u._id === currentUserId;
              const isProcessing = actionUserId === u._id;

              return (
                <div key={u._id} className="user-row">
                  <div className="user-cell-name">
                    <div className="avatar-circle">
                      {u.username?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="username-text">{u.username}</span>
                    {isSelf && <span className="you-tag">{t("youTag")}</span>}
                  </div>

                  <div className="user-cell-email">{u.email}</div>

                  <div>
                    <button
                      type="button"
                      className={`role-pill ${u.role === "admin" ? "role-admin" : "role-user"}`}
                      onClick={() => handleRoleToggle(u)}
                      disabled={isSelf || isProcessing}
                    >
                      {isProcessing ? (
                        <FaSpinner className="spinner-icon" />
                      ) : (
                        <FaUserShield />
                      )}
                      <span>{u.role === "admin" ? t("adminRoleLabel") : t("userRole")}</span>
                    </button>
                  </div>

                  <div className="cell-actions">
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleDeleteClick(u)}
                      disabled={isSelf || isProcessing}
                      title={t("deleteUserBtn")}
                    >
                      {isProcessing ? (
                        <FaSpinner className="spinner-icon" />
                      ) : (
                        <FaTrash />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}

            {users.length === 0 && (
              <p className="muted empty-list-notice">{t("noUserAccountsFound")}</p>
            )}
          </div>
        </div>
      )}

      {/* CUSTOM DELETE USER MODAL */}
      {deleteModal.isOpen && (
        <div className="vibeify-modal-overlay" onClick={handleCloseModal}>
          <div className="vibeify-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-wrapper">
              <FaUserCog className="modal-icon error-icon" />
            </div>
            {/* 👈 Dynamic Translation added to Modal Title */}
            <h3>{t("deleteUserTitle")}</h3>
            <p>{t("confirmDeleteUser")} <strong>("{deleteModal.targetUser?.username}")</strong></p>
            <div className="modal-actions">
               {/* 👈 Dynamic Translation added to Modal Buttons */}
              <button className="modal-btn cancel" onClick={handleCloseModal}>
                {t("cancel")}
              </button>
              <button className="modal-btn confirm" onClick={handleConfirmDelete}>
                {t("deleteUserBtn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;