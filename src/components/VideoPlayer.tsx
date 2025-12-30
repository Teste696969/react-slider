import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { VideoItem } from '../types/video'

type VideoPlayerProps = {
  videos: VideoItem[]
  initialVideoId?: string
  autoRandom?: boolean
  autoLoop?: boolean
  hiddenPrevious?: boolean
  hiddenNext?: boolean
  hiddenRandom?: boolean
  hiddenLoop?: boolean
  containerStyle?: React.CSSProperties
  videoStyle?: React.CSSProperties
  onVideoChange?: (video: VideoItem) => void
}

export function VideoPlayer({
  videos,
  initialVideoId,
  autoRandom = false,
  autoLoop = false,
  hiddenPrevious = false,
  hiddenNext = false,
  hiddenRandom = false,
  hiddenLoop = false,
  containerStyle,
  videoStyle,
  onVideoChange,
}: VideoPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isRandom, setIsRandom] = useState<boolean>(autoRandom)
  const [isLoop, setIsLoop] = useState<boolean>(autoLoop)
  const isHiddenLoop = hiddenLoop
  const isHiddenRandom = hiddenRandom
  const isHiddenNext = hiddenNext
  const isHiddenPrevious = hiddenPrevious
  const [, setQueue] = useState<number[]>([])
  const randomHistory = useRef<number[]>([])

  useEffect(() => {
    setCurrentIndex(0)
    setQueue(Array.from({ length: videos.length }, (_, i) => i))
    randomHistory.current = []
  }, [videos])

  useEffect(() => {
    if (!initialVideoId) return
    const targetIndex = videos.findIndex(video => String(video.id) === initialVideoId)
    if (targetIndex >= 0) {
      setCurrentIndex(targetIndex)
      randomHistory.current = [targetIndex]
    }
  }, [initialVideoId, videos])

  const loadIndex = useCallback((idx: number) => {
    if (idx < 0 || idx >= videos.length) return
    setCurrentIndex(idx)
  }, [videos.length])

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const controlsRef = useRef<HTMLDivElement | null>(null)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

  useEffect(() => {
    if (!videoRef.current) return
    videoRef.current.loop = isLoop
  }, [isLoop])

  const current = useMemo(() => videos[currentIndex], [videos, currentIndex])

  useEffect(() => {
    if (current && onVideoChange) {
      onVideoChange(current)
    }
  }, [current, onVideoChange])

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
        const pool = q.length ? q : Array.from({ length: videos.length }, (_, i) => i)
        const ri = Math.floor(Math.random() * pool.length)
        const nextIdx = pool[ri]
        const newPool = pool.slice()
        newPool.splice(ri, 1)
        randomHistory.current.push(nextIdx)
        loadIndex(nextIdx)
        return newPool
      })
    } else {
      const next = currentIndex < videos.length - 1 ? currentIndex + 1 : 0
      loadIndex(next)
    }
  }, [currentIndex, videos.length, isRandom, loadIndex])

  const onEnded = useCallback(() => {
    if (isRandom) onNext()
    else {
      const next = currentIndex < videos.length - 1 ? currentIndex + 1 : 0
      loadIndex(next)
    }
  }, [currentIndex, videos.length, isRandom, loadIndex, onNext])

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
    
    const scheduleHideControls = () => {
      if (hideTimeout.current) window.clearTimeout(hideTimeout.current)
      hideTimeout.current = window.setTimeout(() => {
        if (!videoRef.current?.paused) setShowControls(false)
      }, 3000)
    }
    
    const handleMouseMove = () => {
      setShowControls(true)
      scheduleHideControls()
    }
    const handleMouseEnter = () => {
      isPointerInside.current = true
      setShowControls(true)
      scheduleHideControls()
    }
    const handleMouseLeave = () => {
      isPointerInside.current = false
    }
    
    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('keydown', onKeyDown)
    const onFull = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current)
    }
    document.addEventListener('fullscreenchange', onFull)
    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('fullscreenchange', onFull)
      if (hideTimeout.current) window.clearTimeout(hideTimeout.current)
    }
  }, [onKeyDown])

  useEffect(() => {
    if (!isPlaying) return
    
    if (hideTimeout.current) window.clearTimeout(hideTimeout.current)
    hideTimeout.current = window.setTimeout(() => {
      setShowControls(false)
    }, 3000)
    
    return () => {
      if (hideTimeout.current) window.clearTimeout(hideTimeout.current)
    }
  }, [isPlaying])

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

  if (!current) {
    return (
      <div style={{ padding: 16, color: '#fff', textAlign: 'center' }}>
        Nenhum vídeo disponível.
      </div>
    )
  }

  const currentSource = current.parts && current.parts.length > 0 ? current.parts[0].url : current.url

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        minHeight: window.innerWidth <= 768 ? '400px' : 'auto',
        maxHeight: window.innerWidth <= 768 ? '400px' : '900px',
        width: '100%',
        margin: '0 auto',
        padding: window.innerWidth <= 768 ? '0' : '0 clamp(12px, 4vw, 24px)',
        ...containerStyle,
      }}
    >
      

      <div
        ref={containerRef}
        className={`video-container ${showControls ? '' : 'paused'} ${isScrubbing ? 'scrubbing' : ''} ${isFullscreen ? 'full-screen' : ''}`}
        data-volume-level={muted ? 'muted' : volume >= 0.5 ? 'high' : 'low'}
        style={{
          cursor: showControls ? 'default' : 'none',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
        }}
      >
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
            <button style={{ display: isHiddenPrevious ? 'none' : 'inline-block' }}  id="prev-button" onClick={onPrev}><i className="fa-solid fa-backward"></i></button>
            <button className="play-pause-btn" onClick={onTogglePlay}>
              <i className="play-icon fa-solid fa-play" style={{ display: isPlaying ? 'none' : 'inline-block' }}></i>
              <i className="pause-icon fa-solid fa-pause" style={{ display: isPlaying ? 'inline-block' : 'none' }}></i>
            </button>
            <button style={{ display: isHiddenNext ? 'none' : 'inline-block' }} id="next-button" onClick={onNext}><i className="fa-solid fa-forward"></i></button>
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
            <button style={{ display: isHiddenRandom ? 'none' : 'inline-block' }} id="random-button" className={isRandom ? 'active-random' : ''} onClick={() => setIsRandom(v => !v)}>
              <i className="fa-solid fa-shuffle"></i>
            </button>
            <button style={{ display: isHiddenLoop ? 'none' : 'inline-block' }} id="loop-button" className={isLoop ? 'active-loop' : ''} onClick={() => setIsLoop(v => !v)}>
              <i className="fa-solid fa-repeat"></i>
            </button>
            <button className="full-screen-btn" onClick={() => { if (!document.fullscreenElement) containerRef.current?.requestFullscreen(); else document.exitFullscreen() }}>
              <i className="fa-solid fa-expand"></i>
            </button>
          </div>
        </div>

        {currentSource ? (
          <video
            ref={videoRef}
            id="video-player"
            onClick={() => {
              setShowControls(true)
              if (hideTimeout.current) window.clearTimeout(hideTimeout.current)
              hideTimeout.current = window.setTimeout(() => {
                if (!videoRef.current?.paused) setShowControls(false)
              }, 3000)
              onTogglePlay()
            }}
            onPlay={onPlay}
            onPause={onPause}
            onEnded={onEnded}
            onTimeUpdate={onTimeUpdate}
            onLoadedData={onLoadedData}
            src={currentSource}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: isFullscreen ? '100%' : 'auto',
              minHeight: "100%",
              flex: 1,
              borderRadius: '12px',
              background: 'transparent',
              objectFit: 'contain',
              ...videoStyle,
            }}
          />
        ) : (
          <div style={{ padding: 16 }}>Fonte de vídeo inválida.</div>
        )}
      </div>
      <div className="video-title-container">
        <div className="video-urls-container">
          <h5 className="video-url" onClick={() => { if (currentId) window.open(currentSource || '#', '_blank') }}>{currentId}</h5>
         <div>
         <h6 className="artist-url" onClick={() => { if (current?.autor) window.open(`https://www.google.com/search?q=${encodeURIComponent(current.autor)}`, '_blank') }}>{current?.autor || ''}</h6>
         <h6 className="video-title">{current?.categoria || ''}</h6>
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

