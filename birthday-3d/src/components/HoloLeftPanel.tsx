"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Layers, ChevronDown, ChevronRight, Cake, Image, Mail, Heart } from "lucide-react";

interface HoloLeftPanelProps {
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  wishes: string[];
}

export default function HoloLeftPanel({
  selectedLayerId,
  setSelectedLayerId,
  wishes,
}: HoloLeftPanelProps) {
  const [expanded, setExpanded] = useState({
    cake: true,
    crystals: true,
    envelope: true,
    balloons: true,
  });

  const toggleExpand = (key: keyof typeof expanded) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const layers = [
    {
      id: "cake",
      icon: Cake,
      label: "🎂 3D Birthday Cake",
      sublayers: ["Cake.init() frosting", "System.candles = 20", "Console.write(Greeting)"],
    },
    {
      id: "envelope",
      icon: Mail,
      label: "✉️ Wax Envelope",
      sublayers: ["Crimson Seal", "Parchment Greeting"],
    },
    {
      id: "balloons",
      icon: Heart,
      label: "🎈 Helium Balloons",
      sublayers: wishes.length > 0 ? wishes.map((w, idx) => `Wish: ${w.slice(0, 15)}...`) : ["Wish.push(balloon)"],
    },
  ];

  return (
    <div className="holographic-panel w-[260px] h-[550px] p-4 text-white border-gold/30 flex flex-col font-sans select-none">
      {/* Figma Layers Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-goldAccent flex items-center gap-1.5">
          <Layers size={14} /> Layers
        </span>
        <span className="text-[10px] text-gray-400 font-mono">Page 1</span>
      </div>

      {/* Pages Dropdown Simulation */}
      <div className="text-xs font-semibold px-2 py-1.5 bg-white/5 border border-white/5 rounded-md mb-4 flex items-center justify-between">
        <span className="text-gray-300">📱 Main Workspace</span>
        <ChevronDown size={12} className="text-gray-400" />
      </div>

      {/* Layers Tree */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 text-xs font-mono">
        {layers.map((l) => {
          const isSelected = selectedLayerId === l.id;
          const isExpanded = expanded[l.id as keyof typeof expanded];
          const Icon = l.icon;

          return (
            <div key={l.id} className="space-y-0.5">
              {/* Parent Layer */}
              <div
                onClick={() => setSelectedLayerId(isSelected ? null : l.id)}
                className={`group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "bg-goldAccent/15 border-l-2 border-goldAccent text-goldAccent font-semibold"
                    : "hover:bg-white/5 text-gray-300"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(l.id as keyof typeof expanded);
                    }}
                    className="p-0.5 hover:bg-white/10 rounded cursor-pointer"
                  >
                    {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </span>
                  <Icon size={13} className={isSelected ? "text-goldAccent" : "text-gray-400"} />
                  <span className="truncate">{l.label}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  <Eye size={12} className="text-gray-400 hover:text-white" />
                </div>
              </div>

              {/* Sublayers */}
              {isExpanded && (
                <div className="pl-6 border-l border-white/5 ml-3 space-y-0.5">
                  {l.sublayers.map((sub, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-2 py-1 rounded text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
                    >
                      <span className="truncate">{sub}</span>
                      <Eye size={10} className="text-gray-600 hover:text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-white/10 text-[9px] text-gray-500 text-center font-mono">
        COLLABORATOR ACTIVE: Guest Editor
      </div>
    </div>
  );
}
