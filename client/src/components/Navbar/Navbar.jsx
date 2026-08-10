import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaUserCircle,
  FaSignOutAlt,
  FaCog,
  FaUser,
  FaBars,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext"; // Import Settings
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
  
  //  Extract translation function and dynamic theme
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
    showToast(t("logoutSuccessToast"), "info");
    navigate("/");
  };

  return (
    //  Apply dynamic theme class wrapper
    <header className={`vibe-navbar theme-${theme}`}>
      <div className="navbar-left">
        {/* Toggle Sidebar Button */}
        <button
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <FaBars />
        </button>

        {/* History Navigation Buttons */}
        <div className="nav-history-buttons">
          <button
            className="nav-btn"
            onClick={() => navigate(-1)}
            title={t("goBackTitle")}
            aria-label={t("goBackTitle")}
          >
            <FaChevronLeft />
          </button>
          <button
            className="nav-btn"
            onClick={() => navigate(1)}
            title={t("goForwardTitle")}
            aria-label={t("goForwardTitle")}
          >
            <FaChevronRight />
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
              className="user-avatar-btn"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <FaUserCircle className="user-icon" />
              <span className="username-text">
                {user.name || user.username || t("accountLabel")}
              </span>
            </button>

            {menuOpen && (
              <div ref={menuRef} className="user-dropdown-menu">
                <Link to="/profile" className="menu-item">
                  <FaUser /> {t("Profile")}
                </Link>
                <Link to="/settings" className="menu-item">
                  <FaCog /> {t("settings")}
                </Link>
                <button onClick={handleLogout} className="menu-item logout-btn">
                  <FaSignOutAlt /> {t("logoutLabel")}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/register" className="auth-btn signup-btn">
              {t("topSignUp")}
            </Link>
            <Link to="/login" className="auth-btn login-btn">
              {t("topLogIn")}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;