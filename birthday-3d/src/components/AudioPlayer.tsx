"use client";

import { useEffect, useRef, useState } from 'react';
import { Music, Music4 } from 'lucide-react';

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Attempt to autoplay on interaction
    const handleInteraction = () => {
      if (!hasInteracted && audioRef.current) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          // Autoplay blocked
        });
        setHasInteracted(true);
      }
    };

    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, [hasInteracted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      <audio ref={audioRef} loop>
        <source src="https://cdn.pixabay.com/download/audio/2022/05/16/audio_01b0f59a93.mp3?filename=cinematic-time-lapse-115672.mp3" type="audio/mpeg" />
      </audio>
      
      <button 
        onClick={togglePlay}
        className="fixed bottom-5 right-5 z-50 p-3 sm:p-4 rounded-full glass-card hover:bg-white/10 transition-colors text-pinkGlow"
      >
        {isPlaying ? <Music size={24} /> : <Music4 size={24} className="text-gray-500" />}
      </button>
    </>
  );
}
