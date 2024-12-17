import { useTexture } from "@react-three/drei";

interface CardProps {
  suit: string;
  value: string;
  pos: [number, number, number];
  inv: boolean;
}

const Card = ({ suit, value, pos, inv }: CardProps) => {
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
};

export default Card;
