import { animated } from "@react-spring/three";
import { useTexture } from "@react-three/drei";
import { useRef } from "react";
import { Mesh } from "three";
import { DEFAULT_DECK_POSITION, DEFAULT_TABLE_POSITION } from "../constants";
import useCardAnimation from "../hooks/useCardAnimation";

interface CardProps {
  suit: string;
  value: string;
  pos: [number, number, number];
  inv: boolean;
}

const Card = ({ suit, value, pos, inv }: CardProps) => {
  const cardTexture = `/assets/cards/${value}_of_${suit}.png`;
  const texture = useTexture(cardTexture);
  const meshRef = useRef<Mesh>(null);

  const { position, rotation } = useCardAnimation({
    animate: "deal",
    meshRef,
    endPos: DEFAULT_TABLE_POSITION,
    startPos: DEFAULT_DECK_POSITION,
    endR: [0, inv ? Math.PI : 0, 0],
    startR: [0, Math.PI, 0],
    deps: [suit, value],
  });

  return (
    <group position={pos}>
      <animated.mesh ref={meshRef} position={position} rotation={rotation}>
        <meshBasicMaterial map={texture} />
        <boxGeometry args={[2, 0, 3]} />
      </animated.mesh>
    </group>
  );
};

export default Card;
