"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, Html, Sparkles, Text, Float } from "@react-three/drei";
import * as THREE from "three";
import confetti from "canvas-confetti";

import HoloHeader from "./HoloHeader";
import HoloLeftPanel from "./HoloLeftPanel";
import HoloRightPanel from "./HoloRightPanel";
import HoloCursor from "./HoloCursor";
import { useMicBlow } from "../hooks/useMicBlow";

// Physics Body definition
interface RigidBody {
  id: string;
  type: "sphere" | "box" | "text" | "balloon";
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  rotVelocity: THREE.Vector3;
  radius: number;
  size: THREE.Vector3;
  mass: number;
  restitution: number; // bounciness (0 - 1)
  color: string;
  text?: string;
  isGrabbed?: boolean;
}

interface LuxeThreeDSceneProps {
  birthdayName: string;
  setBirthdayName: (n: string) => void;
  frostingColor: string;
  setFrostingColor: (c: string) => void;
  gravity: number;
  setGravity: (g: number) => void;
  windForce: number;
  setWindForce: (w: number) => void;
  theme: string;
  setTheme: (t: string) => void;
  letterText: string;
  setLetterText: (t: string) => void;
  activeTool: string;
  setActiveTool: (t: string) => void;
  presentationMode: boolean;
  setPresentationMode: (m: boolean) => void;
}

