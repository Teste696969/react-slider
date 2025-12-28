import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { VideoPlayer } from '../components/VideoPlayer'
import { MusicPlayer } from '../components/MusicPlayer'
import { FilterSection } from '../components/FilterSection'
import { useVideoFilters } from '../hooks/useVideoFilters'
import { useFetchMusic } from '../hooks/useFetchMusic'
import type { VideoItem } from '../types/video'

type PlayerPageProps = {
  videos: VideoItem[]
}

export function PlayerPage({ videos }: PlayerPageProps) {
  const [initialVideoId, setInitialVideoId] = useState<string | undefined>(undefined)
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null)
  const [searchParams] = useSearchParams()
  const { music } = useFetchMusic()

  const {
    selectedArtists,
    selectedCategories,
    artistInput,
    categoryInput,
    showArtistDropdown,
    showCategoryDropdown,
    artistSuggestions,
    categorySuggestions,
    filtered,
    setArtistInput,
    setCategoryInput,
    setShowArtistDropdown,
    setShowCategoryDropdown,
    removeArtist,
    removeCategory,
    addArtist,
    addCategory,
    addCategoriesFromVideo,
    addArtistFromVideo,
  } = useVideoFilters(videos)

  useEffect(() => {
    const requestedVideoId = searchParams.get('videoId') || undefined
    setInitialVideoId(requestedVideoId)
    if (!requestedVideoId) return

    const targetIndex = filtered.findIndex(video => String(video.id) === requestedVideoId)
    if (targetIndex >= 0) return

    const original = videos.find(video => String(video.id) === requestedVideoId)
    if (!original) return

    if (original.autor) {
      addArtistFromVideo(original.autor)
    }
    if (original.categoria) {
      addCategoriesFromVideo(original.categoria)
    }
  }, [filtered, searchParams, videos, addArtistFromVideo, addCategoriesFromVideo])

  return (
    <div style={{ backgroundColor: '#121212', minHeight: '100vh', display: "flex", flexDirection: "column", color: '#fff' }}>
      <div style={{ padding: '20px', width: '100%', alignItems: "center", display: "flex", flexDirection: "column" }}>
        <FilterSection
        artistInput={artistInput}
        categoryInput={categoryInput}
        selectedArtists={selectedArtists}
        selectedCategories={selectedCategories}
        artistSuggestions={artistSuggestions}
        categorySuggestions={categorySuggestions}
        showArtistDropdown={showArtistDropdown}
        showCategoryDropdown={showCategoryDropdown}
        onArtistInputChange={setArtistInput}
        onCategoryInputChange={setCategoryInput}
        onArtistFocus={() => setShowArtistDropdown(true)}
        onArtistBlur={() => setShowArtistDropdown(false)}
        onCategoryFocus={() => setShowCategoryDropdown(true)}
        onCategoryBlur={() => setShowCategoryDropdown(false)}
        onAddArtist={addArtist}
        onAddCategory={addCategory}
        onRemoveArtist={removeArtist}
        onRemoveCategory={removeCategory}
      />
      {music.length > 0 && (
        <div style={{ width: '100%', padding: '16px 24px',  }}>
          <MusicPlayer 
            music={music} 
            autoPlay={true}
            autoLoop={false}
            autoRandom={true}
            currentVideo={currentVideo}
            containerStyle={{ maxWidth: '1200px', margin: '0 auto' }}
          />
        </div>
      )}
      

      <div style={{ width: "100%" }}>
          <VideoPlayer 
            containerStyle={{ width: '100%', maxWidth: '1200px' }} 
            videos={filtered} 
            initialVideoId={initialVideoId} 
            autoRandom
            onVideoChange={setCurrentVideo}
          />
        </div>
      </div>
    </div>
  )
}

