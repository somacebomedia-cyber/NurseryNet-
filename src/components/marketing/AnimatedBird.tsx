"use client";

import { useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';

const AnimatedBird = () => {
  const [isChirping, setIsChirping] = useState(false);

  const handleClick = () => {
    setIsChirping(true);
    setTimeout(() => setIsChirping(false), 2400);
  };

  return (
    <div 
      className="relative w-full h-full pointer-events-none" 
      aria-label="Flying mascot bird"
    >
      {/* Moving flight container that travels horizontally across the sky */}
      <div 
        className="absolute top-0 left-0 animate-bird-flight pointer-events-auto cursor-pointer select-none group"
        style={{ animationDelay: '-4s' }}
        onClick={handleClick}
        title="Click to chirp!"
      >
        {/* Bird hover & loop wrapper */}
        <div className={`relative transition-transform duration-500 ${isChirping ? 'rotate-[360deg] scale-110' : 'group-hover:scale-105'}`}>
          {/* Interactive chirp speech bubble */}
          {isChirping && (
            <div className="absolute -top-10 -right-6 z-30 bg-white/95 text-purple-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-lg border border-purple-200 animate-bounce flex items-center gap-1 whitespace-nowrap">
              <span>Tweet! 🎒✨</span>
              <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
            </div>
          )}

          {/* Sparkles / wind breeze trail behind the bird */}
          <div className="absolute top-6 -left-10 pointer-events-none opacity-75">
            <div className="flex items-center space-x-1">
              <span className="w-6 h-1 rounded-full bg-white/40 blur-[0.5px] animate-pulse" />
              <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="w-3 h-1 rounded-full bg-yellow-200/50" />
            </div>
          </div>

          {/* Bird SVG & Carrying Parcel */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 drop-shadow-xl">
            <svg
              viewBox="0 0 160 160"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full overflow-visible"
            >
              <defs>
                {/* Body Gradient */}
                <linearGradient id="birdBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDE047" />
                  <stop offset="60%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>

                {/* Belly Gradient */}
                <linearGradient id="birdBellyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FEF9C3" />
                  <stop offset="100%" stopColor="#FDE68A" />
                </linearGradient>

                {/* Wing Gradient */}
                <linearGradient id="birdWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FCD34D" />
                  <stop offset="100%" stopColor="#EA580C" />
                </linearGradient>

                {/* Parcel Gradient */}
                <linearGradient id="parcelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FB923C" />
                  <stop offset="100%" stopColor="#EA580C" />
                </linearGradient>
              </defs>

              {/* Back Wing (flaps behind body) */}
              <g className="animate-bird-wing-back">
                <path
                  d="M62,60 C52,25 22,25 35,58 C42,70 54,68 62,60 Z"
                  fill="#D97706"
                  opacity="0.85"
                />
              </g>

              {/* Tail Feathers */}
              <g>
                <path
                  d="M38,78 C20,70 12,82 22,90 C30,95 38,88 38,78 Z"
                  fill="#F59E0B"
                />
                <path
                  d="M40,84 C18,84 14,96 26,102 C34,104 42,94 40,84 Z"
                  fill="#D97706"
                />
              </g>

              {/* Bird Main Chubby Body */}
              <path
                d="M45,80 C45,52 75,44 100,50 C125,56 128,85 118,105 C108,122 75,124 55,112 C46,105 45,92 45,80 Z"
                fill="url(#birdBodyGrad)"
              />

              {/* Soft Pale Belly */}
              <path
                d="M65,82 C72,82 108,86 102,110 C96,120 74,122 62,114 C56,108 58,95 65,82 Z"
                fill="url(#birdBellyGrad)"
              />

              {/* Head Crest Feathers */}
              <path
                d="M92,48 C94,36 104,36 100,48 Z"
                fill="#EA580C"
              />
              <path
                d="M98,47 C104,38 112,42 105,50 Z"
                fill="#F59E0B"
              />

              {/* Cute Rosy Blush */}
              <ellipse cx="106" cy="82" rx="7" ry="5" fill="#FB7185" opacity="0.65" />

              {/* Cheerful Friendly Eye */}
              <circle cx="104" cy="68" r="8.5" fill="#1E293B" />
              {/* Eye sparkle highlights */}
              <circle cx="107" cy="65" r="3" fill="#FFFFFF" />
              <circle cx="102" cy="71" r="1.4" fill="#FFFFFF" />

              {/* Happy Orange Beak */}
              <path
                d="M120,68 L142,74 C140,78 128,82 118,84 Z"
                fill="#F97316"
              />
              <path
                d="M120,74 L138,76 C134,80 124,81 118,80 Z"
                fill="#EA580C"
              />

              {/* Front Flapping Wing (animated) */}
              <g className="animate-bird-wing">
                <path
                  d="M60,76 C55,42 20,44 38,78 C48,94 66,92 72,80 C74,75 66,72 60,76 Z"
                  fill="url(#birdWingGrad)"
                  stroke="#B45309"
                  strokeWidth="1.5"
                />
                {/* Wing feather detailing */}
                <path
                  d="M48,74 C42,56 26,56 38,76"
                  stroke="#FEF08A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.8"
                />
              </g>

              {/* Bird Claws holding threads */}
              <g>
                <path d="M78,118 L76,126 M84,118 L84,126" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
                {/* Suspension threads to parcel */}
                <line x1="76" y1="126" x2="72" y2="136" stroke="#FEF08A" strokeWidth="1.5" strokeDasharray="2,2" />
                <line x1="84" y1="126" x2="88" y2="136" stroke="#FEF08A" strokeWidth="1.5" strokeDasharray="2,2" />
              </g>

              {/* Swaying Delivery Gift Parcel */}
              <g className="animate-bird-package">
                {/* Box body */}
                <rect x="66" y="134" width="28" height="22" rx="4" fill="url(#parcelGrad)" stroke="#C2410C" strokeWidth="1.2" />
                {/* Ribbon horizontal */}
                <rect x="66" y="142" width="28" height="5" fill="#FEF08A" />
                {/* Ribbon vertical */}
                <rect x="78" y="134" width="5" height="22" fill="#FEF08A" />
                {/* Ribbon bow on top */}
                <path d="M76,134 C72,129 74,127 79,132 C82,127 86,129 82,134 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="1" />
                {/* Heart emblem on parcel */}
                <circle cx="80.5" cy="144.5" r="3.2" fill="#EF4444" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedBird;
