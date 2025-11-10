import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { VideoPlayer } from '../components/VideoPlayer'
import type { VideoItem } from '../types/video'

type PlayerPageProps = {
  videos: VideoItem[]
}

export function PlayerPage({ videos }: PlayerPageProps) {
  const [selectedArtists, setSelectedArtists] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [artistInput, setArtistInput] = useState<string>('')
  const [categoryInput, setCategoryInput] = useState<string>('')
  const [showArtistDropdown, setShowArtistDropdown] = useState<boolean>(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState<boolean>(false)
  const [initialVideoId, setInitialVideoId] = useState<string | undefined>(undefined)
  const [searchParams] = useSearchParams()

  const allArtists = useMemo(() => Array.from(new Set(videos.map(v => v.autor))).sort(), [videos])
  const allCategories = useMemo(() => Array.from(new Set(videos.map(v => v.categoria))).sort(), [videos])

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

  useEffect(() => {
    const requestedVideoId = searchParams.get('videoId') || undefined
    setInitialVideoId(requestedVideoId)
    if (!requestedVideoId) return

    const targetIndex = filtered.findIndex(video => video.id === requestedVideoId)
    if (targetIndex >= 0) return

    const original = videos.find(video => video.id === requestedVideoId)
    if (!original) return

    if (original.autor) {
      setSelectedArtists(prev => (prev.includes(original.autor) ? prev : [...prev, original.autor]))
    }
    if (original.categoria) {
      setSelectedCategories(prev => (prev.includes(original.categoria) ? prev : [...prev, original.categoria]))
    }
  }, [filtered, searchParams, videos])

  return (
    <div>
      <section style={{ padding: 'clamp(12px, 4vw, 24px) clamp(16px, 6vw, 32px)', display: 'flex', gap: 'clamp(12px, 3vw, 20px)', flexWrap: 'wrap', background: '#111', justifyContent: 'center' }}>
        <div className="filter-group" style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <div className="filter-input-container" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar artistas..."
              value={artistInput}
              onChange={e => {
                setArtistInput(e.target.value)
                setShowArtistDropdown(true)
              }}
              onFocus={() => setShowArtistDropdown(true)}
              onBlur={() => setTimeout(() => setShowArtistDropdown(false), 200)}
            />
            <div className="selected-filters" style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {selectedArtists.map(artist => (
                <span key={artist} className="filter-pill" style={{
                  background: '#ff8533',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: 15,
                  display: 'inline-flex',
                  alignItems: 'center',
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
        <div style={{ flex: 1, minWidth: '240px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="filter-input-container" style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar categorias..."
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
          <div className="selected-filters" style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {selectedCategories.map(category => (
              <span key={category} className="filter-pill" style={{
                background: '#ff8533',
                color: 'white',
                padding: '4px 8px',
                borderRadius: 15,
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'pointer'
              }}>
                {category} <span onClick={() => removeCategory(category)} style={{ marginLeft: 4 }}>×</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="container-main mt-5">
        <VideoPlayer containerStyle={{ width: '100%', maxWidth: '1200px' }} videos={filtered} initialVideoId={initialVideoId} autoRandom />
      </div>
    </div>
  )
}

