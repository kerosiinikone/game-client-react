import { animated, useSpring } from "@react-spring/three";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Mesh, QuadraticBezierCurve3, Vector3 } from "three";

type Animation = "deal" | "win" | "none";

interface TopCardProps {
  color?: "blue" | "red";
  endPos?: [number, number, number];
  startPos?: [number, number, number];
  r?: [number, number, number];
  animate?: Animation;
}

// Stateful component -> bad practice?

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
  const [isDealt, setIsDealt] = useState<boolean>(false);
  const [animationProgress, setAnimationProgress] = useState<number>(0);

  const doAnimate = animate !== "none";

  let position = endPos;
  let rotation = r;

  const startPoint = new Vector3(...startPos);
  const controlPoint = new Vector3(startPos[0] + 1, startPos[1], startPos[2]);
  const endPoint = new Vector3(...endPos);

  switch (animate) {
    case "deal":
      ({ position, rotation } = useSpring({
        position: isDealt ? endPos : startPos,
        rotation: isDealt ? [0, 0, 0] : r,
        config: { tension: 500, friction: 50 },
      }) as any);

      const curve = new QuadraticBezierCurve3(
        startPoint,
        controlPoint,
        endPoint
      );
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
      break;
    case "win":
      ({ position, rotation } = useSpring({
        position: isDealt ? endPos : startPos,
        rotation: isDealt ? [0, 0, 0] : r,
        config: { tension: 500, friction: 50, clamp: true },
      }) as any);
  }

  useEffect(() => {
    setIsDealt(true);
    return () => {
      setIsDealt(false);
      setAnimationProgress(0);
    };
  }, []);

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
