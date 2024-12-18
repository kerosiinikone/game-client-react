import { animated, useSpring } from "@react-spring/three";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Mesh, QuadraticBezierCurve3, Vector3 } from "three";

interface TopCardProps {
  color?: "blue" | "red";
  endPos?: [number, number, number];
  startPos?: [number, number, number];
  r?: [number, number, number];
  animate?: boolean;
}

const TopCard = ({
  color = "red",
  endPos = [0, 0, 0],
  startPos = [0, 0, 0],
  animate = true,
  r = [0, 0, 0],
}: TopCardProps) => {
  const cardTexture =
    color === "red" ? "/assets/redcard.png" : "/assets/bluecard.png";
  const texture = useTexture(cardTexture);
  const meshRef = useRef<Mesh>(null);
  const [isDealt, setIsDealt] = useState<boolean>(false);
  const [animationProgress, setAnimationProgress] = useState<number>(0);

  let position = endPos;
  let rotation = r;

  if (animate) {
    ({ position, rotation } = useSpring({
      position: isDealt ? endPos : startPos,
      rotation: isDealt ? [0, 0, 0] : [0, Math.PI, 0],
      config: { mass: 1, tension: 200, friction: 20 },
    }) as any);

    const startPoint = new Vector3(...startPos);
    const controlPoint = new Vector3(0, 0, 0);
    const endPoint = new Vector3(...endPos);

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
  }

  useEffect(() => {
    setIsDealt(true);
    return () => {
      setIsDealt(false);
      setAnimationProgress(0);
    };
  }, []);

  return (
    <group position={animate ? [0, 0, 0] : endPos} rotation={r}>
      <animated.mesh
        ref={meshRef}
        position={animate ? position : [0, 0, 0]}
        rotation={animate ? rotation : [0, 0, 0]}
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
