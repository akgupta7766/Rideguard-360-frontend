import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

// Closed loop route the bus drives around. Kept in normalized scene units.
const ROUTE_POINTS = [
  new THREE.Vector3(-3.2, 0, 1.5),
  new THREE.Vector3(-1.1, 0, -1.7),
  new THREE.Vector3(1.5, 0, -1.1),
  new THREE.Vector3(3.0, 0, 1.3),
  new THREE.Vector3(0.9, 0, 2.5),
  new THREE.Vector3(-1.7, 0, 2.6),
];

const STOP_PARAMS = [0.06, 0.38, 0.68];

function useRouteCurve() {
  return useMemo(
    () => new THREE.CatmullRomCurve3(ROUTE_POINTS, true, "catmullrom", 0.5),
    []
  );
}

function RoutePath({ curve }) {
  const points = useMemo(() => curve.getPoints(160), [curve]);
  return (
    <>
      {/* soft glow underlay */}
      <Line points={points} color="#5da1ff" lineWidth={6} transparent opacity={0.18} />
      {/* crisp core line */}
      <Line points={points} color="#5da1ff" lineWidth={2} transparent opacity={0.9} />
    </>
  );
}

function StopMarker({ position, phaseOffset, reduceMotion }) {
  const ringRef = useRef();

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    const t = reduceMotion ? 0.4 : (clock.getElapsedTime() * 0.6 + phaseOffset) % 1;
    const scale = 1 + Math.sin(t * Math.PI) * 0.5;
    ringRef.current.scale.set(scale, scale, scale);
    ringRef.current.material.opacity = 0.5 - t * 0.3;
  });

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.075, 24]} />
        <meshStandardMaterial
          color="#5da1ff"
          emissive="#5da1ff"
          emissiveIntensity={1.6}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.12, 0.15, 32]} />
        <meshBasicMaterial color="#5da1ff" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

function Bus({ curve, reduceMotion }) {
  const group = useRef();
  const progress = useRef(0);

  useFrame((_, delta) => {
    if (!group.current) return;
    progress.current = (progress.current + (reduceMotion ? 0 : delta * 0.05)) % 1;
    const point = curve.getPointAt(progress.current || 0.001);
    const tangent = curve.getTangentAt(progress.current || 0.001);
    group.current.position.set(point.x, 0.16, point.z);
    group.current.rotation.y = Math.atan2(tangent.x, tangent.z);
  });

  return (
    <group ref={group}>
      <pointLight color="#5da1ff" intensity={1.1} distance={1.6} position={[0, 0.3, 0]} />

      {/* body */}
      <mesh position={[0, 0.14, 0]}>
        <boxGeometry args={[0.34, 0.28, 0.66]} />
        <meshStandardMaterial color="#eef3fb" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* roof accent stripe */}
      <mesh position={[0, 0.29, 0]}>
        <boxGeometry args={[0.36, 0.03, 0.68]} />
        <meshStandardMaterial color="#0d6efd" emissive="#0d6efd" emissiveIntensity={0.6} />
      </mesh>

      {/* window band */}
      <mesh position={[0, 0.18, 0.001]}>
        <boxGeometry args={[0.345, 0.09, 0.5]} />
        <meshStandardMaterial
          color="#8fc1ff"
          emissive="#8fc1ff"
          emissiveIntensity={0.7}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* headlights */}
      {[0.1, -0.1].map((x) => (
        <mesh key={x} position={[x, 0.1, 0.335]}>
          <boxGeometry args={[0.05, 0.04, 0.02]} />
          <meshStandardMaterial color="#fff6d6" emissive="#ffe9a8" emissiveIntensity={2.2} />
        </mesh>
      ))}

      {/* wheels */}
      {[
        [-0.16, -0.02, 0.22],
        [0.16, -0.02, 0.22],
        [-0.16, -0.02, -0.22],
        [0.16, -0.02, -0.22],
      ].map((p, i) => (
        <mesh key={i} position={p} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.055, 0.055, 0.05, 16]} />
          <meshStandardMaterial color="#1a2330" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function CameraRig({ reduceMotion }) {
  const { camera, pointer } = useThree();
  useFrame(() => {
    if (reduceMotion) {
      camera.lookAt(0, 0, 0);
      return;
    }
    camera.position.x += (pointer.x * 0.9 - camera.position.x) * 0.02;
    camera.position.y += (2.5 - pointer.y * 0.4 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const handler = (e) => setReduced(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export default function BusScene() {
  const curve = useRouteCurve();
  const reduceMotion = usePrefersReducedMotion();

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 2.5, 4.4], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#0b1524"]} />
      <fog attach="fog" args={["#0b1524", 5, 9.5]} />

      <ambientLight intensity={0.55} color="#3f6ea8" />
      <directionalLight position={[2, 3, 2]} intensity={0.9} color="#dbe8ff" />

      <gridHelper args={[9, 18, "#1c3252", "#152238"]} position={[0, -0.01, 0]} />

      <RoutePath curve={curve} />
      {STOP_PARAMS.map((t, i) => (
        <StopMarker
          key={i}
          position={curve.getPointAt(t)}
          phaseOffset={i * 0.33}
          reduceMotion={reduceMotion}
        />
      ))}
      <Bus curve={curve} reduceMotion={reduceMotion} />

      <CameraRig reduceMotion={reduceMotion} />
    </Canvas>
  );
}