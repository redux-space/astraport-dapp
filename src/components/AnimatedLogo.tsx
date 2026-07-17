'use client';

import React from 'react';

export default function AnimatedLogo() {
  return (
    <div className="group flex items-center opacity-0 animate-fade-in">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/AstraPort_logo.svg"
        alt="AstraPort Logo"
        className="w-56 h-14 object-contain transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_12px_rgba(18,198,178,0.35)]"
      />
    </div>
  );
}
