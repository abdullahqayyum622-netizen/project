"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Sparkles } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { motion as motionDOM } from "framer-motion";

function GiftBox({ onOpen }: { onOpen: () => void }) {
  const lidRef = useRef<THREE.Group>(null);
  const frontRef = useRef<THREE.Group>(null);
  const backRef = useRef<THREE.Group>(null);
  const leftRef = useRef<THREE.Group>(null);
  const rightRef = useRef<THREE.Group>(null);
  const miniCakeRef = useRef<THREE.Group>(null);

  const [opened, setOpened] = useState(false);
  const openTimeRef = useRef<number>(0);

  const handleOpen = (e: any) => {
    e.stopPropagation();
    if (!opened) {
      setOpened(true);
      openTimeRef.current = performance.now() / 1000;
      onOpen();
    }
  };

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    if (opened && lidRef.current) {
      lidRef.current.position.y = THREE.MathUtils.lerp(lidRef.current.position.y, 4.5, 0.05);
      lidRef.current.rotation.x = THREE.MathUtils.lerp(lidRef.current.rotation.x, -Math.PI / 2.5, 0.05);
      lidRef.current.rotation.z = THREE.MathUtils.lerp(lidRef.current.rotation.z, Math.PI / 5, 0.05);
    }

    if (opened && openTimeRef.current > 0) {
      const timeSinceOpen = elapsed - openTimeRef.current + 0.3;
      if (timeSinceOpen > 0.4) {
        const targetRot = Math.PI / 2.05;
        if (frontRef.current) frontRef.current.rotation.x = THREE.MathUtils.lerp(frontRef.current.rotation.x, targetRot, 0.08);
        if (backRef.current) backRef.current.rotation.x = THREE.MathUtils.lerp(backRef.current.rotation.x, -targetRot, 0.08);
        if (leftRef.current) leftRef.current.rotation.z = THREE.MathUtils.lerp(leftRef.current.rotation.z, targetRot, 0.08);
        if (rightRef.current) rightRef.current.rotation.z = THREE.MathUtils.lerp(rightRef.current.rotation.z, -targetRot, 0.08);
      }
    }

    if (miniCakeRef.current) {
      miniCakeRef.current.rotation.y = elapsed * (opened ? 0.8 : 0.2);
      if (opened) {
        miniCakeRef.current.position.y = THREE.MathUtils.lerp(miniCakeRef.current.position.y, -0.6, 0.05);
      }
    }
  });

  const boxMaterial = new THREE.MeshPhysicalMaterial({
    color: "#18181b",
    roughness: 0.15,
    metalness: 0.85,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });

  const ribbonMaterial = new THREE.MeshPhysicalMaterial({
    color: "#EC4899",
    roughness: 0.3,
    metalness: 0.2,
    clearcoat: 0.8,
  });

  return (
    <group
      onClick={handleOpen}
      onPointerOver={(e) => (document.body.style.cursor = "pointer")}
      onPointerOut={(e) => (document.body.style.cursor = "auto")}
    >
      <Float speed={opened ? 0 : 2.5} rotationIntensity={opened ? 0 : 0.25} floatIntensity={opened ? 0 : 0.4}>
        {/* 1. Static Box Base Platform */}
        <mesh position={[0, -1.25, 0]}>
          <boxGeometry args={[3.02, 0.1, 3.02]} />
          <meshStandardMaterial color="#050505" roughness={0.5} />
        </mesh>

        {/* 2. Unfolding Side Panels */}
        <group ref={frontRef} position={[0, -1.2, 1.5]}>
          <mesh position={[0, 1.0, 0]} material={boxMaterial}>
            <boxGeometry args={[3.0, 2.0, 0.08]} />
          </mesh>
          <mesh position={[0, 1.0, 0.01]} material={ribbonMaterial}>
            <boxGeometry args={[0.4, 2.02, 0.09]} />
          </mesh>
        </group>

        <group ref={backRef} position={[0, -1.2, -1.5]}>
          <mesh position={[0, 1.0, 0]} material={boxMaterial}>
            <boxGeometry args={[3.0, 2.0, 0.08]} />
          </mesh>
          <mesh position={[0, 1.0, -0.01]} material={ribbonMaterial}>
            <boxGeometry args={[0.4, 2.02, 0.09]} />
          </mesh>
        </group>

        <group ref={leftRef} position={[-1.5, -1.2, 0]}>
          <mesh position={[0, 1.0, 0]} material={boxMaterial}>
            <boxGeometry args={[0.08, 2.0, 2.96]} />
          </mesh>
          <mesh position={[-0.01, 1.0, 0]} material={ribbonMaterial}>
            <boxGeometry args={[0.09, 2.02, 0.4]} />
          </mesh>
        </group>

        <group ref={rightRef} position={[1.5, -1.2, 0]}>
          <mesh position={[0, 1.0, 0]} material={boxMaterial}>
            <boxGeometry args={[0.08, 2.0, 2.96]} />
          </mesh>
          <mesh position={[0.01, 1.0, 0]} material={ribbonMaterial}>
            <boxGeometry args={[0.09, 2.02, 0.4]} />
          </mesh>
        </group>

        {/* 3. The Lid */}
        <group ref={lidRef} position={[0, 0.85, 0]}>
          <mesh material={boxMaterial}>
            <boxGeometry args={[3.2, 0.4, 3.2]} />
          </mesh>
          <mesh position={[0, 0.01, 0]} material={ribbonMaterial}>
            <boxGeometry args={[3.25, 0.42, 0.42]} />
          </mesh>
          <mesh position={[0, 0.01, 0]} material={ribbonMaterial}>
            <boxGeometry args={[0.42, 0.42, 3.25]} />
          </mesh>
          <mesh position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]} material={ribbonMaterial}>
            <torusGeometry args={[0.35, 0.08, 16, 32]} />
          </mesh>
          <mesh position={[0.3, 0.35, 0.3]} rotation={[Math.PI / 2, 0, Math.PI / 4]} material={ribbonMaterial}>
            <torusGeometry args={[0.35, 0.08, 16, 32]} />
          </mesh>
          <mesh position={[-0.3, 0.35, -0.3]} rotation={[Math.PI / 2, 0, Math.PI / 4]} material={ribbonMaterial}>
            <torusGeometry args={[0.35, 0.08, 16, 32]} />
          </mesh>
        </group>

        {/* 4. Mini 3D Cake inside */}
        <group ref={miniCakeRef} position={[0, -1.6, 0]}>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.8, 0.85, 0.05, 16]} />
            <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.65, 0.65, 0.4, 16]} />
            <meshStandardMaterial color="#FDF8F0" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.5, 0.04, 8, 24]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.65, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
            <meshStandardMaterial color="#FACC15" />
          </mesh>
          {opened && (
            <mesh position={[0, 0.82, 0]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial color="#FFB84D" />
            </mesh>
          )}
        </group>

        {opened && (
          <pointLight position={[0, 0, 0]} intensity={35} color="#FFD700" distance={12} decay={1.5} />
        )}
        {opened && (
          <Sparkles count={400} scale={7} size={8} speed={0.6} opacity={1.0} color="#FACC15" />
        )}
      </Float>
    </group>
  );
}

