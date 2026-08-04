import { useEffect, useState, useRef } from "react";
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
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
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

const TABS = [
  { key: "overview", label: "Overview", icon: <FaChartBar /> },
  { key: "songs", label: "Songs", icon: <FaMusic /> },
  { key: "users", label: "Users", icon: <FaUsers /> },
];

const DEFAULT_IMAGE = "https://via.placeholder.com/150/1e1e24/ffffff?text=Vibeify";

const Admin = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");

  if (!user || user.role !== "admin") {
    return (
      <div className="admin-page">
        <h1>Admin Dashboard</h1>
        <div className="admin-access-denied">
          <FaExclamationTriangle className="denied-icon" />
          <p className="muted">
            You need an admin account to view this dashboard. Set a user's role to
            {" "}<code>"admin"</code> directly in MongoDB to unlock access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>

      <div className="admin-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={tab === t.key ? "admin-tab active" : "admin-tab"}
            onClick={() => setTab(t.key)}
          >
            {t.icon} {t.label}
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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getAdminStats()
      .then((res) => {
        // Safe extraction whether response is res.data.data or direct res.data
        const payload = res.data?.data || res.data;
        setStats(payload);
      })
      .catch((err) => {
        console.error("Admin stats fetch error:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="admin-loading-state">
        <FaSpinner className="spinner-icon" />
        <p className="muted">Loading dashboard metrics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return <p className="muted">Failed to load system metrics. Please refresh.</p>;
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
            <div className="stat-label">Total Songs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaUsers /></div>
          <div>
            <div className="stat-value">{stats.totalUsers ?? 0}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaListUl /></div>
          <div>
            <div className="stat-value">{stats.totalPlaylists ?? 0}</div>
            <div className="stat-label">Total Playlists</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaUserShield /></div>
          <div>
            <div className="stat-value">{stats.totalAdmins ?? 0}</div>
            <div className="stat-label">Admins</div>
          </div>
        </div>
      </div>

      <div className="overview-grid">
        <div className="overview-panel">
          <h3>Song Uploads (Last 7 Days)</h3>
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
                    title={`${countVal} song${countVal === 1 ? "" : "s"} on ${d.date}`}
                  />
                  <span className="bar-label">{d.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="overview-panel">
          <h3>Recently Added Songs</h3>
          {!stats.recentUploads || stats.recentUploads.length === 0 ? (
            <p className="muted">No songs uploaded yet.</p>
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
          <h3>Newest Users</h3>
          {!stats.recentUsers || stats.recentUsers.length === 0 ? (
            <p className="muted">No users registered yet.</p>
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
                      {u.role === "admin" && <span className="tiny-badge">admin</span>}
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

// ---------------- Songs Tab ----------------

const SongsTab = () => {
  const [songs, setSongs] = useState([]);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const audioInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const loadSongs = () => {
    getSongs()
      .then((res) => {
        const dataList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setSongs(dataList);
      })
      .catch((err) => console.error("Load songs error:", err));
  };

  useEffect(() => {
    loadSongs();
  }, []);

  const resetForm = () => {
    setTitle("");
    setArtist("");
    setAlbum("");
    setAudioFile(null);
    setImageFile(null);
    if (audioInputRef.current) audioInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!audioFile || !imageFile || !title.trim() || !artist.trim()) {
      setStatus({
        type: "error",
        msg: "Please complete all required fields and select both files.",
      });
      return;
    }

    setUploading(true);
    setStatus({ type: "", msg: "" });

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("artist", artist.trim());
      formData.append("album", album.trim());
      formData.append("audio", audioFile);
      formData.append("image", imageFile);

      await uploadSong(formData);
      setStatus({ type: "success", msg: "Song successfully uploaded and published!" });
      resetForm();
      loadSongs();
    } catch (err) {
      setStatus({
        type: "error",
        msg: err.response?.data?.message || "Upload failed. Check file formats.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this song?")) return;
    setDeletingId(id);
    try {
      await deleteSong(id);
      loadSongs();
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete song");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredSongs = songs.filter(
    (s) =>
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.artist?.toLowerCase().includes(search.toLowerCase()) ||
      s.album?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <form className="upload-form" onSubmit={handleUpload}>
        <div className="form-row">
          <input
            type="text"
            placeholder="Song Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Artist Name *"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Album (Optional)"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label className="file-label">
            <span>Audio Track (MP3/WAV) *</span>
            <div className={`file-dropzone ${audioFile ? "has-file" : ""}`}>
              <FaFileAudio className="file-icon" />
              <span className="file-name">
                {audioFile ? audioFile.name : "Choose audio track..."}
              </span>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files[0] || null)}
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
            <span>Cover Artwork (PNG/JPG) *</span>
            <div className={`file-dropzone ${imageFile ? "has-file" : ""}`}>
              <FaFileImage className="file-icon" />
              <span className="file-name">
                {imageFile ? imageFile.name : "Choose cover image..."}
              </span>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0] || null)}
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
                <FaSpinner className="spinner-icon" /> Uploading Track...
              </>
            ) : (
              <>
                <FaUpload /> Publish Song
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
        <h2>Existing Catalog ({filteredSongs.length})</h2>
        <div className="mini-search">
          <FaSearch />
          <input
            type="text"
            placeholder="Search title, artist or album..."
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
              <div className="song-title">{song.title}</div>
              <div className="song-artist">
                {song.artist} {song.album && `• ${song.album}`}
              </div>
            </div>
            <button
              type="button"
              className="delete-btn"
              onClick={() => handleDelete(song._id)}
              disabled={deletingId === song._id}
              title="Delete track"
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
          <p className="muted empty-list-notice">No matching songs found in database.</p>
        )}
      </div>
    </div>
  );
};

// ---------------- Users Tab ----------------

const UsersTab = ({ currentUserId }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionUserId, setActionUserId] = useState(null);

  const loadUsers = (query) => {
    getAdminUsers(query)
      .then((res) => {
        // Safe check for user list payload
        const userList = Array.isArray(res.data) 
          ? res.data 
          : (res.data?.users || res.data?.data || []);
        setUsers(userList);
      })
      .catch((err) => console.error("Load users error:", err))
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
    } catch (err) {
      alert(err.response?.data?.message || "Failed to modify role");
    } finally {
      setActionUserId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user and all associated playlists permanently?")) {
      return;
    }
    setActionUserId(id);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove user");
    } finally {
      setActionUserId(null);
    }
  };

  return (
    <div>
      <div className="admin-list-header">
        <h2>Registered Users {!loading && `(${users.length})`}</h2>
        <div className="mini-search">
          <FaSearch />
          <input
            type="text"
            placeholder="Search username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="admin-loading-state">
          <FaSpinner className="spinner-icon" />
          <p className="muted">Fetching users...</p>
        </div>
      ) : (
        <div className="user-table-wrapper">
          <div className="user-table">
            <div className="user-table-head">
              <span>User</span>
              <span>Email</span>
              <span>Access Level</span>
              <span className="text-right">Actions</span>
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
                    {isSelf && <span className="you-tag">(you)</span>}
                  </div>

                  <div className="user-cell-email">{u.email}</div>

                  <div>
                    <button
                      type="button"
                      className={`role-pill ${u.role === "admin" ? "role-admin" : "role-user"}`}
                      onClick={() => handleRoleToggle(u)}
                      disabled={isSelf || isProcessing}
                      title={
                        isSelf
                          ? "You cannot revoke your own admin rights"
                          : `Change access level to ${u.role === "admin" ? "user" : "admin"}`
                      }
                    >
                      {isProcessing ? (
                        <FaSpinner className="spinner-icon" />
                      ) : (
                        <FaUserShield />
                      )}
                      <span>{u.role}</span>
                    </button>
                  </div>

                  <div className="cell-actions">
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleDelete(u._id)}
                      disabled={isSelf || isProcessing}
                      title={isSelf ? "You cannot delete yourself" : "Delete User Account"}
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
              <p className="muted empty-list-notice">No user accounts found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;