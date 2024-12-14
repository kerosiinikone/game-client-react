import { useCallback, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { WebSocketMessage } from "react-use-websocket/dist/lib/types";

interface Message {
  Typ: number;
  Data?: string;
  PlayerId?: number;
  Card?: Card;
  ScoreCards?: Card[];
}

interface Card {
  Suit: string;
  Value: string;
}

function App() {
  const [socketUrl, _] = useState<string>("ws://localhost:3000");
  const [isCurrentTurn, setIsCurrentTurn] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<number>(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [scoreCards, setScoreCards] = useState<Card[]>([]);
  const [__, setMessageHistory] = useState<MessageEvent<any>[]>([]);

  const { lastMessage, sendMessage } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage));
      const data: Message = JSON.parse(lastMessage.data);
      switch (data.Typ) {
        case 1: // Handshake
          if (playerId === 0) {
            setPlayerId(data.PlayerId!);
          }
          break;
        case 5: // Player1Turn + winning condition
          if (data.ScoreCards?.length) {
            setScoreCards([...scoreCards, ...data.ScoreCards]);
          }
          if (playerId === 1) {
            // Receive a card
            setCards([...cards, data.Card!]);
            setIsCurrentTurn(true);
          } else {
            setIsCurrentTurn(false);
          }
          break;
        case 6: // Player2Turn
          if (playerId === 2) {
            // Receive a card
            setCards([...cards, data.Card!]);
            setIsCurrentTurn(true);
          } else {
            setIsCurrentTurn(false);
          }
          break;
      }
    }
  }, [lastMessage]);

  const handleClickSendMessage = useCallback(
    (msg: WebSocketMessage) => sendMessage(msg),
    []
  );

  return (
    <>
      <h1>Player ID: {playerId}</h1>
      <h2>Current turn: {isCurrentTurn ? "Yes" : "No"}</h2>
      <h2>Won Cards:</h2>
      <ul>
        {scoreCards.map((card, index) => (
          <li key={index}>
            {card.Value} of {card.Suit}
          </li>
        ))}
      </ul>
      <h2>Drawn cards:</h2>
      <ul>
        {cards.map((card, index) => (
          <li key={index}>
            {card.Value} of {card.Suit}
          </li>
        ))}
      </ul>
      <button
        onClick={() => {
          if (isCurrentTurn) {
            const msg: Message = {
              Typ: playerId === 1 ? 7 : 8,
            };
            handleClickSendMessage(JSON.stringify(msg));
            setIsCurrentTurn(false);
          }
        }}
      >
        Pass turn
      </button>
    </>
  );
}

export default App;
