import { useState,useEffect } from "react"
import { useNavigate } from "react-router-dom"
import type { Team } from "../types/team"
import { subscribeToPublicTeams, toggleLike, addComment, removeComment } from "../services/teams"
import { pokemonGames } from "../data/pokemonGames"
import "./Community.css"
import { useAuth } from "../context/AuthContext"
import { addNotification, setUniqueNotification, removeNotification } from "../services/notifications"


function Community() {
const [teams,setTeams] = useState<Team[]>([])
const [loading,setLoading] = useState(true)
const [error,setError] = useState('')
const [gameFilter,setGameFilter] = useState('')
const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null)
const [commentText,setCommentText] = useState("")
const [replyingTo, setReplyingTo] = useState<{ teamId: string, parentCommentId: string, targetUserId: string, targetUserName: string } | null>(null)
const [replyText, setReplyText] = useState("")
const [showOnlyMine, setShowOnlyMine] = useState(false)
const {user} = useAuth()
const navigate = useNavigate()

// Stati per gestire il Modale di Eliminazione Commento
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
const [commentToDelete, setCommentToDelete] = useState<{ team: Team, commentId: string } | null>(null)

useEffect(()=>{
  const unsubscribe = subscribeToPublicTeams(
    (publicTeams) => {
      setTeams(publicTeams)
      setLoading(false)
    },
    (err) => {
      setError(err.message)
      setLoading(false)
    }
  )
  
  // Pulizia del listener quando l'utente cambia pagina (evita memory leaks)
  return () => unsubscribe()
},[])

const handleLike = async(team:Team)=>{
  if(!user){
    navigate("/login")
    return
  }

  // Otteniamo i like attuali, se undefined usiamo array vuoto
  const currentLikes = team.likes || []
  const hasLiked = currentLikes.includes(user.uid)

  try {
    // Grazie a onSnapshot, non serve più l'aggiornamento locale manuale con setTeams.
    // onSnapshot intercetterà la modifica e aggiornerà l'interfaccia istantaneamente.
    toggleLike(team.id, user.uid).catch(err => console.error("Errore sincronizzazione like:", err))
    
    if (team.ownerId !== user.uid) {
      const notificationId = `${team.id}_${user.uid}_like`;
      if (!hasLiked) {
        // Se ho aggiunto un like (non rimosso), creo/aggiorno la notifica univoca
        setUniqueNotification(notificationId, team.ownerId, `${user.displayName || 'Un allenatore'} ha messo "Mi piace" al tuo team "${team.name}"!`).catch(err => console.error(err));
      } else {
        // Se ho rimosso il like, elimino la notifica per non spammare l'autore
        removeNotification(notificationId).catch(err => console.error(err));
      }
    }
  } catch (error) {
    console.error("Errore durante l'aggiornamento del like:", error)
  }
}

const handleComment = async(e:React.SyntheticEvent,team:Team) => {
  e.preventDefault()
  
  if(!user){
    navigate("/login")
    return
  }

  if (commentText.trim() === "") return

  try {
    addComment(team.id, user.uid, user.displayName || "allenatore", commentText).catch(err => console.error("Errore sincronizzazione commento:", err))

    // Svuotiamo l'input text
    setCommentText("")
    
    // Invio la notifica al proprietario
    if (team.ownerId !== user.uid) {
      addNotification(team.ownerId, `${user.displayName || 'Un allenatore'} ha commentato il tuo team "${team.name}".`).catch(err => console.error(err));
    }
  } catch (error) {
    console.error("Errore durante l'aggiunta del commento:", error)
  }
  
}

