import React, { useEffect, useState } from "react";
import { 
  FaUserShield, 
  FaShieldAlt, 
  FaPlay, 
  FaHeart, 
  FaFolderPlus, 
  FaClock, 
  FaUserEdit, 
  FaCog, 
  FaBell, 
  FaSignOutAlt,
  FaTimes,
  FaPencilAlt
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext"; 
import { getUserProfile, updateProfile } from "../../services/api"; 
import "./Profile.css";

const Profile = () => {
  const { user, logout, updateUser } = useAuth(); 
  const { showToast } = useToast();
  const { t, theme } = useSettings(); 

  const [profileStats, setProfileStats] = useState({
    songsPlayedCount: 0,
    likedSongsCount: 0,
    playlistsCreatedCount: 0,
    totalListeningTime: 24,
  });
  const [loading, setLoading] = useState(true);

  // --- Edit Profile Modal State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user?.username) {
      setNewUsername(user.username);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    getUserProfile()
      .then((res) => {
        if (res.data) {
          setProfileStats({
            songsPlayedCount: res.data.songsPlayedCount || 0,
            likedSongsCount: res.data.likedSongsCount || 0,
            playlistsCreatedCount: res.data.playlistsCreatedCount || 0,
            totalListeningTime: res.data.totalListeningTime || 24,
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load user profile stats:", err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleAction = (actionName) => {
    showToast(`${actionName} ${t("featureComingSoon")}`, "info");
  };

  // Handle Profile Update Submission
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      showToast("Username cannot be empty", "error");
      return;
    }

    setIsUpdating(true);
    try {
      const res = await updateProfile({ username: newUsername.trim() });
      
      if (updateUser && res.data) {
        updateUser(res.data);
      } else if (user) {
        user.username = newUsername.trim();
      }

      showToast("Profile name updated successfully! ✨", "success");
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className={`profile-page theme-${theme}`}>
        <div className="profile-empty-state">
          <FaShieldAlt className="empty-icon" />
          <h2>{t("accessDenied")}</h2>
          <p className="muted">{t("accessDeniedDesc")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`profile-page theme-${theme}`}>
      {/* Animated Background Ambient Glows */}
      <div className="profile-ambient-glow glow-left" />
      <div className="profile-ambient-glow glow-right" />
      <div className="profile-ambient-glow glow-center" />

      {/* Hero Header */}
      <div className="profile-header animate-slide-up delay-1">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">
            {user.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="avatar-glow" />
        </div>

        <div className="profile-info">
          {/* 🚀 New Vibeify Elite Label & Premium Star SVG Icon */}
          <div className="profile-label" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style={{ filter: "drop-shadow(0 0 6px var(--accent-glow))" }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span>Vibeify Elite</span>
          </div>
          
          <div className="username-edit-row" style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <h1 className="animated-username" style={{ margin: 0 }}>{user.username}</h1>
            <button 
              type="button"
              className="inline-username-edit-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditModalOpen(true);
              }}
              title="Edit Username"
              style={{
                background: "var(--accent-glow)",
                border: "1px solid var(--accent-primary)",
                color: "var(--accent-secondary)",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <FaPencilAlt size={12} />
            </button>
          </div>

          <div className="profile-email">{user.email}</div>

          {user.role === "admin" && (
            <span className="admin-badge">
              <FaUserShield />
              {t("adminRole")}
            </span>
          )}
        </div>
        
        <button 
          type="button"
          className="edit-profile-btn" 
          onClick={(e) => {
            e.stopPropagation();
            setIsEditModalOpen(true);
          }}
        >
          <FaUserEdit /> {t("editProfile")}
        </button>
      </div>

      {/* Cyber-Glass Stats Grid */}
      <div className="profile-stats animate-slide-up delay-2">
        <div className="stat-card">
          <div className="stat-icon-wrapper cyan">
            <FaPlay />
          </div>
          <div className="stat-details">
            <h2>{profileStats.songsPlayedCount}</h2>
            <p>{t("songsPlayed")}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper pink">
            <FaHeart />
          </div>
          <div className="stat-details">
            <h2>{profileStats.likedSongsCount}</h2>
            <p>{t("likedSongs")}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper purple">
            <FaFolderPlus />
          </div>
          <div className="stat-details">
            <h2>{profileStats.playlistsCreatedCount}</h2>
            <p>{t("playlistsCreated")}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper orange">
            <FaClock />
          </div>
          <div className="stat-details">
            <h2>{profileStats.totalListeningTime}h</h2>
            <p>{t("listeningTime")}</p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Account Info & Quick Actions */}
      <div className="profile-bottom-grid animate-slide-up delay-3">
        <div className="profile-card">
          <div className="card-header">
            <div className="header-icon-box info-box">
              <FaShieldAlt />
            </div>
            <h3>{t("accountInfo")}</h3>
          </div>

          <div className="info-grid">
            <div className="info-row hoverable" onClick={() => setIsEditModalOpen(true)} style={{ cursor: "pointer" }}>
              <span>{t("usernameLabel")}</span>
              <strong style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {user.username} <FaPencilAlt size={10} color="var(--accent-secondary)" />
              </strong>
            </div>

            <div className="info-row">
              <span>{t("emailLabel")}</span>
              <strong>{user.email}</strong>
            </div>

            <div className="info-row">
              <span>{t("accountRoleLabel")}</span>
              <strong className="role-tag">{user.role === "admin" ? t("adminRole") : t("defaultUserRole")}</strong>
            </div>

            <div className="info-row">
              <span>{t("statusLabel")}</span>
              <strong className="status-active">
                <span className="status-dot" /> {t("statusActive")}
              </strong>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <div className="card-header">
            <div className="header-icon-box settings-box">
              <FaCog />
            </div>
            <h3>{t("quickSettings")}</h3>
          </div>
          
          <div className="settings-list">
            <button className="settings-btn" onClick={() => handleAction(t("notifications"))}>
              <div className="settings-btn-left">
                <FaBell className="settings-icon blue" />
                <span>{t("notifications")}</span>
              </div>
              <span className="settings-arrow">→</span>
            </button>

            <button className="settings-btn" onClick={() => handleAction(t("privacySecurity"))}>
              <div className="settings-btn-left">
                <FaShieldAlt className="settings-icon green" />
                <span>{t("privacySecurity")}</span>
              </div>
              <span className="settings-arrow">→</span>
            </button>

            <button className="settings-btn danger" onClick={() => logout ? logout() : handleAction(t("signOut"))}>
              <div className="settings-btn-left">
                <FaSignOutAlt className="settings-icon red" />
                <span>{t("signOut")}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* --- EDIT PROFILE MODAL --- */}
      {isEditModalOpen && (
        <div className="profile-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="profile-modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-top-bar">
              <div className="profile-status-indicator">
                <span className="profile-status-text">STUDIO SETTINGS</span>
              </div>
              <button className="profile-modal-close-btn" onClick={() => setIsEditModalOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="profile-modal-header">
              <h2 className="profile-modal-title">Edit Profile</h2>
              <p className="profile-modal-subtitle">Update your public display name on Vibeify.</p>
            </div>

            <form onSubmit={handleUpdateProfile} className="profile-modal-body">
              <div>
                <label className="profile-modal-label">Display Name / Username</label>
                <input
                  type="text"
                  className="profile-modal-input"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter new username..."
                  autoFocus
                  required
                />
              </div>

              <div className="profile-modal-actions">
                <button
                  type="button"
                  className="profile-btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="profile-btn-primary"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;