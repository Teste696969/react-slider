import { useCallback, useEffect, useMemo, useState } from 'react'
import { VideoPlayer } from '../components/VideoPlayer'
import { FilterSection } from '../components/FilterSection'
import { useVideoFilters } from '../hooks/useVideoFilters'
import type { VideoItem } from '../types/video'

type GalleryPageProps = {
  videos: VideoItem[]
}

export function GalleryPage({ videos }: GalleryPageProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const itemsPerPage = 20
  const maxVisiblePages = 6

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
  } = useVideoFilters(videos)

  const totalPages = useMemo(() => Math.ceil(filtered.length / itemsPerPage), [filtered.length, itemsPerPage])
  const pageCount = Math.max(1, totalPages)

  const paginatedVideos = useMemo(() => {
    return filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  }, [currentPage, itemsPerPage, filtered])

  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, pageCount))
  }, [pageCount])

  const pageNumbers = useMemo(() => {
    if (pageCount <= maxVisiblePages) {
      return Array.from({ length: pageCount }, (_, index) => index + 1)
    }
    const half = Math.floor(maxVisiblePages / 2)
    let start = Math.max(1, currentPage - half)
    let end = start + maxVisiblePages - 1

    if (end > pageCount) {
      end = pageCount
      start = end - maxVisiblePages + 1
    }

    if (start < 1) start = 1

    return Array.from({ length: end - start + 1 }, (_, index) => start + index)
  }, [currentPage, pageCount, maxVisiblePages])

  const handleCardEnter = useCallback((id: string) => {
    setHoveredId(id)
  }, [])

  const handleCardLeave = useCallback(() => {
    setHoveredId(null)
  }, [])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pageCount) {
      setCurrentPage(page)
    }
  }

  const openDialog = (videoId: string) => {
    setSelectedVideoId(String(videoId))
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setSelectedVideoId(null)
  }

  return (
    <div style={{ padding: 'clamp(16px, 5vw, 40px)', minHeight: '100vh', backgroundColor: '#121212', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(16px, 4vw, 32px)', width: '100%' }}>
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
      {filtered.length === 0 ? (
        <div style={{ color: '#aaa', fontSize: '18px' }}>Nenhum vídeo disponível.</div>
      ) : (
        <div
          className="gallery-container"
          style={{
            width: '85vw',  
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 768 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: "1px",
            margin: '0 auto',
            justifyItems: 'center',
            justifyContent: 'center',
          }}
        >
          {paginatedVideos.map((video, index) => (
            <div
              key={`${video.id || video.url}-${index}`}
              className="video-card"
              style={{
                width: '100%',
                overflow: 'hidden',
                maxWidth: "300px",
                backgroundColor: "transparent",
                transform: hoveredId === video.id ? 'translateY(-6px)' : 'translateY(0)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '240px',
                cursor: 'pointer',
              }}
              onMouseEnter={() => handleCardEnter(video.id)}
              onMouseLeave={() => handleCardLeave()}
              onFocus={() => handleCardEnter(video.id)}
              onBlur={() => handleCardLeave()}
              onClick={() => openDialog(video.id)}
            >
              <img 
              loading="lazy"
                src={video.thumbnail_url}
                style={{ width: '100%', height: window.innerWidth <= 768 ? '120px' : '100%', aspectRatio: '16 / 9', borderRadius: "12px", objectFit: 'cover', background: '#000', pointerEvents: 'none' }}
              />
              <div
                className="video-info"
                style={{ padding: '12px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}
              >
                <h3
                  style={{
                    fontSize: '16px',
                    margin: 0,
                    color: '#ffbb66',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: '2',
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {video.title || video.autor}
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: '#ccc',
                    margin: 0,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: '1',
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {video.autor}
                </p>
                <span style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>
                  {Array.isArray(video.categoria) ? video.categoria.join(', ') : video.categoria}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
  {filtered.length > 0 && (
        <div
          className="pagination"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            style={{
              padding: '10px 16px',
              background: currentPage === 1 ? '#1f1f1f' : '#333',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '8px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Início
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '10px 18px',
              background: currentPage === 1 ? '#1f1f1f' : '#333',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '999px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Anterior
          </button>
          {pageNumbers.map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              style={{
                padding: '10px 16px',
                background: currentPage === page ? '#ff8533' : '#1f1f1f',
                color: currentPage === page ? '#fff' : '#aaa',
                border: '1px solid #333',
                borderRadius: '8px',
                cursor: 'pointer',
                minWidth: '48px',
              }}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pageCount}
            style={{
              padding: '10px 18px',
              background: currentPage === pageCount ? '#1f1f1f' : '#333',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '999px',
              cursor: currentPage === pageCount ? 'not-allowed' : 'pointer',
            }}
          >
            Próxima
          </button>
          <button
            onClick={() => handlePageChange(pageCount)}
            disabled={currentPage === pageCount}
            style={{
              padding: '10px 16px',
              background: currentPage === pageCount ? '#1f1f1f' : '#333',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '8px',
              cursor: currentPage === pageCount ? 'not-allowed' : 'pointer',
            }}
          >
            Fim
          </button>
        </div>
      )}

      {isDialogOpen && selectedVideoId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: window.innerWidth <= 768 ? 'stretch' : 'start',
            zIndex: 1000,
            padding: window.innerWidth <= 768 ? '0' : '24px',
            paddingTop: window.innerWidth <= 768 ? '0' : '24px',
            width: '100%',
            overflowY: 'auto',
          }}
          onClick={closeDialog}
        >
          <div
            style={{
              position: 'relative',
              width: window.innerWidth <= 768 ? '100%' : '85vw',
              maxHeight: window.innerWidth <= 768 ? '100vh' : '90vh',
              background: '#0f0f0f',
              borderRadius: window.innerWidth <= 768 ? '0' : '16px',
              border: window.innerWidth <= 768 ? 'none' : '1px solid #333',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeDialog}
              style={{
                position: 'absolute',
                top: '6px',
                right: '12px',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '24px',
                cursor: 'pointer',
              }}
              aria-label="Fechar"
            >
              ×
            </button>
            <div style={{ padding: 'clamp(48px, 8vw, 40px) clamp(1px, 2vw, 8px) clamp(24px, 5vw, 40px)', overflow: 'auto', flex: 1, display: 'flex', justifyContent: 'center' }}>
              <VideoPlayer
                videos={videos}
                hiddenLoop
                hiddenRandom
                hiddenNext
                hiddenPrevious                
                initialVideoId={selectedVideoId}
                autoLoop={true}
                containerStyle={{ width: '100%', maxWidth: '85vw' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

