import { combine } from "zustand/middleware";
import { createWithEqualityFn as create } from "zustand/traditional";
import { Card, ScoreCardTuple } from "../types";

// Set up the initial state from a config field at hanshake

export type GameStateVars = {
  isCurrentTurn: boolean;
  playerId: number;
  isWar: boolean;
  player2Id: number;
  ownCards: Card[];
  enemyCards: Card[];
  wonTurn: number;
  ownScoreCards: ScoreCardTuple[];
  enemyScoreCards: ScoreCardTuple[];
};

export type GameStateModifiers = {
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
  setGameOver: () => void;

  checkWinner: () => void;
};

export type GameState = GameStateVars & GameStateModifiers;

const initialState = (): GameStateVars => ({
  isCurrentTurn: false,
  playerId: 0,
  isWar: false,
  player2Id: 0,
  ownCards: [],
  enemyCards: [],
  wonTurn: 0,
  ownScoreCards: [],
  enemyScoreCards: [],
});

export const useGamestate = create(
  combine<GameStateVars, GameStateModifiers>(initialState(), (set) => ({
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
    setGameOver: () =>
      set(() => ({
        ownCards: [],
        enemyCards: [],
        enemyScoreCards: [],
        ownScoreCards: [],
        isWar: false,
        isCurrentTurn: false,
      })),
    checkWinner: () =>
      set((state) => {
        let enemyScore: ScoreCardTuple[] = state.enemyScoreCards;
        let ownScore: ScoreCardTuple[] = state.ownScoreCards;

        const wonCards: ScoreCardTuple[] = getWonCards(state);

        if (state.wonTurn == state.playerId) {
          ownScore = ownScore.concat(wonCards);
        } else {
          enemyScore = enemyScore.concat(wonCards);
        }
        return {
          wonTurn: 0,
          isWar: false,
          enemyCards: [],
          ownCards: [],
          ownScoreCards: ownScore,
          enemyScoreCards: enemyScore,
        };
      }),
    reset: () => {
      set(initialState);
    },
  }))
);

function getWonCards<T extends GameStateVars>(state: T): ScoreCardTuple[] {
  if (state.isWar) {
    return [
      ...state.ownCards.map((card) => {
        const tuple = [card, Math.random() - 0.5] as ScoreCardTuple;
        return tuple;
      }),
      ...state.enemyCards.map((card) => {
        const tuple = [card, Math.random() - 0.5] as ScoreCardTuple;
        return tuple;
      }),
    ];
  }
  return [
    [state.ownCards[state.ownCards.length - 1], Math.random() - 0.5],
    [state.enemyCards[state.enemyCards.length - 1], Math.random() - 0.5],
  ];
}
