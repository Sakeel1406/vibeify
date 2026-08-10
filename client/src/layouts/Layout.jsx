import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import Player from "../components/Player/Player";
import { useToast } from "../context/ToastContext";
import { useSettings } from "../context/SettingsContext"; // Import Settings

import "./Layout.css";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { showToast } = useToast();
  
  // Extract translation function and dynamic theme
  const { t, theme } = useSettings();

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  // Auto-close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // 'Escape' key handler for sidebar drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && sidebarOpen) {
        handleCloseSidebar();
        showToast(t("sidebarClosed"), "info");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen, handleCloseSidebar, showToast, t]);

  // Lock body scroll when mobile sidebar drawer is active
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [sidebarOpen]);

  return (
    //  Applied Theme dynamically here
    <div className={`app-shell theme-${theme}`} role="region" aria-label={t("vibeifyAudioApp")}>
      <div className="app-body">
        {/* Mobile Glass Overlay */}
        <div
          className={`sidebar-overlay ${sidebarOpen ? "is-visible" : ""}`}
          onClick={handleCloseSidebar}
          aria-hidden={!sidebarOpen}
          role="presentation"
        />

        {/* Navigation Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

        {/* Main Viewport Area */}
        <div className="main-content">
          <Navbar
            onToggleSidebar={handleToggleSidebar}
            onMenuClick={handleToggleSidebar}
            isSidebarOpen={sidebarOpen}
          />

          <main className="page-container" id="main-content-area">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Persistent Audio Player */}
      <Player />
    </div>
  );
}