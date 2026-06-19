import { useEffect, useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { pokemonGames } from "../data/pokemonGames"
import { createTeam, checkTeamName, updateTeam } from "../services/teams"
import type { Team, TeamPokemon, PokemonDetails } from "../types/team"
import { PokemonCard } from "../components/PokemonCard"
import { TeamSlot } from "../components/TeamSlot"
import { addNotification } from "../services/notifications"
import "./CreateTeam.css"

function CreateTeam() {
    const { game } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAuth()
    
    // Controlliamo se stiamo modificando un team dalla history del router
    const editTeam = location.state?.editTeam as Team | undefined

    const [teamName,setTeamName] = useState(editTeam?.name || '')
    const [selectedPokemons,setSelectedPokemons] = useState<PokemonDetails[]>(
        // Se stiamo modificando, mappiamo i pokemon del database verso PokemonDetails mettendo stats vuote (che ci bastano per i render)
        editTeam?.pokemons.map((p) => ({
            id: p.id, name: p.name, sprite: p.sprite, types: p.types, abilities: [], moves: [], stats: { hp: 0, atk: 0, def: 0 }
        })) || []
    )
    const [availablePokemons, setAvailablePokemons] = useState<PokemonDetails[]>([])
    const [loading, setLoading] = useState(true)
    const [fetchError, setFetchError] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [typeFilter, setTypeFilter] = useState("")
    const [moveFilter, setMoveFilter] = useState("")
    const [isSaving,setIsSaving] = useState(false)



    function handleAddPokemon(pokemon:PokemonDetails){
        if(selectedPokemons.length < 6 ){
            setSelectedPokemons(prev=>[...prev,pokemon])
        }
    }

    function handleRemovePokemon(indexToRemove:number){
        setSelectedPokemons(selectedPokemons.filter((_pokemon,index)=> index!=indexToRemove))
    }

    const handleSaveTeam = async(e: React.SyntheticEvent) => {
        e.preventDefault()

        if(teamName.trim() === "" || selectedPokemons.length === 0){
            alert("Inserisci un nome e aggiungi almeno un Pokémon al team.")
            return
        }

        
        if (!user) {
            alert("Devi effettuare l'accesso per salvare un team!")
            return
        }

        if(await checkTeamName(user.uid, teamName, editTeam?.id)){
            alert("Esiste già un team con questo nome")
            return
        }
        
        // Inizia il caricamento disabilitando il bottone
        setIsSaving(true);
        try {
            const pokemonsPerIlDatabase: TeamPokemon[] = selectedPokemons.map((p) => {
                return {
                    id: p.id,
                    name : p.name,
                    sprite : p.sprite,
                    types : p.types
                }
            })

            if (editTeam) {
                updateTeam(editTeam.id, {
                    name: teamName,
                    game: game!,
                    pokemons: pokemonsPerIlDatabase
                }).catch(err => console.error("Errore di sincronizzazione:", err))
            } else {
                createTeam({
                    name: teamName,
                    ownerId: user.uid,
                    authorName: user.displayName || "allenatore",
                    game: game!,
                    pokemons: pokemonsPerIlDatabase
                }).catch(err => console.error("Errore di sincronizzazione:", err))
            }

            // Gestione notifica team incompleto
            if (selectedPokemons.length < 6) {
                if (Notification.permission === 'granted') {
                    new Notification('Team Incompleto ⚠️', {
                        body: `Hai salvato "${teamName}" con solo ${selectedPokemons.length} Pokémon. Ricordati di completarlo in futuro!`,
                        icon: '/icon-192.png'
                    });
                }
                // Aggiungiamo la notifica anche nel database per farla comparire nel box
                addNotification(user.uid, `Hai salvato il team "${teamName}" con solo ${selectedPokemons.length} Pokémon. Ricordati di completarlo in futuro!`)
                    .catch(err => console.error("Errore notifica:", err));
            }

            navigate('/teams')
        } catch (error) {
            console.error("Errore durante il salvataggio:", error)
            alert("C'è stato un problema durante il salvataggio del team.")
        } finally {
            // Fine del caricamento
            setIsSaving(false);
        }
    }

    useEffect(()=>{
        // Definiamo una funzione asincrona per caricare i dati
        const fetchPokemonsForGame = async () => {
            try {
                setLoading(true); // Inizia il caricamento
                setFetchError("");
                setAvailablePokemons([]); // Svuota la lista vecchia per evitare glitch offline
            
                // 1. Trova il versionGroup come hai già fatto
                const gameData = pokemonGames.find((g) => g.slug === game);
                if (!gameData) {
                    // Se il gioco non è valido, interrompiamo
                    setLoading(false);
                    return;
                }
            
                // 2. Chiamata per ottenere i dati del gruppo di versioni
                // Usa fetch() con l'URL: `https://pokeapi.co/api/v2/version-group/${gameData.versionGroup}`
                // e salva la risposta JSON in una variabile `versionGroupData`. Assicurati di usare 'await' per risolvere la Promise.
                const versionGroupResponse = await fetch(`https://pokeapi.co/api/v2/version-group/${gameData.versionGroup}`)
                const versionGroupData = await versionGroupResponse.json() 
            
                // 3. Da versionGroupData, prendi l'URL del primo pokedex
                // (di solito è quello che ci serve)
                // const pokedexUrl = versionGroupData.pokedexes[0].url;
                // Controlliamo che pokedexes esista e abbia almeno un elemento
                if (!versionGroupData.pokedexes || versionGroupData.pokedexes.length === 0) {
                    throw new Error("Nessun Pokédex trovato per questa versione.");
                }
                const pokedexUrl = versionGroupData.pokedexes[0].url;
            
                // 4. Chiamata per ottenere i dati del Pokédex
                // Usa di nuovo fetch() con `pokedexUrl` e salva la risposta JSON in una variabile `pokedexData`. Assicurati di usare 'await'.
                const pokedexResponse = await fetch(pokedexUrl)
                const pokedexData = await pokedexResponse.json()
                
                // 5. Estrai la lista di Pokémon e aggiorna lo stato
                // La lista si trova in `pokedexData.pokemon_entries`
                const entries = pokedexData.pokemon_entries

                 // Eseguiamo una fetch per ogni singolo pokemon usando Promise.all per estrarre Tipi e Statistiche
                const detailedPokemons = await Promise.all(
                    entries.map(async (entry: { pokemon_species: { url: string, name: string } }) => {
                        const urlParts = entry.pokemon_species.url.split('/').filter(Boolean);
                        const pokemonId = parseInt(urlParts[urlParts.length - 1], 10);
                        
                        try {
                            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
                            if (!res.ok) throw new Error("Pokemon non trovato");
                            const data = await res.json();
                            
                            return {
                                id: pokemonId,
                                name: entry.pokemon_species.name,
                                sprite: data.sprites?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
                                types: data.types.map((t: { type: { name: string } }) => t.type.name),
                                abilities: data.abilities.map((a: { ability: { name: string } }) => a.ability.name),
                                moves: data.moves.map((m: { move: { name: string } }) => m.move.name),
                                stats: {
                                    hp: data.stats.find((s: { stat: { name: string }, base_stat: number }) => s.stat.name === 'hp')?.base_stat || 0,
                                    atk: data.stats.find((s: { stat: { name: string }, base_stat: number }) => s.stat.name === 'attack')?.base_stat || 0,
                                    def: data.stats.find((s: { stat: { name: string }, base_stat: number }) => s.stat.name === 'defense')?.base_stat || 0,
                                }
                            };
                        } catch {
                            // Se la chiamata singola fallisce, ritorniamo un pokemon di "fallback" senza stats e tipi
                            return {
                                id: pokemonId,
                                name: entry.pokemon_species.name,
                                sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
                                types: [],
                                abilities: [],
                                moves: [],
                                stats: { hp: 0, atk: 0, def: 0 }
                            };
                        }
                    })
                );

                setAvailablePokemons(detailedPokemons);
            
                } catch (error) {
                    console.error("Errore nel caricamento dei Pokémon:", error);
                    if (!navigator.onLine) {
                        setFetchError("Impossibile caricare i Pokémon. Sei offline e questo gioco non è ancora salvato nella cache locale.");
                    } else {
                        setFetchError("Impossibile caricare i Pokémon. Si è verificato un problema con la connessione ai server di PokeAPI.");
                    }
                } finally {
                    setLoading(false); // Fine del caricamento, in ogni caso
                }
            };
        
            fetchPokemonsForGame(); // Eseguiamo la funzione
    },[game])
    
    // Estraiamo dinamicamente tutti i tipi e mosse unici dai Pokémon attualmente disponibili
    const uniqueTypes = Array.from(new Set(availablePokemons.flatMap(p => p.types))).sort()
    const uniqueMoves = Array.from(new Set(availablePokemons.flatMap(p => p.moves))).sort()

    // Filtriamo usando i tre criteri (nome, tipo, mossa)
    const filteredPokemons = availablePokemons.filter((pokemon) => {
        const matchesName = pokemon.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === "" || pokemon.types.includes(typeFilter);
        const matchesMove = moveFilter === "" || pokemon.moves.includes(moveFilter);
        return matchesName && matchesType && matchesMove;
    })
    
    if(!game) return <p>Gioco non valido</p>

    if(loading) return <p>loading...</p>
    
    if(fetchError) return (
        <div style={{ padding: "2rem", textAlign: "center", fontWeight: "bold" }}>
            <p>{fetchError}</p>
            <button onClick={() => navigate('/')} style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer", border: "2px solid #111", background: "#ffd700", fontWeight: "bold", boxShadow: "4px 4px 0 #111" }}>Torna alla Home</button>
        </div>
    )

    return (
        <section className="create-team">
            <div className="create-team__layout">
            <main className="create-team__main">
                <section className="create-team__controls" aria-label="Controlli builder">
                <div className="create-team__controls-top">
                    <div className="create-team__field create-team__field--game">
                    <label htmlFor="gameSelect" className="create-team__label">
                        Select game
                    </label>
                    <select
                        id="gameSelect"
                        className="create-team__select"
                        value={game}
                        onChange={(e) => {
                        setSelectedPokemons([]);
                        setSearchTerm("");
                        setTypeFilter("");
                        setMoveFilter("");
                        navigate(`/teams/new/${e.target.value}`, {
                            state: editTeam ? { editTeam: { ...editTeam, name: teamName, pokemons: [] } } : undefined
                        });
                        }}
                    >
                        {pokemonGames.map((g) => (
                        <option key={g.slug} value={g.slug}>
                            {g.label}
                        </option>
                        ))}
                    </select>
                    </div>

                    <div className="create-team__field create-team__field--search">
                    <label htmlFor="pokemonSearch" className="create-team__label">
                        Search Pokémon
                    </label>
                    <input
                        id="pokemonSearch"
                        className="create-team__input"
                        type="text"
                        placeholder="Search Pokémon..."
                        value={searchTerm}
                        onChange={(e) => {
                        setSearchTerm(e.target.value);
                        }}
                    />
                    </div>
                </div>

                <div className="create-team__filters">
                    <div className="create-team__field">
                    <label htmlFor="typeFilter" className="create-team__label">
                        Type
                    </label>
                    <select
                        id="typeFilter"
                        className="create-team__select"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="">Tutti i tipi</option>
                        {uniqueTypes.map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                        ))}
                    </select>
                    </div>

                    <div className="create-team__field">
                    <label htmlFor="moveFilter" className="create-team__label">
                        Mossa
                    </label>
                    <select
                        id="moveFilter"
                        className="create-team__select"
                        value={moveFilter}
                        onChange={(e) => setMoveFilter(e.target.value)}
                    >
                        <option value="">Tutte le mosse</option>
                        {uniqueMoves.map((m) => (
                        <option key={m} value={m}>
                            {m}
                        </option>
                        ))}
                    </select>
                    </div>
                </div>
                </section>

                <ul className="create-team__pokemon-grid">
                {filteredPokemons.map((p) => {
                    return <PokemonCard key={p.id} pokemon={p} onAdd={handleAddPokemon} />;
                })}
                </ul>
            </main>

            <aside className="create-team__sidebar" aria-label="Team selezionato">
                <section className="team-panel">
                <div className="team-panel__header">
                    <h2 className="team-panel__title">
                    Your team ({selectedPokemons.length}/6)
                    </h2>
                </div>

                <form className="team-panel__form" onSubmit={handleSaveTeam}>
                    <div className="team-panel__field">
                    <label htmlFor="teamName" className="create-team__label">
                        Team name
                    </label>
                    <input
                        id="teamName"
                        className="create-team__input"
                        type="text"
                        placeholder="Inserisci nome"
                        value={teamName}
                        onChange={(event) => {
                        setTeamName(event.target.value);
                        }}
                    />
                    </div>

                    <ul className="team-panel__slots">
                    {Array.from({ length: 6 }).map((_, index) => {
                        const pokemon = selectedPokemons[index];

                        return (
                        <TeamSlot
                            key={index}
                            pokemon={pokemon}
                            index={index}
                            onRemove={handleRemovePokemon}
                        />
                        );
                    })}
                    </ul>

                    <div className="team-panel__actions">
                    <button
                        className="team-panel__save"
                        type="submit"
                        disabled={isSaving}
                    >
                        {isSaving ? "Salvataggio..." : "Salva team"}
                    </button>
                    </div>
                </form>
                </section>
            </aside>
            </div>
        </section>
)
}

export default CreateTeam