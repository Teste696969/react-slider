import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { MusicItem } from '../types/music'
import type { VideoItem } from '../types/video'
import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume2, VolumeOff } from 'lucide-react'

type MusicPlayerProps = {
  music: MusicItem[]
  autoPlay?: boolean
  autoLoop?: boolean
  autoRandom?: boolean
  currentVideo?: VideoItem | null
  containerStyle?: React.CSSProperties
}

export function MusicPlayer({
  music,
  autoPlay = false,
  autoLoop = false,
  autoRandom = false,
  currentVideo,
  containerStyle,
}: MusicPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isRandom, setIsRandom] = useState<boolean>(autoRandom)
  const [isLoop, setIsLoop] = useState<boolean>(autoLoop)
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay)
  const [muted, setMuted] = useState<boolean>(false)
  const [duration, setDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [volume, setVolume] = useState<number>(50)
  const [wasPlayingBeforePMV, setWasPlayingBeforePMV] = useState<boolean>(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const randomHistory = useRef<number[]>([])

  // Verificar se o vídeo atual contém "pmv" na categoria
  useEffect(() => {
    if (!currentVideo) return

    const hasPMV = (() => {
      const categories = Array.isArray(currentVideo.categoria)
        ? currentVideo.categoria
        : [currentVideo.categoria]
      return categories.some(cat => 
        typeof cat === 'string' && cat.toLowerCase().includes('pmv')
      )
    })()

    if (hasPMV) {
      // Se tem PMV e está tocando, pausa e salva o estado
      if (isPlaying) {
        setWasPlayingBeforePMV(true)
        setIsPlaying(false)
      }
    } else {
      // Se não tem PMV e estava tocando antes do PMV, retoma
      if (wasPlayingBeforePMV) {
        setIsPlaying(true)
        setWasPlayingBeforePMV(false)
      }
    }
  }, [currentVideo, isPlaying, wasPlayingBeforePMV])

  useEffect(() => {
    setCurrentIndex(0)
    randomHistory.current = []
  }, [music])

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.loop = isLoop && !isRandom
  }, [isLoop, isRandom])

  const current = useMemo(() => music[currentIndex], [music, currentIndex])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false)
      })
    } else {
      audio.pause()
    }
  }, [isPlaying, current])

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const handleNextTrack = useCallback(() => {
    if (isRandom) {
      if (randomHistory.current.length === music.length) {
        randomHistory.current = []
      }
      let randomIndex
      do {
        randomIndex = Math.floor(Math.random() * music.length)
      } while (randomHistory.current.includes(randomIndex))
      randomHistory.current.push(randomIndex)
      setCurrentIndex(randomIndex)
    } else {
      setCurrentIndex(prev => (prev + 1) % music.length)
    }
  }, [isRandom, music.length])

  const handlePreviousTrack = useCallback(() => {
    if (isRandom && randomHistory.current.length > 1) {
      randomHistory.current.pop()
      setCurrentIndex(randomHistory.current[randomHistory.current.length - 1])
    } else {
      setCurrentIndex(prev => (prev - 1 + music.length) % music.length)
    }
  }, [isRandom, music.length])

  const handleToggleRandom = useCallback(() => {
    setIsRandom(!isRandom)
    randomHistory.current = [currentIndex]
  }, [isRandom, currentIndex])

  const handleToggleLoop = useCallback(() => {
    setIsLoop(!isLoop)
  }, [isLoop])

  const handleToggleMute = useCallback(() => {
    setMuted(!muted)
    if (audioRef.current) {
      audioRef.current.muted = !muted
    }
  }, [muted])

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100
    }
  }, [])

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }, [])

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }, [])

  const handleEnded = useCallback(() => {
    if (isLoop && !isRandom) {
      setCurrentTime(0)
      setIsPlaying(true)
    } else {
      handleNextTrack()
      setIsPlaying(true)
    }
  }, [isLoop, isRandom, handleNextTrack])

  const handleProgressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value)
    setCurrentTime(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }, [])

  const formatTime = useCallback((time: number) => {
    if (!isFinite(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [])

  if (music.length === 0) {
    return (
      <div style={{
        padding: '20px',
        background: '#1a1a1a',
        color: '#ccc',
        textAlign: 'center',
        borderRadius: '8px',
        ...containerStyle,
      }}>
        Nenhuma música disponível
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '24px',
        borderRadius: '8px',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        ...containerStyle,
      }}
    >
      <audio
        ref={audioRef}
        src={current?.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Informações da música */}
      <div style={{ marginBottom: '12px' }}>
        <h3 style={{ marginBottom: '24px', fontSize: '22px', fontWeight: '600' }}>
          {current?.title || 'Sem música'}
        </h3>
        {/* <p style={{ margin: '0', fontSize: '14px', color: '#888' }}>
          Faixa {currentIndex + 1} de {music.length}
        </p> */}
      </div>

      {/* Progress bar */}
      <input
        type="range"
        min="0"
        max={duration || 0}
        value={currentTime}
        onChange={handleProgressChange}
        style={{
          width: '100%',
          height: '6px',
          borderRadius: '2px',
          background: '#333',
          outline: 'none',
          cursor: 'pointer',
          marginBottom: '8px',
          accentColor: '#999',
        }}
      />

      {/* Tempo */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#666',
        marginBottom: '12px',
      }}>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controles */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <button
          onClick={handlePreviousTrack}
          style={{
            padding: '6px 10px',
            background: '#222',
            color: '#ccc',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#333'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#222'; e.currentTarget.style.color = '#ccc' }}
        >
          <SkipBack />
        </button>

        <button
          onClick={handlePlayPause}
          style={{
            padding: '8px 12px',
            background: '#ff8533',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#333'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={(e) => e.currentTarget.style.background = '#ff8533'}
        >
          {isPlaying ? <Pause/> : <Play/>}
        </button>

        <button
          onClick={handleNextTrack}
          style={{
            padding: '6px 10px',
            background: '#222',
            color: '#ccc',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#333'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#222'; e.currentTarget.style.color = '#ccc' }}
        >
          <SkipForward />
        </button>

        <div style={{ flex: 1 }} />

        <button
          onClick={handleToggleRandom}
           style={{
            padding: '6px 8px',
            background: isRandom ? '#ff8533' : '#222',
            color: isRandom ? '#fff' : '#666',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '10px',
            transition: 'all 0.2s',
            opacity: isRandom ? 1 : 0.7,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#333'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={(e) => {  e.currentTarget.style.background = isRandom ? '#ff8533' : '#222' }}
        >
          <Shuffle/>
        </button>

        <button
          onClick={handleToggleLoop}
          style={{
            padding: '6px 8px',
            background: isLoop ? '#ff8533' : '#222',
            color: isLoop ? '#fff' : '#666',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '10px',
            transition: 'all 0.2s',
            opacity: isLoop ? 1 : 0.7,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#333'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={(e) => {  e.currentTarget.style.background = isLoop ? '#ff8533' : '#222' }}
        >
          <Repeat/>
        </button>

        <button
          onClick={handleToggleMute}
          style={{
            padding: '6px 8px',
            background: '#222',
            color: muted ? '#666' : '#ccc',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '10px',
            transition: 'all 0.2s',
            opacity: 0.7,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#333'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.background = '#222' }}
        >
          {muted ? <VolumeOff/> : <Volume2/>}
        </button>

        <input
          type="range"
          min="0"
          max="100"
          value={muted ? 0 : volume}
          onChange={handleVolumeChange}
          disabled={muted}
          style={{
            width: '100px',
            height: '6px',
            borderRadius: '2px',
            background: '#333',
            outline: 'none',
            cursor: muted ? 'not-allowed' : 'pointer',
            opacity: muted ? 0.5 : 1,
            accentColor: '#666',
          }}
        />
      </div>
    </div>
  )
}
