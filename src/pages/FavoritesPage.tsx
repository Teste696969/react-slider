import { useEffect, useState } from "react";
import type { VideoItem } from "../types/video";
import { useFavorites } from "../hooks/useFavorites";
import { useIsMobile } from "../hooks/useMobile";

type FavoritesPageProps = {
  videos: VideoItem[];
};

export function FavoritesPage({ videos }: FavoritesPageProps) {
  const { favorites, removeFavorite, clearFavorites, copyToClipboard } = useFavorites();
  const [filteredVideos, setFilteredVideos] = useState<VideoItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [showData, setShowData] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const isMobileLayout = useIsMobile();

  useEffect(() => {
    const filtered = videos.filter((video) => favorites.includes(Number(video.id)));
    setFilteredVideos(filtered);
  }, [videos, favorites]);

  const handleCopyIds = () => {
    const success = copyToClipboard();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClearFavorites = () => {
    setShowClearDialog(true);
  };

  const confirmClearFavorites = () => {
    clearFavorites();
    setShowClearDialog(false);
  };

  const handleRemoveFavorite = (videoId: number | string) => {
    removeFavorite(Number(videoId));
  };

  return (
    <div
      style={{
        backgroundColor: "#121212",
        minHeight: "100vh",
        padding: isMobileLayout ? "12px 8px" : "24px 12px",
        color: "#fff",
      }}
    >
      {/* Dialog de Confirmação */}
      {showClearDialog && (
        <>
          {/* Overlay */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={() => setShowClearDialog(false)}
          >
            {/* Dialog */}
            <div
              style={{
                backgroundColor: "#222",
                borderRadius: "12px",
                padding: "24px",
                maxWidth: "400px",
                width: "90%",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.8)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#fff",
                }}
              >
                Limpar Favoritos?
              </h2>
              <p
                style={{
                  margin: "0 0 24px 0",
                  fontSize: "14px",
                  color: "#aaa",
                  lineHeight: "1.5",
                }}
              >
                Tem certeza que deseja remover todos os {filteredVideos.length} vídeos favoritados? Esta ação não pode ser desfeita.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => setShowClearDialog(false)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#444",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#555")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#444")}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmClearFavorites}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#e74c3c",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#c0392b")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e74c3c")}
                >
                  Sim, Limpar Tudo
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Header com botões */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "24px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0, flex: 1, minWidth: "200px" }}>
          Meus Favoritos ({filteredVideos.length})
        </h1>
        <button
          onClick={handleCopyIds}
          style={{
            padding: "10px 16px",
            backgroundColor: "#1db954",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1ed760")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1db954")}
          title="Copia a lista de IDs para a área de transferência"
        >
          {copied ? "✓ Copiado!" : "Copiar IDs"}
        </button>
        <button
          onClick={handleClearFavorites}
          disabled={filteredVideos.length === 0}
          style={{
            padding: "10px 16px",
            backgroundColor: filteredVideos.length === 0 ? "#444" : "#e74c3c",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: filteredVideos.length === 0 ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            if (filteredVideos.length > 0) {
              e.currentTarget.style.backgroundColor = "#c0392b";
            }
          }}
          onMouseLeave={(e) => {
            if (filteredVideos.length > 0) {
              e.currentTarget.style.backgroundColor = "#e74c3c";
            }
          }}
          title="Limpar todos os favoritos"
        >
          Limpar Tudo
        </button>
      </div>

      {/* Seção de dados salvos */}
      <div
        style={{
          marginBottom: "24px",
          padding: "12px",
          backgroundColor: "#1a1a1a",
          borderRadius: "8px",
          borderLeft: "4px solid #1db954",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={() => setShowData(!showData)}
        >
          <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>
            📊 Dados Salvos em Local Storage ({favorites.length} IDs)
          </h3>
          <span style={{ fontSize: "12px", color: "#888" }}>
            {showData ? "▼" : "▶"}
          </span>
        </div>

        {showData && (
          <div
            style={{
              marginTop: "12px",
              padding: "12px",
              backgroundColor: "#0f0f0f",
              borderRadius: "4px",
              fontFamily: "monospace",
              fontSize: "12px",
              color: "#00ff00",
              wordBreak: "break-all",
              maxHeight: "200px",
              overflow: "auto",
            }}
          >
            <code>{JSON.stringify(favorites)}</code>
          </div>
        )}
      </div>
      {filteredVideos.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            color: "#888",
          }}
        >
          <p style={{ fontSize: "18px", marginBottom: "12px" }}>
            Você não tem vídeos favoritados ainda.
          </p>
          <p style={{ fontSize: "14px" }}>
            Clique no ícone de coração ao reproduzir um vídeo para adicioná-lo aqui.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobileLayout
              ? "repeat(2, 1fr)"
              : "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              style={{
                backgroundColor: "#222",
                borderRadius: "8px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
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
                {/* Ícone de coração (indicando que está favoritado) */}
                <div
                  style={{
                    position: "absolute",
                    top: "8px",
                    left: "8px",
                    color: "#ff6b6b",
                    fontSize: "20px",
                  }}
                >
                  <i className="fa-solid fa-heart"></i>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(video.id);
                  }}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    backgroundColor: "rgba(255, 0, 0, 0.7)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(220, 0, 0, 1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 0, 0, 0.7)";
                  }}
                  title="Remover dos favoritos"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
