import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { VideoItem } from "../types/video";

type MainNavbarProps = {
  videos: VideoItem[];
};

export function MainNavbar({ videos }: MainNavbarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const navigate = useNavigate();
  const location = useLocation();

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered =
      normalized.length === 0
        ? videos
        : videos.filter((video) => {
            const categoriaStr = Array.isArray(video.categoria)
              ? video.categoria.join(" ")
              : video.categoria;
            const haystack = [video.title, video.autor, categoriaStr, video.id]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();
            return haystack.includes(normalized);
          });
    return filtered.slice(0, 8);
  }, [query, videos]);

  const selectVideo = (video: VideoItem) => {
    const videoId = String(video.id);
    navigate(`/?videoId=${encodeURIComponent(videoId)}`);
    setQuery("");
    setIsOpen(false);
    setHighlightIndex(-1);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (suggestions[0]) {
      selectVideo(suggestions[0]);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex(
        (prev) => (prev - 1 + suggestions.length) % suggestions.length,
      );
    } else if (event.key === "Enter" && highlightIndex >= 0) {
      event.preventDefault();
      selectVideo(suggestions[highlightIndex]);
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setHighlightIndex(-1);
    }
  };

  return (
    <nav
      style={{
        display: "flex",
        flexDirection: window.innerWidth <= 768 ? "column" : "row",
        gap: window.innerWidth <= 768 ? "12px" : "0",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 24px",
        backgroundColor: "#0f0f0f",
        borderBottom: "1px solid #1f1f1f",
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span style={{ fontSize: "20px", fontWeight: 600, color: "#ff8533" }}>
          VideoPlayer
        </span>
        <Link
          to="/"
          style={{
            color: location.pathname === "/" ? "#ffbb66" : "#f8f9fa",
            textDecoration: "none",
            fontWeight: location.pathname === "/" ? 600 : 500,
          }}
        >
          Player
        </Link>
        <Link
          to="/gallery"
          style={{
            color: location.pathname.startsWith("/gallery")
              ? "#ffbb66"
              : "#f8f9fa",
            textDecoration: "none",
            fontWeight: location.pathname.startsWith("/gallery") ? 600 : 500,
          }}
        >
          Galeria
        </Link>
      </div>
      <form
        onSubmit={onSubmit}
        style={{
          position: "relative",
          width: "320px",
          maxWidth: "100%",
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
            setHighlightIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setIsOpen(false), 150);
          }}
          onKeyDown={onKeyDown}
          placeholder="Pesquisar vídeos..."
          autoComplete="off"
          style={{
            width: "100%",
            padding: "10px 14px",
            background: "#1f1f1f",
            color: "#f8f9fa",
            border: "1px solid #333",
            borderRadius: "999px",
          }}
        />
        {isOpen && suggestions.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "110%",
              left: 0,
              right: 0,
              background: "#1f1f1f",
              border: "1px solid #2c2c2c",
              borderRadius: "12px",
              boxShadow: "0 12px 30px rgba(0, 0, 0, 0.35)",
              padding: "6px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              maxHeight: "260px",
              overflowY: "auto",
            }}
          >
            {suggestions.map((video, index) => (
              <button
                key={video.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectVideo(video)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  textAlign: "left",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor:
                    highlightIndex === index ? "#2e2e2e" : "transparent",
                  color: "#f8f9fa",
                  cursor: "pointer",
                }}
                onMouseEnter={() => setHighlightIndex(index)}
              >
                <span style={{ fontWeight: 600, fontSize: "14px" }}>
                  {video.title || video.id}
                </span>
                <span style={{ fontSize: "12px", color: "#bbb" }}>
                  {video.autor} ·{" "}
                  {Array.isArray(video.categoria)
                    ? video.categoria.join(", ")
                    : video.categoria}
                </span>
              </button>
            ))}
          </div>
        )}
      </form>
    </nav>
  );
}
