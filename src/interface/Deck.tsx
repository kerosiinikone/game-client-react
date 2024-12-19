import TopCard from "./TopCard";

interface DeckProps {
  pos?: [number, number, number];
  rotation?: [number, number, number];
  color?: "blue" | "red";
}

const Deck = ({
  pos = [0, 0, 0],
  rotation = [0, 0, 0],
  color = "red",
}: DeckProps) => {
  return (
    <group position={pos} rotation={rotation}>
      <TopCard endPos={[0, -2, -3]} color={color} animate="none" />
      <mesh position={[0, -2.25, -3]}>
        <meshBasicMaterial color="white" />
        <boxGeometry args={[2, 0.5, 3]} />
      </mesh>
    </group>
  );
};

export default Deck;
