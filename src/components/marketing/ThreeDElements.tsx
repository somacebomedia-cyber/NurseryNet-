
"use client";

// Basic SVGs for Caterpillar, Rainbow Pyramid, Baby Bottle
// These are simplified and can be enhanced further.

const Caterpillar = () => (
  <svg viewBox="0 0 150 50" className="w-32 h-12 text-green-500 drop-shadow-md caterpillar-animation">
    <circle cx="25" cy="25" r="15" fill="currentColor" />
    <circle cx="50" cy="25" r="15" fill="currentColor" />
    <circle cx="75" cy="25" r="15" fill="currentColor" />
    <circle cx="100" cy="25" r="15" fill="currentColor" />
    <circle cx="125" cy="25" r="15" fill="currentColor" />
    {/* Antennae */}
    <line x1="120" y1="10" x2="130" y2="0" stroke="black" strokeWidth="2" />
    <line x1="130" y1="10" x2="140" y2="0" stroke="black" strokeWidth="2" />
    <style jsx>{`
      .caterpillar-animation {
        animation: wiggle 2s infinite ease-in-out;
      }
      @keyframes wiggle {
        0%, 100% { transform: rotate(0deg); }
        50% { transform: rotate(5deg) scale(1.05); }
      }
    `}</style>
  </svg>
);

const RainbowPyramid = () => (
  <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-md pyramid-animation">
    <polygon points="50,10 90,90 10,90" fill="hsl(0, 100%, 70%)" /> {/* Red */}
    <polygon points="50,30 76.6,80 23.3,80" fill="hsl(39, 100%, 70%)" /> {/* Orange */}
    <polygon points="50,45 68.3,72.5 31.6,72.5" fill="hsl(60, 100%, 70%)" /> {/* Yellow */}
    <polygon points="50,57.5 60,65 40,65" fill="hsl(120, 100%, 70%)" /> {/* Green */}
    <style jsx>{`
      .pyramid-animation {
        animation: pulse-pyramid 3s infinite ease-in-out;
      }
      @keyframes pulse-pyramid {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
    `}</style>
  </svg>
);

const BabyBottle = () => (
  <svg viewBox="0 0 60 120" className="w-16 h-32 drop-shadow-md bottle-animation">
    {/* Bottle Body */}
    <rect x="10" y="30" width="40" height="70" rx="10" ry="10" fill="hsl(var(--accent-blue-hsl))" opacity="0.7" />
    {/* Milk */}
    <rect x="15" y="50" width="30" height="45" fill="white" opacity="0.8" />
    {/* Cap Ring */}
    <rect x="5" y="20" width="50" height="15" rx="5" ry="5" fill="hsl(var(--accent))" />
    {/* Nipple Base */}
    <ellipse cx="30" cy="20" rx="15" ry="7" fill="hsl(var(--accent))" />
    {/* Nipple */}
    <path d="M30,0 C25,10 20,15 20,20 H40 C40,15 35,10 30,0 Z" fill="hsl(var(--accent) / 0.8)" />
    <style jsx>{`
      .bottle-animation {
        animation: gentle-rock 4s infinite ease-in-out;
      }
      @keyframes gentle-rock {
        0%, 100% { transform: rotate(-2deg); }
        50% { transform: rotate(2deg); }
      }
    `}</style>
  </svg>
);

const ThreeDElements = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-around gap-8 p-4">
      <Caterpillar />
      <RainbowPyramid />
      <BabyBottle />
    </div>
  );
};

export default ThreeDElements;


    
