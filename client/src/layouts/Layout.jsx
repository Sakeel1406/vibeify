import { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import Player from "../components/Player/Player";

import "./Layout.css";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Auto-close mobile sidebar when location actually changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Handle 'Escape' key press to close sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && sidebarOpen) {
        handleCloseSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen, handleCloseSidebar]);

  // Prevent background scrolling on mobile when sidebar drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="app-shell">
      <div className="app-body">
        {/* Mobile Backdrop Overlay */}
        <div
          className={`sidebar-overlay ${sidebarOpen ? "is-visible" : ""}`}
          onClick={handleCloseSidebar}
          aria-hidden={!sidebarOpen}
          role="presentation"
        />

        {/* Sidebar Component */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={handleCloseSidebar}
        />

        {/* Main Content Viewport */}
        <div className="main-content">
          <Navbar
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
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
};

export default Layout;