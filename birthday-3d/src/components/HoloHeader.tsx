"use client";

import React from "react";
import { MousePointer, Orbit, Bomb, Trash2, Play, Pause, Sparkles } from "lucide-react";

interface HoloHeaderProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  birthdayName: string;
  presentationMode: boolean;
  setPresentationMode: (mode: boolean) => void;
  onTriggerConfetti: () => void;
}

export default function HoloHeader({
  activeTool,
  setActiveTool,
  birthdayName,
  presentationMode,
  setPresentationMode,
  onTriggerConfetti,
}: HoloHeaderProps) {
  const tools = [
    { id: "select", icon: MousePointer, label: "Grab (V)" },
    { id: "orbit", icon: Orbit, label: "Orbit (O)" },
    { id: "balloon", icon: Sparkles, label: "Balloon (B)" },
    { id: "confetti", icon: Bomb, label: "Confetti (C)" },
    { id: "eraser", icon: Trash2, label: "Eraser (E)" },
  ];

  return (
    <div className="holographic-panel px-6 py-3 w-[750px] flex items-center justify-between text-white border-gold/30">
      {/* Figma Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-gray-400">
        <span className="text-goldAccent font-semibold">Luxe Drafts</span>
        <span>/</span>
        <span className="text-gray-300 truncate max-w-[120px]">
          {birthdayName || "Birthday Sandbox"}
        </span>
        <span className="bg-goldAccent/10 border border-goldAccent/20 px-1.5 py-0.5 rounded text-[10px] text-goldAccent font-mono">
          3D Canvas
        </span>
      </div>

      {/* Figma Center: Toolbelt */}
      <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-lg border border-white/5">
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              title={t.label}
              className={`p-2 rounded-md transition-all duration-300 flex items-center gap-1 ${
                isActive
                  ? "bg-goldAccent text-black shadow-[0_0_15px_rgba(250,204,21,0.4)] scale-105"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={16} />
            </button>
          );
        })}
      </div>

      {/* Figma Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Confetti Quick Button */}
        <button
          onClick={onTriggerConfetti}
          className="px-3 py-1.5 rounded-md border border-goldAccent/30 text-xs font-mono text-goldAccent bg-goldAccent/5 hover:bg-goldAccent hover:text-black transition-all duration-300"
        >
          Confetti! 🎉
        </button>

        {/* Present mode */}
        <button
          onClick={() => setPresentationMode(!presentationMode)}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all duration-300 ${
            presentationMode
              ? "bg-roseGold text-white shadow-[0_0_15px_rgba(183,110,121,0.5)] animate-pulse"
              : "bg-goldAccent text-black hover:bg-opacity-80"
          }`}
        >
          {presentationMode ? <Pause size={12} /> : <Play size={12} />}
          {presentationMode ? "STOP" : "PRESENT"}
        </button>

        {/* Collaborative avatars */}
        <div className="flex -space-x-1.5">
          {["M", "B", "A", "Y"].map((init, i) => {
            const colors = [
              "bg-purple-500",
              "bg-pink-500",
              "bg-blue-500",
              "bg-amber-500",
            ];
            const borderColors = [
              "border-purple-300",
              "border-pink-300",
              "border-blue-300",
              "border-amber-300",
            ];
            return (
              <div
                key={init}
                title={`Collaborator ${init}`}
                className={`w-6 h-6 rounded-full border-2 ${borderColors[i]} ${colors[i]} flex items-center justify-center text-[10px] font-bold text-white shadow-[0_2px_5px_rgba(0,0,0,0.3)]`}
              >
                {init}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
