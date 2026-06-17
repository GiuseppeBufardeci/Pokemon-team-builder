import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getTeamsByOwner, deleteTeam, publishTeam, unpublishTeam } from "../services/teams"
import { pokemonGames } from "../data/pokemonGames"
import type { Team } from "../types/team"
import "./Teams.css"


function Teams() {
  const [teams,setTeams] = useState<Team[]>([])
  const [gameFilter, setGameFilter] = useState("")
  const [loading,setLoading] = useState(true)
  const [error, setError] = useState('')

  // Stati per gestire il Modale di Pubblicazione
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [teamToPublish, setTeamToPublish] = useState<Team | null>(null)
  const [publishDescription, setPublishDescription] = useState("")

    // Stati per gestire il Modale di Eliminazione
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null)

  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(()=>{
    if(!user) return

    const loadTeams = async()=>{
      try{
        setLoading(true)
        setError('')
        const data = await getTeamsByOwner(user.uid)
        setTeams(data)
      }catch(error:any){
        setError(error.message)
      }finally{
        setLoading(false)
      }
    }
    loadTeams()
  },[user])

  // Apre il modale di eliminazione
  const openDeleteModal = (team: Team) => {
    setTeamToDelete(team)
    setIsDeleteModalOpen(true)
  }

  // Esegue l'eliminazione dopo la conferma nel modale
  const confirmDelete = async () => {
    if (!teamToDelete) return;
    try {
      await deleteTeam(teamToDelete.id);
      setTeams((prevTeams) => prevTeams.filter((t) => t.id !== teamToDelete.id));
      setIsDeleteModalOpen(false);
      setTeamToDelete(null);
    } catch (err) {
      console.error("Errore durante l'eliminazione:", err);
      alert("Impossibile eliminare il team.");
    }
  }

  // Apre il modale invece di usare window.prompt
  const openPublishModal = (team: Team) => {
    setTeamToPublish(team)
    setPublishDescription("") // Resetta il testo precedente
    setIsPublishModalOpen(true)
  }

  // Esegue la pubblicazione dopo la conferma nel modale
  const confirmPublish = async (e: React.SyntheticEvent) => {
    e.preventDefault() // Evita il ricaricamento della pagina al submit del form
    if (!teamToPublish || publishDescription.trim() === "") return

    try {
      await publishTeam(teamToPublish.id, publishDescription)
      setTeams(prev => prev.map(t => t.id === teamToPublish.id ? { ...t, isPublic: true, description: publishDescription } : t));
      setIsPublishModalOpen(false)
      setTeamToPublish(null)
    } catch (err) {
      console.error("Errore durante la pubblicazione:", err)
      alert("Impossibile pubblicare il team.")
    }
  }

  const handleUnpublish = async(team:Team) => {
    const isConfirmed = window.confirm(`Sei sicuro di voler rendere privato il team ${team.name}?`);
    if (isConfirmed) {
      try {
        await unpublishTeam(team.id);
        // Aggiorniamo lo stato locale
        setTeams(prev => prev.map(t => t.id === team.id ? { ...t, isPublic: false } : t));
      } catch (err) {
        console.error("Errore durante l'operazione:", err);
        alert("Impossibile rendere privato il team.");
      }
    }
  }

  // Filtriamo i team prima di stamparli
  const filteredTeams = teams.filter((t) => gameFilter === "" || t.game === gameFilter)

  return (
    <section className="teams-page">
      <div className="teams-page__header">
        <div className="teams-page__title-wrapper">
          <h2>I Miei Team</h2>
          <div className="teams-page__title-underline"></div>
        </div>

        {teams.length > 0 && (
          <div className="teams-filter">
            <label htmlFor="gameFilter" className="teams-filter__label">Filtra per gioco:</label>
            <select className="teams-filter__select" id="gameFilter" value={gameFilter} onChange={(e) => setGameFilter(e.target.value)}>
              <option value="">Tutti i giochi</option>
              {pokemonGames.map(g => (
                <option key={g.slug} value={g.slug}>{g.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <p>Caricamento dei team in corso...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="teams-grid">
          <article 
            className="team-card team-card--create"
            onClick={() => navigate('/')}
            title="Crea un nuovo team"
          >
            <div className="team-card__create-content">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <h3>Crea Nuovo Team</h3>
            </div>
          </article>

          {filteredTeams.map((team) => (
            <article key={team.id} className="team-card">
              <header className="team-card__header">
                <h3>{team.name}</h3>
                <span className="team-card__date">{new Date(team.createdAt).toLocaleDateString()}</span>
              </header>
              {team.description && <p style={{ fontSize: '0.9rem', margin: '0' }}>{team.description}</p>}
              <ul className="team-card__pokemons">
                {team.pokemons.map((pokemon, index) => (
                  <li key={index} className="team-card__pokemon" title={pokemon.name}>
                    <img src={pokemon.sprite} alt={pokemon.name} />
                  </li>
                ))}
              </ul>
              <div className="team-card__actions">
                <button 
                  className="team-card__btn team-card__edit-btn"
                  onClick={() => navigate(`/teams/new/${team.game}`, { state: { editTeam: team } })}
                  title="Modifica"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button 
                  className="team-card__btn team-card__delete-btn"
                  onClick={() => openDeleteModal(team)}
                  title="Elimina"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
                {!team.isPublic ? (
                  <button 
                    className="team-card__btn team-card__publish-btn"
                    onClick={() => openPublishModal(team)} 
                    title="Pubblica"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  </button>
                ) : (
                  <button 
                    className="team-card__btn team-card__unpublish-btn"
                    onClick={() => handleUnpublish(team)} 
                    title="Rendi Privato"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* MODALE DI PUBBLICAZIONE NEO-BRUTALISTA */}
      {isPublishModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Pubblica Team</h3>
            <p>Inserisci una breve descrizione per il tuo team <strong>{teamToPublish?.name}</strong>:</p>
            <form onSubmit={confirmPublish}>
              <input 
                type="text" 
                placeholder="Es: Ottimo per il competitivo..." 
                value={publishDescription}
                onChange={(e) => setPublishDescription(e.target.value)}
                autoFocus
              />
              <div className="modal-actions">
                <button type="button" className="modal-btn modal-btn--cancel" onClick={() => setIsPublishModalOpen(false)}>Annulla</button>
                <button type="submit" className="modal-btn modal-btn--confirm">Pubblica</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE DI ELIMINAZIONE NEO-BRUTALISTA */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Elimina Team</h3>
            <p>Sei sicuro di voler eliminare il team <strong>{teamToDelete?.name}</strong>?<br/>Questa azione non può essere annullata.</p>
            <div className="modal-actions">
              <button type="button" className="modal-btn modal-btn--cancel" onClick={() => setIsDeleteModalOpen(false)}>Annulla</button>
              <button type="button" className="modal-btn modal-btn--danger" onClick={confirmDelete}>Elimina</button>
            </div>
          </div>
        </div>
      )}

    </section>
  )
}

export default Teams