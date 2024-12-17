import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { Vector3 } from "three";
import PCard from "./components/Card";
import Deck from "./components/Deck";
import TopCard from "./components/TopCard";
import { useGameWebSocket } from "./hooks/useWebsocket";
import { handleCommand, handleWinner, useGamestate } from "./state/game";
import type { Message } from "./types";

function Game() {
  // Do I need to consume the entire state?
  const state = useGamestate((state) => state);

  const { handleSendMessage, lastMessage: message } = useGameWebSocket();

  const x = Math.min(4 * (window.innerWidth / 1000), 4);
  const cameraPosition = new Vector3(x, 5, 2);

  function handleDeckClick() {
    if (state.isCurrentTurn) {
      if (state.wonTurn !== 0) handleWinner(state);

      const msg: Message = {
        Typ: state.playerId === 1 ? 7 : 8,
        PlayerId: state.playerId,
      };

      handleSendMessage(JSON.stringify(msg));
      state.setIsCurrentTurn(false);
    }
  }

  useEffect(() => {
    if (message != null) {
      handleCommand(state, message);
    }
  }, [message]);

  return (
    <div id="canvas-container">
      <Canvas
        onClick={handleDeckClick}
        camera={{ position: cameraPosition, rotation: [-1, 0, 0] }}
      >
        {state.player2Id != 0 && <Deck pos={[0, 0, -4]} color="blue" />}
        <Deck color="red" />
        {!state.isWar ? (
          <group>
            {state.enemyCards.length && (
              <PCard
                pos={[0, 0, -4]}
                inv={true}
                suit={state.enemyCards[
                  state.enemyCards.length - 1
                ].Suit.toLowerCase()}
                value={state.enemyCards[state.enemyCards.length - 1].Value}
              />
            )}
            {state.ownCards.length && (
              <PCard
                pos={[0, 0, 0]}
                inv={false}
                suit={state.ownCards[
                  state.ownCards.length - 1
                ].Suit.toLowerCase()}
                value={state.ownCards[state.ownCards.length - 1].Value}
              />
            )}
          </group>
        ) : (
          <group>
            {state.enemyCards.map((card, idx) => {
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
            {state.ownCards.map((card, idx) => {
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
        {state.ownScoreCards.map((tuple) => (
          <TopCard pos={[3, -2.5, 1]} rotation={[0, tuple[1], 0]} color="red" />
        ))}
        {state.enemyScoreCards.map((tuple) => (
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
