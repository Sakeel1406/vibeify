import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { recordPlay } from "../services/api";

const PlayerContext = createContext();

export const MAX_GUEST_PLAYS = 5;

export function PlayerProvider({ children }) {
  const { user } = useAuth() || {};
  const { showToast } = useToast() || {};

  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const [songs, setSongs] = useState([]);
  const [queue, setQueue] = useState([]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const audioRef = useRef(new Audio());

  const [guestPlayCount, setGuestPlayCount] = useState(() => {
    return Number(localStorage.getItem("vibeify_guest_play_count")) || 0;
  });

  useEffect(() => {
    localStorage.setItem("vibeify_guest_play_count", guestPlayCount.toString());
  }, [guestPlayCount]);

  useEffect(() => {
    if (user) {
      setGuestPlayCount(0);
      localStorage.removeItem("vibeify_guest_play_count");
      setShowLimitModal(false);
    }
  }, [user]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    const handleError = () => {
      console.error("Audio Playback Error:", audio.error?.message);
      if (showToast) {
        showToast("Failed to load audio stream format", "error");
      }
    };
    audio.addEventListener("error", handleError);
    return () => audio.removeEventListener("error", handleError);
  }, [showToast]);

  // Robust Audio Listeners with duration fallback handling
  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
        setDuration(audio.duration);
      } else if (currentSong?.duration) {
        setDuration(currentSong.duration);
      } else {
        setDuration(210);
      }
    };
    const handleDurationChange = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      if (!user && guestPlayCount >= MAX_GUEST_PLAYS) {
        setIsPlaying(false);
        setShowLimitModal(true);
        if (showToast) {
          showToast("You've reached your 5 free guest plays!", "error");
        }
        return;
      }
      nextSong();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);

    if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
      setDuration(audio.duration);
    } else if (currentSong?.duration) {
      setDuration(currentSong.duration);
    }

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [user, guestPlayCount, showToast, queue, currentSong]);

  // Audio URL Resolution and Playback Control with Debugging
  useEffect(() => {
    const audio = audioRef.current;

    if (currentSong) {
      console.log("🎵 Current Song Object:", currentSong);

      let rawUrl = 
        currentSong?.songUrl || 
        currentSong?.audio || 
        currentSong?.url || 
        currentSong?.audioUrl || 
        currentSong?.fileUrl || 
        currentSong?.filePath || 
        currentSong?.path || 
        currentSong?.song || 
        currentSong?.file;

      console.log("🔗 Resolved Raw URL:", rawUrl);

      if (rawUrl) {
        let finalSongUrl = rawUrl;
        
        if (rawUrl.startsWith("/") || (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://"))) {
          const backendBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
          const baseHost = backendBase.replace(/\/api\/?$/, ""); 
          
          if (rawUrl.startsWith("/")) {
             finalSongUrl = `${baseHost}${rawUrl}`;
          } else {
             finalSongUrl = `${baseHost}/${rawUrl}`;
          }
        }

        console.log("🚀 Final Audio SRC:", finalSongUrl);

        if (audio.src !== finalSongUrl) {
          audio.src = finalSongUrl;
          audio.load();
        }

        if (isPlaying) {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
             playPromise.catch((err) => {
                console.error("Audio playback failed:", err);
             });
          }
        } else {
          audio.pause();
        }
      } else {
        console.warn("⚠️ No audio URL found inside currentSong!");
      }
    } else {
      audio.pause();
    }
  }, [currentSong, isPlaying]);

  const togglePlay = () => {
    if (!currentSong) return;
    setIsPlaying((prev) => !prev);
  };

  const seekTo = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setProgress(seconds);
    }
  };

  const setVolume = (vol) => {
    setVolumeState(vol);
  };

  const nextSong = () => {
    const activeQueue = queue.length > 0 ? queue : songs;
    if (!activeQueue || activeQueue.length === 0) return;

    const currentIndex = activeQueue.findIndex((s) => s._id === currentSong?._id);
    let nextIndex;

    if (shuffle) {
      nextIndex = Math.floor(Math.random() * activeQueue.length);
    } else {
      nextIndex = (currentIndex + 1) % activeQueue.length;
    }

    playSong(activeQueue[nextIndex]);
  };

  const prevSong = () => {
    const activeQueue = queue.length > 0 ? queue : songs;
    if (!activeQueue || activeQueue.length === 0) return;

    const currentIndex = activeQueue.findIndex((s) => s._id === currentSong?._id);
    const prevIndex = (currentIndex - 1 + activeQueue.length) % activeQueue.length;

    playSong(activeQueue[prevIndex]);
  };

  const playSong = (song, newQueue = []) => {
    if (!song) return false;

    if (!user && guestPlayCount >= MAX_GUEST_PLAYS) {
      setIsPlaying(false);
      setShowLimitModal(true);
      if (showToast) {
        showToast("Guest limit reached! Log in for unlimited plays.", "error");
      }
      return false;
    }

    if (!user) {
      setGuestPlayCount((prev) => prev + 1);
    }

    if (newQueue.length > 0) {
      setQueue(newQueue);
    }

    setCurrentSong(song);
    setIsPlaying(true);

    if (song.duration && !isNaN(song.duration)) {
      setDuration(song.duration);
    } else if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    } else {
      setDuration(0);
    }

    if (song._id) {
      recordPlay(song._id).catch(() => {});
    }

    return true;
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        setCurrentSong,
        isPlaying,
        setIsPlaying,
        playSong,
        songs,
        setSongs,
        queue,
        setQueue,
        progress,
        duration,
        volume,
        setVolume,
        shuffle,
        setShuffle,
        repeat,
        setRepeat,
        seekTo,
        togglePlay,
        nextSong,
        prevSong,
        guestPlayCount,
        showLimitModal,
        setShowLimitModal,
        MAX_GUEST_PLAYS,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

// Unified Aliases so both usePlayer and useMusic work seamlessly anywhere
export const usePlayer = () => useContext(PlayerContext);
export const useMusic = usePlayer;
export const MusicProvider = PlayerProvider;