import { useCallback, useEffect, useMemo, useState } from "react";
import { FilterSection } from "../components/FilterSection";
import { useVideoFilters } from "../hooks/useVideoFilters";
import type { VideoItem } from "../types/video";
import { useIsMobile } from "../hooks/useMobile";

export function GalleryPage({ videos }: { videos: VideoItem[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const itemsPerPage = 20;
  const maxVisiblePages = 6;

  const {
    selectedArtists,
    selectedCategories,
    searchInput,
    showSuggestions,
    randomArtists,
    allCategories,
    searchSuggestions,
    filtered,
    setSearchInput,
    setShowSuggestions,
    removeArtist,
    removeCategory,
    addArtist,
    addCategory,
  } = useVideoFilters(videos);

  const totalPages = useMemo(
    () => Math.ceil(filtered.length / itemsPerPage),
    [filtered.length, itemsPerPage],
  );
  const pageCount = Math.max(1, totalPages);

  const paginatedVideos = useMemo(() => {
    return filtered.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
  }, [currentPage, itemsPerPage, filtered]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, pageCount));
  }, [pageCount]);

  const pageNumbers = useMemo(() => {
    if (pageCount <= maxVisiblePages) {
      return Array.from({ length: pageCount }, (_, index) => index + 1);
    }
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = start + maxVisiblePages - 1;

    if (end > pageCount) {
      end = pageCount;
      start = end - maxVisiblePages + 1;
    }

    if (start < 1) start = 1;

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [currentPage, pageCount, maxVisiblePages]);

  const handleCardEnter = useCallback((id: string) => {
    setHoveredId(id);
  }, []);

  const handleCardLeave = useCallback(() => {
    setHoveredId(null);
  }, []);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pageCount) {
      setCurrentPage(page);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#121212",
        minHeight: "100vh",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: "24px",
        padding: "24px 12px",
        color: "#fff",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          width: isMobile ? "100%" : "25%",
          minWidth: "250px",
        }}
      >
        <FilterSection
          searchInput={searchInput}
          selectedArtists={selectedArtists}
          selectedCategories={selectedCategories}
          randomArtists={randomArtists}
          allCategories={allCategories}
          searchSuggestions={searchSuggestions}
          showSuggestions={showSuggestions}
          onSearchInputChange={setSearchInput}
          onSearchFocus={() => setShowSuggestions(true)}
          onSearchBlur={() => setShowSuggestions(false)}
          onAddArtist={addArtist}
          onAddCategory={addCategory}
          onRemoveArtist={removeArtist}
          onRemoveCategory={removeCategory}
        />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          width: isMobile ? "100%" : "auto",
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ color: "#aaa", fontSize: "18px" }}>
            Nenhum vídeo disponível.
          </div>
        ) : (
          <>
            <div
              className="gallery-container"
              style={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "repeat(2, 1fr)"
                  : "repeat(5, 1fr)",
                gap: "1px",
                margin: "0",
                justifyItems: "center",
                justifyContent: "center",
              }}
            >
              {paginatedVideos.map((video, index) => (
                <a
                  key={`${video.id || video.url}-${index}`}
                  href={`/video/${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    width: "100%",
                    maxWidth: "300px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                  onMouseEnter={() => handleCardEnter(video.id)}
                  onMouseLeave={() => handleCardLeave()}
                  onFocus={() => handleCardEnter(video.id)}
                  onBlur={() => handleCardLeave()}
                >
                  <div
                    className="video-card"
                    style={{
                      width: "100%",
                      overflow: "hidden",
                      maxWidth: "300px",
                      backgroundColor: "transparent",
                      transform:
                        hoveredId === video.id
                          ? "translateY(-6px)"
                          : "translateY(0)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      minHeight: "240px",
                      cursor: "pointer",
                    }}
                  >
                    <img
                      loading="lazy"
                      src={video.thumbnail_url}
                      style={{
                        width: "100%",
                        aspectRatio: "16 / 9",
                        borderRadius: "12px",
                        objectFit: "cover",
                        background: "#000",
                        pointerEvents: "none",
                      }}
                    />
                    <div
                      className="video-info"
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "16px",
                          margin: 0,
                          color: "#ffbb66",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: "2",
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {video.title || video.autor}
                      </h3>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "#ccc",
                          margin: 0,
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: "1",
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {video.autor}
                      </p>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#888",
                          textTransform: "uppercase",
                        }}
                      >
                        {Array.isArray(video.categoria)
                          ? video.categoria.join(", ")
                          : video.categoria}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {filtered.length > 0 && (
              <div
                className="pagination"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                  width: "100%",
                  maxWidth: "800px",
                  margin: "0 auto",
                }}
              >
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: "10px 16px",
                    background: currentPage === 1 ? "#1f1f1f" : "#333",
                    color: "#fff",
                    border: "1px solid #444",
                    borderRadius: "8px",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Início
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: "10px 18px",
                    background: currentPage === 1 ? "#1f1f1f" : "#333",
                    color: "#fff",
                    border: "1px solid #444",
                    borderRadius: "999px",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Anterior
                </button>
                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    style={{
                      padding: "10px 16px",
                      background: currentPage === page ? "#ff8533" : "#1f1f1f",
                      color: currentPage === page ? "#fff" : "#aaa",
                      border: "1px solid #333",
                      borderRadius: "8px",
                      cursor: "pointer",
                      minWidth: "48px",
                    }}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pageCount}
                  style={{
                    padding: "10px 18px",
                    background: currentPage === pageCount ? "#1f1f1f" : "#333",
                    color: "#fff",
                    border: "1px solid #444",
                    borderRadius: "999px",
                    cursor:
                      currentPage === pageCount ? "not-allowed" : "pointer",
                  }}
                >
                  Próxima
                </button>
                <button
                  onClick={() => handlePageChange(pageCount)}
                  disabled={currentPage === pageCount}
                  style={{
                    padding: "10px 16px",
                    background: currentPage === pageCount ? "#1f1f1f" : "#333",
                    color: "#fff",
                    border: "1px solid #444",
                    borderRadius: "8px",
                    cursor:
                      currentPage === pageCount ? "not-allowed" : "pointer",
                  }}
                >
                  Fim
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
