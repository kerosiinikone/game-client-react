import { useCallback } from "react";
import type { Card, Message } from "../types";
import { GameState, useGamestate } from "../state/game";
import { MessageType } from "../types";

export const useHandleCommand = () => {
  const state = useGamestate((state) => state);

  const handleCommand = useCallback(
    (message: MessageEvent<any>) => {
      let ownCard,
        enemyCard: Card | null = null;
      let data: Message;

      try {
        data = JSON.parse(message.data) as Message;
      } catch (error) {
        console.error("Invalid message received", message);
        return;
      }

      if (data.Typ !== 9 && state.wonTurn !== 0) state.checkWinner();

      switch (data.Typ as MessageType) {
        case MessageType.Handshake:
          handleHandshake(state, data);
          break;
        case MessageType.PlayerJoined:
          state.setPlayer2Id(data.PlayerId!);
          break;
        case MessageType.Player1Turn:
          [ownCard, enemyCard] = handlePlayer1Turn(data);
          break;
        case MessageType.Player2Turn:
          [ownCard, enemyCard] = handlePlayer2Turn(data);
          break;
        case MessageType.GameOver:
          state.setGameOver();
          alert("Game over");
          break;
        default:
          console.error("Invalid message received", data);
          break;
      }
      if (data.War && !state.isWar && ownCard && enemyCard) {
        state.setIsWar(true);
        state.setEnemyCard(enemyCard);
        state.setOwnCard(ownCard);
      }
    },
    [state]
  );

  const handleHandshake = useCallback((state: GameState, data: Message) => {
    state.setPlayerId(data.PlayerId!);
    if (data.PlayerId === 2) {
      state.setPlayer2Id(1);
    }
  }, []);

  const handlePlayer1Turn = useCallback(
    (data: Message) => {
      let ownCard,
        enemyCard: Card | null = null;

      if (state.playerId === 1) state.setIsCurrentTurn(true);
      if (data.Card?.Suit && data.Card?.Value) {
        const receiveCards = getReceivedCards(state, data);

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
      return [ownCard, enemyCard] as const;
    },
    [state]
  );

  const handlePlayer2Turn = useCallback(
    (data: Message) => {
      let ownCard,
        enemyCard: Card | null = null;

      if (state.playerId === 2) state.setIsCurrentTurn(true);
      if (data.Card?.Suit && data.Card?.Value) {
        const receiveCards = getReceivedCards(state, data);

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
      return [ownCard, enemyCard] as const;
    },
    [state]
  );

  return { handleCommand };
};

function getReceivedCards(state: GameState, data: Message) {
  let receiveCards: Card[] = [];
  if (!data.Card?.Suit || !data.Card?.Value) {
    return receiveCards;
  }
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
  return receiveCards;
}
