import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StreamingLimitModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  // Close modal when pressing Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  // Handle phone input formatting (digits only, max 10)
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setPhoneNumber(value);
      if (error) setError('');
    }
  };

  const handleMobileSubmit = (e) => {
    e.preventDefault();
    if (phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    
    // Redirect to register page with phone state pre-filled
    navigate('/register', { 
      state: { phone: phoneNumber, redirectedFromLimit: true } 
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all duration-300 animate-fade-in"
      onClick={onClose} // Click outside to close
    >
      {/* Glassmorphism Card Container */}
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-[#0d0d14]/90 p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(6,182,212,0.15)] backdrop-blur-2xl transition-all"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Ambient Glow Effects */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10 hover:text-white transition-all active:scale-95"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Icon / Badge */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-inner">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 .895-2 3-2 3 .895 3 2zm12 0c0 1.105-1.343 2-3 2s-3-.895-3-2 .895-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>

        {/* Modal Header */}
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Streaming limit reached!
        </h2>
        <p className="mt-2 text-sm text-gray-300 leading-relaxed font-normal">
          Log in or sign up to unlock unlimited listening, custom playlists & personal recommendations!
        </p>

        {/* Mobile Input Form */}
        <form onSubmit={handleMobileSubmit} className="mt-6">
          <div className={`flex items-center rounded-xl border bg-white/5 px-3 py-2.5 transition-all duration-200 ${
            error ? 'border-red-500/80 ring-1 ring-red-500/50' : 'border-white/10 focus-within:border-cyan-400/80 focus-within:ring-1 focus-within:ring-cyan-400/50'
          }`}>
            <span className="flex items-center gap-1.5 text-sm text-gray-300 font-medium pr-3 border-r border-white/10 select-none">
              🇮🇳 +91
            </span>
            <input
              type="tel"
              placeholder="Enter mobile number"
              value={phoneNumber}
              onChange={handlePhoneChange}
              className="w-full bg-transparent pl-3 text-sm font-medium text-white placeholder-gray-500 focus:outline-none"
              autoFocus
            />
          </div>

          {error && (
            <p className="mt-1.5 text-left text-xs text-red-400 font-medium animate-pulse">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-3.5 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-bold py-3 text-sm transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110 active:scale-[0.98]"
          >
            Continue
          </button>
        </form>

        {/* Legal Consent */}
        <p className="mt-3.5 text-[11px] text-gray-400 leading-relaxed">
          By clicking ‘Continue’, you agree to Vibeify’s{' '}
          <a href="/terms" className="text-cyan-400 hover:underline">Terms of Use</a>{' '}
          and acknowledge our{' '}
          <a href="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</a>.
        </p>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
            <span className="bg-[#0d0d14] px-3 text-gray-400 font-semibold">OR CONNECT WITH</span>
          </div>
        </div>

        {/* Social / Alternative Login Options */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98]"
          >
            <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </button>

          <button
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
            </svg>
            Google
          </button>
        </div>

      </div>
    </div>
  );
}