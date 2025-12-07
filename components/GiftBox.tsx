import React from 'react';
import { PrizeTier } from '../types';

interface GiftBoxProps {
  tier: PrizeTier;
}

const GiftBox: React.FC<GiftBoxProps> = ({ tier }) => {
  // 根據獎項等級設定顏色
  const colors = {
    [PrizeTier.A]: { box: '#F59E0B', ribbon: '#B45309', light: '#FCD34D' }, // 金色
    [PrizeTier.B]: { box: '#3B82F6', ribbon: '#1E40AF', light: '#93C5FD' }, // 藍色
    [PrizeTier.C]: { box: '#10B981', ribbon: '#047857', light: '#6EE7B7' }, // 綠色
  };

  const c = colors[tier] || colors[PrizeTier.C];

  return (
    <div className="w-32 h-32 relative mx-auto drop-shadow-2xl filter">
      <style>
        {`
          @keyframes pop-lid {
            0% { transform: translateY(0) rotate(0); }
            50% { transform: translateY(-15px) rotate(-5deg); }
            100% { transform: translateY(-5px) rotate(0); }
          }
          .lid { animation: pop-lid 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; transform-origin: center bottom; }
        `}
      </style>
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shadow */}
        <ellipse cx="100" cy="180" rx="60" ry="10" fill="rgba(0,0,0,0.2)" />

        {/* Box Body */}
        <rect x="50" y="80" width="100" height="90" rx="5" fill={c.box} />
        <rect x="50" y="80" width="100" height="90" rx="5" fill="url(#shine)" opacity="0.3" />
        
        {/* Vertical Ribbon */}
        <rect x="90" y="80" width="20" height="90" fill={c.ribbon} />

        {/* Lid Group */}
        <g className="lid">
          {/* Lid Base */}
          <rect x="45" y="60" width="110" height="25" rx="3" fill={c.box} stroke={c.ribbon} strokeWidth="1" />
          
          {/* Lid Ribbon Vertical */}
          <rect x="90" y="60" width="20" height="25" fill={c.ribbon} />
          
          {/* Bow / Knot */}
          <path d="M100 65 Q80 30 60 50 Q80 80 100 65" fill={c.ribbon} />
          <path d="M100 65 Q120 30 140 50 Q120 80 100 65" fill={c.ribbon} />
          <circle cx="100" cy="65" r="8" fill={c.light} />
        </g>
        
        {/* Gradient for Shine */}
        <defs>
          <linearGradient id="shine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.5" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default GiftBox;