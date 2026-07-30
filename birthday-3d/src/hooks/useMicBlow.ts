"use client";

import { useEffect, useRef, useState } from "react";

export function useMicBlow(
  onBlow: () => void,
  threshold = 0.15,
  isActive = true
) {
  const [volume, setVolume] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isBlowingRef = useRef(false);

  useEffect(() => {
    if (!isActive) return;

    let animationFrameId: number;

    const initMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        const source = audioContext.createMediaStreamSource(stream);
        sourceRef.current = source;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        dataArrayRef.current = dataArray;

        const checkVolume = () => {
          if (!analyserRef.current || !dataArrayRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);

          let sum = 0;
          for (let i = 0; i < dataArrayRef.current.length; i++) {
            sum += dataArrayRef.current[i];
          }
          const average = sum / dataArrayRef.current.length;
          const normalizedVolume = average / 128.0; // scale between 0 and 2 roughly
          setVolume(normalizedVolume);

          if (normalizedVolume > threshold) {
            if (!isBlowingRef.current) {
              isBlowingRef.current = true;
              onBlow();
            }
          } else {
            isBlowingRef.current = false;
          }

          animationFrameId = requestAnimationFrame(checkVolume);
        };

        checkVolume();
      } catch (err) {
        console.warn("Microphone access denied or error: ", err);
      }
    };

    initMic();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (sourceRef.current) sourceRef.current.disconnect();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
    };
  }, [onBlow, threshold, isActive]);

  return volume;
}
