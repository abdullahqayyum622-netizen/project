"use client";

import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface CursorData {
  id: string;
  name: string;
  color: string;
  textColor: string;
  x: number;
  y: number;
  z: number;
  targetX: number;
  targetY: number;
  targetZ: number;
}

export default function HoloCursor() {
  const cursorsRef = useRef<CursorData[]>([
    {
      id: "mom",
      name: "Mom",
      color: "#EC4899", // pink
      textColor: "#ffffff",
      x: -3,
      y: 1,
      z: 2,
      targetX: -3,
      targetY: 1,
      targetZ: 2,
    },
    {
      id: "bestie",
      name: "Bestie ✨",
      color: "#D4AF37", // gold
      textColor: "#000000",
      x: 3,
      y: 0.5,
      z: 1,
      targetX: 3,
      targetY: 0.5,
      targetZ: 1,
    },
    {
      id: "alex",
      name: "Alex",
      color: "#3B82F6", // blue
      textColor: "#ffffff",
      x: 0,
      y: 2,
      z: 3,
      targetX: 0,
      targetY: 2,
      targetZ: 3,
    },
  ]);

  const [cursors, setCursors] = useState<CursorData[]>([]);

  // Randomly redirect cursors to simulate activity
  useEffect(() => {
    const interval = setInterval(() => {
      cursorsRef.current = cursorsRef.current.map((c) => {
        // Move towards center items (Cake is at [0,0,0], envelope at [2,0,-1], crystals at [-3,0,-2])
        const targets = [
          { x: 0, y: 1.5, z: 0 }, // Cake top
          { x: 2, y: 0.5, z: -1 }, // Envelope
          { x: -3, y: 1, z: -2 }, // Crystals
          { x: (Math.random() - 0.5) * 8, y: Math.random() * 3, z: (Math.random() - 0.5) * 6 }, // Random float
        ];
        const chosen = targets[Math.floor(Math.random() * targets.length)];
        return {
          ...c,
          targetX: chosen.x,
          targetY: chosen.y,
          targetZ: chosen.z,
        };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useFrame((state, delta) => {
    // Smoothly lerp cursor positions in 3D
    const updated = cursorsRef.current.map((c) => {
      const speed = 2.5 * delta;
      c.x = THREE.MathUtils.lerp(c.x, c.targetX, speed);
      c.y = THREE.MathUtils.lerp(c.y, c.targetY, speed);
      c.z = THREE.MathUtils.lerp(c.z, c.targetZ, speed);
      return { ...c };
    });
    setCursors(updated);
  });

  return (
    <group>
      {cursors.map((c) => (
        <group key={c.id} position={[c.x, c.y, c.z]}>
          <Html distanceFactor={8} transform>
            <div className="flex items-start select-none pointer-events-none origin-top-left scale-[0.6]">
              {/* Figma Styled Cursor Arrow */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] shrink-0"
              >
                <path
                  d="M1 1L7.5 17L10.5 11.5L16 8.5L1 1Z"
                  fill={c.color}
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              {/* Collaborator Name Tag */}
              <div
                className="ml-2.5 px-2 py-0.5 rounded text-[10px] font-bold font-mono whitespace-nowrap shadow-[0_2px_8px_rgba(0,0,0,0.4)] border border-white/10"
                style={{ backgroundColor: c.color, color: c.textColor }}
              >
                {c.name}
              </div>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}
