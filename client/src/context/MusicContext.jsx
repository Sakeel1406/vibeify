import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { recordPlay } from "../services/api";
import { useAuth } from "./AuthContext";

const MusicContext = createContext();

export const useMusic = () => useContext(MusicContext);

export const MusicProvider = ({ children }) => {
  const { user } = useAuth();
  const audioRef = useRef(new Audio());

  const [queue, setQueue] = useState([]); // list of song objects
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false); // repeat current song

  const currentSong = currentIndex >= 0 ? queue[currentIndex] : null;

  // play a song, optionally supplying a new queue (e.g. an album's song list)
  const playSong = useCallback(
    (song, songList = null) => {
      if (songList) {
        const idx = songList.findIndex((s) => s._id === song._id);
        setQueue(songList);
        setCurrentIndex(idx >= 0 ? idx : 0);
      } else {
        const idx = queue.findIndex((s) => s._id === song._id);
        if (idx >= 0) {
          setCurrentIndex(idx);
        } else {
          setQueue((prev) => [...prev, song]);
          setCurrentIndex(queue.length);
        }
      }
      setIsPlaying(true);
      if (user) recordPlay(song._id).catch(() => {});
    },
    [queue, user]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!currentSong) return;
    audio.src = currentSong.audio;
    audio.volume = volume;
    if (isPlaying) {
      audio.play().catch(() => {});
    }
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const nextSong = useCallback(() => {
    if (queue.length === 0) return;
    if (shuffle) {
      const randIdx = Math.floor(Math.random() * queue.length);
      setCurrentIndex(randIdx);
    } else if (currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
    setIsPlaying(true);
  }, [queue, currentIndex, shuffle]);

  const prevSong = useCallback(() => {
    if (queue.length === 0) return;
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(queue.length - 1);
    }
    setIsPlaying(true);
  }, [queue, currentIndex]);

  useEffect(() => {
    const audio = audioRef.current;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        nextSong();
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [repeat, nextSong]);

  const togglePlay = () => {
    if (!currentSong) return;
    setIsPlaying((prev) => !prev);
  };

  const seekTo = (time) => {
    audioRef.current.currentTime = time;
    setProgress(time);
  };

  return (
    <MusicContext.Provider
      value={{
        queue,
        currentSong,
        isPlaying,
        progress,
        duration,
        volume,
        shuffle,
        repeat,
        playSong,
        togglePlay,
        nextSong,
        prevSong,
        seekTo,
        setVolume,
        setShuffle,
        setRepeat,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};
