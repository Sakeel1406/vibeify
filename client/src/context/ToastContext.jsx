import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "../components/Toast/Toast"; // Renders the Toast UI automatically

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Function to remove a toast by its unique ID
  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Function to trigger a new toast
  // Variants: 'success', 'error', 'info', 'like', 'share'
  const showToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();

    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    // Auto-dismiss toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/*  Toast component mounted globally with context state */}
      <Toast toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

// Custom hook to consume toast actions in any component
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};