// Subcomponent inside Canvas to execute the physics simulation loop
function PhysicsEngine({
  gravity,
  windForce,
  activeTool,
  bodies,
  setBodiesState,
  grabbedIndex,
  setGrabbedIndex,
  grabTarget,
  envelopeOpen,
  setEnvelopeOpen,
  candlesLit,
  setCandlesLit,
  birthdayName,
  selectedLayerId,
  setSelectedLayerId,
  presentationMode,
  letterText,
}: {
  gravity: number;
  windForce: number;
  activeTool: string;
  bodies: React.MutableRefObject<RigidBody[]>;
  setBodiesState: (b: RigidBody[]) => void;
  grabbedIndex: React.MutableRefObject<number>;
  setGrabbedIndex: (idx: number) => void;
  grabTarget: React.MutableRefObject<THREE.Vector3>;
  envelopeOpen: boolean;
  setEnvelopeOpen: (open: boolean) => void;
  candlesLit: boolean[];
  setCandlesLit: React.Dispatch<React.SetStateAction<boolean[]>>;
  birthdayName: string;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  presentationMode: boolean;
  letterText: string;
}) {
  const { camera } = useThree();

  // Control camera transitions based on selected layer or presentationMode
  useFrame((state, delta) => {
    // Restrict delta to avoid giant physics steps when tab is unfocused
    const dt = Math.min(delta, 0.03);

    // 1. Camera sweeping logic
    if (presentationMode) {
      const time = state.clock.getElapsedTime() * 0.15;
      const targetPos = new THREE.Vector3(Math.sin(time) * 11, 4.5, Math.cos(time) * 11);
      camera.position.lerp(targetPos, 0.04);
      camera.lookAt(0, 1.2, 0);
    } else if (selectedLayerId === "cake") {
      camera.position.lerp(new THREE.Vector3(0, 3.5, 5), 0.05);
      camera.lookAt(0, 1.2, 0);
    } else if (selectedLayerId === "envelope") {
      camera.position.lerp(new THREE.Vector3(2.5, 1.8, 1), 0.05);
      camera.lookAt(2, 0.5, -1);
    } else if (selectedLayerId === "balloons") {
      camera.position.lerp(new THREE.Vector3(0, 3.0, 6), 0.05);
      camera.lookAt(0, 4.0, 0);
    } else {
      camera.position.lerp(new THREE.Vector3(0, 4.5, 10.5), 0.05);
      camera.lookAt(0, 1.0, 0);
    }

    // 2. Physics Simulation Loop
    const list = bodies.current;
    const floor = 0;
    const bounds = 6.5;

    list.forEach((body, idx) => {
      // Apply spring force if grabbed
      if (body.isGrabbed && idx === grabbedIndex.current) {
        const springK = 180;
        const dragSpring = (grabTarget.current.clone().sub(body.position)).multiplyScalar(springK * dt);
        body.velocity.add(dragSpring);
        body.velocity.multiplyScalar(Math.max(0, 1 - 10 * dt));
      } else {
        // Normal forces: Gravity & Buoyancy
        if (body.type === "balloon") {
          const buoyancy = 3.0;
          body.velocity.y += (buoyancy - gravity * 0.1) * dt;
          body.velocity.multiplyScalar(Math.max(0, 1 - 0.5 * dt));
        } else {
          body.velocity.y -= gravity * dt;
          body.velocity.multiplyScalar(Math.max(0, 1 - 0.2 * dt));
        }

        // Wind force
        body.velocity.x += windForce * dt * (body.type === "balloon" ? 1.5 : 0.4);
      }

      // Update position
      body.position.addScaledVector(body.velocity, dt);

      // Rotate objects
      body.rotation.x += body.rotVelocity.x * dt;
      body.rotation.y += body.rotVelocity.y * dt;
      body.rotation.z += body.rotVelocity.z * dt;

      body.rotVelocity.multiplyScalar(Math.max(0, 1 - 0.5 * dt));

      // Floor Collisions
      if (body.type === "balloon") {
        if (body.position.y > 6.0) {
          body.position.y = 6.0;
          body.velocity.y = -body.velocity.y * body.restitution;
        }
      } else {
        const radiusOffset = body.type === "sphere" ? body.radius : 0.2;
        if (body.position.y < floor + radiusOffset) {
          body.position.y = floor + radiusOffset;
          body.velocity.y = -body.velocity.y * body.restitution;
          body.velocity.x *= 0.8;
          body.velocity.z *= 0.8;
        }
      }

      // Boundary Collisions (Walls)
      if (body.position.x < -bounds) {
        body.position.x = -bounds;
        body.velocity.x = -body.velocity.x * body.restitution;
      }
      if (body.position.x > bounds) {
        body.position.x = bounds;
        body.velocity.x = -body.velocity.x * body.restitution;
      }
      if (body.position.z < -bounds) {
        body.position.z = -bounds;
        body.velocity.z = -body.velocity.z * body.restitution;
      }
      if (body.position.z > bounds) {
        body.position.z = bounds;
        body.velocity.z = -body.velocity.z * body.restitution;
      }

      // Collisions between bodies
      for (let j = idx + 1; j < list.length; j++) {
        const other = list[j];
        const distVec = other.position.clone().sub(body.position);
        const dist = distVec.length();
        const minDistance = (body.type === "sphere" ? body.radius : 0.3) + (other.type === "sphere" ? other.radius : 0.3);

        if (dist < minDistance) {
          const overlap = minDistance - dist;
          const normal = distVec.clone().normalize();
          
          if (!body.isGrabbed) body.position.addScaledVector(normal, -overlap * 0.5);
          if (!other.isGrabbed) other.position.addScaledVector(normal, overlap * 0.5);

          const relativeVel = other.velocity.clone().sub(body.velocity);
          const speedAlongNormal = relativeVel.dot(normal);

          if (speedAlongNormal < 0) {
            const e = Math.min(body.restitution, other.restitution);
            const impulseScalar = -(1 + e) * speedAlongNormal / (1 / body.mass + 1 / other.mass);
            const impulse = normal.clone().multiplyScalar(impulseScalar);

            if (!body.isGrabbed) body.velocity.addScaledVector(impulse, -1 / body.mass);
            if (!other.isGrabbed) other.velocity.addScaledVector(impulse, 1 / other.mass);

            body.rotVelocity.add(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(2));
            other.rotVelocity.add(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(2));
          }
        }
      }
    });

    if (state.clock.getElapsedTime() % 0.05 < 0.015) {
      setBodiesState([...bodies.current]);
    }
  });

  return null;
}

