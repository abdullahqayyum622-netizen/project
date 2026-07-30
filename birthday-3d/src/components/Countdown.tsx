"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Countdown({ birthDate = "08-04" }: { birthDate?: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // birthDate format is MM-DD (e.g., "08-04")
    const parts = birthDate.split("-");
    const month = parseInt(parts[0], 10) - 1; // 0-indexed
    const day = parseInt(parts[1], 10);

    const targetDate = new Date();
    targetDate.setMonth(month);
    targetDate.setDate(day);
    targetDate.setHours(0, 0, 0, 0);

    // If target birthday has already passed this year, set it for next year
    if (new Date().getTime() > targetDate.getTime()) {
      targetDate.setFullYear(targetDate.getFullYear() + 1);
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [birthDate]);

  return (
    <div className="flex justify-center gap-2 sm:gap-4 md:gap-8 mt-12 px-2">
      {[
        { label: "Days", value: timeLeft.days },
        { label: "Hours", value: timeLeft.hours },
        { label: "Minutes", value: timeLeft.minutes },
        { label: "Seconds", value: timeLeft.seconds },
      ].map((item, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 glass-card rounded-xl flex items-center justify-center mb-2 border border-white/10 hover:border-goldAccent/30 shadow-[0_4px_30px_rgba(0,0,0,0.4),0_0_15px_rgba(250,204,21,0.05)] transition-all duration-500">
            <span className="font-heading text-2xl sm:text-3xl md:text-5xl text-goldAccent font-bold">
              {item.value}
            </span>
          </div>
          <span className="font-body text-pinkGlow text-[10px] sm:text-xs md:text-sm uppercase tracking-widest">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
