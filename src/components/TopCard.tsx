import { useRef } from "react";
import { Mesh } from "three";
import { useTexture } from "@react-three/drei";

interface TopCardProps {
  color?: "blue" | "red";
  pos?: [number, number, number];
  rotation?: [number, number, number];
}

const TopCard = ({
  color = "red",
  pos = [0, 0, 0],
  rotation = [0, 0, 0],
}: TopCardProps) => {
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
};

export default TopCard;
