import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { Vector3 } from "three";
import PCard from "./interface/Card";
import Deck from "./interface/Deck";
import TopCard from "./interface/TopCard";
import { useHandleCommand } from "./hooks/useHandleCommand";
import { useGameWebSocket } from "./hooks/useWebsocket";
import { useGamestate } from "./state/game";
import type { Message } from "./types";

function Game() {
  const {
    isCurrentTurn,
    playerId,
    isWar,
    player2Id,
    ownCards,
    enemyCards,
    wonTurn,
    ownScoreCards,
    setIsCurrentTurn,
    enemyScoreCards,
    setWinner,
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
    setWinner: state.checkWinner,
    setIsCurrentTurn: state.setIsCurrentTurn,
  }));

  const { handleSendMessage, lastMessage: message } = useGameWebSocket();
  const { handleCommand } = useHandleCommand();

  const x = Math.min(4 * (window.innerWidth / 1000), 4);
  const cameraPosition = new Vector3(x, 5, 2);

  function handleDeckClick() {
    if (isCurrentTurn) {
      if (wonTurn !== 0) setWinner();

      const wsMsg: Message = {
        Typ: playerId === 1 ? 7 : 8,
        PlayerId: playerId,
      };

      handleSendMessage(JSON.stringify(wsMsg));
      setIsCurrentTurn(false);
    }
  }

  useEffect(() => {
    if (message != null) {
      handleCommand(message);
    }
  }, [message]);

  return (
    <div id="canvas-container">
      <Canvas
        onClick={handleDeckClick}
        camera={{ position: cameraPosition, rotation: [-1, 0, 0] }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        {player2Id != 0 && <Deck pos={[0, 0, -4]} color="blue" />}
        <Deck color="red" />

        <group>
          {enemyCards.length && (
            <PCard
              pos={[0, 0, -4]}
              inv={true}
              suit={
                !isWar
                  ? enemyCards[enemyCards.length - 1].Suit.toLowerCase()
                  : enemyCards[0].Suit.toLowerCase()
              }
              value={
                !isWar
                  ? enemyCards[enemyCards.length - 1].Value.toLowerCase()
                  : enemyCards[0].Value.toLowerCase()
              }
            />
          )}
          {ownCards.length && (
            <PCard
              pos={[0, 0, 0]}
              inv={false}
              suit={
                !isWar
                  ? ownCards[ownCards.length - 1].Suit.toLowerCase()
                  : ownCards[0].Suit.toLowerCase()
              }
              value={
                !isWar
                  ? ownCards[ownCards.length - 1].Value.toLowerCase()
                  : ownCards[0].Value.toLowerCase()
              }
            />
          )}
        </group>
        {isWar && (
          <group>
            {enemyCards.slice(1).map((card, idx) => {
              const offset = Math.ceil((idx + 1) / 2);
              return card.Suit ? (
                <PCard
                  pos={[offset + 1, 0, -4]}
                  inv={true}
                  suit={card.Suit.toLowerCase()}
                  value={card.Value}
                />
              ) : (
                <TopCard
                  endPos={[3 + offset, -2.5, -7]}
                  startPos={[0, 0, -4]}
                  r={[0, 0, 0]}
                  color="blue"
                />
              );
            })}
            {ownCards.slice(1).map((card, idx) => {
              const offset = Math.ceil((idx + 1) / 2);
              return card.Suit ? (
                <PCard
                  pos={[offset + 1, 0, 0]}
                  inv={false}
                  suit={card.Suit.toLowerCase()}
                  value={card.Value}
                />
              ) : (
                <TopCard
                  endPos={[3 + offset, -2.5, -3]}
                  startPos={[0, 0, 0]}
                  r={[0, 0, 0]}
                  color="red"
                />
              );
            })}
          </group>
        )}
        {ownScoreCards.map((tuple) => (
          <TopCard
            endPos={[3, -2.5, 1]}
            startPos={[3, -2.5, -3]}
            r={[0, tuple[1], 0]}
            animate="win"
            color="red"
          />
        ))}
        {enemyScoreCards.map((tuple) => (
          <TopCard
            endPos={[3, -2.5, -11]}
            startPos={[3, -2.5, -7]}
            r={[0, tuple[1], 0]}
            animate="win"
            color="blue"
          />
        ))}
      </Canvas>
    </div>
  );
}

export default Game;
