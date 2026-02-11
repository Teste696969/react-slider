import { useEffect, useState } from 'react'
import type { MusicItem } from '../types/music'

export function useFetchMusic() {
  const [music, setMusic] = useState<MusicItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

   useEffect(() => {
    setLoading(true)
    fetch('https://huggingface.co/datasets/Teste696969/bunker-musics/resolve/main/data.json')
      .then(response => response.json())
      .then(data => {
        setMusic(data)
        setLoading(false)
      })
      .catch(e => {
        setError(String(e))
        setLoading(false)
      })
  }, [])

  return { music, error, loading }
}
