import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import type { Team } from "../types/team"
import { getAllPublicTeams, toggleLike } from "../services/teams"
import { pokemonGames } from "../data/pokemonGames"
import { useAuth } from "../context/AuthContext"
import "./Teams.css"
import "./Leaderboard.css"

function Leaderboard() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [gameFilter, setGameFilter] = useState('')
  const [visibleCount, setVisibleCount] = useState(10)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const recuperaTeam = async () => {
      try {
        setLoading(true)
        const publicTeams = await getAllPublicTeams()
        setTeams(publicTeams)
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message)
        } else {
          setError(String(e))
        }
      } finally {
        setLoading(false)
      }
    }
    recuperaTeam()
  }, [])

  const handleLike = async (team: Team) => {
    if (!user) {
      alert("Devi accedere per mettere like!")
      return
    }
    const currentLikes = team.likes || []
    const hasLiked = currentLikes.includes(user.uid)
    const newLikes = hasLiked ? currentLikes.filter(id => id !== user.uid) : [...currentLikes, user.uid]
    setTeams(prevTeams => prevTeams.map(t => t.id === team.id ? { ...t, likes: newLikes } : t))
    try { toggleLike(team.id, user.uid).catch(err => console.error("Errore sincronizzazione like:", err)) } catch (error) { console.error("Errore during like:", error) }
  }

  // Limite massimo di team che possono apparire in classifica
  const MAX_LEADERBOARD_TEAMS = 50;

  // Filtro
  const displayTeams = teams.filter((t) => gameFilter === "" || t.game === gameFilter)

  // Ordina per numero di like in ordine decrescente
  displayTeams.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))

  // Limita i risultati
  const visibleTeams = displayTeams.slice(0, Math.min(visibleCount, MAX_LEADERBOARD_TEAMS))

  return (
    <section className="teams-page">
      <div className="teams-page__header" style={{ maxWidth: '900px', margin: '0 auto 2rem auto', width: '100%', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <button onClick={() => navigate('/community')} style={{ background: '#fff', color: '#111', padding: '0.5rem 1rem', border: '3px solid #111', fontWeight: 'bold', cursor: 'pointer', boxShadow: '4px 4px 0 #111', textTransform: 'uppercase', marginBottom: '1rem' }}>
            &larr; Torna alla Community
          </button>
          <div className="teams-page__title-wrapper">
            <h2>Classifica Team</h2>
            <div className="teams-page__title-underline" style={{ backgroundColor: '#ffd700' }}></div>
          </div>
        </div>

        <div className="teams-filter" style={{ background: '#fff', padding: '1.2rem', border: '3px solid #111', boxShadow: '6px 6px 0 #111', marginBottom: '0.5rem' }}>
          <label htmlFor="gameFilter" className="teams-filter__label">Filtra per gioco:</label>
          <select className="teams-filter__select" id="gameFilter" value={gameFilter} onChange={(e) => { setGameFilter(e.target.value); setVisibleCount(10); }}>
            <option value="">Tutti i giochi</option>
            {pokemonGames.map(g => (
              <option key={g.slug} value={g.slug}>{g.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Caricamento della classifica...</p>
      ) : error ? (
        <p style={{ textAlign: 'center', color: '#e63b10' }}>{error}</p>
      ) : (
        <div className="leaderboard-list">
          {visibleTeams.map((team, index) => (
            <article key={team.id} className="leaderboard-card">
              <div style={{ position: 'absolute', top: '-20px', left: '-20px', background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#fff', border: '3px solid #111', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.5rem', zIndex: 10, boxShadow: '3px 3px 0 #111' }}>
                #{index + 1}
              </div>

              <header className="team-card__header">
                <h3>{team.name}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
                  <span className="team-card__date" style={{ color: '#e63b10' }}>By {team.authorName}</span>
                </div>
              </header>
              {team.description && <p className="team-card__description">{team.description}</p>}
              
              {/* Visualizzazione orizzontale dei Pokemon! */}
              <ul className="team-card__pokemons" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
                {team.pokemons.map((pokemon, idx) => (
                  <li key={idx} className="team-card__pokemon" title={pokemon.name}>
                    <img src={pokemon.sprite} alt={pokemon.name} />
                  </li>
                ))}
              </ul>
              
              <div className="team-card__actions" style={{ justifyContent: 'flex-start', fontSize: '1.25rem', cursor: 'pointer', flexWrap: 'wrap' }}>
                 <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                  <span title="Mi piace" onClick={() => handleLike(team)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={team.likes?.includes(user?.uid || '') ? '#e63b10' : '#fff'} stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'fill 0.2s' }}>
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    {team.likes?.length || 0}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Bottone di caricamento */}
      {!loading && visibleCount < displayTeams.length && visibleCount < MAX_LEADERBOARD_TEAMS && (
        <button className="load-more-btn" onClick={() => setVisibleCount(prev => prev + 10)}>
          Carica altri team
        </button>
      )}
    </section>
  )
}

export default Leaderboard