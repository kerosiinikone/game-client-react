import {
  Decal,
  OrbitControls,
  PerspectiveCamera,
  useTexture,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import { WebSocketMessage } from "react-use-websocket/dist/lib/types";
import { Mesh, Vector3 } from "three";

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

const SOCKET_URL = "ws://localhost:3000";

function TopCard(
  {
    color,
  }: {
    color?: "blue" | "red";
  } = {
    color: "red",
  }
) {
  const deckRef = useRef<Mesh>(null);
  const cardTexture =
    color === "red" ? "/assets/redcard.png" : "/assets/bluecard.png";
  const texture = useTexture(cardTexture);

  return (
    <mesh ref={deckRef} position={[0, -2, -3]}>
      <meshBasicMaterial map={texture} polygonOffset polygonOffsetFactor={-1} />
      <boxGeometry args={[2, 0, 3]} />
    </mesh>
  );
}

function Deck(
  {
    pos,
    rotation,
    color,
  }: {
    pos?: [number, number, number];
    rotation?: [number, number, number];
    color?: "blue" | "red";
  } = {
    pos: [0, 0, 0],
    rotation: [0, 0, 0],
    color: "red",
  }
) {
  return (
    <group position={pos} rotation={rotation}>
      <TopCard color={color} />
      <mesh position={[0, -2.25, -3]}>
        <meshBasicMaterial color="white" />
        <boxGeometry args={[2, 0.5, 3]} />
      </mesh>
    </group>
  );
}

function App() {
  const [isCurrentTurn, setIsCurrentTurn] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<number>(0);
  const [player2Id, setPlayer2Id] = useState<number>(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [scoreCards, setScoreCards] = useState<Card[]>([]);
  const [__, setMessageHistory] = useState<MessageEvent<any>[]>([]);

  const { lastMessage, sendMessage: ____ } = useWebSocket(SOCKET_URL);

  const x = Math.min(4 * (window.innerWidth / 1000), 4);
  const cameraPosition = new Vector3(x, 5, 2);

  const handleDeckClick = useCallback(() => {
    if (isCurrentTurn && cards.length) {
    }
  }, [cards, playerId]);

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage));
      const data: Message = JSON.parse(lastMessage.data);
      switch (data.Typ) {
        case 1: // Handshake
          setPlayerId(data.PlayerId!);
          if (data.PlayerId === 2) {
            setPlayer2Id(1);
          }
          break;
        case 2: // Another player connected
          setPlayer2Id(data.PlayerId!);
          break;
        case 5: // Player1Turn + winning condition
          if (data.ScoreCards?.length) {
            setScoreCards([...scoreCards, ...data.ScoreCards]);
          }
          if (playerId === 1) {
            // Receive a card from the server
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

  // const handleClickSendMessage = useCallback(
  //   (msg: WebSocketMessage) => sendMessage(msg),
  //   []
  // );

  return (
    <div id="canvas-container">
      <Canvas
        onClick={handleDeckClick}
        camera={{ position: cameraPosition, rotation: [-0.8, 0, 0] }}
      >
        {player2Id != 0 && <Deck pos={[0, 0, -4]} color="blue" />}
        <Deck color="red" />
      </Canvas>
    </div>
  );
}

export default App;
