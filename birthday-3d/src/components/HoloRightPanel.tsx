"use client";

import React, { useState } from "react";
import { Sliders, Sun, Palette, Wind, ShieldAlert, Heart, FileText, Send } from "lucide-react";

interface HoloRightPanelProps {
  selectedLayerId: string | null;
  birthdayName: string;
  setBirthdayName: (name: string) => void;
  frostingColor: string;
  setFrostingColor: (color: string) => void;
  gravity: number;
  setGravity: (g: number) => void;
  windForce: number;
  setWindForce: (w: number) => void;
  theme: string;
  setTheme: (t: string) => void;
  letterText: string;
  setLetterText: (text: string) => void;
  onTriggerConfetti: () => void;
  onSpawnBalloon: (wish: string) => void;
}

export default function HoloRightPanel({
  selectedLayerId,
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
  onTriggerConfetti,
  onSpawnBalloon,
}: HoloRightPanelProps) {
  const [wishInput, setWishInput] = useState("");

  const handleSpawnWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (wishInput.trim()) {
      onSpawnBalloon(wishInput.trim());
      setWishInput("");
    }
  };

  const themes = [
    { id: "gold", label: "Satin Gold", color: "#D4AF37" },
    { id: "rosegold", label: "Rose Satin", color: "#B76E79" },
    { id: "emerald", label: "Emerald Royal", color: "#0F766E" },
  ];

  const cakeFlavors = [
    { label: "Champagne", color: "#F7E7CE" },
    { label: "Strawberry", color: "#EC4899" },
    { label: "Dark Chocolate", color: "#2E1A0C" },
    { label: "Mint Cream", color: "#14B8A6" },
  ];

  return (
    <div className="holographic-panel w-[270px] h-[550px] p-4 text-white border-gold/30 flex flex-col font-sans select-none overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-goldAccent flex items-center gap-1.5">
          <Sliders size={14} /> Properties
        </span>
        <span className="text-[10px] text-gray-400 font-mono">Design</span>
      </div>

      {/* Contextual Panels */}
      {!selectedLayerId ? (
        /* CANVAS DEFAULT PANEL */
        <div className="space-y-5 text-xs flex-1">
          {/* Section: Name */}
          <div className="space-y-1.5">
            <label className="text-gray-400 font-mono uppercase text-[10px]">Birthday Name</label>
            <input
              type="text"
              value={birthdayName}
              onChange={(e) => setBirthdayName(e.target.value)}
              placeholder="Enter name..."
              className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-goldAccent font-mono"
            />
          </div>

          {/* Section: Color Theme */}
          <div className="space-y-2">
            <label className="text-gray-400 font-mono uppercase text-[10px] flex items-center gap-1">
              <Palette size={10} /> Brand Theme
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`py-2 px-1 rounded border text-[10px] text-center font-medium transition-all duration-300 ${
                    theme === t.id
                      ? "border-goldAccent bg-goldAccent/10 text-goldAccent shadow-[0_0_8px_rgba(250,204,21,0.2)]"
                      : "border-white/5 bg-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full mx-auto mb-1 border border-white/10"
                    style={{ backgroundColor: t.color }}
                  ></div>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Physics Engine */}
          <div className="space-y-3.5 border-t border-white/5 pt-4">
            <label className="text-gray-400 font-mono uppercase text-[10px] flex items-center gap-1">
              <Sun size={10} /> Gravity Controls
            </label>
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>Down Force</span>
                  <span className="font-mono">{gravity.toFixed(1)} m/s²</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={gravity}
                  onChange={(e) => setGravity(parseFloat(e.target.value))}
                  className="w-full accent-goldAccent bg-black/40 h-1 rounded"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>Silk Wind Speed</span>
                  <span className="font-mono">{windForce.toFixed(1)} m/s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.2"
                  value={windForce}
                  onChange={(e) => setWindForce(parseFloat(e.target.value))}
                  className="w-full accent-goldAccent bg-black/40 h-1 rounded"
                />
              </div>
            </div>
          </div>

          {/* Section: Quick Actions */}
          <div className="space-y-2 border-t border-white/5 pt-4">
            <label className="text-gray-400 font-mono uppercase text-[10px]">Quick Actions</label>
            <button
              onClick={onTriggerConfetti}
              className="w-full py-2 bg-gradient-to-r from-goldAccent to-roseGold text-black font-semibold rounded text-center transition-all duration-300 hover:scale-102 hover:shadow-[0_0_15px_rgba(250,204,21,0.2)]"
            >
              🎉 Release Gold Rain
            </button>
          </div>
        </div>
      ) : selectedLayerId === "cake" ? (
        /* CAKE PROPERTIES */
        <div className="space-y-5 text-xs flex-1">
          <div className="p-2.5 bg-goldAccent/5 border border-goldAccent/10 rounded-md text-goldAccent font-mono text-[10px] flex items-center gap-1.5">
            <ShieldAlert size={12} /> Editing Cake Geometry
          </div>

          {/* Frosting Selection */}
          <div className="space-y-2">
            <label className="text-gray-400 font-mono uppercase text-[10px]">Frosting Flavor</label>
            <div className="grid grid-cols-2 gap-2">
              {cakeFlavors.map((flavor) => (
                <button
                  key={flavor.label}
                  onClick={() => setFrostingColor(flavor.color)}
                  className={`p-2 rounded border text-left flex items-center gap-2 transition-all duration-300 ${
                    frostingColor === flavor.color
                      ? "border-goldAccent bg-goldAccent/10 text-white font-semibold"
                      : "border-white/5 bg-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/10 shrink-0"
                    style={{ backgroundColor: flavor.color }}
                  ></span>
                  <span className="truncate text-[10px]">{flavor.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Frosting Color Picker */}
          <div className="space-y-1.5">
            <label className="text-gray-400 font-mono uppercase text-[10px]">Custom Frosting Hex</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={frostingColor}
                onChange={(e) => setFrostingColor(e.target.value)}
                className="w-8 h-8 rounded border border-white/10 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={frostingColor}
                onChange={(e) => setFrostingColor(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded px-2.5 text-xs text-white focus:outline-none focus:border-goldAccent font-mono uppercase"
              />
            </div>
          </div>
        </div>
      ) : selectedLayerId === "envelope" ? (
        /* ENVELOPE PROPERTIES */
        <div className="space-y-5 text-xs flex-1">
          <div className="p-2.5 bg-roseGold/5 border border-roseGold/10 rounded-md text-roseGold font-mono text-[10px] flex items-center gap-1.5">
            <FileText size={12} /> Greeting Letter Layer
          </div>

          {/* Message Textarea */}
          <div className="space-y-2">
            <label className="text-gray-400 font-mono uppercase text-[10px]">Custom Greeting Letter</label>
            <textarea
              value={letterText}
              onChange={(e) => setLetterText(e.target.value)}
              rows={12}
              className="w-full bg-black/40 border border-white/10 rounded p-2.5 text-xs text-gray-300 focus:outline-none focus:border-goldAccent font-serif leading-relaxed"
              placeholder="Write a warm note..."
            ></textarea>
            <p className="text-[9px] text-gray-500 font-mono">
              Note: Clicking the 3D envelope opens/closes it and slides this letter out in 3D.
            </p>
          </div>
        </div>
      ) : (
        /* BALLOONS/WISHES PROPERTIES */
        <div className="space-y-5 text-xs flex-1">
          <div className="p-2.5 bg-goldAccent/5 border border-goldAccent/10 rounded-md text-goldAccent font-mono text-[10px] flex items-center gap-1.5">
            <Heart size={12} /> Spawn Wish Balloons
          </div>

          <form onSubmit={handleSpawnWish} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-gray-400 font-mono uppercase text-[10px]">Write your Wish</label>
              <input
                type="text"
                value={wishInput}
                onChange={(e) => setWishInput(e.target.value)}
                placeholder="Spawns physical 3D text block..."
                className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-goldAccent font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-goldAccent text-black font-semibold rounded flex items-center justify-center gap-1.5 transition-all duration-300 hover:scale-102 hover:shadow-[0_0_15px_rgba(250,204,21,0.2)]"
            >
              <Send size={12} /> Spawn Neon Text
            </button>
          </form>

          <div className="pt-2 border-t border-white/5 space-y-2">
            <span className="text-[10px] text-gray-500 font-mono block">HOW TO SPAWN WISHES:</span>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Type your wish above and click spawn. It creates a physical, rigid 3D block of neon text that falls and bounces inside the sandbox. Or use the Confetti Cannon to throw items.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
