import { useEffect, useState } from 'react'
import type { MusicItem } from '../types/music'

export function useFetchMusic() {
  const [music, setMusic] = useState<MusicItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/Teste696969/music-bunker/refs/heads/main/data.json')
      .then(response => response.json())
      .then(setMusic)
      .catch(e => setError(String(e)))
  }, [])

  return { music, error }
}
