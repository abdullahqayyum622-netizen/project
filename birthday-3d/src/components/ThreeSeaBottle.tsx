"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sparkles, Float, Environment, Text } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface ThreeSeaBottleProps {
  wishes: { sender: string; msg: string }[];
  lightIntensity: number;
  waveSpeed: number; // Controlled by parent
  onSelectWish: (wish: { sender: string; msg: string; idx: number } | null) => void;
  openedList: boolean[];
  setOpenedList: React.Dispatch<React.SetStateAction<boolean[]>>;
  activeWishIdx: number | null;
}

// 3D Message Scroll Component
function ScrollModel({ position, visible, slideProgress }: { position: [number, number, number]; visible: boolean; slideProgress: number }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.4;
  });

  return (
    <group ref={meshRef} position={position} scale={[1, 1, 1]}>
      <mesh position={[0, slideProgress * 0.4, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.22, 10]} />
        <meshStandardMaterial color="#f4edd5" roughness={0.8} />
      </mesh>
      <mesh position={[0, slideProgress * 0.4, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.015, 10]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// 3D Glass Bottle Mesh (Translucent, refractive physical material)
function GlassBottle({
  sender,
  position,
  floatSpeed,
  isOpened,
  isSelected,
  onClick,
  waveSpeed,
  isMobile,
}: {
  sender: string;
  position: [number, number, number];
  floatSpeed: number;
  isOpened: boolean;
  isSelected: boolean;
  onClick: () => void;
  waveSpeed: number;
  isMobile: boolean;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const initialPos = useRef<THREE.Vector3>(new THREE.Vector3(...position));
  const currentPos = useRef<THREE.Vector3>(new THREE.Vector3(...position));
  const velocity = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  
  const corkY = useRef<number>(0.34);
  const [slideProgress, setSlideProgress] = useState(0); // 0 to 1

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const elapsed = state.clock.getElapsedTime();

    if (isSelected) {
      // Scale coordinates down on mobile to prevent clipping screen bounds
      const targetPos = isMobile ? new THREE.Vector3(0, 0.12, 1.7) : new THREE.Vector3(0, 0.3, 2.2);
      currentPos.current.lerp(targetPos, 0.22);
      meshRef.current.position.copy(currentPos.current);
      
      meshRef.current.rotation.set(0.1, Math.sin(elapsed * 1.5) * 0.1, 0);

      corkY.current = THREE.MathUtils.lerp(corkY.current, 0.65, 0.12);
      setSlideProgress((prev) => THREE.MathUtils.lerp(prev, 1.0, 0.1));
    } else {
      const waveHeight = Math.sin(initialPos.current.x * 1.4 + elapsed * waveSpeed * 1.5) * 0.08 +
                         Math.cos(initialPos.current.z * 1.1 + elapsed * waveSpeed * 1.2) * 0.05;

      const targetPos = initialPos.current.clone();
      targetPos.y += waveHeight;

      currentPos.current.lerp(targetPos, 0.12);
      meshRef.current.position.copy(currentPos.current);

      meshRef.current.rotation.x = Math.sin(elapsed * floatSpeed) * 0.14;
      meshRef.current.rotation.z = Math.cos(elapsed * floatSpeed * 0.8) * 0.14;
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, elapsed * 0.05, 0.1);

      corkY.current = THREE.MathUtils.lerp(corkY.current, 0.34, 0.15);
      setSlideProgress((prev) => THREE.MathUtils.lerp(prev, 0.0, 0.15));
    }
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: "#b9e2e2",
    transparent: true,
    opacity: 0.36,
    roughness: 0.08,
    metalness: 0.1,
    transmission: 0.9,
    thickness: 0.18,
    ior: 1.48,
  });

  const corkMaterial = new THREE.MeshStandardMaterial({
    color: "#8b5a2b",
    roughness: 0.85,
    metalness: 0.05,
  });

  // Scale down the selected bottle to fit mobile viewports perfectly
  const modelScale = isSelected && isMobile ? 0.72 : 1.0;

  return (
    <group
      ref={meshRef}
      scale={[modelScale, modelScale, modelScale]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "auto";
      }}
    >
      {/* Invisible hitbox cylinder to capture click events 100% reliably */}
      <mesh
        position={[0, 0.15, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "auto";
        }}
      >
        <cylinderGeometry args={[0.13, 0.13, 0.6, 8]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* 1. Bottle Body Cylinder */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.35, 12]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      
      {/* 2. Bottle Tapered Shoulder */}
      <mesh position={[0, 0.225, 0]}>
        <cylinderGeometry args={[0.045, 0.08, 0.08, 12]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      
      {/* 3. Bottle Neck */}
      <mesh position={[0, 0.29, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.09, 12]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* 4. Wooden Cork */}
      <mesh position={[0, corkY.current, 0]} material={corkMaterial} scale={isSelected ? Math.max(0, 1.3 - slideProgress * 1.5) : 1}>
        <cylinderGeometry args={[0.038, 0.038, 0.06, 8]} />
      </mesh>

      {/* 5. Rolled-up Parchment message inside */}
      <ScrollModel position={[0, 0.05, 0]} visible={true} slideProgress={slideProgress} />

      {!isSelected && (
        <Text
          position={[0, 0.44, 0]}
          fontSize={0.11}
          color="#FFF"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.015}
          outlineColor="#000"
        >
          {sender}
        </Text>
      )}

      <pointLight distance={1.2} intensity={0.8} color="#FF9933" decay={2} />
    </group>
  );
}

