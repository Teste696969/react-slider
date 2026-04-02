import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { VideoItem } from "../types/video";
import { useFavorites } from "../hooks/useFavorites";

type VideoPlayerProps = {
  videos: VideoItem[];
  initialVideoId?: string;
  autoRandom?: boolean;
  autoLoop?: boolean;
  hiddenPrevious?: boolean;
  hiddenNext?: boolean;
  hiddenRandom?: boolean;
  hiddenLoop?: boolean;
  hiddenButtons?: boolean;
  containerStyle?: React.CSSProperties;
  videoStyle?: React.CSSProperties;
  onVideoChange?: (video: VideoItem) => void;
  preFavoritedIds?: number[]; // IDs pré-favoritados (de videosFavs)
};

export function VideoPlayer({
  videos,
  initialVideoId,
  autoRandom = false,
  autoLoop = false,
  hiddenPrevious = false,
  hiddenNext = false,
  hiddenRandom = false,
  hiddenLoop = false,
  hiddenButtons = false,
  containerStyle,
  videoStyle,
  onVideoChange,
  preFavoritedIds = [],
}: VideoPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isRandom, setIsRandom] = useState<boolean>(autoRandom);
  const [isLoop, setIsLoop] = useState<boolean>(autoLoop);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const isHiddenLoop = hiddenLoop;
  const isHiddenRandom = hiddenRandom;
  const isHiddenNext = hiddenNext;
  const isHiddenPrevious = hiddenPrevious;
  const isHiddenButtons = hiddenButtons;
  const randomHistory = useRef<number[]>([]);
  const availableIndices = useRef<number[]>([]);

  useEffect(() => {
    setCurrentIndex(0);
    availableIndices.current = Array.from({ length: videos.length }, (_, i) => i);
    randomHistory.current = [];
  }, [videos]);

  useEffect(() => {
    if (!initialVideoId) return;
    const targetIndex = videos.findIndex(
      (video) => String(video.id) === initialVideoId,
    );
    if (targetIndex >= 0) {
      setCurrentIndex(targetIndex);
      randomHistory.current = [targetIndex];
    }
  }, [initialVideoId, videos]);

  const loadIndex = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= videos.length) return;
      setCurrentIndex(idx);
    },
    [videos.length],
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const hideTimeout = useRef<number | null>(null);
  const isPointerInside = useRef<boolean>(false);
  const isSeekingRef = useRef<boolean>(false);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const rewindClickTimeoutRef = useRef<number | null>(null);
  const forwardClickTimeoutRef = useRef<number | null>(null);
  const rewindClickCountRef = useRef<number>(0);
  const forwardClickCountRef = useRef<number>(0);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.loop = isLoop;
  }, [isLoop]);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  // Cleanup double-click timers on unmount
  useEffect(() => {
    return () => {
      if (rewindClickTimeoutRef.current)
        clearTimeout(rewindClickTimeoutRef.current);
      if (forwardClickTimeoutRef.current)
        clearTimeout(forwardClickTimeoutRef.current);
    };
  }, []);

  const current = useMemo(() => videos[currentIndex], [videos, currentIndex]);

  useEffect(() => {
    if (current && onVideoChange) {
      onVideoChange(current);
    }
  }, [current, onVideoChange]);

  const currentVideoId = Number(current?.id || 0);

  const onTogglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  }, []);

  const onTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
  }, []);

  const onLoadedData = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration || 0);
  }, []);

  const onPlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const onPause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const onToggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const onVolumeChange = useCallback((val: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    v.muted = val === 0;
    setVolume(val);
    setMuted(v.muted);
  }, []);

  const onTogglePlaybackRate = useCallback(() => {
    const rates = [1, 1.15, 1.25, 1.5];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  }, [playbackRate]);

  const onPrev = useCallback(() => {
    if (isRandom) {
      if (randomHistory.current.length > 1) {
        // Remove o vídeo atual do histórico
        const current = randomHistory.current.pop();
        // Se o vídeo atual foi removido, volta à pool de disponíveis
        if (current !== undefined && !availableIndices.current.includes(current)) {
          availableIndices.current.push(current);
        }
        // Pega o vídeo anterior
        const prev = randomHistory.current[randomHistory.current.length - 1];
        loadIndex(prev);
      }
    } else {
      loadIndex(currentIndex > 0 ? currentIndex - 1 : 0);
    }
  }, [currentIndex, isRandom, loadIndex]);

  const onNext = useCallback(() => {
    if (isRandom) {
      // Se a pool está vazia, reinicializa com todos os índices
      if (availableIndices.current.length === 0) {
        availableIndices.current = Array.from(
          { length: videos.length },
          (_, i) => i
        );
      }

      // Seleciona um índice aleatório da pool disponível
      const randomPosition = Math.floor(
        Math.random() * availableIndices.current.length
      );
      const nextIdx = availableIndices.current[randomPosition];

      // Remove o índice da pool para evitar repetições
      availableIndices.current.splice(randomPosition, 1);

      // Registra no histórico
      randomHistory.current.push(nextIdx);

      // Carrega o vídeo
      loadIndex(nextIdx);
    } else {
      const next = currentIndex < videos.length - 1 ? currentIndex + 1 : 0;
      loadIndex(next);
    }
  }, [currentIndex, videos.length, isRandom, loadIndex]);

  // Handle rewind button clicks (single click = -5s, double click = previous video)
  const handleRewindClick = useCallback(() => {
    rewindClickCountRef.current += 1;

    if (rewindClickCountRef.current === 1) {
      // First click - rewind 5 seconds
      if (videoRef.current) {
        videoRef.current.currentTime = Math.max(
          0,
          videoRef.current.currentTime - 5,
        );
      }

      // Set timeout to check for double click
      if (rewindClickTimeoutRef.current) {
        clearTimeout(rewindClickTimeoutRef.current);
      }

      rewindClickTimeoutRef.current = window.setTimeout(() => {
        rewindClickCountRef.current = 0;
      }, 300);
    } else if (rewindClickCountRef.current === 2 && !isHiddenButtons) {
      // Double click - go to previous video
      if (rewindClickTimeoutRef.current) {
        clearTimeout(rewindClickTimeoutRef.current);
      }
      rewindClickCountRef.current = 0;
      onPrev();
    }
  }, [onPrev]);

  // Handle forward button clicks (single click = +5s, double click = next video)
  const handleForwardClick = useCallback(() => {
    forwardClickCountRef.current += 1;

    if (forwardClickCountRef.current === 1) {
      // First click - forward 5 seconds
      if (videoRef.current) {
        videoRef.current.currentTime = Math.min(
          videoRef.current.duration || 0,
          videoRef.current.currentTime + 5,
        );
      }

      // Set timeout to check for double click
      if (forwardClickTimeoutRef.current) {
        clearTimeout(forwardClickTimeoutRef.current);
      }

      forwardClickTimeoutRef.current = window.setTimeout(() => {
        forwardClickCountRef.current = 0;
      }, 300);
    } else if (forwardClickCountRef.current === 2 && !isHiddenButtons) {
      // Double click - go to next video
      if (forwardClickTimeoutRef.current) {
        clearTimeout(forwardClickTimeoutRef.current);
      }
      forwardClickCountRef.current = 0;
      onNext();
    }
  }, [onNext]);

  const onEnded = useCallback(() => {
    if (isRandom) onNext();
    else {
      const next = currentIndex < videos.length - 1 ? currentIndex + 1 : 0;
      loadIndex(next);
    }
  }, [currentIndex, videos.length, isRandom, loadIndex, onNext]);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Erro ao alternar fullscreen:", err);
    }
  }, []);



  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const active = document.activeElement?.tagName.toLowerCase();
      if (active === "input" || active === "button") return;
      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          onTogglePlay();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen(); // Usa a nova função que trava a tela
          break;
        case "m":
          onToggleMute();
          break;
        case "arrowleft":
        case "j":
          if (videoRef.current) videoRef.current.currentTime -= 5;
          break;
        case "arrowright":
        case "l":
          if (videoRef.current) videoRef.current.currentTime += 5;
          break;
        case ">":
        case ".":
          e.preventDefault();
          onTogglePlaybackRate();
          break;
      }
    },
    [onToggleMute, onTogglePlay, onTogglePlaybackRate],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const hideControls = () => {
      if (!videoRef.current?.paused) {
        setShowControls(false);
      }
    };

    const scheduleHide = () => {
      // 1. Sempre mostra os controles ao interagir
      setShowControls(true);

      // 2. Limpa o timer anterior para o mouse não sumir enquanto move
      if (hideTimeout.current) window.clearTimeout(hideTimeout.current);

      // 3. Agenda o sumiço apenas se o vídeo estiver rodando
      if (!videoRef.current?.paused) {
        hideTimeout.current = window.setTimeout(hideControls, 3000);
      }
    };

    const handleMouseMove = () => {
      scheduleHide();
    };

    const handleMouseEnter = () => {
      isPointerInside.current = true;
      scheduleHide();
    };

    const handleMouseLeave = () => {
      isPointerInside.current = false;
      // Opcional: esconder mais rápido ao sair do container
      if (hideTimeout.current) window.clearTimeout(hideTimeout.current);
      hideControls();
    };

    // Eventos
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("keydown", onKeyDown);

    const onFull = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener("fullscreenchange", onFull);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("fullscreenchange", onFull);
      if (hideTimeout.current) window.clearTimeout(hideTimeout.current);
    };
  }, [onKeyDown, isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    if (hideTimeout.current) window.clearTimeout(hideTimeout.current);
    hideTimeout.current = window.setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => {
      if (hideTimeout.current) window.clearTimeout(hideTimeout.current);
    };
  }, [isPlaying]);

  const seekToClientX = useCallback((clientX: number) => {
    const container = controlsRef.current;
    const v = videoRef.current;
    if (!container || !v) return;
    const timeline = container.querySelector(
      ".timeline",
    ) as HTMLDivElement | null;
    if (!timeline) return;
    const rect = timeline.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    v.currentTime = ratio * (v.duration || 0);
  }, []);

  const onTimelineMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      isSeekingRef.current = true;
      setIsScrubbing(true);
      seekToClientX(e.clientX);
      const onMove = (ev: MouseEvent) => {
        if (!isSeekingRef.current) return;
        seekToClientX(ev.clientX);
      };
      const onUp = () => {
        isSeekingRef.current = false;
        setIsScrubbing(false);
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [seekToClientX],
  );

  const currentId = useMemo(() => {
    if (!current) return "";
    const raw = current.url ? current.url : current.parts?.[0]?.url || "";
    const name = raw.split("/").pop() || "";
    return name.split(".")[0];
  }, [current]);

  if (!current) {
    return (
      <div style={{ padding: 16, color: "#fff", textAlign: "center" }}>
        Nenhum vídeo disponível.
      </div>
    );
  }

  const currentSource =
    current.parts && current.parts.length > 0
      ? current.parts[0].url
      : current.url;

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "100%",
        margin: "0 auto",
        ...containerStyle,
      }}
    >
      <div
        ref={containerRef}
        className={`video-container ${showControls ? "" : "paused"} ${isScrubbing ? "scrubbing" : ""} ${isFullscreen ? "full-screen" : ""}`}
        data-volume-level={muted ? "muted" : volume >= 0.5 ? "high" : "low"}
        style={{
          position: "relative",
          aspectRatio: isFullscreen ? "auto" : "16 / 9",
          cursor: showControls ? "default" : "none",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          ...(isFullscreen && {
            transform:
              window.innerHeight > window.innerWidth ? "rotate(90deg)" : "none",
            transformOrigin: "center",
            width: window.innerHeight > window.innerWidth ? "100vh" : "100vw",
            height: window.innerHeight > window.innerWidth ? "100vw" : "100vh",
          }),
        }}
      >
        <div
          ref={controlsRef}
          className="video-controls-container"
          style={{ opacity: showControls ? 1 : 0 }}
        >
          <div className="timeline-container">
            <div
              className="timeline"
              style={{
                ["--progress-position" as any]: duration
                  ? currentTime / duration
                  : 0,
              }}
              onMouseDown={onTimelineMouseDown}
              onClick={(e) => seekToClientX(e.clientX)}
            >
              <div className="thumb-indicator"></div>
            </div>
          </div>
          <div className="controls">
            <button
              style={{ display: isHiddenPrevious ? "none" : "inline-block" }}
              id="prev-button"
              onClick={onPrev}
            >
              <i className="fa-solid fa-backward"></i>
            </button>
            <button className="play-pause-btn" onClick={onTogglePlay}>
              <i
                className="play-icon fa-solid fa-play"
                style={{ display: isPlaying ? "none" : "inline-block" }}
              ></i>
              <i
                className="pause-icon fa-solid fa-pause"
                style={{ display: isPlaying ? "inline-block" : "none" }}
              ></i>
            </button>
            <button
              style={{ display: isHiddenNext ? "none" : "inline-block" }}
              id="next-button"
              onClick={onNext}
            >
              <i className="fa-solid fa-forward"></i>
            </button>
            <div className="volume-container">
              <button className="mute-btn" onClick={onToggleMute}>
                <i className="volume-high-icon fa-solid fa-volume-high"></i>
                <i className="volume-low-icon fa-solid fa-volume-low"></i>
                <i className="volume-muted-icon fa-solid fa-volume-off"></i>
              </button>
              <input
                className="volume-slider"
                type="range"
                min="0"
                max="1"
                step="any"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              />
            </div>
            <div className="duration-container">
              <div className="current-time">{formatDuration(currentTime)}</div>/
              <div className="total-time">{formatDuration(duration)}</div>
            </div>
            <button
              style={{ display: isHiddenRandom ? "none" : "inline-block" }}
              id="random-button"
              className={isRandom ? "active-random" : ""}
              onClick={() => setIsRandom((v) => !v)}
            >
              <i className="fa-solid fa-shuffle"></i>
            </button>
            <button
              style={{ display: isHiddenLoop ? "none" : "inline-block" }}
              id="loop-button"
              className={isLoop ? "active-loop" : ""}
              onClick={() => setIsLoop((v) => !v)}
            >
              <i className="fa-solid fa-repeat"></i>
            </button>
            <button
              id="playback-rate-button"
              className="playback-rate-btn"
              onClick={onTogglePlaybackRate}
              title={`Velocidade: ${playbackRate}x`}
            >
              <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                {playbackRate}x
              </span>
            </button>
            <button className="full-screen-btn" onClick={toggleFullscreen}>
              <i className="fa-solid fa-expand"></i>
            </button>
          </div>
        </div>

        {currentSource ? (
          <div
            style={{
              display: "flex",
              width: "100%",
              height: isFullscreen ? "100%" : "100%",
              flex: 1,
              background: "#000",
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
            }}
          >
            <video
              ref={videoRef}
              id="video-player"
              onClick={() => {
                setShowControls(true);
                if (hideTimeout.current)
                  window.clearTimeout(hideTimeout.current);
                hideTimeout.current = window.setTimeout(() => {
                  if (!videoRef.current?.paused) setShowControls(false);
                }, 3000);
                onTogglePlay();
              }}
              onPlay={onPlay}
              onPause={onPause}
              onEnded={onEnded}
              onTimeUpdate={onTimeUpdate}
              onLoadedData={onLoadedData}
              src={currentSource}
              autoPlay
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                background: "#000",
                display: "block",
                ...videoStyle,
              }}
            />

            {/* Invisible Control Buttons Overlay */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 0,
                zIndex: 5,
              }}
            >
              {/* Left Button - Rewind */}
              <button
                className="invisible-control-btn rewind-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRewindClick();
                }}
                style={{
                  display: "flex",
                  background: "transparent",
                  border: "none",
                  cursor: showControls ? "pointer" : "none",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    fontSize: "40px",
                    color: "rgba(255, 255, 255, 0)",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  className="rewind-icon"
                >
                  <i className="fa-solid fa-backward-step"></i>
                </div>
              </button>

              {/* Center Button - Play/Pause */}
              <button
                className="invisible-control-btn play-pause-overlay-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePlay();
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: showControls ? "pointer" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "50px",
                    color: "rgba(255, 255, 255, 0)",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  className="play-pause-overlay-icon"
                >
                  <i
                    className={`fa-solid ${isPlaying ? "fa-pause" : "fa-play"}`}
                  ></i>
                </div>
              </button>

              {/* Right Button - Forward */}
              <button
                className="invisible-control-btn forward-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleForwardClick();
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: showControls ? "pointer" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    fontSize: "40px",
                    color: "rgba(255, 255, 255, 0)",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  className="forward-icon"
                >
                  <i className="fa-solid fa-forward-step"></i>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: 16 }}>Fonte de vídeo inválida.</div>
        )}
      </div>
      <div className="video-title-container">
        <div className="video-urls-container">
          <h5
            className="video-url"
            onClick={() => {
              if (currentId) window.open(currentSource || "#", "_blank");
            }}
          >
            {currentId}
          </h5>
          <div>
            <h6
              className="artist-url"
              onClick={() => {
                if (current?.autor)
                  window.open(
                    `https://www.google.com/search?q=${encodeURIComponent(current.autor)}`,
                    "_blank",
                  );
              }}
            >
              {current?.autor || ""}
            </h6>
            <h6 className="video-title">{current?.categoria || ""}</h6>
          </div>
        </div>
        <button
          className="favorites-btn"
          onClick={() => {
            if (current?.id) {
              const videoId = Number(current.id);
              if (isFavorite(videoId)) {
                removeFavorite(videoId);
              } else {
                addFavorite(videoId);
              }
            }
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "24px",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isFavorite(currentVideoId) || preFavoritedIds.includes(currentVideoId) ? "#ff6b6b" : "#888",
            transition: "color 0.2s ease",
          }}
          title={isFavorite(currentVideoId) || preFavoritedIds.includes(currentVideoId) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <i className={`fa-${isFavorite(currentVideoId) || preFavoritedIds.includes(currentVideoId) ? "solid" : "regular"} fa-heart`}></i>
        </button>
      </div>
    </section>
  );
}

function formatDuration(time?: number) {
  const t = Math.max(0, Math.floor(time || 0));
  const seconds = t % 60;
  const minutes = Math.floor(t / 60) % 60;
  const hours = Math.floor(t / 3600);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return hours === 0
    ? `${minutes}:${pad(seconds)}`
    : `${hours}:${pad(minutes)}:${pad(seconds)}`;
}
