import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { Vector3 } from "three";
import PCard from "./components/Card";
import Deck from "./components/Deck";
import TopCard from "./components/TopCard";
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
