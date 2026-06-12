
"use client";

import { Package } from 'lucide-react';

const AnimatedBird = () => {
  return (
    <div className="relative w-24 h-24 animate-bird-fly" aria-hidden="true">
      <svg 
        viewBox="0 0 200 200" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-primary drop-shadow-lg"
      >
        {/* Bird Body */}
        <ellipse cx="100" cy="100" rx="60" ry="40" fill="currentColor" />
        {/* Bird Head */}
        <circle cx="150" cy="80" r="25" fill="currentColor" />
        {/* Beak */}
        <polygon points="175,75 190,80 175,85" className="text-yellow-400" fill="currentColor" />
        {/* Eye */}
        <circle cx="155" cy="75" r="5" fill="black" />
        {/* Wing 1 (animated) */}
        <path 
          d="M100,100 Q80,60 50,100 T100,100 Z" 
          fill="currentColor" 
          className="opacity-70 origin-center bird-wing"
        />
         {/* Wing 2 (animated, slightly offset) */}
        <path 
          d="M100,100 Q120,60 150,100 T100,100 Z" 
          fill="currentColor" 
          className="opacity-60 origin-center bird-wing-2"
        />
      </svg>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 transform">
        <Package className="w-8 h-8 text-secondary-foreground fill-secondary" />
      </div>
      <style jsx>{`
        .bird-wing {
          animation: flap 0.5s infinite alternate ease-in-out;
        }
        .bird-wing-2 {
          animation: flap 0.5s infinite alternate ease-in-out 0.1s;
        }
        @keyframes flap {
          0% {
            transform: rotate(0deg) scaleY(1);
          }
          100% {
            transform: rotate(-20deg) scaleY(0.8);
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedBird;

    
