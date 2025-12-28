import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { VideoPlayer } from '../components/VideoPlayer'
import { FilterSection } from '../components/FilterSection'
import { useVideoFilters } from '../hooks/useVideoFilters'
import type { VideoItem } from '../types/video'

type PlayerPageProps = {
  videos: VideoItem[]
}

export function PlayerPage({ videos }: PlayerPageProps) {
  const [initialVideoId, setInitialVideoId] = useState<string | undefined>(undefined)
  const [searchParams] = useSearchParams()

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
    <div style={{ backgroundColor: '#121212', minHeight: '100vh', display: "flex", flexDirection: "column", alignItems: "center", padding: 'clamp(16px, 5vw, 40px)', color: '#fff' }}>
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

      <div style={{ display: 'flex', justifyContent: 'center', margin: 'clamp(16px, 5vw, 40px) auto 0' }}>
        <VideoPlayer containerStyle={{ width: '100%', maxWidth: '1200px' }} videos={filtered} initialVideoId={initialVideoId} autoRandom />
      </div>
    </div>
  )
}

