import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaTimes } from "react-icons/fa";
import { usePlayer } from "../../context/PlayerContext"; // 👈 Uses your active PlayerContext
import { useToast } from "../../context/ToastContext";
import "./StreamingLimitModal.css";

export default function StreamingLimitModal() {
  const navigate = useNavigate();
  const { showToast } = useToast() || {};

  const { showLimitModal, setShowLimitModal } = usePlayer() || {};

  // Trigger Toast Notification when Modal appears
  useEffect(() => {
    if (showLimitModal && showToast) {
      showToast("Guest limit reached! Log in for unlimited streaming.", "error");
    }
  }, [showLimitModal, showToast]);

  if (!showLimitModal) return null;

  const handleClose = () => {
    if (setShowLimitModal) setShowLimitModal(false);
  };

  const handleSignUp = () => {
    handleClose();
    if (showToast) showToast("Redirecting to Sign Up...", "info");
    navigate("/register");
  };

  const handleLogin = () => {
    handleClose();
    if (showToast) showToast("Redirecting to Log In...", "info");
    navigate("/login");
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content limit-modal animate-pop" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleClose} type="button" aria-label="Close modal">
          <FaTimes />
        </button>

        <div className="modal-badge-icon">
          <FaLock className="text-cyan-400 text-xl" />
        </div>

        <h2 className="modal-title">Guest Limit Reached</h2>
        <p className="modal-subtitle">
          You've enjoyed your 5 free guest plays! Sign up or log in now for unlimited music streaming on Vibeify.
        </p>

        <div className="limit-modal-actions">
          <button type="button" onClick={handleSignUp} className="btn-primary w-full py-3">
            Sign Up Free
          </button>
          <button type="button" onClick={handleLogin} className="btn-secondary w-full py-3">
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}