import { useEffect, useState, useCallback } from 'react'

const FAVORITES_KEY = 'video_favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  // Carregar favoritos do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY)
      if (stored) {
        setFavorites(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Erro ao carregar favoritos:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const addFavorite = useCallback((videoId: number) => {
    setFavorites((prev) => {
      if (!prev.includes(videoId)) {
        const updated = [...prev, videoId]
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
        return updated
      }
      return prev
    })
  }, [])

  const removeFavorite = useCallback((videoId: number) => {
    setFavorites((prev) => {
      const updated = prev.filter((id) => id !== videoId)
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const isFavorite = useCallback((videoId: number) => {
    return favorites.includes(videoId)
  }, [favorites])

  const clearFavorites = useCallback(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([]))
    setFavorites([])
  }, [])

  const copyToClipboard = useCallback(() => {
    try {
      navigator.clipboard.writeText(JSON.stringify(favorites))
      return true
    } catch (e) {
      console.error('Erro ao copiar:', e)
      return false
    }
  }, [favorites])

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    clearFavorites,
    copyToClipboard,
  }
}
