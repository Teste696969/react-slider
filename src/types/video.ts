export type VideoPart = {
  url: string
}

export type VideoItem = {
  url?: string
  categoria: string
  autor: string
  parts?: VideoPart[]
  id: string
  title: string
  previous_id: string
  thumbnail_url: string
}

