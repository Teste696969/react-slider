import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { MainNavbar } from './components/MainNavbar'
import { useFetchVideos } from './hooks/useFetchVideos'
import { GalleryPage } from './pages/GalleryPage'
import { PlayerPage } from './pages/PlayerPage'

export default function App() {
  const { videos, error } = useFetchVideos()

  return (
    <Router>
      <MainNavbar videos={videos} />
      {error && (
        <div style={{ padding: '12px 24px', background: '#2c0d0d', color: '#ffb3b3' }}>
          Erro ao carregar vídeos: {error}
        </div>
      )}
      <Routes>
        <Route path="/gallery" element={<GalleryPage videos={videos} />} />
        <Route path="/" element={<PlayerPage videos={videos} />} />
      </Routes>
    </Router>
  )
}
