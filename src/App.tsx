import { Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Teams from './pages/Teams'
import Community from './pages/Community'
import Leaderboard from './pages/Leaderboard'
import PokemonDetail from './pages/PokemonDetail'
import CreateTeam from './pages/CreateTeam'
import Navbar from './components/Navbar'
import { PwaManager } from './components/PwaManager'
import { NotificationBox } from './components/NotificationBox'
import { OfflineBanner } from './components/OfflineBanner'

function App() {
  const {loading} = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <PwaManager />
      <OfflineBanner />
      <NotificationBox />
      <Navbar />

      <main style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/community" element={<Community />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/pokemon/:name" element={<PokemonDetail />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/teams" element={<Teams />} />
            <Route path="/teams/new/:game" element={<CreateTeam />} />
          </Route>
        </Routes>
      </main>
    </div>
  )
}

export default App