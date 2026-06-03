import { create } from 'zustand'

interface Team {
  id: string
  name: string
  color: string
  game_id: string
  access_code: string
}

interface GameState {
  teamId: string | null
  teamName: string | null
  teamColor: string | null
  gameId: string | null
  currentEnigma: any | null
  setTeam: (team: Team) => void
  setCurrentEnigma: (enigma: any) => void
  clear: () => void
}

export const useGameStore = create<GameState>((set) => ({
  teamId: null,
  teamName: null,
  teamColor: null,
  gameId: null,
  currentEnigma: null,
  setTeam: (team) => set({
    teamId: team.id,
    teamName: team.name,
    teamColor: team.color,
    gameId: team.game_id,
  }),
  setCurrentEnigma: (enigma) => set({ currentEnigma: enigma }),
  clear: () => set({
    teamId: null,
    teamName: null,
    teamColor: null,
    gameId: null,
    currentEnigma: null,
  }),
}))
