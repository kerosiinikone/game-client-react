import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { WebSocketMessage } from "react-use-websocket/dist/lib/types";
import { Vector3 } from "three";
import PCard from "./components/Card";
import Deck from "./components/Deck";
import TopCard from "./components/TopCard";
import type { Card, ScoreCardTuple } from "./types";
import { useGamestate } from "./state/game";

interface Message {
  Typ: number;
  Data?: string;
  PlayerId?: number;
  Card?: Card;
  Won?: boolean;
  War?: boolean;
}

const SOCKET_URL = "ws://localhost:3000";

function Game() {
  const [__, setMessageHistory] = useState<MessageEvent<any>[]>([]);
  const { lastMessage, sendMessage } = useWebSocket(SOCKET_URL, {
    shouldReconnect: () => true,
    reconnectInterval: 1000,
    reconnectAttempts: 1,
  });

  const {
    enemyCards,
    player2Id,
    ownCards,
    playerId,
    isCurrentTurn,
    isWar,
    wonTurn,
    ownScoreCards,
    enemyScoreCards,
    setTurnWinner,
    setPlayerId,
    setPlayer2Id,
    setIsCurrentTurn,
    clearOwnScoreCards,
    addOwnScore,
    clearEnemyScoreCards,
    clearOwnCards,
    clearEnemyCards,
    addEnemyScore,
    setEnemyCard,
    setOwnCard,
    addOwnCards,
    addEnemyCards,
    setIsWar,
  } = useGamestate((state) => ({
    isCurrentTurn: state.isCurrentTurn,
    playerId: state.playerId,
    isWar: state.isWar,
    player2Id: state.player2Id,
    ownCards: state.ownCards,
    enemyCards: state.enemyCards,
    wonTurn: state.wonTurn,
    ownScoreCards: state.ownScoreCards,
    enemyScoreCards: state.enemyScoreCards,
    clearOwnCards: state.clearOwnCards,
    setIsWar: state.setIsWar,
    setTurnWinner: state.setTurnWinner,
    setPlayerId: state.setPlayerId,
    setEnemyCard: state.setEnemyCard,
    setOwnCard: state.setOwnCard,
    clearEnemyScoreCards: state.clearEnemyScoreCards,
    addOwnScore: state.addOwnScore,
    clearEnemyCards: state.clearEnemyCards,
    clearOwnScoreCards: state.clearOwnScoreCards,
    setPlayer2Id: state.setPlayer2Id,
    addOwnCards: state.addOwnCards,
    addEnemyCards: state.addEnemyCards,
    setIsCurrentTurn: state.setIsCurrentTurn,
    addEnemyScore: state.addEnemyScore,
  }));

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
        addOwnScore(wonCards);
        clearOwnCards();
        clearEnemyCards();
        setTurnWinner(0);
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
        addEnemyScore(wonCards);
        clearOwnCards();
        clearEnemyCards();
        setTurnWinner(0);
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
    if (lastMessage && lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage));
      const data: Message = JSON.parse(lastMessage.data);

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
        addOwnScore(wonCards);
        clearOwnCards();
        clearEnemyCards();
        setTurnWinner(0);
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
        addEnemyScore(wonCards);
        clearOwnCards();
        clearEnemyCards();
        setTurnWinner(0);
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
            addOwnCards(receiveCards);
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
            addEnemyCards(receiveCards);
          }
          if (data.Won && enemyCard.Suit != "" && ownCard.Suit != "") {
            setTurnWinner(playerId);
          } else if (
            !data.Won &&
            enemyCard.Suit != "" &&
            ownCard.Suit != "" &&
            !data.War
          ) {
            setTurnWinner(player2Id);
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
            addOwnCards(receiveCards);
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
            addEnemyCards(receiveCards);
          }
          break;
        case 9: // Game over
          clearOwnCards();
          clearEnemyCards();
          clearEnemyScoreCards();
          clearOwnScoreCards();
          setIsWar(false);
          setIsCurrentTurn(false);
          setTurnWinner(0);
          alert("Game over");
          break;
      }
      if (data.War && !isWar) {
        setIsWar(true);
        setEnemyCard(enemyCard);
        setOwnCard(ownCard);
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
              <PCard
                pos={[0, 0, -4]}
                inv={true}
                suit={enemyCards[enemyCards.length - 1].Suit.toLowerCase()}
                value={enemyCards[enemyCards.length - 1].Value}
              />
            )}
            {ownCards.length && (
              <PCard
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
                <PCard
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
                <PCard
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

export default Game;
