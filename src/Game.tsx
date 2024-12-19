import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useMemo } from "react";
import { Vector3 } from "three";
import PCard from "./interface/Card";
import Deck from "./interface/Deck";
import TopCard from "./interface/TopCard";
import { useHandleCommand } from "./hooks/useHandleCommand";
import { useGameWebSocket } from "./hooks/useWebsocket";
import { useGamestate } from "./state/game";
import type { Message } from "./types";

function Game() {
  const game = useGamestate((state) => state);

  const { handleSendMessage, lastMessage: message } = useGameWebSocket();
  const { handleCommand } = useHandleCommand();

  const x = Math.min(4 * (window.innerWidth / 1000), 4);
  const cameraPosition = new Vector3(x, 5, 2);

  function handleDeckClick() {
    if (game.isCurrentTurn) {
      if (game.wonTurn !== 0) game.checkWinner();

      const wsMsg: Message = {
        Typ: game.playerId === 1 ? 7 : 8,
        PlayerId: game.playerId,
      };

      handleSendMessage(JSON.stringify(wsMsg));
      game.setIsCurrentTurn(false);
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
        {game.player2Id != 0 && <Deck pos={[0, 0, -4]} color="blue" />}
        <Deck color="red" />

        <group>
          {game.enemyCards.length && (
            <PCard
              pos={[0, 0, -4]}
              inv={true}
              suit={
                !game.isWar
                  ? game.getLastEnemySuite()
                  : game.getFirstEnemySuite()
              }
              value={
                !game.isWar
                  ? game.getLastEnemyValue()
                  : game.getFirstEnemyValue()
              }
            />
          )}
          {game.ownCards.length && (
            <PCard
              pos={[0, 0, 0]}
              inv={false}
              suit={
                !game.isWar ? game.getLastOwnSuite() : game.getFirstOwnSuite()
              }
              value={
                !game.isWar ? game.getLastOwnValue() : game.getFirstOwnValue()
              }
            />
          )}
        </group>
        {game.isWar && (
          <group>
            {game.enemyCards.slice(1).map((card, idx) => {
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
            {game.ownCards.slice(1).map((card, idx) => {
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
        {game.ownScoreCards.map((tuple) => (
          <TopCard
            endPos={[3, -2.5, 1]}
            startPos={[3, -2.5, -3]}
            r={[0, tuple[1], 0]}
            animate="win"
            color="red"
          />
        ))}
        {game.enemyScoreCards.map((tuple) => (
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
