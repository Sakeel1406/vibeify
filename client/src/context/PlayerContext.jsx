import React, { createContext, useContext, useState } from 'react';
import StreamingLimitModal from '../components/StreamingLimitModal';

const PlayerContext = createContext();

const FREE_PLAY_LIMIT = 3; // Number of tracks guest users can play

export function PlayerProvider({ children }) {
  // Replace with your actual auth state (e.g., JWT presence or auth context)
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('token')
  );

  const [guestPlayCount, setGuestPlayCount] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);

  // Call this function whenever a user clicks "Play" or skips to next track
  const playSong = (song) => {
    if (!isAuthenticated && guestPlayCount >= FREE_PLAY_LIMIT) {
      setIsPlaying(false);
      setShowLimitModal(true);
      return false; // Playback blocked
    }

    if (!isAuthenticated) {
      setGuestPlayCount((prev) => prev + 1);
    }

    setCurrentSong(song);
    setIsPlaying(true);
    return true; // Playback allowed
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        setIsPlaying,
        playSong,
        isAuthenticated,
        setShowLimitModal,
      }}
    >
      {children}

      {/* Global Limit Modal Mount */}
      <StreamingLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
      />
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);