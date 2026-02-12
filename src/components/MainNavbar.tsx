import React, { useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import type { VideoItem } from "../types/video";
import { useAdvancedSearch } from "../hooks/useAdvancedSearch";

type MainNavbarProps = {
  videos: VideoItem[];
};

export function MainNavbar({ videos }: MainNavbarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<VideoItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const location = useLocation();
  const { debouncedSearch, searchHistory } = useAdvancedSearch(videos);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);
      if (searchQuery.trim()) {
        setIsSearching(true);
      }
      debouncedSearch(searchQuery, (results) => {
        setSuggestions(results);
        setIsSearching(false);
      });
      setHighlightIndex(-1);
    },
    [debouncedSearch],
  );

  const selectVideo = (video: VideoItem) => {
    const urlVideo = `/video/${video.id}`;
    window.open(urlVideo, "_blank", "noopener,noreferrer");
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
          width: "620px",
          maxWidth: "100%",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: "12px",
              fontSize: "16px",
              color: "#666",
            }}
          >
            🔍
          </span>
          <input
            type="text"
            value={query}
            onChange={(event) => {
              handleSearch(event.target.value);
              setIsOpen(true);
            }}
            onFocus={(e) => {
              setIsOpen(true);
              if (!query.trim()) {
                setSuggestions(videos.slice(0, 8));
              }
              e.currentTarget.style.borderColor = "#ff8533";
              e.currentTarget.style.boxShadow =
                "0 0 0 2px rgba(255, 133, 51, 0.1)";
            }}
            onBlur={(e) => {
              window.setTimeout(() => setIsOpen(false), 150);
              e.currentTarget.style.borderColor = "#333";
              e.currentTarget.style.boxShadow = "none";
            }}
            onKeyDown={onKeyDown}
            placeholder="Pesquisar vídeos..."
            autoComplete="off"
            style={{
              width: "100%",
              padding: "10px 14px 10px 38px",
              background: "#1f1f1f",
              color: "#f8f9fa",
              border: "1px solid #333",
              borderRadius: "999px",
              transition: "border-color 0.2s, box-shadow 0.2s",
              outline: "none",
            }}
          />
          {isSearching && (
            <span
              style={{
                position: "absolute",
                right: "12px",
                fontSize: "14px",
                animation: "spin 1s linear infinite",
              }}
            >
              ⏳
            </span>
          )}
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        {isOpen &&
          (suggestions.length > 0 ||
            (query === "" && searchHistory.length > 0)) && (
            <div
              style={{
                position: "absolute",
                top: "110%",
                left: 0,
                zIndex: 1000000000,
                right: 0,
                background: "#0f0f0f",
                border: "1px solid #2c2c2c",
                borderRadius: "16px",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                maxHeight: "380px",
                overflowY: "auto",
                backdropFilter: "blur(10px)",
              }}
            >
              {query === "" && searchHistory.length > 0 && (
                <>
                  <div
                    style={{
                      padding: "8px 12px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#666",
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                    }}
                  >
                    🕐 Histórico recente
                  </div>
                  {searchHistory.map((historyQuery, index) => (
                    <button
                      key={`history-${index}`}
                      type="button"
                      onClick={() => handleSearch(historyQuery)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: "none",
                        backgroundColor: "transparent",
                        color: "#bbb",
                        cursor: "pointer",
                        fontSize: "13px",
                        transition: "all 0.15s ease",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#1a1a1a";
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#bbb";
                      }}
                    >
                      <span style={{ fontSize: "12px" }}>⌚</span>
                      <span>{historyQuery}</span>
                    </button>
                  ))}
                  <div
                    style={{
                      borderTop: "1px solid #1a1a1a",
                      margin: "4px 0",
                    }}
                  />
                </>
              )}
              {suggestions.length > 0 && (
                <>
                  {query !== "" && (
                    <div
                      style={{
                        padding: "8px 12px",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#666",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                      }}
                    >
                      🎬 Resultados ({suggestions.length})
                    </div>
                  )}
                  {suggestions.map((video, index) => (
                    <button
                      key={video.id}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        selectVideo(video);
                      }}
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px",
                        borderRadius: "12px",
                        border: "1px solid transparent",
                        backgroundColor:
                          highlightIndex === index ? "#1a1a1a" : "transparent",
                        color: "#f8f9fa",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => {
                        setHighlightIndex(index);
                        e.currentTarget.style.backgroundColor = "#1a1a1a";
                        e.currentTarget.style.borderColor = "#ff8533";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.borderColor = "transparent";
                      }}
                    >
                      <img
                        loading="lazy"
                        src={video.thumbnail_url}
                        style={{
                          width: "40%",
                          height: "100%",
                          objectFit: "cover",
                          background: "#000",
                          pointerEvents: "none",
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "14px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            marginBottom: "4px",
                          }}
                        >
                          {video.title || video.id}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#888",
                            marginBottom: "6px",
                          }}
                        >
                          {video.autor}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "4px",
                            flexWrap: "wrap",
                          }}
                        >
                          {Array.isArray(video.categoria) ? (
                            video.categoria.slice(0, 2).map((cat, i) => (
                              <span
                                key={i}
                                style={{
                                  fontSize: "11px",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  background: "#ff8533",
                                  color: "#fff",
                                  fontWeight: 600,
                                }}
                              >
                                {cat}
                              </span>
                            ))
                          ) : (
                            <span
                              style={{
                                fontSize: "11px",
                                padding: "3px 8px",
                                borderRadius: "6px",
                                background: "#ff8533",
                                color: "#fff",
                                fontWeight: 600,
                              }}
                            >
                              {video.categoria}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
      </form>
    </nav>
  );
}
