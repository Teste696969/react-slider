import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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

export default function App() {
  const { videos } = useFetchVideos()

  const [authorFilter, setAuthorFilter] = useState<string>('')
  const [genreFilter, setGenreFilter] = useState<string>('')
  const [pmvAuthorFilter, setPmvAuthorFilter] = useState<string>('')
  const [pmvGenreFilter, setPmvGenreFilter] = useState<string>('')
  const [realAuthorFilter, setRealAuthorFilter] = useState<string>('')
  const [realGenreFilter, setRealGenreFilter] = useState<string>('')
  const [isRandom, setIsRandom] = useState<boolean>(true)
  const [isLoop, setIsLoop] = useState<boolean>(false)

  const isPMV = useCallback((v: VideoItem) => v.categoria?.toLowerCase() === 'pmv', [])
  const isREAL = useCallback((v: VideoItem) => v.categoria?.toLowerCase() === 'real', [])
  const isR34 = useCallback((v: VideoItem) => !isPMV(v) && !isREAL(v), [isPMV, isREAL])

  const filtered = useMemo(() => {
    return videos.filter(v => {
      const authorMatch = !authorFilter || (isR34(v) && v.autor === authorFilter)
      const genreMatch = !genreFilter || (isR34(v) && v.categoria === genreFilter)
      const pmvAuthorMatch = !pmvAuthorFilter || (isPMV(v) && !isREAL(v) && v.autor === pmvAuthorFilter)
      const pmvGenreMatch = !pmvGenreFilter || (isPMV(v) && !isREAL(v) && v.categoria === pmvGenreFilter)
      const realAuthorMatch = !realAuthorFilter || (isREAL(v) && v.autor === realAuthorFilter)
      const realGenreMatch = !realGenreFilter || (isREAL(v) && v.categoria === realGenreFilter)
      return authorMatch && genreMatch && pmvAuthorMatch && pmvGenreMatch && realAuthorMatch && realGenreMatch
    })
  }, [videos, authorFilter, genreFilter, pmvAuthorFilter, pmvGenreFilter, realAuthorFilter, realGenreFilter, isR34, isPMV, isREAL])

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

  const authors = useMemo(() => Array.from(new Set(videos.filter(v => isR34(v)).map(v => v.autor))).sort(), [videos, isR34])
  const genres = useMemo(() => Array.from(new Set(videos.filter(v => isR34(v)).map(v => v.categoria))).sort(), [videos, isR34])
  const pmvAuthors = useMemo(() => Array.from(new Set(videos.filter(v => isPMV(v) && !isREAL(v)).map(v => v.autor))).sort(), [videos, isPMV, isREAL])
  const pmvGenres = useMemo(() => Array.from(new Set(videos.filter(v => isPMV(v) && !isREAL(v)).map(v => v.categoria))).sort(), [videos, isPMV, isREAL])
  const realAuthors = useMemo(() => Array.from(new Set(videos.filter(v => isREAL(v)).map(v => v.autor))).sort(), [videos, isREAL])
  const realGenres = useMemo(() => Array.from(new Set(videos.filter(v => isREAL(v)).map(v => v.categoria))).sort(), [videos, isREAL])

  const currentId = useMemo(() => {
    if (!current) return ''
    const raw = current.url ? current.url : current.parts?.[0]?.url || ''
    const name = raw.split('/').pop() || ''
    return name.split('.')[0]
  }, [current])

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <a className="navbar-brand" href="#">NHere</a>
        <div className="collapse navbar-collapse show">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="authorDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Authors R34</a>
              <div className="dropdown-menu" aria-labelledby="authorDropdown">
                <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setAuthorFilter('') }}>All R34 Authors</a>
                {authors.map(a => (
                  <a key={a} className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setAuthorFilter(a) }}>{a}</a>
                ))}
              </div>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="genreDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Genre R34</a>
              <div className="dropdown-menu" aria-labelledby="genreDropdown">
                <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setGenreFilter('') }}>All R34 Genres</a>
                {genres.map(g => (
                  <a key={g} className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setGenreFilter(g) }}>{g}</a>
                ))}
              </div>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="pmvAuthorsDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Authors R34 PMV</a>
              <div className="dropdown-menu" aria-labelledby="pmvAuthorsDropdown">
                <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setPmvAuthorFilter('') }}>All R34 PMV Authors</a>
                {pmvAuthors.map(a => (
                  <a key={a} className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setPmvAuthorFilter(a) }}>{a}</a>
                ))}
              </div>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="pmvGenresDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Genre R34 PMV</a>
              <div className="dropdown-menu" aria-labelledby="pmvGenresDropdown">
                <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setPmvGenreFilter('') }}>All R34 PMV Genres</a>
                {pmvGenres.map(g => (
                  <a key={g} className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setPmvGenreFilter(g) }}>{g}</a>
                ))}
              </div>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="realAuthorsDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Authors REAL</a>
              <div className="dropdown-menu" aria-labelledby="realAuthorsDropdown">
                <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setRealAuthorFilter('') }}>All REAL Authors</a>
                {realAuthors.map(a => (
                  <a key={a} className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setRealAuthorFilter(a) }}>{a}</a>
                ))}
              </div>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="realGenreDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Genre REAL</a>
              <div className="dropdown-menu" aria-labelledby="realGenreDropdown">
                <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setRealGenreFilter('') }}>All REAL Genres</a>
                {realGenres.map(g => (
                  <a key={g} className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setRealGenreFilter(g) }}>{g}</a>
                ))}
              </div>
            </li>
          </ul>
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

          <div ref={containerRef} className={`video-container ${showControls ? '': 'paused'} ${isScrubbing ? 'scrubbing' : ''}`} data-volume-level={muted ? 'muted' : volume >= 0.5 ? 'high' : 'low'} style={{ cursor: showControls ? 'default' : 'none' }}>
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


