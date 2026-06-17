export interface TeamPokemon {
  id: number
  name: string
  sprite: string
  types: string[]
}

export interface PokemonDetails {
    id: number;
    name: string;
    sprite: string;
    types: string[];
    abilities: string[];
    moves: string[];
    stats: {
        hp: number;
        atk: number;
        def: number;
    };
}

export interface TeamComment {
  id: string;
  userId: string;
  userName: string;
  text: string; 
  createdAt: string;
}

export interface Team {
  id: string
  name: string
  ownerId: string
  authorName?: string
  game: string
  pokemons: TeamPokemon[]
  createdAt: string
  updatedAt: string
  isPublic?: boolean
  description?: string
  likes?: string[]
  comments?: TeamComment[]
}

export interface CreateTeamInput {
  name: string
  ownerId: string
  authorName: string
  game: string
  pokemons: TeamPokemon[]
}
