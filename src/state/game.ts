import { createWithEqualityFn as create } from "zustand/traditional";
import { Card, ScoreCardTuple } from "../types";

type GameState = {
  isCurrentTurn: boolean;
  playerId: number;
  isWar: boolean;
  player2Id: number;
  ownCards: Card[];
  enemyCards: Card[];
  wonTurn: number;
  ownScoreCards: ScoreCardTuple[];
  enemyScoreCards: ScoreCardTuple[];

  addEnemyScore: (wonCards: ScoreCardTuple[]) => void;
  setTurnWinner: (wonTurn: number) => void;
  setPlayerId: (playerId: number) => void;
  setPlayer2Id: (player2Id: number) => void;
  setIsCurrentTurn: (isCurrentTurn: boolean) => void;
  setIsWar: (isWar: boolean) => void;
  addOwnScore: (wonCards: ScoreCardTuple[]) => void;
  clearEnemyScoreCards: () => void;
  clearOwnScoreCards: () => void;
  clearOwnCards: () => void;
  clearEnemyCards: () => void;
  addOwnCards: (receive: Card[]) => void;
  addEnemyCards: (receive: Card[]) => void;
  setEnemyCard: (enemyCard: Card) => void;
  setOwnCard: (ownCard: Card) => void;
};

export const useGamestate = create<GameState>((set) => ({
  isCurrentTurn: false,
  playerId: 0,
  isWar: false,
  player2Id: 0,
  ownCards: [],
  enemyCards: [],
  wonTurn: 0,
  ownScoreCards: [],
  enemyScoreCards: [],
  setIsWar: (isWar: boolean) => set({ isWar }),
  clearOwnCards: () => set({ ownCards: [] }),
  clearEnemyCards: () => set({ enemyCards: [] }),
  setTurnWinner: (wonTurn: number) => set({ wonTurn }),
  setPlayerId: (playerId: number) => set({ playerId }),
  setPlayer2Id: (player2Id: number) => set({ player2Id }),
  setIsCurrentTurn: (isCurrentTurn: boolean) => set({ isCurrentTurn }),
  addEnemyScore: (wonCards: ScoreCardTuple[]) =>
    set((state) => ({
      enemyScoreCards: state.enemyScoreCards.concat(wonCards),
    })),
  clearEnemyScoreCards: () => set({ enemyScoreCards: [] }),
  addOwnScore: (wonCards: ScoreCardTuple[]) =>
    set((state) => ({
      ownScoreCards: state.ownScoreCards.concat(wonCards),
    })),
  clearOwnScoreCards: () => set({ ownScoreCards: [] }),
  addOwnCards: (receive: Card[]) =>
    set((state) => ({
      ownCards: state.ownCards.concat(receive),
    })),
  addEnemyCards: (receive: Card[]) =>
    set((state) => ({
      enemyCards: state.enemyCards.concat(receive),
    })),
  setEnemyCard: (enemyCard: Card) => set({ enemyCards: [enemyCard] }),
  setOwnCard: (ownCard: Card) => set({ ownCards: [ownCard] }),
}));
