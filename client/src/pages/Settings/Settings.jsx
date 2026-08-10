import React, { useState, useRef, useEffect } from "react";
import {
  FaChevronDown, FaCheck, FaVolumeUp, FaPalette, FaUserShield,
  FaSave, FaShieldAlt, FaUndoAlt, FaLanguage, FaDatabase,
  FaMagic, FaRocket, FaSlidersH, FaCloudUploadAlt, FaBell, FaTv, FaCog
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext"; 
import "./Settings.css";

const languageOptions = [
  { value: "en", label: "English (US)" },
  { value: "ta", label: "தமிழ் (Tamil)" }
];

const Settings = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const { 
    language, setLanguage, theme, setTheme, glassIntensity, setGlassIntensity, 
    compactSidebar, setCompactSidebar, explicitBadges, setExplicitBadges,
    audioQuality, setAudioQuality, eqPreset, setEqPreset, crossfade, setCrossfade,
    normalizeVolume, setNormalizeVolume, spatialAudio, setSpatialAudio,
    autoPlay, setAutoPlay, dataSaver, setDataSaver, privateSession, setPrivateSession,
    showActivity, setShowActivity, t 
  } = useSettings();

  const qualityOptions = [
    { value: "low", label: t("normalQuality") },
    { value: "medium", label: t("highQuality") },
    { value: "high", label: t("veryHighQuality") },
    { value: "lossless", label: t("losslessQuality") },
  ];

  const eqPresets = [
    { value: "flat", label: t("eqFlat") },
    { value: "bass-boost", label: t("eqBass") },
    { value: "electronic", label: t("eqElectronic") },
    { value: "vocal", label: t("eqVocal") },
    { value: "acoustic", label: t("eqAcoustic") }
  ];

  const [waitlistStatus, setWaitlistStatus] = useState({
    aiDj: false, cloudSync: false, visualizer: false, customEq: false,
  });

  const [qualityDropdownOpen, setQualityDropdownOpen] = useState(false);
  const [eqDropdownOpen, setEqDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  
  const [saved, setSaved] = useState(false); 

  const qualityRef = useRef(null);
  const eqRef = useRef(null);
  const langRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (qualityRef.current && !qualityRef.current.contains(e.target)) setQualityDropdownOpen(false);
      if (eqRef.current && !eqRef.current.contains(e.target)) setEqDropdownOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = () => {
    localStorage.setItem("vibeify_compact_sidebar", JSON.stringify(compactSidebar));
    localStorage.setItem("vibeify_explicit_badges", JSON.stringify(explicitBadges));
    localStorage.setItem("vibeify_audio_quality", audioQuality);
    localStorage.setItem("vibeify_eq_preset", eqPreset);
    localStorage.setItem("vibeify_crossfade", crossfade.toString());
    localStorage.setItem("vibeify_normalize", JSON.stringify(normalizeVolume));
    localStorage.setItem("vibeify_spatial_audio", JSON.stringify(spatialAudio));
    localStorage.setItem("vibeify_autoplay", JSON.stringify(autoPlay));
    localStorage.setItem("vibeify_private_session", JSON.stringify(privateSession));
    localStorage.setItem("vibeify_share_activity", JSON.stringify(showActivity));
    localStorage.setItem("vibeify_data_saver", JSON.stringify(dataSaver));

    setSaved(true);
    showToast(t("toastSaved"), "success");
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setTheme("violet");
    setGlassIntensity(24);
    setLanguage("en");
    setCompactSidebar(false);
    setExplicitBadges(true);
    setAudioQuality("high");
    setEqPreset("flat");
    setCrossfade(3);
    setNormalizeVolume(true);
    setSpatialAudio(false);
    setAutoPlay(true);
    setPrivateSession(false);
    setShowActivity(true);
    setDataSaver(false);

    showToast(t("toastReset"), "info");
  };

  const handleWaitlistToggle = (featureKey, featureName) => {
    setWaitlistStatus((prev) => {
      const nextState = !prev[featureKey];
      if (nextState) {
        showToast(`${t("subscribed")} ${t(featureName)} ${t("toastSubscribed")}`, "success");
      } else {
        showToast(t("toastUnsubscribed"), "info");
      }
      return { ...prev, [featureKey]: nextState };
    });
  };

  return (
    <div className={`settings-page theme-${theme}`}>
      <div className="settings-ambient-glow glow-top" />
      <div className="settings-ambient-glow glow-bottom" />
      <div className="settings-ambient-glow glow-center" />

      {/* Updated Header with Custom Glowing Accent Icon Box */}
      <div className="settings-header animate-stagger delay-1" style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "38px" }}>
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
          <FaCog size={26} />
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
            {t("appSettings")}
          </h1>
          <p className="settings-subtitle" style={{ margin: "4px 0 0 0" }}>{t("settingsSub")}</p>
        </div>
      </div>

      <div className="settings-container">
        {/* ACCOUNT SECTION */}
        <div className="glass-card animate-stagger delay-2">
          <div className="section-title">
            <FaUserShield className="section-icon" />
            <h2>{t("accountOverview")}</h2>
          </div>
          <div className="account-preview">
            <div className="settings-avatar-wrapper">
              <div className="settings-avatar">
                {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="avatar-pulse" />
            </div>
            <div className="account-details">
              <h3>{user?.username || t("guestUser")}</h3>
              <p>{user?.email || "guest@vibeify.io"}</p>
              <span className="role-badge">
                {user?.role === "admin" ? t("adminRole") : t("freeTier")}
              </span>
            </div>
          </div>
        </div>

        {/* INTERFACE & APPEARANCE SECTION */}
        <div className="glass-card animate-stagger delay-3">
          <div className="section-title">
            <FaPalette className="section-icon" />
            <h2>{t("interfaceApp")}</h2>
          </div>

          <div className="setting-item vertical-item">
            <div className="setting-info">
              <label>{t("glowThemeAccent")}</label>
              <p>{t("themeDesc")}</p>
            </div>
            <div className="theme-grid">
              {["violet", "pink", "emerald", "gold"].map((colorOption) => (
                <div
                  key={colorOption}
                  className={`theme-chip ${theme === colorOption ? "selected" : ""}`}
                  onClick={() => {
                    setTheme(colorOption);
                    showToast(`${t("toastTheme")} ${colorOption.toUpperCase()}! 🎨`, "info");
                  }}
                >
                  <div className={`theme-swatch ${colorOption}`} />
                  <span>{colorOption.charAt(0).toUpperCase() + colorOption.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>{t("glassBlur")}</label>
              <p>{t("glassDesc")}</p>
            </div>
            <div className="slider-wrapper">
              <input
                type="range" min="8" max="40"
                value={glassIntensity}
                onChange={(e) => setGlassIntensity(Number(e.target.value))}
                className="settings-slider"
              />
              <span className="slider-value">{glassIntensity}px</span>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>{t("compactSidebar")}</label>
              <p>{t("compactSidebarDesc")}</p>
            </div>
            <button className={`toggle-btn ${compactSidebar ? "active" : ""}`} onClick={() => setCompactSidebar(!compactSidebar)}>
              <div className="toggle-thumb" />
            </button>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>{t("explicitTags")}</label>
              <p>{t("explicitTagsDesc")}</p>
            </div>
            <button className={`toggle-btn ${explicitBadges ? "active" : ""}`} onClick={() => setExplicitBadges(!explicitBadges)}>
              <div className="toggle-thumb" />
            </button>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label><FaLanguage className="inline-icon" /> {t("displayLang")}</label>
              <p>{t("langDesc")}</p>
            </div>
            <div className="custom-dropdown-wrapper" ref={langRef}>
              <button
                type="button"
                className={`custom-dropdown-btn ${langDropdownOpen ? "active" : ""}`}
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              >
                <span>{languageOptions.find((opt) => opt.value === language)?.label}</span>
                <FaChevronDown className={`dropdown-chevron ${langDropdownOpen ? "open" : ""}`} />
              </button>
              {langDropdownOpen && (
                <div className="custom-dropdown-menu">
                  {languageOptions.map((opt) => (
                    <div
                      key={opt.value}
                      className={`custom-dropdown-option ${language === opt.value ? "selected" : ""}`}
                      onClick={() => { 
                        setLanguage(opt.value);
                        setLangDropdownOpen(false); 
                        showToast(`${t("toastLang")} ${opt.label}`, "success");
                      }}
                    >
                      <span>{opt.label}</span>
                      {language === opt.value && <FaCheck className="option-check-icon" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AUDIO & PLAYBACK SECTION */}
        <div className="glass-card animate-stagger delay-4">
          <div className="section-title">
            <FaVolumeUp className="section-icon" />
            <h2>{t("audioPlay")}</h2>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>{t("audioQualityTitle")}</label>
              <p>{t("audioQualityDesc")}</p>
            </div>
            <div className="custom-dropdown-wrapper" ref={qualityRef}>
              <button
                type="button"
                className={`custom-dropdown-btn ${qualityDropdownOpen ? "active" : ""}`}
                onClick={() => setQualityDropdownOpen(!qualityDropdownOpen)}
              >
                <span>{qualityOptions.find((opt) => opt.value === audioQuality)?.label}</span>
                <FaChevronDown className={`dropdown-chevron ${qualityDropdownOpen ? "open" : ""}`} />
              </button>
              {qualityDropdownOpen && (
                <div className="custom-dropdown-menu">
                  {qualityOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`custom-dropdown-option ${audioQuality === option.value ? "selected" : ""}`}
                      onClick={() => { setAudioQuality(option.value); setQualityDropdownOpen(false); }}
                    >
                      <span>{option.label}</span>
                      {audioQuality === option.value && <FaCheck className="option-check-icon" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>{t("eqPresetTitle")}</label>
              <p>{t("eqPresetDesc")}</p>
            </div>
            <div className="custom-dropdown-wrapper" ref={eqRef}>
              <button
                type="button"
                className={`custom-dropdown-btn ${eqDropdownOpen ? "active" : ""}`}
                onClick={() => setEqDropdownOpen(!eqDropdownOpen)}
              >
                <span>{eqPresets.find((opt) => opt.value === eqPreset)?.label}</span>
                <FaChevronDown className={`dropdown-chevron ${eqDropdownOpen ? "open" : ""}`} />
              </button>
              {eqDropdownOpen && (
                <div className="custom-dropdown-menu">
                  {eqPresets.map((option) => (
                    <div
                      key={option.value}
                      className={`custom-dropdown-option ${eqPreset === option.value ? "selected" : ""}`}
                      onClick={() => { setEqPreset(option.value); setEqDropdownOpen(false); }}
                    >
                      <span>{option.label}</span>
                      {eqPreset === option.value && <FaCheck className="option-check-icon" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>{t("crossfadeTitle")}</label>
              <p>{t("crossfadeDesc")}</p>
            </div>
            <div className="slider-wrapper">
              <input
                type="range" min="0" max="12"
                value={crossfade}
                onChange={(e) => setCrossfade(Number(e.target.value))}
                className="settings-slider"
              />
              <span className="slider-value">{crossfade}s</span>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label><FaMagic className="inline-icon" /> {t("spatialAudio")}</label>
              <p>{t("spatialAudioDesc")}</p>
            </div>
            <button className={`toggle-btn ${spatialAudio ? "active" : ""}`} onClick={() => setSpatialAudio(!spatialAudio)}>
              <div className="toggle-thumb" />
            </button>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>{t("autoPlay")}</label>
              <p>{t("autoPlayDesc")}</p>
            </div>
            <button className={`toggle-btn ${autoPlay ? "active" : ""}`} onClick={() => setAutoPlay(!autoPlay)}>
              <div className="toggle-thumb" />
            </button>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>{t("normalizeVol")}</label>
              <p>{t("normalizeVolDesc")}</p>
            </div>
            <button className={`toggle-btn ${normalizeVolume ? "active" : ""}`} onClick={() => setNormalizeVolume(!normalizeVolume)}>
              <div className="toggle-thumb" />
            </button>
          </div>
        </div>

        {/* DATA & PRIVACY SECTION */}
        <div className="glass-card animate-stagger delay-5">
          <div className="section-title">
            <FaShieldAlt className="section-icon" />
            <h2>{t("dataPrivacy")}</h2>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label><FaDatabase className="inline-icon" /> {t("dataSaver")}</label>
              <p>{t("dataSaverDesc")}</p>
            </div>
            <button className={`toggle-btn ${dataSaver ? "active" : ""}`} onClick={() => setDataSaver(!dataSaver)}>
              <div className="toggle-thumb" />
            </button>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>{t("privateSession")}</label>
              <p>{t("privateSessionDesc")}</p>
            </div>
            <button className={`toggle-btn ${privateSession ? "active" : ""}`} onClick={() => setPrivateSession(!privateSession)}>
              <div className="toggle-thumb" />
            </button>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>{t("shareActivity")}</label>
              <p>{t("shareActivityDesc")}</p>
            </div>
            <button className={`toggle-btn ${showActivity ? "active" : ""}`} onClick={() => setShowActivity(!showActivity)}>
              <div className="toggle-thumb" />
            </button>
          </div>
        </div>

        {/* UPCOMING FEATURES & ROADMAP SECTION */}
        <div className="glass-card animate-stagger delay-6 roadmap-card">
          <div className="section-title">
            <FaRocket className="section-icon rocket-glow" />
            <div className="title-with-badge">
              <h2>{t("upcomingFeatures")}</h2>
              <span className="coming-soon-badge top-badge">{t("nextUpdates")}</span>
            </div>
          </div>
          <p className="roadmap-desc">{t("roadmapDesc")}</p>

          <div className="upcoming-grid">
            <div className="upcoming-item">
              <div className="upcoming-header">
                <div className="feature-icon-box purple">
                  <FaMagic />
                </div>
                <span className="coming-soon-badge">{t("comingSoon")}</span>
              </div>
              <h3>{t("aiDj")}</h3>
              <p>{t("aiDjDesc")}</p>
              <button
                className={`waitlist-btn ${waitlistStatus.aiDj ? "active" : ""}`}
                onClick={() => handleWaitlistToggle("aiDj", "aiDj")}
              >
                <FaBell /> {waitlistStatus.aiDj ? t("subscribed") : t("notifyMe")}
              </button>
            </div>

            <div className="upcoming-item">
              <div className="upcoming-header">
                <div className="feature-icon-box cyan">
                  <FaSlidersH />
                </div>
                <span className="coming-soon-badge">{t("comingSoon")}</span>
              </div>
              <h3>{t("eqTuner")}</h3>
              <p>{t("eqTunerDesc")}</p>
              <button
                className={`waitlist-btn ${waitlistStatus.customEq ? "active" : ""}`}
                onClick={() => handleWaitlistToggle("customEq", "eqTuner")}
              >
                <FaBell /> {waitlistStatus.customEq ? t("subscribed") : t("notifyMe")}
              </button>
            </div>

            <div className="upcoming-item">
              <div className="upcoming-header">
                <div className="feature-icon-box green">
                  <FaCloudUploadAlt />
                </div>
                <span className="coming-soon-badge">{t("comingSoon")}</span>
              </div>
              <h3>{t("cloudSync")}</h3>
              <p>{t("cloudSyncDesc")}</p>
              <button
                className={`waitlist-btn ${waitlistStatus.cloudSync ? "active" : ""}`}
                onClick={() => handleWaitlistToggle("cloudSync", "cloudSync")}
              >
                <FaBell /> {waitlistStatus.cloudSync ? t("subscribed") : t("notifyMe")}
              </button>
            </div>

            <div className="upcoming-item">
              <div className="upcoming-header">
                <div className="feature-icon-box pink">
                  <FaTv />
                </div>
                <span className="beta-badge">{t("betaPreview")}</span>
              </div>
              <h3>{t("visualizer")}</h3>
              <p>{t("visualizerDesc")}</p>
              <button
                className={`waitlist-btn ${waitlistStatus.visualizer ? "active" : ""}`}
                onClick={() => handleWaitlistToggle("visualizer", "visualizer")}
              >
                <FaBell /> {waitlistStatus.visualizer ? t("subscribed") : t("notifyMe")}
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="settings-footer animate-stagger delay-6">
          <button className="reset-btn" onClick={handleReset}>
            <FaUndoAlt /> {t("resetDefaults")}
          </button>
          <button className={`save-btn ${saved ? "saved" : ""}`} onClick={handleSave}>
            {saved ? <><FaCheck /> {t("saved")}</> : <><FaSave /> {t("saveChanges")}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;