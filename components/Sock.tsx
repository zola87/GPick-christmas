import React, { useState } from 'react';

interface SockProps {
  id: number;
  onSelect: () => void;
  disabled: boolean;
}

const Sock: React.FC<SockProps> = ({ id, onSelect, disabled }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // 不同的顏色裝飾，讓襪子看起來有點不一樣
  const patterns = [
    'text-green-600',
    'text-yellow-400',
    'text-white',
    'text-blue-300',
    'text-purple-300'
  ];
  
  const patternColor = patterns[id % patterns.length];

  const handleClick = () => {
    if (disabled || isAnimating) return;
    
    setIsAnimating(true);
    
    // 搖晃動畫結束後觸發
    setTimeout(() => {
      onSelect();
      setIsAnimating(false);
    }, 800);
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-2">
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`
          relative w-24 h-24 md:w-32 md:h-32 transition-transform duration-200
          ${isAnimating ? 'animate-bounce' : 'hover:scale-105'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
        `}
        aria-label="選擇這隻襪子"
      >
        {/* SVG Sock Graphic */}
        <svg
          viewBox="0 0 512 512"
          className="w-full h-full drop-shadow-lg filter"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sock Body */}
          <path
            d="M142.4 24.3C154.2 12.5 170.2 6.8 186.9 8.2L350.2 21.8C387.8 25 416 57.5 416 95.2V208C416 261 373 304 320 304H276.9C265.8 304 256.9 313 256.9 324.1C256.9 335.2 265.8 344.2 276.9 344.2H320C373 344.2 416 387.2 416 440.2C416 479.8 383.8 512 344.2 512H214.2C143.5 512 86.2 454.7 86.2 384V146.6C86.2 97.4 107.8 51.1 142.4 24.3Z"
            className="fill-red-600"
          />
          {/* Heel/Toe Accents */}
          <path d="M142.4 24.3C107.8 51.1 86.2 97.4 86.2 146.6L126.2 146.6L186.9 8.2C170.2 6.8 154.2 12.5 142.4 24.3Z" className="fill-white opacity-20"/>
          <path d="M86.2 384C86.2 454.7 143.5 512 214.2 512H344.2C383.8 512 416 479.8 416 440.2C416 414.9 403.4 392.5 383.9 379.1C367.6 397.6 343.8 409.2 317.2 409.2H256V384H86.2Z" className="fill-white"/>
          
          {/* Top Cuff */}
          <rect x="120" y="20" width="240" height="60" rx="10" className="fill-white" />
          
          {/* Decorative Pattern (Dynamic Color) */}
          <circle cx="250" cy="200" r="20" className={patternColor} fill="currentColor" />
          <circle cx="200" cy="250" r="15" className={patternColor} fill="currentColor" />
          <circle cx="300" cy="250" r="15" className={patternColor} fill="currentColor" />
        </svg>
        
        <div className="absolute top-0 right-0 bg-yellow-400 text-red-900 text-xs font-bold px-2 py-1 rounded-full transform rotate-12 shadow-sm border border-yellow-200">
           {id + 1}
        </div>
      </button>
    </div>
  );
};

export default Sock;