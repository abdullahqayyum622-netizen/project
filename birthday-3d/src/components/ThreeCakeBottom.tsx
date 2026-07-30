"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sparkles, Environment, Text } from "@react-three/drei";
import * as THREE from "three";

// Glowing Candle Flame Component
function CandleFlame({ position }: { position: [number, number, number] }) {
  const flameRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!flameRef.current) return;
    const elapsed = state.clock.getElapsedTime();
    
    const scale = 1.0 + Math.sin(elapsed * 15.0) * 0.15;
    flameRef.current.scale.set(scale, scale * 1.3, scale);
    flameRef.current.position.y = position[1] + Math.sin(elapsed * 20.0) * 0.005;
  });

  return (
    <group>
      <mesh ref={flameRef} position={position}>
        <sphereGeometry args={[0.024, 8, 8]} />
        <meshBasicMaterial color="#FF9900" />
      </mesh>
      <pointLight position={position} distance={0.8} intensity={1.5} color="#FF7700" decay={2} />
    </group>
  );
}

// 3D Candle with Wick and Flame
function CakeCandle({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.31, 0]}>
        <cylinderGeometry args={[0.003, 0.003, 0.04, 4]} />
        <meshBasicMaterial color="#222" />
      </mesh>
      <CandleFlame position={[0, 0.34, 0]} />
    </group>
  );
}

// A single decorative red cherry topping
function CakeCherry({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshStandardMaterial color="#c00" roughness={0.1} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.05, 0.02]} rotation={[0.4, 0, 0.2]}>
        <cylinderGeometry args={[0.003, 0.003, 0.06, 4]} />
        <meshBasicMaterial color="#4a5f31" />
      </mesh>
    </group>
  );
}

// 3D Vanilla Cake Model
function CakeModel({ isMobile }: { isMobile: boolean }) {
  const cakeGroup = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (cakeGroup.current) {
      cakeGroup.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
  });

  const boardMaterial = new THREE.MeshStandardMaterial({
    color: "#D4AF37",
    metalness: 0.85,
    roughness: 0.18,
  });

  const frostingMaterial = new THREE.MeshStandardMaterial({
    color: "#FFFdf6",
    roughness: 0.8,
    metalness: 0.05,
  });

  const bottomToppingsCount = 12;
  const bottomToppingAngles = Array.from({ length: bottomToppingsCount }).map((_, i) => (i * 2 * Math.PI) / bottomToppingsCount);

  const topToppingsCount = 8;
  const topToppingAngles = Array.from({ length: topToppingsCount }).map((_, i) => (i * 2 * Math.PI) / topToppingsCount);

  return (
    <group ref={cakeGroup} scale={isMobile ? 0.72 : 1.0} position={[0, -0.4, 0]}>
      {/* 1. Gold Metallic Base Plate */}
      <mesh position={[0, -0.58, 0]} material={boardMaterial}>
        <cylinderGeometry args={[1.3, 1.3, 0.04, 32]} />
      </mesh>

      {/* 2. Bottom Tier (Large Vanilla Sponge) */}
      <mesh position={[0, -0.26, 0]} material={frostingMaterial}>
        <cylinderGeometry args={[0.92, 0.92, 0.6, 32]} />
      </mesh>

      {/* 3. Middle Vanilla Drip Accent */}
      <mesh position={[0, 0.04, 0]}>
        <torusGeometry args={[0.93, 0.025, 8, 32]} />
        <meshStandardMaterial color="#FCE7F3" roughness={0.7} />
      </mesh>

      {/* Toppings on Bottom Tier Rim */}
      {bottomToppingAngles.map((angle, idx) => (
        <CakeCherry
          key={`bot-ch-${idx}`}
          position={[0.78 * Math.cos(angle), 0.05, 0.78 * Math.sin(angle)]}
        />
      ))}

      {/* 4. Top Tier (Small Vanilla Sponge) */}
      <mesh position={[0, 0.28, 0]} material={frostingMaterial}>
        <cylinderGeometry args={[0.58, 0.58, 0.48, 32]} />
      </mesh>

      {/* Toppings on Top Tier Rim */}
      {topToppingAngles.map((angle, idx) => (
        <CakeCherry
          key={`top-ch-${idx}`}
          position={[0.48 * Math.cos(angle), 0.52, 0.48 * Math.sin(angle)]}
        />
      ))}

      {/* 5. Gold Birthday Topper Sign */}
      <group position={[0, 0.62, 0]}>
        <mesh position={[-0.15, 0.06, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.2, 6]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.8} />
        </mesh>
        <mesh position={[0.15, 0.06, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.2, 6]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.8} />
        </mesh>

        <Text
          position={[0, 0.25, 0.01]}
          fontSize={0.15}
          color="#D4AF37"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.015}
          outlineColor="#453610"
        >
          Happy Birthday
        </Text>
        <Text
          position={[0, 0.1, 0.01]}
          fontSize={0.13}
          color="#EC4899"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.012}
          outlineColor="#000"
        >
          Muziha
        </Text>
      </group>

      {/* 6. Five lit candles on the top tier */}
      <CakeCandle position={[0, 0.52, 0]} />
      <CakeCandle position={[0.26, 0.52, 0.26]} />
      <CakeCandle position={[-0.26, 0.52, 0.26]} />
      <CakeCandle position={[0.26, 0.52, -0.26]} />
      <CakeCandle position={[-0.26, 0.52, -0.26]} />
    </group>
  );
}

export default function ThreeCakeBottom() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto h-[350px] sm:h-[450px] relative rounded-3xl overflow-hidden bg-transparent z-10 select-none">
      <Canvas camera={{ position: isMobile ? [0, 1.6, 3.8] : [0, 1.4, 3.2], fov: isMobile ? 54 : 42 }}>
        <ambientLight intensity={0.65} />
        
        <spotLight position={[0, 5, 2]} angle={0.6} penumbra={1} intensity={14} color="#ffffff" />
        <spotLight position={[3, 2, -2]} angle={0.8} penumbra={1} intensity={6} color="#EC4899" />
        
        <Sparkles count={30} scale={2.2} size={2.5} speed={0.2} opacity={0.65} color="#FACC15" />

        <CakeModel isMobile={isMobile} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 8}
        />

        <directionalLight position={[5, 8, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-5, 5, -5]} intensity={0.6} color="#EC4899" />
      </Canvas>
    </div>
  );
}
