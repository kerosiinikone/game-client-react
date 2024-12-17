import { useState, useEffect, useCallback } from "react";
import useWebSocket from "react-use-websocket";
import { WebSocketMessage } from "react-use-websocket/dist/lib/types";

const SOCKET_URL = "ws://localhost:3000";

export const useGameWebSocket = () => {
  const [socket, _] = useState<string>(SOCKET_URL);
  const [messageHistory, setMessageHistory] = useState<MessageEvent<any>[]>([]);
  const { lastMessage, sendMessage } = useWebSocket(socket, {
    shouldReconnect: () => true,
    reconnectInterval: 1000,
    reconnectAttempts: 1,
  });

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage));
    }
  }, [lastMessage]);

  const handleSendMessage = useCallback(
    (msg: WebSocketMessage) => sendMessage(msg),
    []
  );

  return { lastMessage, handleSendMessage, messageHistory };
};
