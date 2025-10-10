import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

type VideoPart = { url: string }
type VideoItem = {
  url?: string
  categoria: string
  autor: string
  parts?: VideoPart[]
}

function useFetchVideos() {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    fetch('/videos/Videos.json')
      .then(r => r.json())
      .then(setVideos)
      .catch(e => setError(String(e)))
  }, [])
  return { videos, error }
}

function Gallery() {
  const { videos } = useFetchVideos();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 28; // 4x7 grid

  const totalPages = Math.ceil(videos.length / itemsPerPage);
  const paginatedVideos = videos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div style={{ padding: '40px', backgroundColor: '#121212', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        className="gallery-container"
        style={{
          width: '90%',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '14px',
          justifyContent: 'center',
        }}
      >
        {paginatedVideos.map((video, index) => (
          <div
            key={index}
            className="video-card"
            style={{
              border: '1px solid #333',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#1e1e1e',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.5)',
              transition: 'transform 0.2s',
              height: '340px',
              width: '100%',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <video
              src={video.url || video.parts?.[0]?.url}
              controls
              style={{ width: '100%', height: '250px', objectFit: 'cover' }}
            />
            <div
              className="video-info"
              style={{ padding: '10px', textAlign: 'center' }}
            >
              <h3
                style={{
                  fontSize: '18px',
                  margin: '0 0 5px',
                  color: '#ff8533',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                {video.autor}
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: '#aaa',
                  margin: '0',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                {video.categoria}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div
        className="pagination"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '20px',
          gap: '10px',
        }}
      >
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '10px 15px',
            background: '#333',
            color: '#fff',
            border: '1px solid #444',
            borderRadius: '4px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          }}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            style={{
              padding: '10px 15px',
              background: currentPage === index + 1 ? '#ff8533' : '#333',
              color: currentPage === index + 1 ? '#fff' : '#aaa',
              border: '1px solid #444',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '10px 15px',
            background: '#333',
            color: '#fff',
            border: '1px solid #444',
            borderRadius: '4px',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { videos } = useFetchVideos()

  const [selectedArtists, setSelectedArtists] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [artistInput, setArtistInput] = useState<string>('')
  const [categoryInput, setCategoryInput] = useState<string>('')
  const [showArtistDropdown, setShowArtistDropdown] = useState<boolean>(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState<boolean>(false)
  const [isRandom, setIsRandom] = useState<boolean>(true)
  const [isLoop, setIsLoop] = useState<boolean>(false)

  // Get unique artists and categories for suggestions
  const allArtists = useMemo(() => Array.from(new Set(videos.map(v => v.autor))).sort(), [videos])
  const allCategories = useMemo(() => Array.from(new Set(videos.map(v => v.categoria))).sort(), [videos])

  // Filter suggestions based on input
  const artistSuggestions = useMemo(() => {
    if (!artistInput) return allArtists
    return allArtists.filter(a =>
      a.toLowerCase().includes(artistInput.toLowerCase()) &&
      !selectedArtists.includes(a)
    )
  }, [allArtists, artistInput, selectedArtists])

  const categorySuggestions = useMemo(() => {
    if (!categoryInput) return allCategories
    return allCategories.filter(c =>
      c.toLowerCase().includes(categoryInput.toLowerCase()) &&
      !selectedCategories.includes(c)
    )
  }, [allCategories, categoryInput, selectedCategories])

  const filtered = useMemo(() => {
    return videos.filter(v => {
      const artistMatch = selectedArtists.length === 0 || selectedArtists.includes(v.autor)
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(v.categoria)
      return artistMatch && categoryMatch
    })
  }, [videos, selectedArtists, selectedCategories])

  const removeArtist = useCallback((artist: string) => {
    setSelectedArtists(prev => prev.filter(a => a !== artist))
  }, [])

  const removeCategory = useCallback((category: string) => {
    setSelectedCategories(prev => prev.filter(c => c !== category))
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

  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [, setQueue] = useState<number[]>([])
  const randomHistory = useRef<number[]>([])

  useEffect(() => {
    setCurrentIndex(0)
    setQueue(Array.from({ length: filtered.length }, (_, i) => i))
    randomHistory.current = []
  }, [filtered])

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const controlsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!videoRef.current) return
    videoRef.current.loop = isLoop
  }, [isLoop])

  const loadIndex = useCallback((idx: number) => {
    if (idx < 0 || idx >= filtered.length) return
    setCurrentIndex(idx)
  }, [filtered.length])

  const onPrev = useCallback(() => {
    if (isRandom) {
      if (randomHistory.current.length > 1) {
        randomHistory.current.pop()
        const prev = randomHistory.current.pop() as number
        loadIndex(prev)
      }
    } else {
      loadIndex(currentIndex > 0 ? currentIndex - 1 : 0)
    }
  }, [currentIndex, isRandom, loadIndex])

  const onNext = useCallback(() => {
    if (isRandom) {
      setQueue(q => {
        const pool = q.length ? q : Array.from({ length: filtered.length }, (_, i) => i)
        const ri = Math.floor(Math.random() * pool.length)
        const nextIdx = pool[ri]
        const newPool = pool.slice()
        newPool.splice(ri, 1)
        randomHistory.current.push(nextIdx)
        loadIndex(nextIdx)
        return newPool
      })
    } else {
      const next = currentIndex < filtered.length - 1 ? currentIndex + 1 : 0
      loadIndex(next)
    }
  }, [currentIndex, filtered.length, isRandom, loadIndex])

  const current = filtered[currentIndex]

  const [duration, setDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [muted, setMuted] = useState<boolean>(false)
  const [volume, setVolume] = useState<number>(1)
  const [showControls, setShowControls] = useState<boolean>(true)
  const hideTimeout = useRef<number | null>(null)
  const isPointerInside = useRef<boolean>(false)
  const isSeekingRef = useRef<boolean>(false)
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false)

  const onTogglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play()
    else v.pause()
  }, [])

  const onTimeUpdate = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    setCurrentTime(v.currentTime)
  }, [])

  const onLoadedData = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    setDuration(v.duration || 0)
  }, [])

  const onPlay = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const onPause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const onToggleMute = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }, [])

  const onVolumeChange = useCallback((val: number) => {
    const v = videoRef.current
    if (!v) return
    v.volume = val
    v.muted = val === 0
    setVolume(val)
    setMuted(v.muted)
  }, [])

  const onEnded = useCallback(() => {
    if (isRandom) onNext()
    else {
      const next = currentIndex < filtered.length - 1 ? currentIndex + 1 : 0
      loadIndex(next)
    }
  }, [currentIndex, filtered.length, isRandom, loadIndex, onNext])

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    const active = document.activeElement?.tagName.toLowerCase()
    if (active === 'input' || active === 'button') return
    switch (e.key.toLowerCase()) {
      case ' ':
      case 'k':
        e.preventDefault()
        onTogglePlay()
        break
      case 'f':
        if (!document.fullscreenElement) containerRef.current?.requestFullscreen()
        else document.exitFullscreen()
        break
      case 'm':
        onToggleMute()
        break
      case 'arrowleft':
      case 'j':
        if (videoRef.current) videoRef.current.currentTime -= 5
        break
      case 'arrowright':
      case 'l':
        if (videoRef.current) videoRef.current.currentTime += 5
        break
    }
  }, [onToggleMute, onTogglePlay])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const handleMouseMove = () => {
      setShowControls(true)
      if (hideTimeout.current) window.clearTimeout(hideTimeout.current)
      hideTimeout.current = window.setTimeout(() => {
        if (isPointerInside.current && !videoRef.current?.paused) setShowControls(false)
      }, 3000)
    }
    const handleMouseEnter = () => {
      isPointerInside.current = true
      handleMouseMove()
    }
    const handleMouseLeave = () => {
      isPointerInside.current = false
      if (!videoRef.current?.paused) setShowControls(false)
    }
    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onKeyDown])

  // progress percentage now handled via CSS variable --progress-position

  const seekToClientX = useCallback((clientX: number) => {
    const container = controlsRef.current
    const v = videoRef.current
    if (!container || !v) return
    const timeline = container.querySelector('.timeline') as HTMLDivElement | null
    if (!timeline) return
    const rect = timeline.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    v.currentTime = ratio * (v.duration || 0)
  }, [])

  const onTimelineMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    isSeekingRef.current = true
    setIsScrubbing(true)
    seekToClientX(e.clientX)
    const onMove = (ev: MouseEvent) => {
      if (!isSeekingRef.current) return
      seekToClientX(ev.clientX)
    }
    const onUp = () => {
      isSeekingRef.current = false
      setIsScrubbing(false)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [seekToClientX])

  const currentId = useMemo(() => {
    if (!current) return ''
    const raw = current.url ? current.url : current.parts?.[0]?.url || ''
    const name = raw.split('/').pop() || ''
    return name.split('.')[0]
  }, [current])

  return (
    <Router>
      <Routes>
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/" element={
          <div>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
              <div className="collapse navbar-collapse show">
                <div className="filter-section" style={{ padding: '10px 0', display: 'flex', gap: '20px' }}>
                  <div className="filter-group" style={{ flex: 1, position: 'relative' }}>
                    <div className="filter-input-container" style={{ position: 'relative', display: "flex", flexDirection: "column", gap: "5px" }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search artists..."
                        value={artistInput}
                        onChange={e => {
                          setArtistInput(e.target.value)
                          setShowArtistDropdown(true)
                        }}
                        onFocus={() => setShowArtistDropdown(true)}
                        onBlur={() => setTimeout(() => setShowArtistDropdown(false), 200)}
                      />
                      <div className="selected-filters" style={{ marginBottom: 8 }}>
                        {selectedArtists.map(artist => (
                          <span key={artist} className="filter-pill" style={{
                            background: '#ff8533',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: 15,
                            margin: '0 4px 4px 0',
                            display: 'inline-block',
                            cursor: 'pointer'
                          }}>
                            {artist} <span onClick={() => removeArtist(artist)} style={{ marginLeft: 4 }}>×</span>
                          </span>
                        ))}
                      </div>
                      {showArtistDropdown && artistSuggestions.length > 0 && (
                        <div className="dropdown-menu show" style={{
                          position: 'absolute',
                          width: '100%',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          background: '#343a40',
                          border: '1px solid #454d55',
                          zIndex: 1000
                        }}>
                          {artistSuggestions.map(artist => (
                            <a
                              key={artist}
                              className="dropdown-item"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                addArtist(artist)
                              }}
                              style={{ color: '#fff' }}
                            >
                              {artist}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <div className="filter-input-container" style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search categories..."
                        value={categoryInput}
                        onChange={e => {
                          setCategoryInput(e.target.value)
                          setShowCategoryDropdown(true)
                        }}
                        onFocus={() => setShowCategoryDropdown(true)}
                        onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                      />
                      {showCategoryDropdown && categorySuggestions.length > 0 && (
                        <div className="dropdown-menu show" style={{
                          position: 'absolute',
                          width: '100%',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          background: '#343a40',
                          border: '1px solid #454d55',
                          zIndex: 1000
                        }}>
                          {categorySuggestions.map(category => (
                            <a
                              key={category}
                              className="dropdown-item"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                addCategory(category)
                              }}
                              style={{ color: '#fff' }}
                            >
                              {category}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="filter-group" style={{ flex: 1, position: 'relative' }}>
                      <div className="selected-filters" style={{ marginBottom: 8 }}>
                        {selectedCategories.map(category => (
                          <span key={category} className="filter-pill" style={{
                            background: '#ff8533',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: 15,
                            margin: '0 4px 4px 0',
                            display: 'inline-block',
                            cursor: 'pointer'
                          }}>
                            {category} <span onClick={() => removeCategory(category)} style={{ marginLeft: 4 }}>×</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </nav>

            <div className="container-main mt-5">
              <div>
                <div className="video-title-container">
                  <div className="video-urls-container">
                    <h5 className="video-url" onClick={() => { if (currentId) window.open(current?.url || current?.parts?.[0]?.url || '#', '_blank') }}>{currentId}</h5>
                    <h5> - </h5>
                    <h5 className="artist-url" onClick={() => { if (current?.autor) window.open(`https://www.google.com/search?q=${encodeURIComponent(current.autor)} rule34`, '_blank') }}>{current?.autor || ''}</h5>
                    <h5> - </h5>
                    <h5 className="video-title">{current?.categoria || ''}</h5>
                  </div>
                </div>

                <div ref={containerRef} className={`video-container ${showControls ? '' : 'paused'} ${isScrubbing ? 'scrubbing' : ''}`} data-volume-level={muted ? 'muted' : volume >= 0.5 ? 'high' : 'low'} style={{ cursor: showControls ? 'default' : 'none' }}>
                  <div ref={controlsRef} className="video-controls-container" style={{ opacity: showControls ? 1 : 0 }}>
                    <div className="timeline-container">
                      <div
                        className="timeline"
                        style={{ ['--progress-position' as any]: (duration ? currentTime / duration : 0) }}
                        onMouseDown={onTimelineMouseDown}
                        onClick={(e) => seekToClientX(e.clientX)}
                      >
                        <div className="thumb-indicator"></div>
                      </div>
                    </div>
                    <div className="controls">
                      <button id="prev-button" onClick={onPrev}><i className="fa-solid fa-backward"></i></button>
                      <button className="play-pause-btn" onClick={onTogglePlay}>
                        <i className="play-icon fa-solid fa-play" style={{ display: isPlaying ? 'none' : 'inline-block' }}></i>
                        <i className="pause-icon fa-solid fa-pause" style={{ display: isPlaying ? 'inline-block' : 'none' }}></i>
                      </button>
                      <button id="next-button" onClick={onNext}><i className="fa-solid fa-forward"></i></button>
                      <div className="volume-container">
                        <button className="mute-btn" onClick={onToggleMute}>
                          <i className="volume-high-icon fa-solid fa-volume-high"></i>
                          <i className="volume-low-icon fa-solid fa-volume-low"></i>
                          <i className="volume-muted-icon fa-solid fa-volume-off"></i>
                        </button>
                        <input className="volume-slider" type="range" min="0" max="1" step="any" value={volume} onChange={(e) => onVolumeChange(parseFloat(e.target.value))} />
                      </div>
                      <div className="duration-container">
                        <div className="current-time">{formatDuration(currentTime)}</div>
                        /
                        <div className="total-time">{formatDuration(duration)}</div>
                      </div>
                      <button id="random-button" className={isRandom ? 'active-random' : ''} onClick={() => setIsRandom(v => !v)}>
                        <i className="fa-solid fa-shuffle"></i>
                      </button>
                      <button id="loop-button" className={isLoop ? 'active-loop' : ''} onClick={() => setIsLoop(v => !v)}>
                        <i className="fa-solid fa-repeat"></i>
                      </button>
                      <button className="full-screen-btn" onClick={() => { if (!document.fullscreenElement) containerRef.current?.requestFullscreen(); else document.exitFullscreen() }}>
                        <i className="fa-solid fa-expand"></i>
                      </button>
                    </div>
                  </div>

                  {current ? (
                    current.parts && current.parts.length > 0 ? (
                      <video ref={videoRef} id="video-player" onClick={onTogglePlay} onPlay={onPlay} onPause={onPause} onEnded={onEnded} onTimeUpdate={onTimeUpdate} onLoadedData={onLoadedData} src={current.parts[0].url} autoPlay />
                    ) : (
                      <video ref={videoRef} id="video-player" onClick={onTogglePlay} onPlay={onPlay} onPause={onPause} onEnded={onEnded} onTimeUpdate={onTimeUpdate} onLoadedData={onLoadedData} src={current.url} autoPlay />
                    )
                  ) : (
                    <div style={{ padding: 16 }}>Carregando...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  )
}

function formatDuration(time?: number) {
  const t = Math.max(0, Math.floor(time || 0))
  const seconds = t % 60
  const minutes = Math.floor(t / 60) % 60
  const hours = Math.floor(t / 3600)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return hours === 0 ? `${minutes}:${pad(seconds)}` : `${hours}:${pad(minutes)}:${pad(seconds)}`
}


