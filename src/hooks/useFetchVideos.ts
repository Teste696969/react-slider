import { useEffect, useState } from 'react'
import type { VideoItem } from '../types/video'

export function useFetchVideos() {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch('https://huggingface.co/datasets/Teste696969/bunker-videos/resolve/main/data.json')
      .then(response => response.json())
      .then(data => {
        setVideos(data)
        setLoading(false)
      })
      .catch(e => {
        setError(String(e))
        setLoading(false)
      })
  }, [])

  return { videos, loading, error }
}