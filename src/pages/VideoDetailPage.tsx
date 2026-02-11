import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { VideoPlayer } from "../components/VideoPlayer";
import type { VideoItem } from "../types/video";
import { useFetchMusic } from "../hooks/useFetchMusic";
import { MusicPlayer } from "../components/MusicPlayer";
import { useIsMobile } from "../hooks/useMobile";

// Props: videos: VideoItem[]
export function VideoDetailPage({ videos }: { videos: VideoItem[] }) {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const isMobileLayout = useIsMobile();

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

  const { music } = useFetchMusic();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [videoId]);

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
        flexDirection: isMobileLayout ? "column" : "row",
        width: "100%",
        gap: "20px",
      }}
    >
      <div
        style={{
          flex: isMobileLayout ? "none" : 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div style={{ width: "100%" }}>
          <VideoPlayer
            videos={[currentVideo]}
            initialVideoId={String(currentVideo.id)}
            autoLoop={true}
            hiddenLoop
            hiddenRandom
            hiddenNext
            hiddenPrevious
            hiddenButtons
            containerStyle={{ width: "100%" }}
          />
        </div>
        {music.length > 0 && (
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <MusicPlayer
              music={music}
              autoPlay={true}
              autoLoop={false}
              autoRandom={true}
              containerStyle={{
                width: "100%",
              }}
            />
          </div>
        )}

        {isMobileLayout && (
          <div style={{ width: "100%", margin: "32px auto 0 auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
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
                >
                  <img
                    src={video.thumbnail_url}
                    style={{
                      width: "100%",
                      height: "140px",
                      objectFit: "cover",
                      background: "#000",
                    }}
                    onClick={() => navigate(`/video/${video.id}`)}
                  />
                  <a
                    href={`/video/${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "inherit",
                      width: "100%",
                      maxWidth: "300px",
                      display: "block",
                    }}
                  >
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
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!isMobileLayout && (
        <div
          style={{
            maxWidth: "17%",
            minWidth: "17%",
            margin: "auto 0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
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
              >
                <img
                  src={video.thumbnail_url}
                  style={{
                    width: "100%",
                    height: "140px",
                    objectFit: "cover",
                    background: "#000",
                  }}
                  onClick={() => navigate(`/video/${video.id}`)}
                />
                <a
                  href={`/video/${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "inherit",
                    width: "100%",
                    maxWidth: "300px",
                    display: "block",
                  }}
                >
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
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
