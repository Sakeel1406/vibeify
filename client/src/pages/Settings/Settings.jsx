import React, { useState, useRef, useEffect } from "react";
import {
  FaChevronDown,
  FaCheck,
  FaVolumeUp,
  FaPalette,
  FaUserShield,
  FaSave,
  FaShieldAlt,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./Settings.css";

const qualityOptions = [
  { value: "low", label: "Normal (96 kbps - Saver)" },
  { value: "medium", label: "High (160 kbps - Standard)" },
  { value: "high", label: "Very High (320 kbps - HQ)" },
  { value: "lossless", label: "Lossless Audio (FLAC - Hi-Fi)" },
];

const eqPresets = [
  { value: "flat", label: "Flat (Default)" },
  { value: "bass-boost", label: "Bass Boost" },
  { value: "electronic", label: "Electronic / EDM" },
  { value: "vocal", label: "Vocal Boost" },
];

const Settings = () => {
  const { user } = useAuth();

  // Settings States
  const [audioQuality, setAudioQuality] = useState("high");
  const [eqPreset, setEqPreset] = useState("flat");
  const [crossfade, setCrossfade] = useState(3);
  const [normalizeVolume, setNormalizeVolume] = useState(true);

  // Interface & Appearance States (Loaded from localStorage)
  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem("vibeify_theme") || "violet";
  });
  const [glassIntensity, setGlassIntensity] = useState(() => {
    return Number(localStorage.getItem("vibeify_glass_blur")) || 24;
  });
  const [explicitBadges, setExplicitBadges] = useState(() => {
    return JSON.parse(localStorage.getItem("vibeify_explicit_badges") ?? "true");
  });
  const [compactSidebar, setCompactSidebar] = useState(() => {
    return JSON.parse(localStorage.getItem("vibeify_compact_sidebar") ?? "false");
  });

  // Privacy States
  const [privateSession, setPrivateSession] = useState(false);
  const [showActivity, setShowActivity] = useState(true);

  // Dropdown States
  const [qualityDropdownOpen, setQualityDropdownOpen] = useState(false);
  const [eqDropdownOpen, setEqDropdownOpen] = useState(false);

  // UI Notification State
  const [saved, setSaved] = useState(false);

  // Refs for Outside Click Handler
  const qualityRef = useRef(null);
  const eqRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (qualityRef.current && !qualityRef.current.contains(e.target)) {
        setQualityDropdownOpen(false);
      }
      if (eqRef.current && !eqRef.current.contains(e.target)) {
        setEqDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // REAL-TIME GLOBAL THEME HOOK
  useEffect(() => {
    const root = document.documentElement;

    // Set Glass Blur
    root.style.setProperty("--glass-blur", `${glassIntensity}px`);

    // Color Palette Definitions
    const themeAccents = {
      violet: { primary: "#8b5cf6", secondary: "#ff4ecd", glow: "rgba(255, 78, 205, 0.35)" },
      pink: { primary: "#ec4899", secondary: "#f43f5e", glow: "rgba(244, 63, 94, 0.35)" },
      emerald: { primary: "#10b981", secondary: "#06b6d4", glow: "rgba(6, 182, 212, 0.35)" },
      gold: { primary: "#f59e0b", secondary: "#ef4444", glow: "rgba(239, 68, 68, 0.35)" },
    };

    const activeTheme = themeAccents[selectedTheme] || themeAccents.violet;

    // Inject CSS variables globally to :root
    root.style.setProperty("--accent-primary", activeTheme.primary);
    root.style.setProperty("--accent-secondary", activeTheme.secondary);
    root.style.setProperty("--accent-glow", activeTheme.glow);
    root.style.setProperty(
      "--accent-gradient",
      `linear-gradient(135deg, ${activeTheme.primary}, ${activeTheme.secondary})`
    );
  }, [selectedTheme, glassIntensity]);

  const handleSave = () => {
    localStorage.setItem("vibeify_theme", selectedTheme);
    localStorage.setItem("vibeify_glass_blur", glassIntensity.toString());
    localStorage.setItem("vibeify_compact_sidebar", JSON.stringify(compactSidebar));
    localStorage.setItem("vibeify_explicit_badges", JSON.stringify(explicitBadges));

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className={`settings-page theme-${selectedTheme}`}>
      {/* Ambient Lighting */}
      <div className="settings-ambient-glow glow-top" />
      <div className="settings-ambient-glow glow-bottom" />

      {/* Header */}
      <div className="settings-header">
        <h1>App Settings</h1>
        <p className="settings-subtitle">
          Manage your interface appearance, theme accents, audio fidelity, and privacy controls.
        </p>
      </div>

      <div className="settings-container">
        {/* ACCOUNT SECTION */}
        <div className="glass-card">
          <div className="section-title">
            <FaUserShield className="section-icon" />
            <h2>Account Overview</h2>
          </div>
          <div className="account-preview">
            <div className="settings-avatar-wrapper">
              <div className="settings-avatar">
                {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="avatar-pulse" />
            </div>
            <div className="account-details">
              <h3>{user?.username || "Guest User"}</h3>
              <p>{user?.email || "guest@vibeify.io"}</p>
              <span className="role-badge">
                {user?.role === "admin" ? "Administrator" : "Free Tier"}
              </span>
            </div>
          </div>
        </div>

        {/* INTERFACE & APPEARANCE SECTION */}
        <div className="glass-card">
          <div className="section-title">
            <FaPalette className="section-icon" />
            <h2>Interface & Appearance</h2>
          </div>

          {/* Theme Accent Picker */}
          <div className="setting-item vertical-item">
            <div className="setting-info">
              <label>Glow Theme Accent</label>
              <p>Select your primary ambient lighting and glowing gradient highlight color.</p>
            </div>
            <div className="theme-grid">
              <div
                className={`theme-chip ${selectedTheme === "violet" ? "selected" : ""}`}
                onClick={() => setSelectedTheme("violet")}
              >
                <div className="theme-swatch violet" />
                <span>Cyber Violet</span>
              </div>
              <div
                className={`theme-chip ${selectedTheme === "pink" ? "selected" : ""}`}
                onClick={() => setSelectedTheme("pink")}
              >
                <div className="theme-swatch pink" />
                <span>Neon Magenta</span>
              </div>
              <div
                className={`theme-chip ${selectedTheme === "emerald" ? "selected" : ""}`}
                onClick={() => setSelectedTheme("emerald")}
              >
                <div className="theme-swatch emerald" />
                <span>Emerald Cyber</span>
              </div>
              <div
                className={`theme-chip ${selectedTheme === "gold" ? "selected" : ""}`}
                onClick={() => setSelectedTheme("gold")}
              >
                <div className="theme-swatch gold" />
                <span>Solar Gold</span>
              </div>
            </div>
          </div>

          {/* Glass Backdrop Blur Slider */}
          <div className="setting-item">
            <div className="setting-info">
              <label>Glass Backdrop Blur</label>
              <p>Adjust the frost intensity of glass cards and background panels live.</p>
            </div>
            <div className="slider-wrapper">
              <input
                type="range"
                min="8"
                max="40"
                value={glassIntensity}
                onChange={(e) => setGlassIntensity(Number(e.target.value))}
                className="settings-slider"
              />
              <span className="slider-value">{glassIntensity}px</span>
            </div>
          </div>

          {/* Explicit Content Tag Badge */}
          <div className="setting-item">
            <div className="setting-info">
              <label>Explicit Content Tags</label>
              <p>Display explicit content indicator badges on songs and album listings.</p>
            </div>
            <button
              className={`toggle-btn ${explicitBadges ? "active" : ""}`}
              onClick={() => setExplicitBadges((v) => !v)}
              aria-label="Toggle Explicit Badges"
            >
              <div className="toggle-thumb" />
            </button>
          </div>

          {/* Compact Navigation Sidebar */}
          <div className="setting-item">
            <div className="setting-info">
              <label>Compact Navigation Sidebar</label>
              <p>Collapse navigation text labels to maximize dashboard workspace.</p>
            </div>
            <button
              className={`toggle-btn ${compactSidebar ? "active" : ""}`}
              onClick={() => setCompactSidebar((v) => !v)}
              aria-label="Toggle Compact Sidebar"
            >
              <div className="toggle-thumb" />
            </button>
          </div>
        </div>

        {/* AUDIO & PLAYBACK SECTION */}
        <div className="glass-card">
          <div className="section-title">
            <FaVolumeUp className="section-icon" />
            <h2>Audio & Playback</h2>
          </div>

          {/* Audio Quality Dropdown */}
          <div className="setting-item">
            <div className="setting-info">
              <label>Streaming Audio Quality</label>
              <p>Higher bitrates offer superior clarity but consume more bandwidth.</p>
            </div>
            <div className="custom-dropdown-wrapper" ref={qualityRef}>
              <button
                type="button"
                className={`custom-dropdown-btn ${qualityDropdownOpen ? "active" : ""}`}
                onClick={() => setQualityDropdownOpen((prev) => !prev)}
              >
                <span>
                  {qualityOptions.find((opt) => opt.value === audioQuality)?.label}
                </span>
                <FaChevronDown
                  className={`dropdown-chevron ${qualityDropdownOpen ? "open" : ""}`}
                />
              </button>

              {qualityDropdownOpen && (
                <div className="custom-dropdown-menu">
                  {qualityOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`custom-dropdown-option ${
                        audioQuality === option.value ? "selected" : ""
                      }`}
                      onClick={() => {
                        setAudioQuality(option.value);
                        setQualityDropdownOpen(false);
                      }}
                    >
                      <span>{option.label}</span>
                      {audioQuality === option.value && (
                        <FaCheck className="option-check-icon" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Equalizer Preset */}
          <div className="setting-item">
            <div className="setting-info">
              <label>Equalizer Audio Preset</label>
              <p>Adjust frequency curves for your specific headphones or speakers.</p>
            </div>
            <div className="custom-dropdown-wrapper" ref={eqRef}>
              <button
                type="button"
                className={`custom-dropdown-btn ${eqDropdownOpen ? "active" : ""}`}
                onClick={() => setEqDropdownOpen((prev) => !prev)}
              >
                <span>
                  {eqPresets.find((opt) => opt.value === eqPreset)?.label}
                </span>
                <FaChevronDown
                  className={`dropdown-chevron ${eqDropdownOpen ? "open" : ""}`}
                />
              </button>

              {eqDropdownOpen && (
                <div className="custom-dropdown-menu">
                  {eqPresets.map((option) => (
                    <div
                      key={option.value}
                      className={`custom-dropdown-option ${
                        eqPreset === option.value ? "selected" : ""
                      }`}
                      onClick={() => {
                        setEqPreset(option.value);
                        setEqDropdownOpen(false);
                      }}
                    >
                      <span>{option.label}</span>
                      {eqPreset === option.value && (
                        <FaCheck className="option-check-icon" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Crossfade Slider */}
          <div className="setting-item">
            <div className="setting-info">
              <label>Crossfade Songs</label>
              <p>Seamlessly blend transitions between consecutive audio tracks.</p>
            </div>
            <div className="slider-wrapper">
              <input
                type="range"
                min="0"
                max="12"
                value={crossfade}
                onChange={(e) => setCrossfade(Number(e.target.value))}
                className="settings-slider"
              />
              <span className="slider-value">{crossfade}s</span>
            </div>
          </div>

          {/* Normalize Volume */}
          <div className="setting-item">
            <div className="setting-info">
              <label>Normalize Volume</label>
              <p>Set the same volume level for all tracks automatically.</p>
            </div>
            <button
              className={`toggle-btn ${normalizeVolume ? "active" : ""}`}
              onClick={() => setNormalizeVolume((v) => !v)}
              aria-label="Toggle Normalize Volume"
            >
              <div className="toggle-thumb" />
            </button>
          </div>
        </div>

        {/* PRIVACY & SOCIAL SECTION */}
        <div className="glass-card">
          <div className="section-title">
            <FaShieldAlt className="section-icon" />
            <h2>Privacy & Listening Activity</h2>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Private Listening Session</label>
              <p>Hide your listening history temporarily from profile statistics.</p>
            </div>
            <button
              className={`toggle-btn ${privateSession ? "active" : ""}`}
              onClick={() => setPrivateSession((v) => !v)}
              aria-label="Toggle Private Listening"
            >
              <div className="toggle-thumb" />
            </button>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Share Listening Activity</label>
              <p>Allow friends to view live updates of tracks you are playing.</p>
            </div>
            <button
              className={`toggle-btn ${showActivity ? "active" : ""}`}
              onClick={() => setShowActivity((v) => !v)}
              aria-label="Toggle Share Activity"
            >
              <div className="toggle-thumb" />
            </button>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="settings-footer">
          <button
            className={`save-btn ${saved ? "saved" : ""}`}
            onClick={handleSave}
          >
            {saved ? (
              <>
                <FaCheck /> Preferences Saved!
              </>
            ) : (
              <>
                <FaSave /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;