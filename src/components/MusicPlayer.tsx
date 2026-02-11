import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MusicItem } from "../types/music";
import type { VideoItem } from "../types/video";
import {
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeOff,
} from "lucide-react";
import { useIsMobile } from "../hooks/useMobile";

type MusicPlayerProps = {
  music: MusicItem[];
  autoPlay?: boolean;
  autoLoop?: boolean;
  autoRandom?: boolean;
  currentVideo?: VideoItem | null;
  containerStyle?: React.CSSProperties;
};

export function MusicPlayer({
  music,
  autoPlay = false,
  autoLoop = false,
  autoRandom = false,
  currentVideo,
  containerStyle,
}: MusicPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isRandom, setIsRandom] = useState<boolean>(autoRandom);
  const [isLoop, setIsLoop] = useState<boolean>(autoLoop);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [muted, setMuted] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(25);
  const [wasPlayingBeforePMV, setWasPlayingBeforePMV] =
    useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const randomHistory = useRef<number[]>([]);

  // Verificar se o vídeo atual contém "pmv" na categoria
  useEffect(() => {
    if (!currentVideo) return;

    const hasPMV = (() => {
      const categories = Array.isArray(currentVideo.categoria)
        ? currentVideo.categoria
        : [currentVideo.categoria];
      return categories.some(
        (cat) => typeof cat === "string" && cat.toLowerCase().includes("pmv"),
      );
    })();

    if (hasPMV) {
      // Se tem PMV e está tocando, pausa e salva o estado
      if (isPlaying) {
        setWasPlayingBeforePMV(true);
        setIsPlaying(false);
      }
    } else {
      // Se não tem PMV e estava tocando antes do PMV, retoma
      if (wasPlayingBeforePMV) {
        setIsPlaying(true);
        setWasPlayingBeforePMV(false);
      }
    }
  }, [currentVideo, isPlaying, wasPlayingBeforePMV]);

  useEffect(() => {
    setCurrentIndex(0);
    randomHistory.current = [];
  }, [music]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.loop = isLoop && !isRandom;
  }, [isLoop, isRandom]);

  const current = useMemo(() => music[currentIndex], [music, currentIndex]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume / 100;
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, current]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleNextTrack = useCallback(() => {
    if (isRandom) {
      if (randomHistory.current.length === music.length) {
        randomHistory.current = [];
      }
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * music.length);
      } while (randomHistory.current.includes(randomIndex));
      randomHistory.current.push(randomIndex);
      setCurrentIndex(randomIndex);
    } else {
      setCurrentIndex((prev) => (prev + 1) % music.length);
    }
  }, [isRandom, music.length]);

  const handlePreviousTrack = useCallback(() => {
    if (isRandom && randomHistory.current.length > 1) {
      randomHistory.current.pop();
      setCurrentIndex(randomHistory.current[randomHistory.current.length - 1]);
    } else {
      setCurrentIndex((prev) => (prev - 1 + music.length) % music.length);
    }
  }, [isRandom, music.length]);

  const handleToggleRandom = useCallback(() => {
    setIsRandom(!isRandom);
    randomHistory.current = [currentIndex];
  }, [isRandom, currentIndex]);

  const handleToggleLoop = useCallback(() => {
    setIsLoop(!isLoop);
  }, [isLoop]);

  const handleToggleMute = useCallback(() => {
    setMuted(!muted);
    if (audioRef.current) {
      audioRef.current.muted = !muted;
    }
  }, [muted]);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = Number(e.target.value);
      setVolume(newVolume);
      if (audioRef.current) {
        audioRef.current.volume = newVolume / 100;
      }
    },
    [],
  );

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    if (isLoop && !isRandom) {
      setCurrentTime(0);
      setIsPlaying(true);
    } else {
      handleNextTrack();
      setIsPlaying(true);
    }
  }, [isLoop, isRandom, handleNextTrack]);

  const handleProgressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = Number(e.target.value);
      setCurrentTime(newTime);
      if (audioRef.current) {
        audioRef.current.currentTime = newTime;
      }
    },
    [],
  );

  const formatTime = useCallback((time: number) => {
    if (!isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  if (music.length === 0) {
    return (
      <div
        style={{
          padding: "20px",
          background: "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)",
          color: "#ccc",
          textAlign: "center",
          borderRadius: "12px",
          border: "1px solid #333",
          ...containerStyle,
        }}
      >
        Nenhuma música disponível
      </div>
    );
  }

  const isMobile = useIsMobile();

  return (
    <div
      style={{
        width: "100%",
        padding: isMobile ? "16px" : "24px",
        borderRadius: "12px",
        background: "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)",
        border: "1px solid #333",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, sans-serif",
        ...containerStyle,
      }}
    >
      <audio
        ref={audioRef}
        src={current?.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Informações da música */}
      <div style={{ marginBottom: isMobile ? "16px" : "20px" }}>
        <h3
          style={{
            margin: 0,
            fontSize: isMobile ? "16px" : "18px",
            fontWeight: "700",
            color: "#fff",
            marginBottom: "4px",
            lineHeight: "1.3",
            wordBreak: "break-word",
          }}
        >
          {current?.title || "Sem música"}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: isMobile ? "12px" : "13px",
            color: "#888",
            marginBottom: "12px",
          }}
        >
          Faixa {currentIndex + 1} de {music.length}
        </p>
      </div>

      {/* Progress bar com melhor visual */}
      <div style={{ marginBottom: "8px" }}>
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleProgressChange}
          style={
            {
              width: "100%",
              height: "6px",
              borderRadius: "3px",
              background: "#333",
              outline: "none",
              cursor: "pointer",
              accentColor: "#ff8533",
              WebkitAppearance: "none",
            } as any
          }
        />
      </div>

      {/* Tempo */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: isMobile ? "11px" : "12px",
          color: "#666",
          marginBottom: isMobile ? "14px" : "16px",
        }}
      >
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controles principais */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: isMobile ? "12px" : "16px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Botões esquerda e centro */}
        <div
          style={{
            display: "flex",
            gap: isMobile ? "16px" : "12px",
            alignItems: "center",
            justifyContent: isMobile ? "center" : "flex-start",
            width: isMobile ? "100%" : "auto",
          }}
        >
          {/* Skip anterior */}
          <button
            onClick={handlePreviousTrack}
            style={{
              padding: "8px",
              background: "#222",
              color: "#ccc",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              width: isMobile ? "44px" : "36px",
              height: isMobile ? "44px" : "36px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#333";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#222";
              e.currentTarget.style.color = "#ccc";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <SkipBack size={isMobile ? 22 : 18} />
          </button>

          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            style={{
              padding: "10px",
              background: "#ff8533",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              width: isMobile ? "56px" : "44px",
              height: isMobile ? "56px" : "44px",
              fontWeight: "600",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ff7020";
              e.currentTarget.style.transform = "scale(1.08)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(255, 133, 51, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ff8533";
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {isPlaying ? (
              <Pause size={isMobile ? 28 : 20} />
            ) : (
              <Play size={isMobile ? 28 : 20} />
            )}
          </button>

          {/* Skip próximo */}
          <button
            onClick={handleNextTrack}
            style={{
              padding: "8px",
              background: "#222",
              color: "#ccc",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              width: isMobile ? "44px" : "36px",
              height: isMobile ? "44px" : "36px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#333";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#222";
              e.currentTarget.style.color = "#ccc";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <SkipForward size={isMobile ? 22 : 18} />
          </button>

          {/* Espaço flexível no mobile */}
          {!isMobile && <div style={{ flex: 1 }} />}
        </div>

        {/* Botões direita */}
        <div
          style={{
            display: "flex",
            gap: isMobile ? "12px" : "12px",
            alignItems: "center",
            width: isMobile ? "100%" : "auto",
            justifyContent: isMobile ? "space-around" : "flex-start",
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            {/* Shuffle */}
            <button
              onClick={handleToggleRandom}
              title="Modo aleatório"
              style={{
                padding: "6px",
                background: isRandom ? "#ff8533" : "#222",
                color: isRandom ? "#fff" : "#888",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                width: isMobile ? "40px" : "34px",
                height: isMobile ? "40px" : "34px",
                fontSize: "14px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isRandom
                  ? "#ff7020"
                  : "#333";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isRandom
                  ? "#ff8533"
                  : "#222";
                e.currentTarget.style.color = isRandom ? "#fff" : "#888";
              }}
            >
              <Shuffle size={isMobile ? 18 : 16} />
            </button>

            {/* Loop */}
            <button
              onClick={handleToggleLoop}
              title="Modo repetição"
              style={{
                padding: "6px",
                background: isLoop ? "#ff8533" : "#222",
                color: isLoop ? "#fff" : "#888",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                width: isMobile ? "40px" : "34px",
                height: isMobile ? "40px" : "34px",
                fontSize: "14px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isLoop ? "#ff7020" : "#333";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isLoop ? "#ff8533" : "#222";
                e.currentTarget.style.color = isLoop ? "#fff" : "#888";
              }}
            >
              <Repeat size={isMobile ? 18 : 16} />
            </button>
          </div>

          {/* Volume */}
          {/* <div style={{
                        display: isMobile ? 'none' : 'flex',
                        gap: '8px',
                        alignItems: 'center',
                        background: 'rgba(255, 133, 51, 0.05)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                    }}>
                        <button
                            onClick={handleToggleMute}
                            title={muted ? 'Desmutar' : 'Mutar'}
                            style={{
                                padding: '4px',
                                background: 'transparent',
                                color: muted ? '#666' : '#ccc',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                width: '28px',
                                height: '28px',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 133, 51, 0.1)'
                                e.currentTarget.style.color = '#ff8533'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent'
                                e.currentTarget.style.color = muted ? '#666' : '#ccc'
                            }}
                        >
                            {muted ? <VolumeOff size={16} /> : <Volume2 size={16} />}
                        </button>

                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={muted ? 0 : volume}
                            onChange={handleVolumeChange}
                            disabled={muted}
                            title={`Volume: ${volume}%`}
                            style={{
                                width: '80px',
                                height: '4px',
                                borderRadius: '2px',
                                background: '#333',
                                outline: 'none',
                                cursor: muted ? 'not-allowed' : 'pointer',
                                opacity: muted ? 0.4 : 1,
                                accentColor: '#ff8533',
                                transition: 'all 0.2s ease',
                            } as any}
                        />
                    </div> */}
        </div>
      </div>
    </div>
  );
}
