import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
  FaCog,
  FaUser,
  FaBars,
  FaShieldAlt,
  FaCrown,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext";
import SearchOverlay from "../SearchOverlay/SearchOverlay";
import "./Navbar.css";

const Navbar = ({
  onToggleSidebar,
  songList = [],
  trendingData = [],
  onSelectSong,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { t, theme } = useSettings();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleBtnRef = useRef(null);

  // Auto-close dropdown menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Handle click outside of user dropdown menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    showToast(t("logoutSuccessToast") || "Logged out successfully", "info");
    navigate("/");
  };

  const displayName = user?.name || user?.username || t("accountLabel") || "Account";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className={`vibe-navbar theme-${theme}`}>
      <div className="navbar-left">
        {/* Toggle Sidebar Button */}
        <button
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
          type="button"
        >
          <FaBars />
        </button>

        {/* History Navigation Buttons */}
        <div className="nav-history-buttons">
          <button
            className="nav-btn"
            onClick={() => navigate(-1)}
            title={t("goBackTitle") || "Go Back"}
            aria-label={t("goBackTitle") || "Go Back"}
            type="button"
          >
            <FaChevronLeft size={13} />
          </button>
          <button
            className="nav-btn"
            onClick={() => navigate(1)}
            title={t("goForwardTitle") || "Go Forward"}
            aria-label={t("goForwardTitle") || "Go Forward"}
            type="button"
          >
            <FaChevronRight size={13} />
          </button>
        </div>

        {/* Central Search Overlay Bar */}
        <div className="navbar-search-wrapper">
          <SearchOverlay
            songList={songList}
            trendingData={trendingData}
            onSelectSong={onSelectSong}
          />
        </div>
      </div>

      <div className="navbar-right">
        {user ? (
          <div className="user-profile-wrapper">
            <button
              ref={toggleBtnRef}
              className={`user-avatar-btn ${menuOpen ? "active-menu" : ""}`}
              onClick={() => setMenuOpen((prev) => !prev)}
              type="button"
            >
              {user.avatar ? (
                <img src={user.avatar} alt={displayName} className="user-img-thumb" />
              ) : (
                <div className="user-initial-badge">{userInitial}</div>
              )}

              <span className="username-text">{displayName}</span>

              {user.role === "admin" && (
                <span className="admin-pill-tag" title="Admin Account">
                  <FaShieldAlt size={10} />
                </span>
              )}
            </button>

            {menuOpen && (
              <div ref={menuRef} className="user-dropdown-menu fade-slide-in">
                <div className="dropdown-user-header">
                  <span className="dropdown-user-name">{displayName}</span>
                  <span className="dropdown-user-role">
                    {user.role === "admin" ? t("adminRole") || "Administrator" : t("freeTier") || "Free Member"}
                  </span>
                </div>

                <div className="dropdown-divider" />

                <Link to="/profile" className="menu-item" onClick={() => setMenuOpen(false)}>
                  <FaUser className="menu-icon text-cyan-400" /> {t("editProfile") || "Profile"}
                </Link>

                {user.role === "admin" && (
                  <Link to="/admin" className="menu-item" onClick={() => setMenuOpen(false)}>
                    <FaCrown className="menu-icon text-amber-400" /> {t("adminDashboard") || "Admin Dashboard"}
                  </Link>
                )}

                <Link to="/settings" className="menu-item" onClick={() => setMenuOpen(false)}>
                  <FaCog className="menu-icon text-pink-400" /> {t("settings") || "Settings"}
                </Link>

                <div className="dropdown-divider" />

                <button onClick={handleLogout} className="menu-item logout-btn" type="button">
                  <FaSignOutAlt className="menu-icon" /> {t("logoutLabel") || "Log Out"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/register" className="auth-btn signup-btn">
              {t("topSignUp") || "Sign Up"}
            </Link>
            <Link to="/login" className="auth-btn login-btn">
              {t("topLogIn") || "Log In"}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;