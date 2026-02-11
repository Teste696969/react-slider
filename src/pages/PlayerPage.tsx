import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { VideoPlayer } from "../components/VideoPlayer";
import { MusicPlayer } from "../components/MusicPlayer";
import { FilterSection } from "../components/FilterSection";
import { useVideoFilters } from "../hooks/useVideoFilters";
import { useFetchMusic } from "../hooks/useFetchMusic";
import type { VideoItem } from "../types/video";
import { useIsMobile } from "../hooks/useMobile";

type PlayerPageProps = {
  videos: VideoItem[];
};

export function PlayerPage({ videos }: PlayerPageProps) {
  const [initialVideoId, setInitialVideoId] = useState<string | undefined>(
    undefined,
  );
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [searchParams] = useSearchParams();
  const { music } = useFetchMusic();

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
    addCategoriesFromVideo,
    addArtistFromVideo,
  } = useVideoFilters(videos);

  const isMobile = useIsMobile();

  useEffect(() => {
    const requestedVideoId = searchParams.get("videoId") || undefined;
    setInitialVideoId(requestedVideoId);
    if (!requestedVideoId) return;

    const targetIndex = filtered.findIndex(
      (video) => String(video.id) === requestedVideoId,
    );
    if (targetIndex >= 0) return;

    const original = videos.find(
      (video) => String(video.id) === requestedVideoId,
    );
    if (!original) return;

    if (original.autor) {
      addArtistFromVideo(original.autor);
    }
    if (original.categoria) {
      addCategoriesFromVideo(original.categoria);
    }
  }, [
    filtered,
    searchParams,
    videos,
    addArtistFromVideo,
    addCategoriesFromVideo,
  ]);

  return (
    <div
      style={{
        backgroundColor: "#121212",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        color: "#fff",
      }}
    >

      {isMobile ? (
        <div
          style={{
            width: "100%",
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            padding: "0 8px",
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

          <div style={{ width: "100%" }}>
            <VideoPlayer
              containerStyle={{ width: "100%", maxWidth: "85vw" }}
              videos={filtered}
              initialVideoId={initialVideoId}
              autoRandom
              onVideoChange={setCurrentVideo}
            />
          </div>

          {music.length > 0 && (
            <div
              style={{
                width: "100%",
                padding: "24px 8px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <MusicPlayer
                music={music}
                autoPlay={true}
                autoLoop={false}
                autoRandom={true}
                currentVideo={currentVideo}
                containerStyle={{
                  width: "100%",
                  margin: "0 auto",
                }}
              />
            </div>
          )}
        </div>
      ) : (
          <div
        style={{
          width: "100%",
          display: "flex",
          padding: "24px 12px",
          flexDirection: "row",
        }}
      >
       <div style={{ display: "flex", flexDirection: "column", width: "25%" }}>
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
              currentVideo={currentVideo}
              containerStyle={{
                width: "100%",
              }}
            />
          </div>
        )}
       </div>

        <div style={{ width: "100%" }}>
          <VideoPlayer
            containerStyle={{ width: "100%", maxWidth: "85vw" }}
            videos={filtered}
            initialVideoId={initialVideoId}
            autoRandom
            onVideoChange={setCurrentVideo}
          />
        </div>

        
      </div>
      )}
    </div>
  );
}
