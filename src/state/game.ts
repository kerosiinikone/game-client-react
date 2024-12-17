import { createWithEqualityFn as create } from "zustand/traditional";
import { Card, Message, ScoreCardTuple } from "../types";
import { WebSocketMessage } from "react-use-websocket/dist/lib/types";

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
  setGameOver: () => void;
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
  setGameOver: () =>
    set(() => ({
      ownCards: [],
      enemyCards: [],
      enemyScoreCards: [],
      ownScoreCards: [],
      isWar: false,
      isCurrentTurn: false,
    })),
}));

export function handleWinner(state: GameState) {
  const ownCard = state.ownCards[state.ownCards.length - 1];
  const enemyCard = state.enemyCards[state.enemyCards.length - 1];

  let wonCards: ScoreCardTuple[] = [];

  if (state.isWar) {
    wonCards = [
      ...state.ownCards.map((card) => {
        const tuple = [card, Math.random() - 0.5] as ScoreCardTuple;
        return tuple;
      }),
      ...state.enemyCards.map((card) => {
        const tuple = [card, Math.random() - 0.5] as ScoreCardTuple;
        return tuple;
      }),
    ];
    state.setIsWar(false);
  } else {
    wonCards = [
      [ownCard, Math.random() - 0.5],
      [enemyCard, Math.random() - 0.5],
    ];
  }
  if (state.wonTurn == state.playerId) {
    state.addOwnScore(wonCards);
  } else {
    state.addEnemyScore(wonCards);
  }
  state.clearOwnCards();
  state.clearEnemyCards();
  state.setTurnWinner(0);
}

export function handleCommand(state: GameState, message: MessageEvent<any>) {
  let ownCard: Card;
  let enemyCard: Card;

  const data: Message = JSON.parse(message.data);

  if (data.Typ !== 9 && state.wonTurn !== 0) handleWinner(state);

  switch (data.Typ) {
    case 1: // Handshake
      state.setPlayerId(data.PlayerId!);
      if (data.PlayerId === 2) {
        state.setPlayer2Id(1);
      }
      break;
    case 2: // Another player connected
      state.setPlayer2Id(data.PlayerId!);
      break;
    case 5: // Player1Turn + winning condition
      if (state.playerId === 1) state.setIsCurrentTurn(true);
      if (data.Card && data.Card.Suit != "") {
        let receiveCards: Card[] = [];
        if (state.isWar) {
          receiveCards = [
            {
              Suit: "",
              Value: "",
            },
            data.Card,
          ];
        } else {
          receiveCards = [data.Card];
        }
        if (state.playerId === 2) {
          enemyCard = state.enemyCards[state.enemyCards.length - 1];
          ownCard = data.Card;
          state.addOwnCards(receiveCards);
        } else {
          enemyCard = data.Card;
          ownCard = state.ownCards[state.ownCards.length - 1];
          state.addEnemyCards(receiveCards);
        }
        if (data.Won) {
          state.setTurnWinner(state.playerId);
        } else if (!data.Won && !data.War) {
          state.setTurnWinner(state.player2Id);
        }
      }
      break;
    case 6: // Player2Turn
      if (state.playerId === 2) state.setIsCurrentTurn(true);
      if (data.Card && data.Card.Suit != "") {
        let receiveCards: Card[] = [];
        if (state.isWar) {
          receiveCards = [
            {
              Suit: "",
              Value: "",
            },
            data.Card,
          ];
        } else {
          receiveCards = [data.Card];
        }
        if (state.playerId === 2) {
          enemyCard = data.Card;
          ownCard = state.ownCards[state.ownCards.length - 1];
          state.addEnemyCards(receiveCards);
        } else {
          enemyCard = state.enemyCards[state.enemyCards.length - 1];
          ownCard = data.Card;
          state.addOwnCards(receiveCards);
        }
      }
      break;
    case 9:
      state.setGameOver();
      alert("Game over");
      break;
  }
  if (data.War && !state.isWar) {
    state.setIsWar(true);
    state.setEnemyCard(enemyCard!);
    state.setOwnCard(ownCard!);
  }
}
