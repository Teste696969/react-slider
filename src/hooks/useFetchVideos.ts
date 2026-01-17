import { useEffect, useState } from 'react'
import type { VideoItem } from '../types/video'

export function useFetchVideos() {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('https://huggingface.co/datasets/Teste696969/bunker-videos/resolve/main/data.json')
      .then(response => response.json())
      .then(setVideos)
      .catch(e => setError(String(e)))
  }, [])

  return { videos, error }
}

