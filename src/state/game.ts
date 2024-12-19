import { combine } from "zustand/middleware";
import { createWithEqualityFn as create } from "zustand/traditional";
import { Card, ScoreCardTuple } from "../types";

type GameStateVars = {
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

type GameStateModifiers = {
  setTurnWinner: (wonTurn: number) => void;
  setPlayerId: (playerId: number) => void;
  setPlayer2Id: (player2Id: number) => void;
  setIsCurrentTurn: (isCurrentTurn: boolean) => void;
  setIsWar: (isWar: boolean) => void;
  addOwnCards: (receive: Card[]) => void;
  addEnemyCards: (receive: Card[]) => void;
  setEnemyCard: (enemyCard: Card) => void;
  setOwnCard: (ownCard: Card) => void;
  setGameOver: () => void;

  checkWinner: () => void;
  reset: () => void;
  getLastOwnSuite: () => string;
  getLastEnemySuite: () => string;
  getFirstEnemySuite: () => string;
  getFirstOwnSuite: () => string;
  getLastOwnValue: () => string;
  getLastEnemyValue: () => string;
  getFirstOwnValue: () => string;
  getFirstEnemyValue: () => string;
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
  combine<GameStateVars, GameStateModifiers>(initialState(), (set, get) => ({
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
    setTurnWinner: (wonTurn: number) => set({ wonTurn }),
    setPlayerId: (playerId: number) => set({ playerId }),
    setPlayer2Id: (player2Id: number) => set({ player2Id }),
    setIsCurrentTurn: (isCurrentTurn: boolean) => set({ isCurrentTurn }),
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
        wonTurn: 0,
        enemyScoreCards: [],
        ownScoreCards: [],
        isWar: false,
        isCurrentTurn: false,
      })),

    checkWinner: () =>
      set((state) => {
        let enemyScore = state.enemyScoreCards;
        let ownScore = state.ownScoreCards;
        const wonCards = getWonCards(state);

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
    getLastOwnSuite: () =>
      get().ownCards[get().ownCards.length - 1].Suit.toLowerCase(),
    getLastEnemySuite: () =>
      get().enemyCards[get().enemyCards.length - 1].Suit.toLowerCase(),
    getFirstEnemySuite: () => get().enemyCards[0].Suit.toLowerCase(),
    getFirstOwnSuite: () => get().ownCards[0].Suit.toLowerCase(),
    getLastOwnValue: () => get().ownCards[get().ownCards.length - 1].Value,
    getLastEnemyValue: () =>
      get().enemyCards[get().enemyCards.length - 1].Value,
    getFirstOwnValue: () => get().ownCards[0].Value,
    getFirstEnemyValue: () => get().enemyCards[0].Value,
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
