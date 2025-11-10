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
  const itemsPerPage = 40
  const maxVisiblePages = 6

  const totalPages = useMemo(() => Math.ceil(videos.length / itemsPerPage), [videos.length, itemsPerPage])
  const pageCount = Math.max(1, totalPages)

  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, pageCount))
  }, [pageCount])

  const paginatedVideos = useMemo(() => {
    return videos.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
  }, [currentPage, itemsPerPage, videos])

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

  const handleCardEnter = useCallback((videoId: string, event: React.MouseEvent<HTMLDivElement>) => {
    setHoveredId(videoId)
    const videoEl = event.currentTarget.querySelector('video')
    if (videoEl) {
      videoEl.currentTime = 0
      const playPromise = (videoEl as HTMLVideoElement).play()
      if (playPromise) playPromise.catch(() => {})
    }
  }, [])

  const handleCardLeave = useCallback((videoId: string, event: React.MouseEvent<HTMLDivElement>) => {
    setHoveredId(prev => (prev === videoId ? null : prev))
    const videoEl = event.currentTarget.querySelector('video')
    if (videoEl) {
      const element = videoEl as HTMLVideoElement
      element.pause()
      element.currentTime = 0
    }
  }, [])

  return (
    <div style={{ padding: '40px', minHeight: '100vh', backgroundColor: '#121212', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      {videos.length === 0 ? (
        <div style={{ color: '#aaa', fontSize: '18px' }}>Nenhum vídeo disponível.</div>
      ) : (
        <div
          className="gallery-container"
          style={{
            width: '95%',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
            gap: '16px',
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
                background: '#1e1e1e',
                boxShadow: hoveredId === video.id ? '0 12px 20px rgba(0, 0, 0, 0.45)' : '0 8px 16px rgba(0, 0, 0, 0.35)',
                transform: hoveredId === video.id ? 'translateY(-6px)' : 'translateY(0)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '260px',
                cursor: 'pointer',
              }}
              onMouseEnter={(event) => handleCardEnter(video.id, event)}
              onMouseLeave={(event) => handleCardLeave(video.id, event)}
              onClick={() => openDialog(video.id)}
            >
              <video
                src={video.url || video.parts?.[0]?.url}
                controls={false}
                muted
                loop
                playsInline
                preload="metadata"
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
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
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
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
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
      {videos.length > 0 && (
        <div
          className="pagination"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
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
            alignItems: 'center',
            zIndex: 1000,
            padding: '24px',
          }}
          onClick={closeDialog}
        >
          <div
            style={{
              position: 'relative',
              width: 'max(1300px)',
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
                top: '12px',
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
            <div style={{ padding: '80px 24px 32px 24px', overflow: 'auto', flex: 1, display: 'flex', justifyContent: 'center' }}>
              <VideoPlayer
                videos={videos}
                initialVideoId={selectedVideoId}
                autoRandom={false}
                containerStyle={{ maxWidth: '100%', height: '100%', justifyContent: 'flex-start' }}
                videoStyle={{ maxHeight: 'calc(80vh - 180px)' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