export default function CanvasIntro({
  onTransitionComplete,
  name = "Muziha Nayab",
}: {
  onTransitionComplete: () => void;
  name?: string;
}) {
  const [isOpened, setIsOpened] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleOpen = () => {
    setIsOpened(true);
    setTimeout(() => {
      onTransitionComplete();
    }, 4500);
  };

  return (
    <motionDOM.div
      className="fixed inset-0 z-[100] bg-gradient-to-b from-[#0a0a0f] to-[#010103] flex items-center justify-center"
      animate={{ opacity: isOpened ? 0 : 1 }}
      transition={{ duration: 1.5, delay: 3.5 }}
      style={{ pointerEvents: isOpened ? "none" : "auto" }}
    >
      <div className="absolute top-[15%] w-full text-center px-4 z-10 pointer-events-none select-none">
        <motionDOM.h1
          className="text-2xl sm:text-3xl md:text-5xl font-heading text-white tracking-widest font-semibold drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          animate={{
            opacity: isOpened ? [0.8, 0] : [0.4, 0.8, 0.4],
            y: isOpened ? -30 : [0, -5, 0],
          }}
          transition={{
            opacity: isOpened ? { duration: 1 } : { duration: 3, repeat: Infinity },
            y: isOpened ? { duration: 1 } : { duration: 3, repeat: Infinity },
          }}
        >
          {isOpened ? `Surprise! Happy Birthday ${name}...` : "🎁 Click to unlock your gift"}
        </motionDOM.h1>
      </div>

      <Canvas camera={{ position: isMobile ? [0, 3.2, 10.5] : [0, 2.5, 8.5], fov: isMobile ? 48 : 40 }}>
        <fog attach="fog" args={["#010103", 5, 18]} />
        <ambientLight intensity={0.6} />
        <spotLight position={[5, 12, 5]} angle={0.25} penumbra={1} intensity={12} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />

        <GiftBox onOpen={handleOpen} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.3, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#050505" roughness={0.15} metalness={0.9} />
        </mesh>
      </Canvas>
    </motionDOM.div>
  );
}
