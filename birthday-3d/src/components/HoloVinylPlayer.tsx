"use client";

import React, { useRef, useEffect } from "react";
import { Play, Pause, SkipForward, Music } from "lucide-react";

interface HoloVinylPlayerProps {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  musicSelected: number;
  setMusicSelected: (idx: number) => void;
  audioAnalysedVolume?: number; // Volume from 0 to 1 representing mic or music amplitude
}

export default function HoloVinylPlayer({
  isPlaying,
  setIsPlaying,
  musicSelected,
  setMusicSelected,
  audioAnalysedVolume = 0.1,
}: HoloVinylPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const playlist = [
    { title: "Satin Lounge Jazz", artist: "Gold Lounge Quartet" },
    { title: "Cinematic Time", artist: "Champagne Symphony" },
    { title: "Acoustic Candle", artist: "Luxe Acoustic Solo" },
  ];

  const handleNext = () => {
    setMusicSelected((musicSelected + 1) % playlist.length);
  };

  // Draw a smooth floating golden waveform inside a local canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let offset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barsCount = 20;
      const spacing = 4;
      const barWidth = (canvas.width - spacing * (barsCount - 1)) / barsCount;

      ctx.fillStyle = "rgba(212, 175, 55, 0.4)"; // Gold color with transparency

      for (let i = 0; i < barsCount; i++) {
        // Calculate dynamic height based on audio amplitude + sine waves
        const baseHeight = 4;
        const soundPulse = isPlaying ? audioAnalysedVolume * 35 : 0;
        const wave = Math.sin(i * 0.4 + offset) * 10;
        const finalHeight = Math.max(2, baseHeight + soundPulse + wave);

        const x = i * (barWidth + spacing);
        const y = canvas.height - finalHeight;

        // Rounded rect for bar
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, finalHeight, 2);
        ctx.fill();
      }

      offset += 0.08;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, audioAnalysedVolume]);

  return (
    <div className="holographic-panel w-[320px] p-3 text-white border-gold/30 flex items-center gap-4 select-none font-sans">
      {/* Spinning Gold Vinyl Record */}
      <div className="relative shrink-0 w-16 h-16 rounded-full border border-goldAccent/30 flex items-center justify-center bg-obsidian shadow-[0_0_12px_rgba(212,175,55,0.15)] overflow-hidden">
        {/* Record Grooves */}
        <div
          className={`absolute w-14 h-14 rounded-full border border-goldAccent/10 flex items-center justify-center ${
            isPlaying ? "animate-spin" : ""
          }`}
          style={{ animationDuration: "3s" }}
        >
          <div className="w-10 h-10 rounded-full border border-goldAccent/15 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border border-goldAccent/20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-goldAccent shadow-[0_0_8px_#D4AF37]"></div>
            </div>
          </div>
        </div>
        <Music className="absolute text-goldAccent/40 pointer-events-none" size={14} />
      </div>

      {/* Track Info & Controls */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div>
          <h4 className="text-[11px] font-bold text-goldAccent tracking-wide truncate">
            {playlist[musicSelected].title}
          </h4>
          <p className="text-[9px] text-gray-400 font-mono truncate">
            {playlist[musicSelected].artist}
          </p>
        </div>

        {/* Local visualizer */}
        <canvas ref={canvasRef} width={140} height={16} className="w-full h-[16px]" />

        {/* Music Buttons */}
        <div className="flex items-center gap-3 mt-0.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-6 h-6 rounded-full bg-goldAccent flex items-center justify-center text-black hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause size={10} fill="black" /> : <Play size={10} fill="black" className="ml-0.5" />}
          </button>
          <button
            onClick={handleNext}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <SkipForward size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
