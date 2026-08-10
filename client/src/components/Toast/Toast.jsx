import React from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaHeart,
  FaTrash,
  FaPlus,
  FaShareAlt,
  FaTimes,
} from "react-icons/fa";
import { useSettings } from "../../context/SettingsContext"; // Import Settings
import "./Toast.css";

const getToastIcon = (type) => {
  switch (type) {
    case "success":
      return <FaCheckCircle className="toast-icon" />;
    case "error":
      return <FaExclamationCircle className="toast-icon" />;
    case "like":
      return <FaHeart className="toast-icon" />;
    case "share":
      return <FaShareAlt className="toast-icon" />;
    case "delete":
      return <FaTrash className="toast-icon" />;
    case "add":
    case "update":
      return <FaPlus className="toast-icon" />;
    case "info":
    default:
      return <FaInfoCircle className="toast-icon" />;
  }
};

export default function Toast({ toasts = [], onClose }) {
  // Extract translation function and active theme
  const { t, theme } = useSettings();

  if (!toasts || toasts.length === 0) return null;

  return (
    //  Apply dynamic theme to toast container
    <div className={`toast-container theme-${theme}`}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`cyber-toast toast-${toast.type || "info"}`}
        >
          <div className="toast-body">
            {getToastIcon(toast.type)}
            <span className="toast-message">{toast.message}</span>
          </div>
          {onClose && (
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => onClose(toast.id)}
              aria-label={t("closeNotification")} //  Translated Aria Label
              title={t("closeNotification")}
            >
              <FaTimes />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}