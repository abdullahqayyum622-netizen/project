"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-black text-white flex items-center justify-center min-h-screen font-sans">
        <div className="text-center p-6">
          <h2 className="text-xl font-bold mb-4">Error occurred</h2>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-pink-500 rounded-full text-xs font-semibold"
          >
            Reset
          </button>
        </div>
      </body>
    </html>
  );
}