const handleReply = async (e: React.SyntheticEvent, team: Team) => {
  e.preventDefault()

  if(!user){
    navigate("/login")
    return
  }

  if (replyText.trim() === "" || !replyingTo) return

  try {
    const { parentCommentId, targetUserId } = replyingTo
    
    addComment(team.id, user.uid, user.displayName || "allenatore", replyText, parentCommentId).catch(err => console.error("Errore sincronizzazione risposta:", err))

    setReplyText("")
    setReplyingTo(null)

    if (targetUserId !== user.uid) {
      addNotification(targetUserId, `${user.displayName || 'Un allenatore'} ti ha risposto in un commento nel team "${team.name}".`).catch(err => console.error(err))
    }
    if (team.ownerId !== user.uid && team.ownerId !== targetUserId) {
      addNotification(team.ownerId, `${user.displayName || 'Un allenatore'} ha commentato il tuo team "${team.name}".`).catch(err => console.error(err))
    }
  } catch (error) {
    console.error("Errore durante l'aggiunta della risposta:", error)
  }
}

const openDeleteModal = (team: Team, commentId: string) => {
  setCommentToDelete({ team, commentId });
  setIsDeleteModalOpen(true);
}

const confirmDeleteComment = async () => {
  if (!commentToDelete) return;
  const { team, commentId } = commentToDelete;

  setIsDeleteModalOpen(false);
  setCommentToDelete(null);

  try {
    removeComment(team.id, commentId).catch(err => console.error("Errore sincronizzazione eliminazione commento:", err));
  } catch (error) {
    console.error("Errore durante l'eliminazione del commento:", error);
  }
}
 

let displayTeams = teams.filter((t) => gameFilter === "" || t.game === gameFilter)

// Filtro "I miei post"
if (showOnlyMine && user) {
  displayTeams = displayTeams.filter(t => t.ownerId === user.uid)
}

