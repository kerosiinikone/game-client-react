import { animated } from "@react-spring/three";
import { useTexture } from "@react-three/drei";
import { useRef } from "react";
import { Mesh } from "three";
import useCardAnimation, { AnimationType } from "../hooks/useCardAnimation";

interface TopCardProps {
  color?: "blue" | "red";
  endPos?: [number, number, number];
  startPos?: [number, number, number];
  r?: [number, number, number];
  animate?: AnimationType;
}

const TopCard = ({
  color = "red",
  endPos = [0, 0, 0],
  startPos = [0, 0, 0],
  animate = "deal",
  r = [0, 0, 0],
}: TopCardProps) => {
  const cardTexture =
    color === "red" ? "/assets/redcard.png" : "/assets/bluecard.png";
  const texture = useTexture(cardTexture);
  const meshRef = useRef<Mesh>(null);

  const { position, rotation } = useCardAnimation({
    animate,
    meshRef,
    endPos,
    startPos,
    endR: r,
  });

  const doAnimate = animate !== "none";

  return (
    <group position={doAnimate ? [0, 0, 0] : endPos}>
      <animated.mesh
        ref={meshRef}
        position={doAnimate ? position : [0, 0, 0]}
        rotation={doAnimate ? rotation : r}
      >
        <meshBasicMaterial
          map={texture}
          polygonOffset
          polygonOffsetFactor={-1}
        />
        <boxGeometry args={[2, 0, 3]} />
      </animated.mesh>
    </group>
  );
};

export default TopCard;
