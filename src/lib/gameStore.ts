import { create } from "zustand";

interface GameState {
  teamId: string | null;
  gameId: string | null;
  currentEnigma: any | null;
  setTeam: (teamId: string, gameId: string) => void;
  setCurrentEnigma: (enigma: any) => void;
}

export const useGameStore = create<GameState>((set) => ({
  teamId: null,
  gameId: null,
  currentEnigma: null,
  setTeam: (teamId, gameId) => set({ teamId, gameId }),
  setCurrentEnigma: (currentEnigma) => set({ currentEnigma }),
}));
