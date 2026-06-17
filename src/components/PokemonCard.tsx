import { useNavigate } from "react-router-dom"
import type { PokemonDetails } from "../types/team"
import "./PokemonCard.css"

interface PokemonCardProps {
  pokemon: PokemonDetails;
  onAdd: (pokemon: PokemonDetails) => void;
}

export function PokemonCard({ pokemon, onAdd }: PokemonCardProps) {
  const navigate = useNavigate();

  return (
    <li className="pokemon-card">
      <div 
        className="pokemon-card__top" 
        onClick={() => navigate(`/pokemon/${pokemon.name}`)}
        style={{ cursor: "pointer" }}
      >
        <div className="pokemon-card__meta">
          <h3 className="pokemon-card__name">{pokemon.name}</h3>
          <div className="pokemon-card__types">
            {pokemon.types.map((type) => (
            <span
                key={type}
                className={`pokemon-card__type-badge pokemon-card__type-badge--${type.toLowerCase()}`}
                >
                {type}
            </span>
            ))}
</div>
        </div>

        <div className="pokemon-card__media">
          <img
            className="pokemon-card__image"
            src={pokemon.sprite}
            alt={pokemon.name}
          />
        </div>
      </div>

      <button
        className="pokemon-card__add"
        type="button"
        onClick={() => onAdd(pokemon)}
      >
        Aggiungi al team
      </button>
    </li>
  )
}