// Main component
export default function LuxeThreeDScene({
  birthdayName,
  setBirthdayName,
  frostingColor,
  setFrostingColor,
  gravity,
  setGravity,
  windForce,
  setWindForce,
  theme,
  setTheme,
  letterText,
  setLetterText,
  activeTool,
  setActiveTool,
  presentationMode,
  setPresentationMode,
}: LuxeThreeDSceneProps) {
  // 3D physics bodies ref
  const bodiesRef = useRef<RigidBody[]>([
    {
      id: "balloon-1",
      type: "balloon",
      position: new THREE.Vector3(-1.5, 2, 1),
      velocity: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(),
      rotVelocity: new THREE.Vector3(),
      radius: 0.45,
      size: new THREE.Vector3(0.9, 1.2, 0.9),
      mass: 1,
      restitution: 0.8,
      color: "#F7E7CE",
    },
    {
      id: "balloon-2",
      type: "balloon",
      position: new THREE.Vector3(1.5, 2.5, 0.5),
      velocity: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(),
      rotVelocity: new THREE.Vector3(),
      radius: 0.45,
      size: new THREE.Vector3(0.9, 1.2, 0.9),
      mass: 1,
      restitution: 0.8,
      color: "#B76E79",
    },
    {
      id: "candy-1",
      type: "sphere",
      position: new THREE.Vector3(-0.5, 4, 0.2),
      velocity: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(),
      rotVelocity: new THREE.Vector3(1, 2, 0.5),
      radius: 0.2,
      size: new THREE.Vector3(),
      mass: 1.5,
      restitution: 0.6,
      color: "#D4AF37",
    },
  ]);

  const [bodies, setBodiesState] = useState<RigidBody[]>(bodiesRef.current);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [candlesLit, setCandlesLit] = useState<boolean[]>(Array(20).fill(true));
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  // Microphone detection setup
  const [micThreshold] = useState(0.15);
  const micVolume = useMicBlow(() => {
    setCandlesLit((prev) => {
      const idx = prev.findIndex((lit) => lit);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = false;
        return updated;
      }
      return prev;
    });
  }, micThreshold, true);

  // Drag tracking refs
  const grabbedIndex = useRef<number>(-1);
  const grabTarget = useRef<THREE.Vector3>(new THREE.Vector3());

  // Confetti explosion handler
  const handleConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#D4AF37", "#F7E7CE", "#B76E79", "#ffffff"],
    });
  };

  // Spark confetti when cake candles are all blown out
  useEffect(() => {
    if (candlesLit.every((c) => !c)) {
      handleConfetti();
      const t = setTimeout(() => setCandlesLit(Array(20).fill(true)), 10000);
      return () => clearTimeout(t);
    }
  }, [candlesLit]);

  // Spawns wishes as a falling 3D neon text block
  const handleSpawnBalloon = (wishText: string) => {
    const id = "wish-" + Date.now();
    const newBody: RigidBody = {
      id,
      type: "text",
      position: new THREE.Vector3((Math.random() - 0.5) * 3, 5.0, (Math.random() - 0.5) * 2),
      velocity: new THREE.Vector3(0, -1, 0),
      rotation: new THREE.Euler(0, (Math.random() - 0.5) * 0.5, 0),
      rotVelocity: new THREE.Vector3(0.5, 1, 0),
      radius: 0.35,
      size: new THREE.Vector3(1.5, 0.4, 0.4),
      mass: 2,
      restitution: 0.7,
      color: theme === "gold" ? "#D4AF37" : theme === "emerald" ? "#14B8A6" : "#EC4899",
      text: wishText,
    };
    bodiesRef.current.push(newBody);
    setBodiesState([...bodiesRef.current]);
  };

  // Drag pointer down listener
  const handlePointerDown = (idx: number, e: any) => {
    if (activeTool !== "select") return;
    e.stopPropagation();
    grabbedIndex.current = idx;
    bodiesRef.current[idx].isGrabbed = true;
    grabTarget.current.copy(e.point);
  };

  // Drag pointer move listener
  const handlePointerMove = (e: any) => {
    if (grabbedIndex.current === -1) return;
    e.stopPropagation();
    grabTarget.current.copy(e.point);
  };

  // Drag pointer up listener
  const handlePointerUp = () => {
    if (grabbedIndex.current !== -1) {
      bodiesRef.current[grabbedIndex.current].isGrabbed = false;
      grabbedIndex.current = -1;
    }
  };

  // Erase clicked element
  const handleErase = (idx: number, e: any) => {
    if (activeTool !== "eraser") return;
    e.stopPropagation();
    bodiesRef.current.splice(idx, 1);
    setBodiesState([...bodiesRef.current]);
  };

  // Toggle candle blowout manually
  const handleCandleClick = (idx: number, e: any) => {
    e.stopPropagation();
    setCandlesLit((prev) => {
      const updated = [...prev];
      updated[idx] = !updated[idx];
      return updated;
    });
  };

  return (
    <div
      className={`w-screen h-screen relative bg-[#050505] overflow-hidden custom-cursor-active`}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* 
        OPTIMIZED CANVAS SETTINGS:
        - shadows={false} for zero shadow mapping overhead
        - dpr={[1, 1.5]} limits resolution on high DPI screens to prevent lag
        - performance={{ min: 0.5 }} adjusts rendering parameters dynamically
      */}
      <Canvas shadows={false} dpr={[1, 1.5]} performance={{ min: 0.5 }} camera={{ position: [0, 4.5, 10.5], fov: 45 }}>
        <fog attach="fog" args={["#050505", 8, 22]} />

        {/* Ambient & optimized Spotlights (no castShadow) */}
        <ambientLight intensity={0.6} />
        <spotLight
          position={[5, 12, 5]}
          angle={0.25}
          penumbra={1}
          intensity={6}
          color={theme === "emerald" ? "#2DD4BF" : "#FFF7ED"}
        />
        <spotLight
          position={[-6, 8, -3]}
          angle={0.3}
          penumbra={1}
          intensity={3}
          color={theme === "rosegold" ? "#EC4899" : "#FACC15"}
        />

        {/* 3D Holographic Figma Controls in Space */}
        <group position={[0, 3.8, -1.8]}>
          <Html distanceFactor={8} transform>
            <HoloHeader
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              birthdayName={birthdayName}
              presentationMode={presentationMode}
              setPresentationMode={setPresentationMode}
              onTriggerConfetti={handleConfetti}
            />
          </Html>
        </group>

        {/* Holographic Left Sidebar Panel */}
        <group position={[-5.8, 1.2, 0]} rotation={[0, Math.PI / 10, 0]}>
          <Html distanceFactor={8} transform>
            <HoloLeftPanel
              selectedLayerId={selectedLayerId}
              setSelectedLayerId={setSelectedLayerId}
              wishes={bodies.filter((b) => b.type === "text").map((b) => b.text || "")}
            />
          </Html>
        </group>

        {/* Holographic Right Sidebar Panel */}
        <group position={[5.8, 1.2, 0]} rotation={[0, -Math.PI / 10, 0]}>
          <Html distanceFactor={8} transform>
            <HoloRightPanel
              selectedLayerId={selectedLayerId}
              birthdayName={birthdayName}
              setBirthdayName={setBirthdayName}
              frostingColor={frostingColor}
              setFrostingColor={setFrostingColor}
              gravity={gravity}
              setGravity={setGravity}
              windForce={windForce}
              setWindForce={setWindForce}
              theme={theme}
              setTheme={setTheme}
              letterText={letterText}
              setLetterText={setLetterText}
              onTriggerConfetti={handleConfetti}
              onSpawnBalloon={handleSpawnBalloon}
            />
          </Html>
        </group>

        {/* Simulated cursors of collaborative editors */}
        <HoloCursor />

        {/* PHYSICS ENGINE SIMULATION CONTROLLER */}
        <PhysicsEngine
          gravity={gravity}
          windForce={windForce}
          activeTool={activeTool}
          bodies={bodiesRef}
          setBodiesState={setBodiesState}
          grabbedIndex={grabbedIndex}
          setGrabbedIndex={(idx) => (grabbedIndex.current = idx)}
          grabTarget={grabTarget}
          envelopeOpen={envelopeOpen}
          setEnvelopeOpen={setEnvelopeOpen}
          candlesLit={candlesLit}
          setCandlesLit={setCandlesLit}
          birthdayName={birthdayName}
          selectedLayerId={selectedLayerId}
          setSelectedLayerId={setSelectedLayerId}
          presentationMode={presentationMode}
          letterText={letterText}
        />

        {/* STAGE & PHYSICS MESHES */}

        {/* 1. Reflective Floor (optimized, no clearcoat/reflections calculation) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial
            color="#0A0A0A"
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>
        
        {/* Figma Ruler Grid Lines on Floor */}
        <gridHelper args={[20, 20, "#D4AF37", "#222222"]} position={[0, 0.005, 0]} />

        {/* 2. Birthday Cake Section */}
        <group
          position={[0, 0, 0]}
          onClick={() => setSelectedLayerId("cake")}
          onPointerOver={(e) => (document.body.style.cursor = "pointer")}
          onPointerOut={(e) => (document.body.style.cursor = "default")}
        >
          {/* Cake Stand / Gold Plate */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[2.0, 2.1, 0.1, 24]} />
            <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.7} />
          </mesh>

          {/* Lower Cake Tier */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[1.7, 1.7, 0.8, 24]} />
            <meshStandardMaterial
              color={frostingColor}
              roughness={0.5}
              metalness={0.1}
            />
          </mesh>

          {/* Gold Divider Trim */}
          <mesh position={[0, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.4, 0.05, 12, 48]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.7} roughness={0.3} />
          </mesh>

          {/* Top Cake Tier */}
          <mesh position={[0, 1.3, 0]}>
            <cylinderGeometry args={[1.3, 1.3, 0.8, 24]} />
            <meshStandardMaterial
              color={frostingColor}
              roughness={0.5}
              metalness={0.1}
            />
          </mesh>

          {/* Gold leaf flakes / Sprinkles on Cake */}
          <Float speed={1} floatIntensity={0.1}>
            <mesh position={[0, 1.75, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.0, 0.03, 12, 48]} />
              <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.2} />
            </mesh>
          </Float>

          {/* Candles (20 candles arranged dynamically in a circle) */}
          {Array.from({ length: 20 }).map((_, i) => {
            const angle = (i / 20) * Math.PI * 2;
            const radius = 0.75;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            return (
              <group key={i} position={[x, 1.8, z]}>
                {/* Candle Body */}
                <mesh position={[0, 0.25, 0]}>
                  <cylinderGeometry args={[0.025, 0.025, 0.45, 8]} />
                  <meshStandardMaterial color="#D4AF37" metalness={0.7} roughness={0.3} />
                </mesh>
                {/* Candle Flame */}
                {candlesLit[i] && (
                  <group position={[0, 0.5, 0]} onClick={(e) => handleCandleClick(i, e)}>
                    {/* Flicker flame based on mic volume */}
                    <mesh scale={[1 + micVolume * 1.5, 1 + micVolume * 3, 1 + micVolume * 1.5]}>
                      <sphereGeometry args={[0.045, 8, 8]} />
                      <meshBasicMaterial color="#FFB84D" />
                    </mesh>
                    <pointLight distance={1.2} intensity={1.2 + micVolume * 2} color="#FF9933" />
                  </group>
                )}
              </group>
            );
          })}

          {/* Floating Birthday Banner above Cake (Standard fallback fonts for speed) */}
          <group position={[0, 2.7, 0]}>
            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
              <Text
                fontSize={0.25}
                color="#D4AF37"
                anchorX="center"
                anchorY="middle"
                maxWidth={3}
                outlineWidth={0.02}
                outlineColor="#000000"
              >
                {`Happy Birthday\n${birthdayName || "!"}`}
              </Text>
            </Float>
          </group>
        </group>

        {/* 3. Luxe Foldable Envelope / Letter Section */}
        <group
          position={[2.5, 0, -1.5]}
          rotation={[0, -Math.PI / 8, 0]}
          onClick={() => {
            setSelectedLayerId("envelope");
            setEnvelopeOpen(!envelopeOpen);
          }}
          onPointerOver={(e) => (document.body.style.cursor = "pointer")}
          onPointerOut={(e) => (document.body.style.cursor = "default")}
        >
          {/* Main Envelope Body */}
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[1.4, 0.08, 0.9]} />
            <meshStandardMaterial
              color="#0F0F0F"
              roughness={0.5}
              metalness={0.2}
            />
          </mesh>

          {/* Wax Stamp Seal */}
          {!envelopeOpen && (
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
              <meshStandardMaterial color="#B71C1C" roughness={0.7} />
            </mesh>
          )}

          {/* Sliding Parchment Letter out of Envelope */}
          <group
            position={[0, envelopeOpen ? 0.8 : 0.1, -0.05]}
            rotation={[envelopeOpen ? -Math.PI / 12 : 0, 0, 0]}
          >
            <mesh>
              <boxGeometry args={[1.2, 0.04, 0.8]} />
              <meshStandardMaterial color="#FFFEEF" roughness={0.8} />
            </mesh>
            {envelopeOpen && (
              <Html distanceFactor={4} position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]} transform>
                <div className="w-[160px] max-h-[100px] overflow-hidden p-2 text-[6px] text-black font-serif select-none leading-normal">
                  <p className="font-bold border-b border-black/10 pb-0.5 mb-1">To My Dear,</p>
                  <p className="whitespace-pre-wrap">{letterText}</p>
                </div>
              </Html>
            )}
          </group>
        </group>



        {/* 5. Helium Balloons & Candies Rigid Bodies */}
        {bodies.map((body, idx) => {
          if (body.type === "balloon") {
            return (
              <group
                key={body.id}
                position={[body.position.x, body.position.y, body.position.z]}
                rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
                onPointerDown={(e) => handlePointerDown(idx, e)}
                onClick={(e) => {
                  handleErase(idx, e);
                  setSelectedLayerId("balloons");
                }}
                onPointerOver={(e) => (document.body.style.cursor = "pointer")}
                onPointerOut={(e) => (document.body.style.cursor = "default")}
              >
                {/* Balloon Pearl Sphere */}
                <mesh>
                  <sphereGeometry args={[body.radius, 16, 16]} />
                  <meshStandardMaterial
                    color={body.color}
                    roughness={0.2}
                    metalness={0.5}
                  />
                </mesh>
                {/* Balloon base cone */}
                <mesh position={[0, -body.radius - 0.05, 0]}>
                  <coneGeometry args={[0.06, 0.1, 8]} />
                  <meshStandardMaterial color={body.color} roughness={0.3} />
                </mesh>
                {/* Balloon thread line */}
                <mesh position={[0, -body.radius - 0.6, 0]}>
                  <cylinderGeometry args={[0.005, 0.005, 1.0, 4]} />
                  <meshStandardMaterial color="#555555" />
                </mesh>
              </group>
            );
          } else if (body.type === "text") {
            return (
              <group
                key={body.id}
                position={[body.position.x, body.position.y, body.position.z]}
                rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
                onPointerDown={(e) => handlePointerDown(idx, e)}
                onClick={(e) => handleErase(idx, e)}
                onPointerOver={(e) => (document.body.style.cursor = "pointer")}
                onPointerOut={(e) => (document.body.style.cursor = "default")}
              >
                {/* Rigid physical Text wish block */}
                <Text
                  fontSize={0.25}
                  color={body.color}
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.02}
                  outlineColor="#000000"
                >
                  {body.text || "Wish!"}
                </Text>
              </group>
            );
          } else {
            return (
              <mesh
                key={body.id}
                position={[body.position.x, body.position.y, body.position.z]}
                rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
                onPointerDown={(e) => handlePointerDown(idx, e)}
                onClick={(e) => handleErase(idx, e)}
                onPointerOver={(e) => (document.body.style.cursor = "pointer")}
                onPointerOut={(e) => (document.body.style.cursor = "default")}
              >
                <sphereGeometry args={[body.radius, 12, 12]} />
                <meshStandardMaterial color={body.color} roughness={0.1} metalness={0.9} />
              </mesh>
            );
          }
        })}

        {/* Environment preset for lighting and reflections */}
        <Environment preset="studio" />

        {/* Sparkles Floating in Scene (Optimized count: 20) */}
        <Sparkles count={20} scale={8} size={4} speed={0.4} opacity={0.6} color="#D4AF37" />
        
        {/* Orbit Controls */}
        <OrbitControls
          enableZoom={true}
          maxPolarAngle={Math.PI / 2.05}
          minDistance={3}
          maxDistance={15}
          makeDefault
        />
      </Canvas>
    </div>
  );
}
