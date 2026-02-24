import { useEffect, useMemo, useState } from "react";
import { FilterSection } from "../components/FilterSection";
import { useVideoFilters } from "../hooks/useVideoFilters";
import type { VideoItem } from "../types/video";
import { useIsMobile } from "../hooks/useMobile";

export function GalleryPageFavs({ videos }: { videos: VideoItem[] }) {
  const [currentPage, setCurrentPage] = useState(1);
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
                  : "repeat(4, 1fr)",
                gap: "16px",
                margin: "0",
                justifyItems: "center",
                justifyContent: "center",
              }}
            >
              {paginatedVideos.map((video, index) => (
                <a
                  key={`${video.id || video.url}-${index}`}
                  href={
                    location.pathname.startsWith("/g-favs")
                      ? `/video-fav/${video.id}`
                      : `/video/${video.id}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "white",
                    backgroundColor: "#222",
                    borderRadius: "8px",
                    maxWidth: "300px",
                    width: "100%",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    position: "relative",
                  }}
                >
                  {/* Thumbnail (placeholder) */}
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "16 / 9",
                      backgroundColor: "#111",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
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
                  </div>

                  {/* Info */}
                  <div style={{ padding: "12px" }}>
                    <h3
                      style={{
                        margin: "0 0 8px 0",
                        fontSize: "14px",
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {video.categoria || "Sem título"}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "#aaa",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {video.autor || "Desconhecido"}
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: "11px",
                        color: "#888",
                      }}
                    >
                      ID: {video.id}
                    </p>
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
