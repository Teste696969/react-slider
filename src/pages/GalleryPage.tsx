import { useCallback, useEffect, useMemo, useState } from 'react'
import { VideoPlayer } from '../components/VideoPlayer'
import type { VideoItem } from '../types/video'

type GalleryPageProps = {
  videos: VideoItem[]
}

export function GalleryPage({ videos }: GalleryPageProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedArtists, setSelectedArtists] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [artistInput, setArtistInput] = useState<string>('')
  const [categoryInput, setCategoryInput] = useState<string>('')
  const [showArtistDropdown, setShowArtistDropdown] = useState<boolean>(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState<boolean>(false)

  const itemsPerPage = 20
  const maxVisiblePages = 6
  

  // derive available artists/categories and suggestions
  const allArtists = useMemo(() => Array.from(new Set(videos.map(v => v.autor))).sort(), [videos])
  const allCategories = useMemo(() => Array.from(new Set(videos.map(v => v.categoria))).sort(), [videos])

  const artistSuggestions = useMemo(() => {
    if (!artistInput) return allArtists.filter(a => !selectedArtists.includes(a))
    return allArtists.filter(a => a.toLowerCase().includes(artistInput.toLowerCase()) && !selectedArtists.includes(a))
  }, [allArtists, artistInput, selectedArtists])

  const categorySuggestions = useMemo(() => {
    if (!categoryInput) return allCategories.filter(c => !selectedCategories.includes(c))
    return allCategories.filter(c => c.toLowerCase().includes(categoryInput.toLowerCase()) && !selectedCategories.includes(c))
  }, [allCategories, categoryInput, selectedCategories])

  const filtered = useMemo(() => {
    return videos.filter(v => {
      const artistMatch = selectedArtists.length === 0 || selectedArtists.includes(v.autor)
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(v.categoria)
      return artistMatch && categoryMatch
    })
  }, [videos, selectedArtists, selectedCategories])

  const totalPages = useMemo(() => Math.ceil(filtered.length / itemsPerPage), [filtered.length, itemsPerPage])
  const pageCount = Math.max(1, totalPages)

  const paginatedVideos = useMemo(() => {
    return filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  }, [currentPage, itemsPerPage, filtered])

  const removeArtist = useCallback((artist: string) => {
    setSelectedArtists(prev => prev.filter(a => a !== artist))
  }, [])

  const removeCategory = useCallback((category: string) => {
    setSelectedCategories(prev => prev.filter(c => c !== category))
  }, [])

  // hover handlers to drive the hover animation (sets hoveredId)
  const handleCardEnter = useCallback((id: string) => {
    setHoveredId(id)
  }, [])

  const handleCardLeave = useCallback(() => {
    setHoveredId(null)
  }, [])

  const addArtist = useCallback((artist: string) => {
    if (!selectedArtists.includes(artist)) {
      setSelectedArtists(prev => [...prev, artist])
      setArtistInput('')
      setShowArtistDropdown(false)
    }
  }, [selectedArtists])

  const addCategory = useCallback((category: string) => {
    if (!selectedCategories.includes(category)) {
      setSelectedCategories(prev => [...prev, category])
      setCategoryInput('')
      setShowCategoryDropdown(false)
    }
  }, [selectedCategories])

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

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pageCount) {
      setCurrentPage(page)
    }
  }

  const openDialog = (videoId: string) => {
    setSelectedVideoId(videoId)
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setSelectedVideoId(null)
  }

  return (
    <div style={{ padding: 'clamp(16px, 5vw, 40px)', minHeight: '100vh', backgroundColor: '#121212', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(16px, 4vw, 32px)', width: '100%' }}>
      <section style={{ width: "90%", padding: 'clamp(2px, 1vw, 4px) clamp(16px, 6vw, 32px)', display: 'flex', gap: 'clamp(12px, 3vw, 20px)', flexWrap: 'wrap', background: '#111', justifyContent: 'center' }}>
        <div className="filter-group" style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <div className="filter-input-container" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar artistas..."
              value={artistInput}
              onChange={e => { setArtistInput(e.target.value); setShowArtistDropdown(true) }}
              onFocus={() => setShowArtistDropdown(true)}
              onBlur={() => setTimeout(() => setShowArtistDropdown(false), 200)}
            />
            <div className="selected-filters" style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {selectedArtists.map(artist => (
                <span key={artist} className="filter-pill" style={{ background: '#ff8533', color: 'white', padding: '4px 8px', borderRadius: 15, display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                  {artist} <span onClick={() => removeArtist(artist)} style={{ marginLeft: 4 }}>×</span>
                </span>
              ))}
            </div>
            {showArtistDropdown && artistSuggestions.length > 0 && (
              <div className="dropdown-menu show" style={{ position: 'absolute', width: '100%', maxHeight: '200px', overflowY: 'auto', background: '#343a40', border: '1px solid #454d55', zIndex: 1000 }}>
                {artistSuggestions.map(artist => (
                  <a key={artist} className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); addArtist(artist) }} style={{ color: '#fff' }}>{artist}</a>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="filter-input-container" style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar categorias..."
              value={categoryInput}
              onChange={e => { setCategoryInput(e.target.value); setShowCategoryDropdown(true) }}
              onFocus={() => setShowCategoryDropdown(true)}
              onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
            />
            {showCategoryDropdown && categorySuggestions.length > 0 && (
              <div className="dropdown-menu show" style={{ position: 'absolute', width: '100%', maxHeight: '200px', overflowY: 'auto', background: '#343a40', border: '1px solid #454d55', zIndex: 1000 }}>
                {categorySuggestions.map(category => (
                  <a key={category} className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); addCategory(category) }} style={{ color: '#fff' }}>{category}</a>
                ))}
              </div>
            )}
          </div>
          <div className="selected-filters" style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {selectedCategories.map(category => (
              <span key={category} className="filter-pill" style={{ background: '#ff8533', color: 'white', padding: '4px 8px', borderRadius: 15, display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                {category} <span onClick={() => removeCategory(category)} style={{ marginLeft: 4 }}>×</span>
              </span>
            ))}
          </div>
        </div>
      </section>
      {filtered.length === 0 ? (
        <div style={{ color: '#aaa', fontSize: '18px' }}>Nenhum vídeo disponível.</div>
      ) : (
        <div
          className="gallery-container"
          style={{
            width: '100%',
            maxWidth: '1200px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: 'clamp(12px, 4vw, 20px)',
            margin: '0 auto',
          }}
        >
          {paginatedVideos.map((video, index) => (
            <div
              key={`${video.id || video.url}-${index}`}
              className="video-card"
              style={{
                border: '1px solid #333',
                borderRadius: '12px',
                width: '100%',
                overflow: 'hidden',
                maxWidth: "270px",
                background: '#1e1e1e',
                boxShadow: hoveredId === video.id ? '0 12px 20px rgba(0, 0, 0, 0.45)' : '0 8px 16px rgba(0, 0, 0, 0.35)',
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
                src={video.thumbnail_url}
                style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', background: '#000', pointerEvents: 'none', borderBottom: '1px solid #333' }}
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
                <span style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>{video.categoria}</span>
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
            alignItems: 'start',
            zIndex: 1000,
            padding: window.innerWidth <= 768 ? '0' : '24px',
            paddingTop: window.innerWidth <= 768 ? '8px' : '24px'
          }}
          onClick={closeDialog}
        >
          <div
            style={{
              position: 'relative',
              width: 'min(96vw, 1300px)',
              maxHeight: '90vh',
              background: '#0f0f0f',
              borderRadius: '16px',
              border: '1px solid #333',
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
                initialVideoId={selectedVideoId}
                autoLoop={true}
                containerStyle={{ width: '100%', maxWidth: '1200px' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

