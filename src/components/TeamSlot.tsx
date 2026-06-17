import type { PokemonDetails } from "../types/team"
import "./TeamSlot.css"

interface TeamSlotProps {
  pokemon?: PokemonDetails;
  index: number;
  onRemove: (index: number) => void;
}

export function TeamSlot({ pokemon, index, onRemove }: TeamSlotProps) {
  return (
    <li className={`team-slot ${pokemon ? "team-slot--filled" : "team-slot--empty"}`}>
      {pokemon ? (
        <>
          <div className="team-slot__content">
            <div className="team-slot__media">
              <img
                className="team-slot__image"
                src={pokemon.sprite}
                alt={pokemon.name}
              />
            </div>

            <div className="team-slot__info">
              <span className="team-slot__name">{pokemon.name}</span>
            </div>
          </div>

          <button
            className="team-slot__remove"
            type="button"
            onClick={() => onRemove(index)}
          >
            Rimuovi
          </button>
        </>
      ) : (
        <div className="team-slot__empty">
          <span className="team-slot__empty-label">Slot vuoto</span>
        </div>
      )}
    </li>
  )
}