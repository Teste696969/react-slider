import { useCallback, useMemo, useState } from 'react'
import type { VideoItem } from '../types/video'

export function useVideoFilters(videos: VideoItem[]) {
  const [selectedArtists, setSelectedArtists] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [artistInput, setArtistInput] = useState<string>('')
  const [categoryInput, setCategoryInput] = useState<string>('')
  const [showArtistDropdown, setShowArtistDropdown] = useState<boolean>(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState<boolean>(false)

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
    setArtistInput('')
    setCategoryInput('')
  }, [])

  return {
    // State
    selectedArtists,
    selectedCategories,
    artistInput,
    categoryInput,
    showArtistDropdown,
    showCategoryDropdown,
    // Computed
    allArtists,
    allCategories,
    artistSuggestions,
    categorySuggestions,
    filtered,
    // Actions
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
    clearFilters,
  }
}
