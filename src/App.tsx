import { useTexture } from "@react-three/drei";
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
  Won?: boolean;
}

interface Card {
  Suit: string;
  Value: string;
}

type ScoreCardTuple = [Card, number];

const SOCKET_URL = "ws://localhost:3000";

function Card({
  suit,
  value,
  inv,
  pos,
}: {
  suit: string;
  value: string;
  pos: [number, number, number];
  inv: boolean;
}) {
  const cardTexture = `/assets/cards/${value}_of_${suit}.png`;
  const texture = useTexture(cardTexture);

  return (
    <group position={pos}>
      <mesh position={[3, -2.5, -3]} rotation={[0, inv ? Math.PI : 0, 0]}>
        <meshBasicMaterial map={texture} />
        <boxGeometry args={[2, 0, 3]} />
      </mesh>
    </group>
  );
}

function TopCard(
  {
    color,
    pos,
    rotation,
  }: {
    color?: "blue" | "red";
    pos?: [number, number, number];
    rotation?: [number, number, number];
  } = {
    color: "red",
    pos: [0, 0, 0],
    rotation: [0, 0, 0],
  }
) {
  const deckRef = useRef<Mesh>(null);
  const cardTexture =
    color === "red" ? "/assets/redcard.png" : "/assets/bluecard.png";
  const texture = useTexture(cardTexture);

  return (
    <mesh ref={deckRef} position={pos} rotation={rotation}>
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
      <TopCard pos={[0, -2, -3]} color={color} />
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
  const [ownCards, setOwnCards] = useState<Card[]>([]);
  const [enemyCards, setEnemyCards] = useState<Card[]>([]);
  const [won, setWon] = useState<number>(0);
  const [ownScoreCards, setScoreOwnCards] = useState<ScoreCardTuple[]>([]);
  const [enemyScoreCards, setScoreEnemyCards] = useState<ScoreCardTuple[]>([]);
  const [__, setMessageHistory] = useState<MessageEvent<any>[]>([]);

  const { lastMessage, sendMessage } = useWebSocket(SOCKET_URL);

  const x = Math.min(4 * (window.innerWidth / 1000), 4);
  const cameraPosition = new Vector3(x, 5, 2);

  const handleDeckClick = () => {
    if (isCurrentTurn) {
      if (playerId != 0 && won == playerId) {
        const rotateY1 = Math.random() - 0.5;
        const rotateY2 = Math.random() - 0.5;

        const ownCard = ownCards[ownCards.length - 1];
        const enemyCard = enemyCards[enemyCards.length - 1];

        setScoreOwnCards([
          ...ownScoreCards,
          [ownCard, rotateY1],
          [enemyCard, rotateY2],
        ]);
        setOwnCards([]);
        setEnemyCards([]);
        setWon(0);
      } else if (player2Id != 0 && won == player2Id) {
        const rotateY1 = Math.random() - 0.5;
        const rotateY2 = Math.random() - 0.5;

        const ownCard = ownCards[ownCards.length - 1];
        const enemyCard = enemyCards[enemyCards.length - 1];

        setScoreEnemyCards([
          ...ownScoreCards,
          [ownCard, rotateY1],
          [enemyCard, rotateY2],
        ]);
        setOwnCards([]);
        setEnemyCards([]);
        setWon(0);
      }
      const msg: Message = {
        Typ: playerId === 1 ? 7 : 8,
        PlayerId: playerId,
      };

      handleSendMessage(JSON.stringify(msg));
      setIsCurrentTurn(false);
    }
  };

  useEffect(() => {
    if (playerId != 0 && won == playerId) {
      const rotateY1 = Math.random() - 0.5;
      const rotateY2 = Math.random() - 0.5;

      const ownCard = ownCards[ownCards.length - 1];
      const enemyCard = enemyCards[enemyCards.length - 1];

      setScoreOwnCards([
        ...ownScoreCards,
        [ownCard, rotateY1],
        [enemyCard, rotateY2],
      ]);
      setOwnCards([]);
      setEnemyCards([]);
      setWon(0);
    } else if (player2Id != 0 && won == player2Id) {
      const rotateY1 = Math.random() - 0.5;
      const rotateY2 = Math.random() - 0.5;

      const ownCard = ownCards[ownCards.length - 1];
      const enemyCard = enemyCards[enemyCards.length - 1];

      setScoreEnemyCards([
        ...ownScoreCards,
        [ownCard, rotateY1],
        [enemyCard, rotateY2],
      ]);
      setOwnCards([]);
      setEnemyCards([]);
      setWon(0);
    }
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
          let ownCard: Card = { Suit: "", Value: "" };
          let enemyCard: Card = { Suit: "", Value: "" };

          if (playerId === 1) setIsCurrentTurn(true);
          if (playerId === 2 && data.Card?.Suit != "") {
            // Receive a card from the server
            enemyCard = enemyCards[enemyCards.length - 1];
            ownCard = data.Card!;
            setOwnCards([...ownCards, data.Card!]);
          } else if (playerId === 1 && data.Card?.Suit != "") {
            enemyCard = data.Card!;
            ownCard = ownCards[ownCards.length - 1];
            setEnemyCards([...enemyCards, data.Card!]);
          }
          if (data.Won && enemyCard.Suit != "" && ownCard.Suit != "") {
            setWon(playerId);
          } else if (!data.Won && enemyCard.Suit != "" && ownCard.Suit != "") {
            setWon(player2Id);
          }
          break;
        case 6: // Player2Turn
          if (playerId === 2) setIsCurrentTurn(true);
          if (playerId === 1 && data.Card) {
            // Receive a card from the server
            setOwnCards([...ownCards, data.Card!]);
          } else if (playerId === 2 && data.Card) {
            setEnemyCards([...enemyCards, data.Card!]);
          }
          break;
      }
    }
  }, [lastMessage]);

  const handleSendMessage = useCallback(
    (msg: WebSocketMessage) => sendMessage(msg),
    []
  );

  return (
    <div id="canvas-container">
      <Canvas
        onClick={handleDeckClick}
        camera={{ position: cameraPosition, rotation: [-1, 0, 0] }}
      >
        {player2Id != 0 && <Deck pos={[0, 0, -4]} color="blue" />}
        <Deck color="red" />
        {enemyCards.length && (
          <Card
            pos={[0, 0, -4]}
            inv={true}
            suit={enemyCards[enemyCards.length - 1].Suit.toLowerCase()}
            value={enemyCards[enemyCards.length - 1].Value}
          />
        )}
        {ownCards.length && (
          <Card
            pos={[0, 0, 0]}
            inv={false}
            suit={ownCards[ownCards.length - 1].Suit.toLowerCase()}
            value={ownCards[ownCards.length - 1].Value}
          />
        )}
        {ownScoreCards.map((tuple) => (
          <TopCard pos={[3, -2.5, 1]} rotation={[0, tuple[1], 0]} color="red" />
        ))}
        {enemyScoreCards.map((tuple) => (
          <TopCard
            pos={[3, -2.5, -11]}
            rotation={[0, tuple[1], 0]}
            color="blue"
          />
        ))}
      </Canvas>
    </div>
  );
}

export default App;
