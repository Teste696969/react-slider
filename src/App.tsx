import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { MainNavbar } from "./components/MainNavbar";
import { useFetchVideos } from "./hooks/useFetchVideos";
import { lazy, Suspense } from "react";
import { useFetchVideosFavs } from "./hooks/useFetchVideosFavs";
import type { VideoItem } from "./types/video";
const PlayerPage = lazy(() =>
  import("./pages/PlayerPage").then((module) => ({
    default: module.PlayerPage,
  })),
);

const GalleryPage = lazy(() =>
  import("./pages/GalleryPage").then((module) => ({
    default: module.GalleryPageFavs,
  })),
);


const VideoDetailPage = lazy(() =>
  import("./pages/VideoDetailPage").then((module) => ({
    default: module.VideoDetailPage,
  })),
);

const FavoritesPage = lazy(() =>
  import("./pages/FavoritesPage").then((module) => ({
    default: module.FavoritesPage,
  })),
);

function LoadingFallback() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#121212",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      Carregando...
    </div>
  );
}
interface AppContentProps {
  videos: VideoItem[];
  videosFavs: VideoItem[];
  error: string | null;
  errorFavs: string | null;
}

function AppContent({ videos, videosFavs, error, errorFavs }: AppContentProps) {

  return (
    <>
      <MainNavbar videos={videos} />
      
      {/* Exibição de Erros */}
      {(error || errorFavs) && (
        <div style={{ padding: "12px 24px", background: "#2c0d0d", color: "#ffb3b3" }}>
          {error && <div>Erro vídeos: {error}</div>}
          {errorFavs && <div>Erro favoritos: {errorFavs}</div>}
        </div>
      )}

      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/gallery" element={<GalleryPage videos={videos} />} />
          <Route path="/g-favs" element={<GalleryPage videos={videosFavs} />} />
          <Route path="/favorites" element={<FavoritesPage videos={videos} />} />
          <Route path="/video/:videoId" element={<VideoDetailPage videos={videos} />} />
          <Route path="/video-fav/:videoId" element={<VideoDetailPage videos={videosFavs} />} />
          <Route path="/" element={<PlayerPage videos={videos} />} />
          <Route path="/favs" element={<PlayerPage videos={videosFavs} />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  const { videos, error } = useFetchVideos();
  const { videos: videosFavs, error: errorFavs } = useFetchVideosFavs();

  return (
    <Router>
      <AppContent 
        videos={videos} 
        videosFavs={videosFavs} 
        error={error} 
        errorFavs={errorFavs} 
      />
    </Router>
  );
}