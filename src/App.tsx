import { useCallback, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { WebSocketMessage } from "react-use-websocket/dist/lib/types";

interface Message {
  Typ: number;
  Data?: string;
  PlayerId?: number;
}

function App() {
  const [socketUrl, _] = useState<string>("ws://localhost:3000");
  const [isCurrentTurn, setIsCurrentTurn] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<number>(0);
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
        case 5: // Player1Turn
          if (playerId === 1) {
            setIsCurrentTurn(true);
          } else {
            setIsCurrentTurn(false);
          }
          break;
        case 6: // Player2Turn
          if (playerId === 2) {
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
