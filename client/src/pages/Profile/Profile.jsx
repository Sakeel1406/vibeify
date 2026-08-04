import React, { useEffect, useState } from "react";
import { FaUserShield, FaShieldAlt } from "react-icons/fa";
import { FaPlay, FaHeart, FaFolderPlus } from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import { getUserProfile } from "../../services/api";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();
  const [profileStats, setProfileStats] = useState({
    songsPlayedCount: 0,
    likedSongsCount: 0,
    playlistsCreatedCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    getUserProfile()
      .then((res) => {
        if (res.data) {
          setProfileStats({
            songsPlayedCount: res.data.songsPlayedCount || 0,
            likedSongsCount: res.data.likedSongsCount || 0,
            playlistsCreatedCount: res.data.playlistsCreatedCount || 0,
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load user profile stats:", err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-empty-state">
          <h2>Access Denied</h2>
          <p className="muted">
            Please log in to view your profile dashboard and personal stats.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Background Ambient Glows */}
      <div className="profile-ambient-glow glow-left" />
      <div className="profile-ambient-glow glow-right" />

      {/* Hero Header */}
      <div className="profile-header">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">
            {user.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="avatar-glow" />
        </div>

        <div className="profile-info">
          <div className="profile-label">USER PROFILE</div>
          <h1>{user.username}</h1>
          <div className="profile-email">{user.email}</div>

          {user.role === "admin" && (
            <span className="admin-badge">
              <FaUserShield />
              Administrator
            </span>
          )}
        </div>
      </div>

      {/* Cyber-Glass Stats Grid */}
      <div className="profile-stats">
        {/* Songs Played Card (Mapped from recentlyPlayed array) */}
        <div className="stat-card cyan-card">
          <div className="stat-icon-wrapper cyan">
            <FaPlay className="stat-icon" />
          </div>
          <div className="stat-details">
            <h2>{profileStats.songsPlayedCount}</h2>
            <p>Songs Played</p>
          </div>
        </div>

        {/* Liked Songs Card (Mapped from likedSongs array) */}
        <div className="stat-card pink-card">
          <div className="stat-icon-wrapper pink">
            <FaHeart className="stat-icon" />
          </div>
          <div className="stat-details">
            <h2>{profileStats.likedSongsCount}</h2>
            <p>Liked Songs</p>
          </div>
        </div>

        {/* Playlists Created Card (Dynamically counted from Playlist collection) */}
        <div className="stat-card purple-card">
          <div className="stat-icon-wrapper purple">
            <FaFolderPlus className="stat-icon" />
          </div>
          <div className="stat-details">
            <h2>{profileStats.playlistsCreatedCount}</h2>
            <p>Playlists Created</p>
          </div>
        </div>
      </div>

      {/* Account Information Section */}
      <div className="profile-card">
        <div className="card-header">
          <FaShieldAlt className="card-header-icon" />
          <h3>Account Information</h3>
        </div>

        <div className="info-grid">
          <div className="info-row">
            <span>Username</span>
            <strong>{user.username}</strong>
          </div>

          <div className="info-row">
            <span>Email Address</span>
            <strong>{user.email}</strong>
          </div>

          <div className="info-row">
            <span>Account Role</span>
            <strong className="role-tag">{user.role || "User"}</strong>
          </div>

          <div className="info-row">
            <span>Status</span>
            <strong className="status-active">
              <span className="status-dot" /> Active
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;