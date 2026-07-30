"use client";

import React from "react";

export default function NotFound() {
  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center font-sans">
      <div className="text-center p-6 max-w-sm">
        <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-goldAccent to-pinkGlow">404</h1>
        <p className="text-gray-400 text-sm mb-6">The page you are looking for does not exist.</p>
        <a 
          href="/" 
          className="px-6 py-2.5 bg-gradient-to-r from-goldAccent to-pinkGlow text-black font-semibold rounded-full text-xs uppercase tracking-wider hover:shadow-[0_0_15px_rgba(250,204,21,0.2)] transition-shadow duration-300"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
