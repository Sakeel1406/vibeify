import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useSettings } from '../context/SettingsContext'; // Import Global Settings

export default function PlayerControls({ songList = [], currentIndex = 0 }) {
  const { playSong, isPlaying, setIsPlaying } = usePlayer();
  const { t } = useSettings(); // Extract translation function

  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  // Helper to attempt playing a track with guest limit safety
  const triggerTrackChange = (targetIndex) => {
    if (!songList.length) return;
    const targetSong = songList[targetIndex];

    const success = playSong(targetSong);
    if (!success) {
      console.warn(t("guestLimitWarning"));
    }
  };

  // Play / Pause Toggle
  const handleTogglePlay = () => {
    if (!songList.length) return;
    
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      // Try playing current song (triggers limit if guest has reached play cap)
      triggerTrackChange(currentIndex);
    }
  };

  // Next Track Logic
  const handleNext = () => {
    if (!songList.length) return;

    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * songList.length);
    } else {
      nextIndex = (currentIndex + 1) % songList.length;
    }

    triggerTrackChange(nextIndex);
  };

  // Previous Track Logic
  const handlePrev = () => {
    if (!songList.length) return;

    let prevIndex;
    if (isShuffle) {
      prevIndex = Math.floor(Math.random() * songList.length);
    } else {
      prevIndex = (currentIndex - 1 + songList.length) % songList.length;
    }

    triggerTrackChange(prevIndex);
  };

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl w-fit mx-auto">
      
      {/* Shuffle Button */}
      <button
        onClick={() => setIsShuffle(!isShuffle)}
        className={`p-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
          !isShuffle ? 'text-gray-400 hover:text-white hover:bg-white/5' : ''
        }`}
        style={isShuffle ? { 
          color: 'var(--accent-primary)', 
          backgroundColor: 'var(--accent-glow)', 
          borderColor: 'var(--accent-primary)',
          borderWidth: '1px'
        } : {}}
        title={t("shuffleTooltip")}
        aria-label={t("toggleShuffleAria")}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h2m8 0h2a2 2 0 012 2v8a2 2 0 01-2 2h-2m-8 0l4-4m0 0l-4-4m4 4H4m16 0l-4-4m0 0l4-4m-4 4h4" />
        </svg>
      </button>

      {/* Previous Song */}
      <button
        onClick={handlePrev}
        className="p-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all active:scale-90"
        title={t("prevSongTooltip")}
        aria-label={t("prevSongTooltip")}
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </svg>
      </button>

      {/* Play / Pause Toggle Button */}
      <button
        onClick={handleTogglePlay}
        className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg hover:scale-105 active:scale-95 transition-all"
        style={{ 
          background: 'var(--accent-gradient)', 
          boxShadow: '0 4px 14px var(--accent-glow)' 
        }}
        title={isPlaying ? t("pauseTooltip") : t("playTooltip")}
        aria-label={isPlaying ? t("pauseTrackAria") : t("playTrackAria")}
      >
        {isPlaying ? (
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg className="h-6 w-6 pl-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Next Song */}
      <button
        onClick={handleNext}
        className="p-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all active:scale-90"
        title={t("nextSongTooltip")}
        aria-label={t("nextSongTooltip")}
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </svg>
      </button>

      {/* Repeat Button */}
      <button
        onClick={() => setIsRepeat(!isRepeat)}
        className={`p-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
          !isRepeat ? 'text-gray-400 hover:text-white hover:bg-white/5' : ''
        }`}
        style={isRepeat ? { 
          color: 'var(--accent-primary)', 
          backgroundColor: 'var(--accent-glow)', 
          borderColor: 'var(--accent-primary)',
          borderWidth: '1px'
        } : {}}
        title={t("repeatTooltip")}
        aria-label={t("toggleRepeatAria")}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

    </div>
  );
}