import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import './PokemonDetail.css'

// Un'interfaccia veloce per i dati grezzi che ci arrivano da PokeAPI
interface PokeApiDetail {
  id: number;
  name: string;
  weight: number;
  height: number;
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
      }
    }
  };
  types: { type: { name: string } }[];
  abilities: { ability: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  moves: { move: { name: string } }[];
}

function PokemonDetail() {
  const { name } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [pokemon, setPokemon] = useState<PokeApiDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const handleBack = () => {
    const s = location.state as { game?: string } | null;
    if (s?.game) {
       navigate(`/teams/new/${s.game}`, { state: s });
    } else {
       navigate(-1);
    }
  }

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        setLoading(true)
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
        if (!res.ok) throw new Error("Pokémon non trovato")
        const data = await res.json()
        setPokemon(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (name) fetchPokemon()
  }, [name])

  if (loading) return <div className="pokedex-loading">Caricamento dati Pokédex...</div>
  if (!pokemon) return <div className="pokedex-error">Pokémon non trovato!</div>

  // Estraiamo l'artwork o facciamo un fallback sul classico sprite
  const imageUrl = pokemon.sprites.other['official-artwork'].front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

  return (
    <div className="pokedex-container">
      <button className="pokedex-back-btn" onClick={handleBack}>
        &larr; Torna indietro
      </button>

      <article className="pokedex-card">
        <div className="pokedex-card__left">
          <header className="pokedex-card__header">
            <span className="pokedex-card__id">#{String(pokemon.id).padStart(4, '0')}</span>
            <h1 className="pokedex-card__name">{pokemon.name}</h1>
          </header>

          <div className="pokedex-card__image-container">
            <img src={imageUrl} alt={pokemon.name} className="pokedex-card__image" />
          </div>
          
          <div className="pokedex-card__types">
            {pokemon.types.map((t) => (
               <span key={t.type.name} className={`pokedex-badge pokedex-badge--${t.type.name}`}>
                 {t.type.name}
               </span>
            ))}
          </div>
        </div>

        <div className="pokedex-card__right">
          <section className="pokedex-stats">
            <h3>Statistiche Base</h3>
            <div className="pokedex-stats__list">
              {pokemon.stats.map((s) => {
                // Calcoliamo la percentuale (max 255 che è il massimo teorico per una stat base)
                const percentage = Math.min((s.base_stat / 255) * 100, 100);
                return (
                  <div key={s.stat.name} className="pokedex-stat-row">
                    <span className="pokedex-stat-name">{s.stat.name.replace('-', ' ')}</span>
                    <span className="pokedex-stat-value">{s.base_stat}</span>
                    <div className="pokedex-stat-bar-bg">
                      <div className="pokedex-stat-bar-fill" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="pokedex-info">
            <h3>Abilità</h3>
            <ul className="pokedex-abilities">
              {pokemon.abilities.map((a) => (
                <li key={a.ability.name}>{a.ability.name.replace('-', ' ')}</li>
              ))}
            </ul>
          </section>

          <section className="pokedex-info pokedex-moves-section">
            <h3>Mosse</h3>
            <ul className="pokedex-moves">
              {pokemon.moves.map((m) => (
                <li key={m.move.name}>{m.move.name.replace('-', ' ')}</li>
              ))}
            </ul>
          </section>
        </div>
      </article>
    </div>
  )
}

export default PokemonDetail