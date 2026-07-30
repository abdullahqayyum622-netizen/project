"use client";

import { useState, useEffect } from "react";
import LenisProvider from "../components/LenisProvider";
import CanvasIntro from "../components/CanvasIntro";
import AudioPlayer from "../components/AudioPlayer";
import Countdown from "../components/Countdown";
import ThreeSeaBottle from "../components/ThreeSeaBottle";
import ThreeCakeBottom from "../components/ThreeCakeBottom";
import { useMicBlow } from "../hooks/useMicBlow";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Settings, Share2, X, Sparkles, Check, Info, MessageSquare } from "lucide-react";
import { Suspense } from "react";

function CanvasLoader() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 backdrop-blur-sm z-30">
      <div className="w-8 h-8 border-4 border-goldAccent/30 border-t-goldAccent rounded-full animate-spin mb-4"></div>
      <span className="text-[10px] font-mono text-goldAccent tracking-widest uppercase animate-pulse">Initializing 3D Space...</span>
    </div>
  );
}

export default function Home() {
  // 1. Core Configurable States
  const [name, setName] = useState("Muziha Nayab");
  const [age, setAge] = useState(20);
  const [birthDate, setBirthDate] = useState("08-04"); // August 4th
  const [letterText, setLetterText] = useState(
    "Dear Muziha Nayab,\n\nOn this auspicious occasion of your 20th birthday, I would like to extend my warmest and most sincere congratulations to you. Turning twenty is a significant milestone, representing the threshold of new opportunities, growth, and academic achievements.\n\nAs your class fellow and the topper of our class, I have always observed your dedication, diligence, and polite demeanor in our lectures. Having you as a peer at the University of Chakwal is truly a privilege, and I hold your presence in our classroom in high regard.\n\nMay this coming year bring you immense success, health, and happiness. I hope you achieve all your academic aspirations and personal goals. Have a wonderful and blessed birthday.\n\nSincerely,\nYour Class Fellow"
  );

  // 2. Interactive States
  const [candlesLit, setCandlesLit] = useState<boolean[]>(Array(20).fill(true));
  const [introFinished, setIntroFinished] = useState(false);
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [letterModalOpen, setLetterModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");

  // 3. 3D Message in a Bottle (Sea Sandbox) States
  const [waveSpeed, setWaveSpeed] = useState(1.0);
  const [lightIntensity, setLightIntensity] = useState(1.0);
  const [activeWish, setActiveWish] = useState<{ sender: string; msg: string; idx: number } | null>(null);
  const [openedList, setOpenedList] = useState<boolean[]>(Array(10).fill(false));

  // 4. Form Editing Buffer States
  const [editName, setEditName] = useState(name);
  const [editAge, setEditAge] = useState(age);
  const [editBirthDate, setEditBirthDate] = useState(birthDate);
  const [editLetterText, setEditLetterText] = useState(letterText);

  // 5. Celebration Birthday Background States (Floating balloons + falling confetti flakes)
  const [bgBalloons, setBgBalloons] = useState<{ id: number; left: string; size: string; color: string; duration: string; delay: string }[]>([]);
  const [bgConfetti, setBgConfetti] = useState<{ id: number; left: string; color: string; size: string; duration: string; delay: string; angle: string }[]>([]);

  // 6. Classroom wishes list
  const classmateWishes = [
    { sender: "Ayesha", msg: "Muziha, wishing you a birthday that is as wonderful and bright as your presence in our lecture hall. May this milestone year bring you closer to all your ambitions." },
    { sender: "Hamza", msg: "Happy 20th Birthday, Muziha! It is truly a pleasure having you as a peer at the University of Chakwal. I wish you sound health and academic brilliance." },
    { sender: "Zainab", msg: "May this special day mark the beginning of a year filled with happiness, new insights, and outstanding achievements. Happy birthday to an admirable class fellow!" },
    { sender: "Bilal", msg: "Warmest congratulations on turning twenty, Muziha! Wishing you great success, peaceful study hours, and a very prosperous journey ahead." },
    { sender: "Fatima", msg: "Happy Birthday to one of the most dedicated and polite classmates in our department. May your diligence continue to pave the way to success." },
    { sender: "Usman", msg: "Wishing you a joyful birthday, Muziha! I hope your twenty-first year is filled with excellent opportunities, deep learning, and happiness." },
    { sender: "Sana", msg: "Hearty birthday greetings to you, Muziha! May your path be lined with peace, achievements, and all the goals you set for yourself." },
    { sender: "Ali", msg: "May this new chapter of your life be filled with prosperity, good health, and memorable milestones. Have an excellent birthday celebration!" },
    { sender: "Maryam", msg: "Happy 20th Birthday, Muziha! Wishing you a brilliant academic journey and great happiness in all your future endeavors." },
    { sender: "Hassan", msg: "It is a privilege to share the classroom with such an inspiring student. Wishing you a blessed and delightful birthday, Muziha!" }
  ];

  // 7. Microphone blowout detector
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
  }, 0.15, introFinished);

  // 8. Parameter Parser & Birthday Background Initialization on Mount
  useEffect(() => {
    // Generate 12 slow rising celebration balloons in background
    const balloonColors = ["rgba(236,72,153,0.18)", "rgba(250,204,21,0.15)", "rgba(109,40,217,0.15)", "rgba(183,110,121,0.18)"];
    const balloons = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: `${5 + Math.random() * 90}%`,
      size: `${35 + Math.random() * 35}px`,
      color: balloonColors[i % balloonColors.length] || "rgba(255,255,255,0.1)",
      duration: `${18 + Math.random() * 15}s`,
      delay: `${Math.random() * 10}s`,
    }));
    setBgBalloons(balloons);

    // Generate 25 slow falling confetti flakes in background
    const confettiColors = ["#EC4899", "#FACC15", "#A78BFA", "#F472B6", "#FFF"];
    const flakes = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: confettiColors[i % confettiColors.length] || "#FFF",
      size: `${4 + Math.random() * 5}px`,
      duration: `${10 + Math.random() * 12}s`,
      delay: `${Math.random() * 8}s`,
      angle: `${Math.random() * 360}deg`,
    }));
    setBgConfetti(flakes);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const nameParam = params.get("name");
      const ageParam = params.get("age");
      const dateParam = params.get("date");
      const msgParam = params.get("msg");

      let finalName = name;
      let finalAge = age;
      let finalDate = birthDate;
      let finalMsg = letterText;

      if (nameParam) {
        finalName = decodeURIComponent(nameParam);
        setName(finalName);
        setEditName(finalName);
      }
      if (ageParam) {
        const parsedAge = parseInt(ageParam, 10);
        if (!isNaN(parsedAge) && parsedAge > 0) {
          finalAge = parsedAge;
          setAge(finalAge);
          setEditAge(finalAge);
          setCandlesLit(Array(finalAge).fill(true));
        }
      }
      if (dateParam) {
        finalDate = decodeURIComponent(dateParam);
        setBirthDate(finalDate);
        setEditBirthDate(finalDate);
      }
      if (msgParam) {
        finalMsg = decodeURIComponent(msgParam);
        setLetterText(finalMsg);
        setEditLetterText(finalMsg);
      }
    }
  }, []);

  // 9. Save Custom Configurations
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setName(editName);
    setAge(editAge);
    setBirthDate(editBirthDate);
    setLetterText(editLetterText);

    // Rescale candles and reset wishing bottles
    setCandlesLit(Array(editAge).fill(true));
    setOpenedList(Array(10).fill(false));
    setActiveWish(null);
    setEnvelopeOpened(false);
    setSettingsOpen(false);
  };

  // 10. Generate Share Link (Query Params)
  const handleCopyLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const query = new URLSearchParams({
      name: encodeURIComponent(editName),
      age: editAge.toString(),
      date: encodeURIComponent(editBirthDate),
      msg: encodeURIComponent(editLetterText),
    }).toString();

    const shareUrl = `${baseUrl}?${query}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setShareStatus("copied");
        setTimeout(() => setShareStatus("idle"), 2500);
      })
      .catch((err) => {
        console.error("Copy failed", err);
      });
  };

  // 11. Handle Open Bottle
  const handleSelectWish = (wish: { sender: string; msg: string; idx: number } | null) => {
    setActiveWish(wish);
    if (wish !== null) {
      const idx = wish.idx;
      if (!openedList[idx]) {
        setOpenedList((prev) => {
          const updated = [...prev];
          updated[idx] = true;
          return updated;
        });

        confetti({
          particleCount: 50,
          spread: 40,
          origin: { y: 0.65 },
          colors: ["#b9e2e2", "#D4AF37", "#ffffff"],
        });
      }
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes floatUpBalloons {
          0% {
            transform: translateY(110vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.55;
          }
          90% {
            opacity: 0.55;
          }
          100% {
            transform: translateY(-20vh) rotate(180deg);
            opacity: 0;
          }
        }
        @keyframes floatDownConfetti {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.75;
          }
          90% {
            opacity: 0.75;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
        .perspective-1200 {
          perspective: 1200px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>

      {/* 3D Intro Gift Box */}
      {!introFinished && (
        <CanvasIntro name={name} onTransitionComplete={() => setIntroFinished(true)} />
      )}

      {/* Background Audio */}
      <AudioPlayer />

      {/* Floating Settings Gear Icon */}
      {introFinished && (
        <button
          onClick={() => setSettingsOpen(true)}
          className="fixed top-5 right-5 z-[90] p-3 rounded-full glass-card hover:bg-white/10 text-white transition-all duration-300 hover:rotate-45 shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/15 cursor-pointer"
          title="Customize Page Settings"
        >
          <Settings size={22} className="text-goldAccent" />
        </button>
      )}

      {/* Settings Modal Dashboard */}
      <AnimatePresence>
        {settingsOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative max-w-lg w-full bg-[#0d0d11]/90 border border-goldAccent/25 rounded-3xl p-6 md:p-8 shadow-[0_10px_50px_rgba(250,204,21,0.1)] text-white z-[160] overflow-y-auto max-h-[85vh] font-sans"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <h3 className="font-heading font-bold text-xl text-goldAccent flex items-center gap-2">
                  <Sparkles size={18} /> Customize Template
                </h3>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-sm font-light">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">
                    Birthday Person's Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-goldAccent font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">
                      Age
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={editAge}
                      onChange={(e) => setEditAge(parseInt(e.target.value, 10) || 1)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-goldAccent font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">
                      Birthday Date (MM-DD)
                    </label>
                    <input
                      type="text"
                      required
                      pattern="\d{2}-\d{2}"
                      value={editBirthDate}
                      onChange={(e) => setEditBirthDate(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-goldAccent font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">
                    Parchment Letter Content
                  </label>
                  <textarea
                    value={editLetterText}
                    onChange={(e) => setEditLetterText(e.target.value)}
                    rows={5}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-gray-300 focus:outline-none focus:border-goldAccent font-serif leading-relaxed"
                  ></textarea>
                </div>

                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex gap-2 text-xs text-gray-400 leading-normal mb-2">
                  <Info size={16} className="text-goldAccent shrink-0 mt-0.5" />
                  <p>
                    Saving will reset custom configurations. Click **Copy Shareable Link** to share!
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex-1 py-2.5 rounded-xl border border-goldAccent/30 text-xs font-mono text-goldAccent bg-goldAccent/5 hover:bg-goldAccent/10 flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer"
                  >
                    {shareStatus === "copied" ? (
                      <>
                        <Check size={14} /> Copied!
                      </>
                    ) : (
                      <>
                        <Share2 size={14} /> Copy Shareable Link
                      </>
                    )}
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-goldAccent to-pinkGlow text-black font-semibold hover:shadow-[0_0_15px_rgba(250,204,21,0.2)] hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                  >
                    Apply Settings
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Layout with Smooth Scrolling */}
      <LenisProvider>
        <main
          className={`transition-opacity duration-1000 relative min-h-screen text-white overflow-hidden ${
            introFinished ? "opacity-100" : "opacity-0 h-[100dvh] overflow-hidden"
          }`}
          style={{
            // Deep, midnight-plum celebration gradient replacing solid black
            background: "linear-gradient(to bottom, #0a040e 0%, #15091e 50%, #060209 100%)"
          }}
        >
          {/* Festive Celebratory Birthday Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            
            {/* 1. Slow rising background balloons */}
            {bgBalloons.map((b) => (
              <div
                key={`b-bal-${b.id}`}
                className="absolute rounded-full"
                style={{
                  left: b.left,
                  width: b.size,
                  height: `calc(${b.size} * 1.25)`,
                  backgroundColor: b.color,
                  bottom: "-100px",
                  animation: `floatUpBalloons ${b.duration} linear infinite`,
                  animationDelay: b.delay,
                  backdropFilter: "blur(2px)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "inset -5px -10px 20px rgba(0,0,0,0.2), 0 10px 20px rgba(0,0,0,0.15)",
                }}
              >
                {/* Balloon string tie node */}
                <div
                  className="absolute bottom-[-6px] left-[50%] -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px]"
                  style={{ borderBottomColor: b.color }}
                ></div>
              </div>
            ))}

            {/* 2. Slow falling background confetti flakes */}
            {bgConfetti.map((f) => (
              <div
                key={`b-conf-${f.id}`}
                className="absolute opacity-80"
                style={{
                  left: f.left,
                  width: f.size,
                  height: f.size,
                  backgroundColor: f.color,
                  top: "-20px",
                  transform: `rotate(${f.angle})`,
                  animation: `floatDownConfetti ${f.duration} linear infinite`,
                  animationDelay: f.delay,
                  borderRadius: f.id % 2 === 0 ? "50%" : "2px",
                }}
              />
            ))}

            {/* Glowing Nebulae */}
            <div className="absolute top-[10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purpleGlow/10 blur-[130px] mix-blend-screen animate-pulse duration-[10s]"></div>
            <div className="absolute top-[45%] right-[-15%] w-[60vw] h-[60vw] rounded-full bg-pinkGlow/8 blur-[150px] mix-blend-screen animate-pulse duration-[15s]"></div>
            <div className="absolute bottom-[5%] left-[5%] w-[45vw] h-[45vw] rounded-full bg-goldAccent/6 blur-[120px] mix-blend-screen animate-pulse duration-[12s]"></div>
          </div>

          {/* Section 1: Hero Landing Page */}
          <section className="relative min-h-[100dvh] flex flex-col items-center justify-center text-center px-4 pt-20 z-10">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="font-script text-pinkGlow text-5xl md:text-7xl mb-5 drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]"
            >
              Happy Birthday
            </motion.h2>

            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              className="font-heading text-6xl sm:text-7xl md:text-9xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-goldAccent via-pinkGlow to-purpleGlow drop-shadow-[0_0_40px_rgba(250,204,21,0.15)] tracking-tight leading-none"
            >
              {name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.6 }}
              className="max-w-xl text-base md:text-lg text-gray-300 font-light tracking-wide mb-14 leading-relaxed"
            >
              Today marks a beautiful milestone. Inspect the 3D ocean, click on floating glass bottles to extract parchment wishes, and read greetings from classmates!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.8 }}
              className="w-full"
            >
              <Countdown birthDate={birthDate} />
            </motion.div>
          </section>

          {/* Section 2: 3D Message in a Bottle Sea Sandbox */}
          <section className="py-28 px-4 w-full max-w-7xl mx-auto text-center relative border-t border-white/5 z-10">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="font-script text-pinkGlow text-5xl md:text-6xl mb-6 drop-shadow-[0_0_12px_rgba(236,72,153,0.2)]"
            >
              3D Message in a Bottle
            </motion.h2>
            <p className="text-gray-300 max-w-2xl mx-auto mb-14 text-sm md:text-base font-light leading-relaxed">
              Floating on the moving ocean waves are **10 glass message bottles**, each carrying a rolled-up parchment scroll with birthday wishes from your classmates.
            </p>

            <div className="relative glass-card rounded-3xl p-4 sm:p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] w-full max-w-5xl mx-auto flex flex-col gap-6 items-center">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-goldAccent rounded-tl-3xl"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-goldAccent rounded-tr-3xl"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-goldAccent rounded-bl-3xl"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-goldAccent rounded-br-3xl"></div>

              <div className="w-full relative h-[420px] sm:h-[580px] lg:h-[650px] z-0">
                <Suspense fallback={<CanvasLoader />}>
                  <ThreeSeaBottle
                    wishes={classmateWishes}
                    lightIntensity={lightIntensity}
                    waveSpeed={waveSpeed}
                    onSelectWish={handleSelectWish}
                    openedList={openedList}
                    setOpenedList={setOpenedList}
                    activeWishIdx={activeWish ? activeWish.idx : null}
                  />
                </Suspense>

                {/* Wish Card Scroll Overlay */}
                <AnimatePresence>
                  {activeWish !== null && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 15 }}
                      className="absolute inset-x-4 bottom-6 sm:bottom-10 max-w-lg mx-auto bg-[#0a0a0f]/90 border border-goldAccent/30 backdrop-blur-lg rounded-2xl p-6 shadow-[0_15px_40px_rgba(250,204,21,0.15)] text-left text-white z-20 flex flex-col justify-between gap-4 font-sans"
                    >
                      <div className="flex justify-between items-center border-b border-white/10 pb-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-goldAccent font-semibold">
                          Scroll Message Extracted 📜
                        </span>
                        <button
                          onClick={() => handleSelectWish(null)}
                          className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-full transition-colors cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-heading text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-goldAccent to-pinkGlow">
                          — Message from {activeWish.sender}
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed font-serif italic">
                          "{activeWish.msg}"
                        </p>
                      </div>

                      <button
                        onClick={() => handleSelectWish(null)}
                        className="w-full py-2.5 rounded-xl border border-white/15 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        Return Bottle to Sea 🌊
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* Section 3: Skeuomorphic 3D Animated Envelope */}
          <section className="py-24 px-4 flex flex-col items-center justify-center text-center border-t border-white/5 bg-black/20 z-10 relative">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="font-script text-pinkGlow text-5xl md:text-6xl text-center mb-6 drop-shadow-[0_0_12px_rgba(236,72,153,0.2)]"
            >
              A Letter For You
            </motion.h2>
            <p className="text-gray-300 max-w-sm mx-auto mb-14 text-sm font-light leading-relaxed">
              Click the wax seal of this luxury envelope. Click the letter to expand it into full view.
            </p>

            <div className="relative w-[340px] h-[220px] sm:w-[520px] sm:h-[320px] mx-auto mt-6 mb-32 perspective-1200 select-none">
              <div
                onClick={() => setEnvelopeOpened(!envelopeOpened)}
                className={`relative w-full h-full preserve-3d transition-transform duration-1000 ease-in-out cursor-pointer ${
                  envelopeOpened ? "rotate-x-[12deg] translate-y-[60px]" : ""
                }`}
              >
                {/* 1. Envelope Back Flap */}
                <div className="absolute inset-0 bg-[#121113] border border-white/5 rounded-2xl shadow-2xl z-0 preserve-3d">
                  <div className="absolute inset-2 border border-goldAccent/15 rounded-xl bg-gradient-to-tr from-[#1b191c] to-[#0f0e10] flex items-center justify-center overflow-hidden">
                    <div className="absolute w-[200%] h-[200%] bg-[linear-gradient(45deg,#000_25%,transparent_25%),linear-gradient(-45deg,#000_25%,transparent_25%)] bg-[size:20px_20px] opacity-10"></div>
                  </div>
                </div>

                {/* 2. The Letter */}
                <div
                  className={`absolute left-[6%] right-[6%] top-4 bg-gradient-to-b from-[#fdfbf7] via-[#faf6eb] to-[#f4edd5] text-[#2c281e] p-6 sm:p-10 shadow-2xl rounded-xl transition-all duration-1000 ease-in-out z-10 border border-[#e5dcbe] ${
                    envelopeOpened
                      ? "-translate-y-[280px] sm:-translate-y-[320px] scale-[1.04] opacity-100 rotate-1"
                      : "translate-y-0 opacity-0 scale-95 pointer-events-none"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLetterModalOpen(true);
                  }}
                >
                  <div className="border border-dashed border-[#cdbf9a] p-1 h-full rounded-lg">
                    <div className="border border-solid border-[#cdbf9a]/40 p-4 h-full rounded flex flex-col justify-between">
                      <p className="font-serif italic text-left text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-[#3a3528] line-clamp-4">
                        {letterText}
                      </p>
                      <span className="text-[9px] font-mono tracking-widest text-[#cdbf9a] uppercase text-center block mt-3 font-semibold">
                        🔍 Click to Expand and Read Full Letter
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Envelope Left & Right flaps */}
                <div
                  className="absolute inset-0 bg-[#1a181b] border-l border-[#d4af37]/5 z-20"
                  style={{
                    clipPath: "polygon(0 0, 48% 50%, 0 100%)",
                  }}
                ></div>
                <div
                  className="absolute inset-0 bg-[#1a181b] border-r border-[#d4af37]/5 z-20"
                  style={{
                    clipPath: "polygon(100% 0, 52% 50%, 100% 100%)",
                  }}
                ></div>

                {/* 4. Envelope Bottom flap */}
                <div
                  className="absolute inset-0 bg-[#161417] border-b border-[#d4af37]/10 rounded-b-2xl shadow-[inset_0_4px_10px_rgba(0,0,0,0.4)] z-20"
                  style={{
                    clipPath: "polygon(0 100%, 50% 48%, 100% 100%)",
                  }}
                ></div>

                {/* 5. Envelope Top Flap */}
                <div
                  className="absolute inset-0 bg-[#211e22] border-t border-[#d4af37]/20 rounded-t-2xl origin-top transition-transform duration-700 ease-in-out z-25"
                  style={{
                    clipPath: "polygon(0 0, 50% 50%, 100% 0)",
                    transform: envelopeOpened ? "rotateX(180deg)" : "rotateX(0deg)",
                    zIndex: envelopeOpened ? 0 : 25,
                  }}
                ></div>

                {/* 6. Gold Metallic Wax Seal */}
                <div
                  className={`absolute top-[48%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-[#ffd700] via-[#d4af37] to-[#aa7c11] border-2 border-white/20 shadow-2xl flex items-center justify-center font-bold text-[#453610] text-lg font-heading z-30 transition-all duration-700 ease-in-out cursor-pointer hover:scale-110 active:scale-95 ${
                    envelopeOpened ? "scale-0 opacity-0 rotate-[360deg] pointer-events-none" : ""
                  }`}
                  style={{
                    boxShadow: "0 0 20px rgba(212, 175, 55, 0.4), inset 0 2px 4px rgba(255,255,255,0.4)",
                  }}
                >
                  <span className="drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]">★</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Class Fellow Wishes Wall */}
          <section className="py-24 px-4 border-t border-white/5 bg-black/20 z-10 relative">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="font-script text-pinkGlow text-5xl md:text-6xl mb-4 drop-shadow-[0_0_12px_rgba(236,72,153,0.2)]"
                >
                  Class Fellow Wishes Wall
                </motion.h2>
                <p className="text-gray-300 max-w-xl mx-auto text-sm md:text-base font-light">
                  A collection of warm, formal congratulations from your peers at the University of Chakwal.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classmateWishes.map((wish, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.6 }}
                    whileHover={{ y: -6, scale: 1.01 }}
                    className="glass-card rounded-2xl p-6 border border-white/10 hover:border-goldAccent/20 shadow-[0_4px_30px_rgba(0,0,0,0.3)] transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-pinkGlow/5 rounded-full blur-xl group-hover:bg-pinkGlow/10 transition-colors"></div>
                    
                    <div className="space-y-4">
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-pinkGlow">
                        <MessageSquare size={14} />
                      </div>
                      <p className="text-gray-300 text-xs leading-relaxed font-serif italic">
                        "{wish.msg}"
                      </p>
                    </div>

                    <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                      <span>University of Chakwal</span>
                      <span className="text-goldAccent font-semibold">— {wish.sender}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 4.5: Large Still 3D Cake (Decorative) */}
          <section className="py-16 px-4 flex flex-col items-center justify-center text-center border-t border-white/5 bg-black/10 z-10 relative min-h-[360px]">
            <Suspense fallback={<CanvasLoader />}>
              <ThreeCakeBottom />
            </Suspense>
          </section>

          {/* Section 5: Reset / Replay */}
          <section className="py-24 px-4 flex flex-col items-center justify-center text-center border-t border-white/5 bg-black/30 z-10 relative">
            <h3 className="font-heading text-xl mb-4 text-gray-400">Want to run the 3D ceremony again?</h3>
            <button
              onClick={() => {
                setIntroFinished(false);
                setEnvelopeOpened(false);
                setOpenedList(Array(10).fill(false));
                setActiveWish(null);
                setCandlesLit(Array(age).fill(true));
              }}
              className="px-6 py-2 border border-white/20 rounded-full text-xs font-mono text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 cursor-pointer"
            >
              Reset 3D gift box ceremony
            </button>
          </section>
        </main>
      </LenisProvider>

      {/* Elegant Full-Screen Parchment Letter Modal */}
      <AnimatePresence>
        {letterModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLetterModalOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 120 }}
              className="relative w-full max-w-2xl bg-gradient-to-b from-[#fdfbf7] via-[#faf6eb] to-[#f4edd5] text-[#2c281e] p-8 sm:p-12 md:p-14 rounded-3xl border border-[#e5dcbe] shadow-[0_25px_60px_rgba(0,0,0,0.85)] z-[210] overflow-y-auto max-h-[85vh]"
            >
              <div className="absolute inset-4 border border-dashed border-[#cdbf9a] rounded-2xl pointer-events-none"></div>
              <div className="absolute inset-5 border border-solid border-[#cdbf9a]/30 rounded-2xl pointer-events-none"></div>

              <button
                onClick={() => setLetterModalOpen(false)}
                className="absolute top-8 right-8 z-[220] w-10 h-10 rounded-full bg-gradient-to-br from-[#ffd700] via-[#d4af37] to-[#aa7c11] border border-white/20 shadow-lg flex items-center justify-center font-bold text-[#453610] text-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              >
                ✕
              </button>

              <div className="relative font-serif italic text-sm sm:text-base md:text-lg leading-relaxed text-[#3a3528] space-y-6 pt-4 px-2">
                {letterText.split("\n\n").map((para, i) => (
                  <p key={i} className="indent-8 text-justify">
                    {para}
                  </p>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
