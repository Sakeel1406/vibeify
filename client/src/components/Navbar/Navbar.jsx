import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaUserCircle,
  FaSignOutAlt,
  FaCog,
  FaUser,
  FaBars,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const menuRef = useRef(null);

  // Sync search input with URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("q");
    if (query) {
      setSearchTerm(query);
    }
  }, [location.search]);

  // Close profile menu on outside click or Escape key press
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (location.pathname.startsWith("/search")) {
      navigate(`/search?q=${encodeURIComponent(val)}`, { replace: true });
    }
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <nav className="navbar" aria-label="Main Navigation">
      {/* Navigation Controls & Search Bar */}
      <div className="navbar-left">
        {/* Mobile Hamburger Drawer Button */}
        <button
          className="mobile-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <FaBars />
        </button>

        <div className="nav-arrows">
          <button
            className="nav-arrow"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <FaChevronLeft />
          </button>
          <button
            className="nav-arrow"
            onClick={() => navigate(1)}
            aria-label="Go forward"
          >
            <FaChevronRight />
          </button>
        </div>

        {location.pathname.startsWith("/search") && (
          <form className="navbar-search" onSubmit={handleSearchSubmit}>
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="What do you want to play?"
              value={searchTerm}
              onChange={handleInputChange}
              aria-label="Search music"
            />
          </form>
        )}
      </div>

      {/* User Actions & Dropdown */}
      <div className="navbar-right">
        {user ? (
          <div className="user-menu" ref={menuRef}>
            <button
              className={`user-pill ${menuOpen ? "active" : ""}`}
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="true"
              aria-expanded={menuOpen}
              aria-label="User account menu"
            >
              <FaUserCircle className="user-avatar-icon" />
              <span>{user.username}</span>
            </button>

            {menuOpen && (
              <div className="dropdown" role="menu">
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  role="menuitem"
                  className={location.pathname === "/profile" ? "active-link" : ""}
                >
                  <FaUser className="dropdown-icon" /> Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  role="menuitem"
                  className={location.pathname === "/settings" ? "active-link" : ""}
                >
                  <FaCog className="dropdown-icon" /> Settings
                </Link>
                <div className="dropdown-divider" />
                <button 
                  onClick={handleLogout} 
                  role="menuitem" 
                  className="logout-btn"
                >
                  <FaSignOutAlt className="dropdown-icon logout-icon" /> Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/register" className="btn-outline">
              Sign up
            </Link>
            <Link to="/login" className="btn-solid">
              Log in
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;