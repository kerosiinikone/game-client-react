import { useSpring } from "@react-spring/web";
import { useFrame } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { QuadraticBezierCurve3, Vector3 } from "three";

export type AnimationType = "deal" | "win" | "none";

interface CardAnimationProps {
  animate: AnimationType;
  meshRef: any;
  endPos?: [number, number, number];
  startPos?: [number, number, number];
  endR?: [number, number, number];
  startR?: [number, number, number];
  deps?: any[];
}

const useCardAnimation = ({
  animate,
  meshRef,
  endPos = [0, 0, 0],
  startPos = [0, 0, 0],
  endR = [0, 0, 0],
  startR = [0, 0, 0],
  deps = [],
}: CardAnimationProps) => {
  const [isDealt, setIsDealt] = useState<boolean>(false);
  const [animationProgress, setAnimationProgress] = useState<number>(0);

  const startPoint = new Vector3(...startPos);
  const controlPoint = new Vector3(startPos[0], startPos[1] + 1, startPos[2]);
  const endPoint = new Vector3(...endPos);

  if (animate === "deal") {
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
  }, [...deps]);

  return useSpring({
    position: isDealt ? endPos : startPos,
    rotation: isDealt ? endR : startR,
    config: { mass: 1, tension: 200, friction: 20 },
  }) as any;
};

export default useCardAnimation;
