import { animated, useSpring } from "@react-spring/three";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Mesh, QuadraticBezierCurve3, Vector3 } from "three";
import { DEFAULT_DECK_POSITION, DEFAULT_TABLE_POSITION } from "../constants";

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
  const [isDealt, setIsDealt] = useState<boolean>(false);
  const [animationProgress, setAnimationProgress] = useState<number>(0);

  const { position, rotation } = useSpring({
    position: isDealt ? DEFAULT_TABLE_POSITION : DEFAULT_DECK_POSITION,
    rotation: isDealt ? [0, inv ? Math.PI : 0, 0] : [0, Math.PI, 0],
    config: { mass: 1, tension: 200, friction: 20 },
  }) as any;

  const startPoint = new Vector3(...DEFAULT_DECK_POSITION);
  const controlPoint = new Vector3(
    DEFAULT_DECK_POSITION.x,
    DEFAULT_DECK_POSITION.y + 1,
    DEFAULT_DECK_POSITION.z
  );
  const endPoint = new Vector3(...DEFAULT_TABLE_POSITION);

  const curve = new QuadraticBezierCurve3(startPoint, controlPoint, endPoint);

  useFrame((_, delta) => {
    if (isDealt && animationProgress < 1) {
      setAnimationProgress((prevProgress) =>
        Math.min(1, prevProgress + delta * 2)
      );

      const pointOnCurve = curve.getPoint(animationProgress);
      if (meshRef.current) {
        meshRef.current.position.copy(pointOnCurve);
        meshRef.current.rotation.y = animationProgress * Math.PI * 2;
      }
    }
  });

  useEffect(() => {
    setIsDealt(true);
    return () => {
      setIsDealt(false);
      setAnimationProgress(0);
    };
  }, [suit, value]);

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
