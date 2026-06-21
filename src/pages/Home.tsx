import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { pokemonGames } from "../data/pokemonGames";
import GameCard from '../components/GameCard' 
import './Home.css'

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const generations = [...new Set(pokemonGames.map((game) => game.generation))].sort(
    (a, b) => a - b
  );

  return (
      <section className="home">
        <header className="home__hero">
          <p className="home__eyebrow">Team Builder Serie Principale</p>
          <h1 className="home__title">SCEGLI IL GIOCO</h1>
          <p className="home__subtitle">
            Crea il tuo team Pokémon scegliendo una versione della serie principale.
          </p>
          <p className="home__status">
          {user
            ? `Bentornato, ${user.displayName ?? "allenatore"}`
            : "Non hai ancora effettuato l'accesso."}
           </p>
       </header>

        <div className="home__generations">
          {generations.map((generation) => {
          const gamesInGeneration = pokemonGames.filter(
          (game) => game.generation === generation
          );

            return (
              <section key={generation} className="generation-section">
              <div className="generation-section__header">
                <h3 className="generation-section__title">Gen {generation}</h3>
                <div className="generation-section__line"></div>
              </div>

              <div className="generation-section__grid">
                {gamesInGeneration.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onSelect={() => navigate(`/teams/new/${game.slug}`)}
                    image={game.image}
                  />
              ))}
              </div>
              </section>
            );
          })}
        </div>
      </section>
)}
export default Home;