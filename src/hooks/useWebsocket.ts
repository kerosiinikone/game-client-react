import { useCallback, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { WebSocketMessage } from "react-use-websocket/dist/lib/types";

export const useGameWebSocket = () => {
  const [socket, __] = useState<string>(import.meta.env.VITE_SERVER_SOCKET);
  const [_, setMessageHistory] = useState<MessageEvent<any>[]>([]);
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

  return { lastMessage, handleSendMessage };
};
