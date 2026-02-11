import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { VideoPlayer } from "../components/VideoPlayer";
import type { VideoItem } from "../types/video";

// Props: videos: VideoItem[]
export function VideoDetailPage({ videos }: { videos: VideoItem[] }) {
  const { videoId } = useParams();
  const navigate = useNavigate();

  // Find current video
  const currentVideo = useMemo(() => {
    return videos.find((v) => String(v.id) === String(videoId));
  }, [videos, videoId]);

  // Random recommendations (exclude current)
  const recommendations = useMemo(() => {
    const pool = videos.filter((v) => String(v.id) !== String(videoId));
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 12);
  }, [videos, videoId]);

  if (!currentVideo) {
    return (
      <div style={{ color: "#fff", padding: 32 }}>Vídeo não encontrado.</div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#121212",
        color: "#fff",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      <div style={{ width: "100%", maxWidth: "900px", margin: "0 auto" }}>
        <VideoPlayer
          videos={[currentVideo]}
          initialVideoId={String(currentVideo.id)}
          autoLoop={false}
          hiddenLoop
          hiddenRandom
          hiddenNext
          hiddenPrevious
          hiddenButtons
          containerStyle={{ width: "100%", maxWidth: "900px" }}
        />
        <div
          style={{
            marginTop: 24,
            padding: "12px 0",
            borderBottom: "1px solid #333",
          }}
        >
          <h2 style={{ color: "#ff8533", fontSize: "22px", marginBottom: 8 }}>
            {currentVideo.title}
          </h2>
          <div style={{ fontSize: "16px", color: "#ccc", marginBottom: 4 }}>
            Artista: {currentVideo.autor}
          </div>
          <div style={{ fontSize: "14px", color: "#aaa" }}>
            Categoria:{" "}
            {Array.isArray(currentVideo.categoria)
              ? currentVideo.categoria.join(", ")
              : currentVideo.categoria}
          </div>
        </div>
      </div>
      <div
        style={{ width: "100%", maxWidth: "900px", margin: "32px auto 0 auto" }}
      >
        <h3 style={{ color: "#ff8533", fontSize: "18px", marginBottom: 12 }}>
          Recomendações
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              window.innerWidth <= 768 ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
            gap: "16px",
          }}
        >
          {recommendations.map((video) => (
            <div
              key={video.id}
              style={{
                background: "#222",
                borderRadius: "12px",
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: "0 2px 8px #0004",
              }}
              onClick={() => navigate(`/video/${video.id}`)}
            >
              <img
                src={video.thumbnail_url}
                style={{
                  width: "100%",
                  height: "140px",
                  objectFit: "cover",
                  background: "#000",
                }}
              />
              <div
                style={{
                  padding: "10px",
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: 500,
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {video.title || video.autor}
              </div>
              <div
                style={{
                  padding: "0 10px 10px 10px",
                  color: "#aaa",
                  fontSize: "13px",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {video.autor}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
