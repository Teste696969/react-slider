import { useCallback, useMemo, useState } from 'react'
import type { VideoItem } from '../types/video'

export type QuerySuggestion = {
  type: 'artist' | 'category'
  value: string
}

export function useVideoFilters(videos: VideoItem[]) {
  const [selectedArtists, setSelectedArtists] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchInput, setSearchInput] = useState<string>('')
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)

  const allArtists = useMemo(() => Array.from(new Set(videos.map(v => v.autor))).sort(), [videos])
  
  const allCategories = useMemo(() => {
    const categories = new Set<string>()
    videos.forEach(v => {
      if (Array.isArray(v.categoria)) {
        v.categoria.forEach(c => categories.add(c))
      } else {
        categories.add(v.categoria)
      }
    })
    return Array.from(categories).sort()
  }, [videos])

  const randomArtists = useMemo(() => {
    const available = allArtists.filter(a => !selectedArtists.includes(a))
    const shuffled = [...available].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 15)
  }, [allArtists, selectedArtists])

  const searchSuggestions = useMemo(() => {
    if (!searchInput.trim()) return []

    const searchLower = searchInput.toLowerCase()
    const matchedArtists: QuerySuggestion[] = allArtists
      .filter(a => a.toLowerCase().includes(searchLower) && !selectedArtists.includes(a))
      .map(a => ({ type: 'artist' as const, value: a }))

    const matchedCategories: QuerySuggestion[] = allCategories
      .filter(c => c.toLowerCase().includes(searchLower) && !selectedCategories.includes(c))
      .map(c => ({ type: 'category' as const, value: c }))

    return [...matchedArtists, ...matchedCategories]
  }, [allArtists, allCategories, searchInput, selectedArtists, selectedCategories])

  const filtered = useMemo(() => {
    return videos.filter(v => {
      const artistMatch = selectedArtists.length === 0 || selectedArtists.includes(v.autor)
      const videoCategorias = Array.isArray(v.categoria) ? v.categoria : [v.categoria]
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.some(cat => videoCategorias.includes(cat))
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
    }
  }, [selectedArtists])

  const addCategory = useCallback((category: string) => {
    if (!selectedCategories.includes(category)) {
      setSelectedCategories(prev => [...prev, category])
    }
  }, [selectedCategories])

  const addCategoriesFromVideo = useCallback((videoCategories: string | string[]) => {
    const categoriasToAdd = Array.isArray(videoCategories) ? videoCategories : [videoCategories]
    setSelectedCategories(prev => {
      const newCategories = [...prev]
      categoriasToAdd.forEach(cat => {
        if (!newCategories.includes(cat)) {
          newCategories.push(cat)
        }
      })
      return newCategories
    })
  }, [])

  const addArtistFromVideo = useCallback((artist: string) => {
    setSelectedArtists(prev => (prev.includes(artist) ? prev : [...prev, artist]))
  }, [])

  const clearFilters = useCallback(() => {
    setSelectedArtists([])
    setSelectedCategories([])
    setSearchInput('')
  }, [])

  return {
    // State
    selectedArtists,
    selectedCategories,
    searchInput,
    showSuggestions,
    // Computed
    allArtists,
    allCategories,
    randomArtists,
    searchSuggestions,
    filtered,
    // Actions
    setSearchInput,
    setShowSuggestions,
    removeArtist,
    removeCategory,
    addArtist,
    addCategory,
    addCategoriesFromVideo,
    addArtistFromVideo,
    clearFilters,
  }
}
