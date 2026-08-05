import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';

export default function PlayerControls({ songList = [], currentIndex = 0 }) {
  const { playSong, isPlaying, setIsPlaying } = usePlayer();

  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  // Helper to attempt playing a track with guest limit safety
  const triggerTrackChange = (targetIndex) => {
    if (!songList.length) return;
    const targetSong = songList[targetIndex];

    const success = playSong(targetSong);
    if (!success) {
      console.warn("Guest streaming limit reached. Registration modal triggered.");
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
          isShuffle 
            ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]' 
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
        title="Shuffle"
        aria-label="Toggle Shuffle"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h2m8 0h2a2 2 0 012 2v8a2 2 0 01-2 2h-2m-8 0l4-4m0 0l-4-4m4 4H4m16 0l-4-4m0 0l4-4m-4 4h4" />
        </svg>
      </button>

      {/* Previous Song */}
      <button
        onClick={handlePrev}
        className="p-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all active:scale-90"
        title="Previous Song"
        aria-label="Previous Song"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </svg>
      </button>

      {/* Play / Pause Toggle Button */}
      <button
        onClick={handleTogglePlay}
        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all"
        title={isPlaying ? "Pause" : "Play"}
        aria-label={isPlaying ? "Pause Track" : "Play Track"}
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
        title="Next Song"
        aria-label="Next Song"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </svg>
      </button>

      {/* Repeat Button */}
      <button
        onClick={() => setIsRepeat(!isRepeat)}
        className={`p-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
          isRepeat 
            ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]' 
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
        title="Repeat"
        aria-label="Toggle Repeat"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

    </div>
  );
}