// Ordinamento standard (Più Recenti)
displayTeams.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <section className="community-page community-wrapper">
      <div className="community-header">
        <div className="community-title-wrapper">
          <h2>Community</h2>
          <div className="community-title-underline"></div>
        </div>
      </div>

      {/* Pannello di controllo Community */}
      <div className="community-controls">
        
        <div className="community-controls__action">
          <label className="community-controls__label">Azione</label>
          <div className="community-controls__buttons">
            <button onClick={() => navigate('/teams')} className="community-btn community-btn--publish">
              + Pubblica Team
            </button>
            <button onClick={() => navigate('/leaderboard')} className="community-btn community-btn--leaderboard">
              🏆 Classifica
            </button>
          </div>
        </div>

        <div className="community-filter">
          <label htmlFor="gameFilter" className="community-filter__label">Filtra per gioco:</label>
          <select className="community-filter__select" id="gameFilter" value={gameFilter} onChange={(e) => setGameFilter(e.target.value)}>
            <option value="">Tutti i giochi</option>
            {pokemonGames.map(g => (
              <option key={g.slug} value={g.slug}>{g.label}</option>
            ))}
          </select>
        </div>

        {user && (
           <label className="community-checkbox">
             <input type="checkbox" className="community-checkbox__input" checked={showOnlyMine} onChange={(e) => setShowOnlyMine(e.target.checked)} />
             MOSTRA SOLO I MIEI
           </label>
        )}
      </div>

      {loading ? (
        <p>Caricamento dei team in corso...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="community-grid">
          {displayTeams.map((team) => (
            <article key={team.id} className="community-card">
              
              <header className="community-card__header">
                <div className="community-card__title-group">
                  <h3>{team.name}</h3>
                  <span className={`community-card__game community-card__game--${team.game}`}>
                    {pokemonGames.find(g => g.slug === team.game)?.label || team.game}
                  </span>
                </div>
                <div className="community-card__meta">
                  <span className="community-card__author">Di {team.authorName}</span>
                </div>
              </header>
              {team.description && <p className="community-card__description">{team.description}</p>}
              <ul className="community-card__pokemons">
                {team.pokemons.map((pokemon, index) => (
                  <li key={index} className="community-card__pokemon" title={pokemon.name}>
                    <img src={pokemon.sprite} alt={pokemon.name} />
                  </li>
                ))}
              </ul>
              <div className="community-card__actions">
                 <div className="community-card__stats">
                  <span title="Mi piace" className="community-card__stat" onClick={() => handleLike(team)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={team.likes?.includes(user?.uid || '') ? '#e63b10' : '#fff'} stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="community-card__icon">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    {team.likes?.length || 0}
                  </span>
                  <span title="Commenti" className="community-card__stat" onClick={() => expandedTeamId === team.id ? setExpandedTeamId(null) : setExpandedTeamId(team.id)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="community-card__icon">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    {team.comments?.length || 0}
                  </span>
                </div>

                {expandedTeamId === team.id && (
                  <div className="community-comments">
                    <ul className="community-comments__list">
                      {(team.comments || []).filter(c => !c.replyToId).map((c) => (
                        <li key={c.id} className="community-comments__item">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <strong className="community-comments__author">{c.userName}</strong>
                            {/* Mostra il tasto elimina solo se l'utente loggato è l'autore del commento */}
                            {user?.uid === c.userId && (
                              <button 
                                className="community-comments__delete-btn" 
                                onClick={() => openDeleteModal(team, c.id)}
                                title="Elimina commento"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                              </button>
                            )}
                          </div>
                          <span className="community-comments__text">{c.text}</span>
                          <div className="community-comments__date-actions">
                            <span className="community-comments__date">{new Date(c.createdAt).toLocaleString()}</span>
                            <button className="community-comments__reply-btn" onClick={() => { setReplyingTo({ teamId: team.id, parentCommentId: c.id, targetUserId: c.userId, targetUserName: c.userName }); setReplyText(""); }}>
                              Rispondi
                            </button>
                          </div>

                          {/* RISPOSTE */}
                          {(team.comments || []).filter(r => r.replyToId === c.id).length > 0 && (
                            <ul className="community-comments__replies">
                              {(team.comments || []).filter(r => r.replyToId === c.id).map(r => (
                                <li key={r.id} className="community-comments__reply-item">
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <strong className="community-comments__author">{r.userName}</strong>
                                    {user?.uid === r.userId && (
                                      <button className="community-comments__delete-btn" onClick={() => openDeleteModal(team, r.id)} title="Elimina risposta">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                      </button>
                                    )}
                                  </div>
                                  <span className="community-comments__text">{r.text}</span>
                                  <div className="community-comments__date-actions">
                                    <span className="community-comments__date">{new Date(r.createdAt).toLocaleString()}</span>
                                    <button className="community-comments__reply-btn" onClick={() => { setReplyingTo({ teamId: team.id, parentCommentId: c.id, targetUserId: r.userId, targetUserName: r.userName }); setReplyText(`@${r.userName} `); }}>
                                      Rispondi
                                    </button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}

                          {/* FORM DI RISPOSTA */}
                          {replyingTo?.teamId === team.id && replyingTo?.parentCommentId === c.id && (
                            <form className="community-comments__reply-form" onSubmit={(e) => handleReply(e, team)}>
                              <input type="text" placeholder={`Rispondi a ${replyingTo.targetUserName}...`} value={replyText} onChange={(e) => setReplyText(e.target.value)} className="community-comments__input" autoFocus />
                              <button type="button" onClick={() => { setReplyingTo(null); setReplyText(""); }} className="community-comments__cancel-btn">Annulla</button>
                              <button type="submit" className="community-comments__submit">Invia</button>
                            </form>
                          )}
                        </li>
                      ))}
                    </ul>
                    
                    <form className="community-comments__form" onSubmit={(e) => handleComment(e, team)}>
                      <input 
                        type="text" 
                        placeholder="Scrivi un commento..." 
                        value={commentText} 
                        onChange={(e) => setCommentText(e.target.value)}
                        className="community-comments__input"
                      />
                      <button type="submit" className="community-comments__submit">
                        Invia
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* MODALE DI ELIMINAZIONE COMMENTO */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Elimina Commento</h3>
            <p>Sei sicuro di voler eliminare questo commento?<br/>L'azione non può essere annullata.</p>
            <div className="modal-actions">
              <button type="button" className="modal-btn modal-btn--cancel" onClick={() => setIsDeleteModalOpen(false)}>Annulla</button>
              <button type="button" className="modal-btn modal-btn--danger" onClick={confirmDeleteComment}>Elimina</button>
            </div>
          </div>
        </div>
      )}

    </section>
  )
}

export default Community