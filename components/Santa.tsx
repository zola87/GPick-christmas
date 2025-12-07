import React from 'react';

const Santa: React.FC = () => {
  return (
    <div className="w-40 h-40 relative">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-xl"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>
          {`
            @keyframes wave {
              0% { transform: rotate(0deg); }
              25% { transform: rotate(-15deg); }
              75% { transform: rotate(10deg); }
              100% { transform: rotate(0deg); }
            }
            @keyframes blink {
              0%, 90%, 100% { transform: scaleY(1); }
              95% { transform: scaleY(0.1); }
            }
            .hand { transform-origin: 150px 120px; animation: wave 2s infinite ease-in-out; }
            .eye { transform-origin: center; animation: blink 4s infinite; }
          `}
        </style>

        {/* Body */}
        <path d="M50 140 Q100 220 150 140 L150 180 Q100 200 50 180 Z" fill="#D62828" />
        
        {/* Buttons */}
        <circle cx="100" cy="155" r="5" fill="#FFB703" />
        <circle cx="100" cy="175" r="5" fill="#FFB703" />

        {/* Beard */}
        <path d="M40 100 Q100 180 160 100 Q160 80 140 80 L60 80 Q40 80 40 100" fill="white" />

        {/* Face */}
        <circle cx="100" cy="85" r="35" fill="#FFD7BA" />
        
        {/* Eyes */}
        <g className="eye">
          <circle cx="85" cy="80" r="4" fill="#333" />
          <circle cx="115" cy="80" r="4" fill="#333" />
        </g>
        
        {/* Cheeks */}
        <circle cx="75" cy="95" r="6" fill="#FFA07A" opacity="0.6" />
        <circle cx="125" cy="95" r="6" fill="#FFA07A" opacity="0.6" />

        {/* Nose */}
        <circle cx="100" cy="90" r="6" fill="#EF476F" />

        {/* Hat */}
        <path d="M50 65 Q100 0 150 65" fill="#D62828" />
        <rect x="45" y="60" width="110" height="20" rx="10" fill="white" />
        <circle cx="150" cy="65" r="12" fill="white" />

        {/* Hand (Waving) */}
        <g className="hand">
          <path d="M150 120 Q170 100 180 120 Q190 140 170 140 Q160 140 150 130" fill="#FFD7BA" />
          <path d="M150 120 L160 150" stroke="#D62828" strokeWidth="15" strokeLinecap="round" />
        </g>
        
        {/* Other Hand */}
        <path d="M50 120 L40 150" stroke="#D62828" strokeWidth="15" strokeLinecap="round" />
        <circle cx="40" cy="150" r="8" fill="#FFD7BA" />

      </svg>
    </div>
  );
};

export default Santa;