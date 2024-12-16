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
  War?: boolean;
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
  const [socket, _] = useState<string>(SOCKET_URL); // Reset the socket when game is over
  const [__, setMessageHistory] = useState<MessageEvent<any>[]>([]);

  const [isCurrentTurn, setIsCurrentTurn] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<number>(0);
  const [isWar, setIsWar] = useState<boolean>(false);
  const [player2Id, setPlayer2Id] = useState<number>(0);
  const [ownCards, setOwnCards] = useState<Card[]>([]);
  const [enemyCards, setEnemyCards] = useState<Card[]>([]);
  const [wonTurn, setWonTurn] = useState<number>(0);
  const [ownScoreCards, setScoreOwnCards] = useState<ScoreCardTuple[]>([]);
  const [enemyScoreCards, setScoreEnemyCards] = useState<ScoreCardTuple[]>([]);

  const { lastMessage, sendMessage } = useWebSocket(socket, {
    shouldReconnect: () => true,
    reconnectInterval: 1000,
    reconnectAttempts: 1,
  });

  const x = Math.min(4 * (window.innerWidth / 1000), 4);
  const cameraPosition = new Vector3(x, 5, 2);

  const handleDeckClick = () => {
    if (isCurrentTurn) {
      if (playerId != 0 && wonTurn == playerId) {
        const ownCard = ownCards[ownCards.length - 1];
        const enemyCard = enemyCards[enemyCards.length - 1];

        let wonCards: ScoreCardTuple[] = [];

        if (isWar) {
          wonCards = [
            ...ownCards.map((card) => {
              const tuple = [card, Math.random() - 0.5] as ScoreCardTuple;
              return tuple;
            }),
            ...enemyCards.map((card) => {
              const tuple = [card, Math.random() - 0.5] as ScoreCardTuple;
              return tuple;
            }),
          ];
          setIsWar(false);
        } else {
          wonCards = [
            [ownCard, Math.random() - 0.5],
            [enemyCard, Math.random() - 0.5],
          ];
        }
        setScoreOwnCards([...ownScoreCards, ...wonCards]);
        setOwnCards([]);
        setEnemyCards([]);
        setWonTurn(0);
      } else if (player2Id != 0 && wonTurn == player2Id) {
        const ownCard = ownCards[ownCards.length - 1];
        const enemyCard = enemyCards[enemyCards.length - 1];

        let wonCards: ScoreCardTuple[] = [];

        if (isWar) {
          wonCards = [
            ...ownCards.map((card) => {
              const tuple = [card, Math.random() - 0.5] as ScoreCardTuple;
              return tuple;
            }),
            ...enemyCards.map((card) => {
              const tuple = [card, Math.random() - 0.5] as ScoreCardTuple;
              return tuple;
            }),
          ];
          setIsWar(false);
        } else {
          wonCards = [
            [ownCard, Math.random() - 0.5],
            [enemyCard, Math.random() - 0.5],
          ];
        }
        setScoreEnemyCards([...enemyScoreCards, ...wonCards]);
        setOwnCards([]);
        setEnemyCards([]);
        setWonTurn(0);
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
    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage));
      const data: Message = JSON.parse(lastMessage.data);
      console.log(player2Id, playerId, wonTurn);

      if (playerId != 0 && wonTurn == playerId && data.Typ !== 9) {
        const ownCard = ownCards[ownCards.length - 1];
        const enemyCard = enemyCards[enemyCards.length - 1];

        let wonCards: ScoreCardTuple[] = [];

        if (isWar) {
          wonCards = [
            ...ownCards.map((card) => {
              const tuple = [card, Math.random() - 0.5] as ScoreCardTuple;
              return tuple;
            }),
            ...enemyCards.map((card) => {
              const tuple = [card, Math.random() - 0.5] as ScoreCardTuple;
              return tuple;
            }),
          ];
          setIsWar(false);
        } else {
          wonCards = [
            [ownCard, Math.random() - 0.5],
            [enemyCard, Math.random() - 0.5],
          ];
        }
        setScoreOwnCards([...ownScoreCards, ...wonCards]);
        setOwnCards([]);
        setEnemyCards([]);
        setWonTurn(0);
      } else if (player2Id != 0 && wonTurn == player2Id && data.Typ !== 9) {
        const ownCard = ownCards[ownCards.length - 1];
        const enemyCard = enemyCards[enemyCards.length - 1];

        let wonCards: ScoreCardTuple[] = [];

        if (isWar) {
          wonCards = [
            ...ownCards.map((card) => {
              const tuple = [card, Math.random() - 0.5] as ScoreCardTuple;
              return tuple;
            }),
            ...enemyCards.map((card) => {
              const tuple = [card, Math.random() - 0.5] as ScoreCardTuple;
              return tuple;
            }),
          ];
          setIsWar(false);
        } else {
          wonCards = [
            [ownCard, Math.random() - 0.5],
            [enemyCard, Math.random() - 0.5],
          ];
        }
        setScoreEnemyCards([...enemyScoreCards, ...wonCards]);
        setOwnCards([]);
        setEnemyCards([]);
        setWonTurn(0);
      }

      let ownCard: Card = { Suit: "", Value: "" };
      let enemyCard: Card = { Suit: "", Value: "" };

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
          if (playerId === 1) setIsCurrentTurn(true);

          if (playerId === 2 && data.Card?.Suit != "") {
            // Receive a card from the server
            let receiveCards: Card[] = [];
            if (isWar) {
              receiveCards = [
                {
                  Suit: "",
                  Value: "",
                },
                data.Card!,
              ];
            } else {
              receiveCards = [data.Card!];
            }
            enemyCard = enemyCards[enemyCards.length - 1];
            ownCard = data.Card!;
            setOwnCards([...ownCards, ...receiveCards]);
          } else if (playerId === 1 && data.Card?.Suit != "") {
            let receiveCards: Card[] = [];
            if (isWar) {
              receiveCards = [
                {
                  Suit: "",
                  Value: "",
                },
                data.Card!,
              ];
            } else {
              receiveCards = [data.Card!];
            }
            enemyCard = data.Card!;
            ownCard = ownCards[ownCards.length - 1];
            setEnemyCards([...enemyCards, ...receiveCards]);
          }
          if (data.Won && enemyCard.Suit != "" && ownCard.Suit != "") {
            setWonTurn(playerId);
          } else if (
            !data.Won &&
            enemyCard.Suit != "" &&
            ownCard.Suit != "" &&
            !data.War
          ) {
            setWonTurn(player2Id);
          }
          break;
        case 6: // Player2Turn
          if (playerId === 2) setIsCurrentTurn(true);
          if (playerId === 1 && data.Card) {
            // Receive a card from the server
            let receiveCards: Card[] = [];
            if (isWar) {
              receiveCards = [
                {
                  Suit: "",
                  Value: "",
                },
                data.Card!,
              ];
            } else {
              receiveCards = [data.Card!];
            }
            enemyCard = enemyCards[enemyCards.length - 1];
            ownCard = data.Card!;
            setOwnCards([...ownCards, ...receiveCards]);
          } else if (playerId === 2 && data.Card) {
            let receiveCards: Card[] = [];
            if (isWar) {
              receiveCards = [
                {
                  Suit: "",
                  Value: "",
                },
                data.Card!,
              ];
            } else {
              receiveCards = [data.Card!];
            }
            enemyCard = data.Card!;
            ownCard = ownCards[ownCards.length - 1];
            setEnemyCards([...enemyCards, ...receiveCards]);
          }
          break;
        case 9: // Game over
          setOwnCards([]);
          setEnemyCards([]);
          setScoreEnemyCards([]);
          setScoreOwnCards([]);
          setIsCurrentTurn(false);
          setWonTurn(0);
          alert("Game over");
          break;
      }
      if (data.War && !isWar) {
        setIsWar(true);
        setEnemyCards([enemyCard]);
        setOwnCards([ownCard]);
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
        {!isWar ? (
          <group>
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
          </group>
        ) : (
          <group>
            {enemyCards.map((card, idx) => {
              const offset = Math.ceil((idx + 1) / 2);
              return card && card.Suit != "" ? (
                <Card
                  pos={[offset - 1, 0, -4]}
                  inv={true}
                  suit={card.Suit.toLowerCase()}
                  value={card.Value}
                />
              ) : (
                <TopCard
                  pos={[3 + offset - 1, -2.5, -7]}
                  rotation={[0, 0, 0]}
                  color="blue"
                />
              );
            })}
            {ownCards.map((card, idx) => {
              const offset = Math.ceil((idx + 1) / 2);
              return card && card.Suit != "" ? (
                <Card
                  pos={[offset - 1, 0, 0]}
                  inv={false}
                  suit={card.Suit.toLowerCase()}
                  value={card.Value}
                />
              ) : (
                <TopCard
                  pos={[3 + offset - 1, -2.5, -3]}
                  rotation={[0, 0, 0]}
                  color="red"
                />
              );
            })}
          </group>
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
