import type { PokemonGame } from "../data/pokemonGames";
import './GameCard.css'

type GameCardProps = {
  game: PokemonGame;
  onSelect: () => void;
  image : string;
};

function GameCard({ game, onSelect }: GameCardProps) {
  return (
    <button type="button" className="game-card" onClick={onSelect}>
      <div className="game-card__media">
        {game.image ? (
          <img
            src={game.image}
            alt={`Copertina di ${game.label}`}
            className="game-card__image"
          />
        ) : (
          <div className="game-card__placeholder">Cover</div>
        )}
      </div>

      <div className="game-card__content">
        <h4 className="game-card__title">{game.label}</h4>

        <div className="game-card__footer">
          <span className="game-card__region">{game.region}</span>
          <span className="game-card__arrow" aria-hidden="true">
           →
          </span>
        </div>
      </div>
    </button>
  );
}

export default GameCard;