// Procedural wave heights modifier in real time
function WaterMesh({ waveSpeed }: { waveSpeed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const geometry = meshRef.current.geometry as THREE.BufferGeometry;
    const pos = geometry.attributes.position;
    const elapsed = state.clock.getElapsedTime();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = Math.sin(x * 1.2 + elapsed * waveSpeed * 1.5) * 0.08 +
                Math.cos(y * 0.9 + elapsed * waveSpeed * 1.2) * 0.06;
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
      <planeGeometry args={[12, 12, 48, 48]} />
      <meshStandardMaterial
        color="#081e35"
        roughness={0.08}
        metalness={0.85}
        flatShading={true}
      />
    </mesh>
  );
}

export default function ThreeSeaBottle({
  wishes,
  lightIntensity,
  waveSpeed,
  onSelectWish,
  openedList,
  setOpenedList,
  activeWishIdx,
}: ThreeSeaBottleProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const bottleCoordinates: [number, number, number][] = [
    [-2.2, -0.4, 1.4],
    [2.0, -0.4, 1.2],
    [-2.6, -0.4, -0.4],
    [2.5, -0.4, -0.8],
    [-1.0, -0.4, -1.8],
    [1.1, -0.4, -1.9],
    [-0.8, -0.4, 2.2],
    [0.9, -0.4, 2.0],
    [-1.6, -0.4, -1.0],
    [1.7, -0.4, 0.4],
  ];

  return (
    <div
      className="w-full h-full min-h-[460px] md:min-h-[580px] lg:min-h-[650px] rounded-3xl overflow-hidden relative border border-[#D4AF37]/20 bg-[#000] shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
      onClick={() => {
        if (activeWishIdx !== null) {
          onSelectWish(null);
        }
      }}
    >
      {activeWishIdx === null && (
        <div className="absolute inset-x-0 top-6 flex items-center justify-center pointer-events-none select-none z-10">
          <div className="bg-black/75 border border-goldAccent/40 backdrop-blur-md px-5 py-2.5 rounded-full text-xs text-goldAccent font-mono tracking-wider animate-pulse flex items-center gap-2 shadow-[0_0_20px_rgba(250,204,21,0.25)]">
            <span>🌊 Click on any floating Message Bottle to read!</span>
          </div>
        </div>
      )}

      {/* Adjust camera FOV and position on mobile to frame the ocean scene */}
      <Canvas camera={{ position: isMobile ? [0, 2.5, 5.8] : [0, 2.2, 4.6], fov: isMobile ? 54 : 46 }}>
        <fog attach="fog" args={["#000000", 4.2, 10]} />
        <ambientLight intensity={0.35 * lightIntensity} />

        <spotLight position={[0, 6, 2]} angle={0.85} penumbra={1} intensity={22 * lightIntensity} color="#FF9933" />
        <spotLight position={[-4, 3, -3]} angle={0.6} penumbra={1} intensity={8 * lightIntensity} color="#EC4899" />
        <spotLight position={[4, 3, -3]} angle={0.6} penumbra={1} intensity={6 * lightIntensity} color="#D4AF37" />

        <WaterMesh waveSpeed={waveSpeed} />

        {wishes.map((wish, idx) => (
          <GlassBottle
            key={idx}
            sender={wish.sender}
            position={bottleCoordinates[idx] || [0, 0, 0]}
            floatSpeed={1.0 + idx * 0.1}
            isOpened={openedList[idx]}
            isSelected={activeWishIdx === idx}
            onClick={() => {
              onSelectWish({ ...wish, idx });
            }}
            waveSpeed={waveSpeed}
            isMobile={isMobile}
          />
        ))}

        <Sparkles count={45} scale={4.5} size={2.5} speed={0.2} opacity={0.6} color="#FFF" />

        <OrbitControls
          enableZoom={true}
          maxDistance={isMobile ? 7.0 : 5.5}
          minDistance={2.5}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 8}
          enabled={activeWishIdx === null}
        />

        <directionalLight position={[5, 12, 5]} intensity={1.5 * lightIntensity} color="#D4AF37" />
        <directionalLight position={[-5, 8, -5]} intensity={0.8 * lightIntensity} color="#EC4899" />
        <directionalLight position={[0, 10, 10]} intensity={0.5 * lightIntensity} color="#ffffff" />
      </Canvas>
    </div>
  );
}
