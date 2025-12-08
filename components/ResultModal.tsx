
import React, { useEffect, useState } from 'react';
import { PrizeConfig, PrizeTier } from '../types';
import { ASSETS } from '../constants';
import Santa from './Santa';
import GiftBox from './GiftBox';

interface ResultModalProps {
  prize: PrizeConfig | null;
  onClose: () => void;
  onPlayAgain: () => void;
  nickname: string;
}

const ResultModal: React.FC<ResultModalProps> = ({ prize, onClose, onPlayAgain, nickname }) => {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    if (prize) {
      // Small delay for entrance animation
      setTimeout(() => setShow(true), 50);
      
      // Play Santa Sound Effect (Only SFX, Music is removed)
      try {
        const sfx = new Audio(ASSETS.winSound);
        sfx.crossOrigin = "anonymous";
        sfx.volume = 1.0;
        const playPromise = sfx.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      } catch (err) {
        // Ignore audio errors
      }

    } else {
      setShow(false);
    }
  }, [prize]);

  if (!prize) return null;

  // 動畫樣式定義
  const animationStyles = `
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes float-1 {
      0%, 100% { transform: translateY(0) rotate(0); }
      50% { transform: translateY(-10px) rotate(10deg); }
    }
    @keyframes float-2 {
      0%, 100% { transform: translateY(0) rotate(0); }
      50% { transform: translateY(-15px) rotate(-10deg); }
    }
    @keyframes pop-in {
      0% { transform: scale(0); opacity: 0; }
      80% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
  `;

  // 判斷是否為大獎 (A/B賞) 以顯示更強烈的特效
  const isBigPrize = prize.tier === PrizeTier.A || prize.tier === PrizeTier.B;
  const isGrandPrize = prize.tier === PrizeTier.A;

  return (
    // Outer Container: Added pt-28 to push the modal down on mobile, preventing Santa from being cut off
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 pt-28 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <style>{animationStyles}</style>
      
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content - Removed overflow-hidden from main card so Santa can float out */}
      <div className={`relative w-full max-w-sm bg-white rounded-3xl shadow-2xl transform transition-all duration-500 text-center ${show ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}`}>
        
        {/* Inner container for background clipping (Light Rays) */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            {isBigPrize && (
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] -z-0 opacity-20 pointer-events-none`}>
                <svg viewBox="0 0 100 100" className={`w-full h-full animate-[spin-slow_20s_linear_infinite] ${isGrandPrize ? 'text-yellow-400' : 'text-blue-300'} fill-current`}>
                    {Array.from({ length: 12 }).map((_, i) => (
                        <path key={i} d="M50 50 L50 0 L60 0 Z" transform={`rotate(${i * 30} 50 50)`} />
                    ))}
                </svg>
            </div>
            )}
        </div>

        {/* Animated SVG Santa (Positioned Outside) */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 pointer-events-none drop-shadow-xl z-20">
           <Santa />
        </div>

        {/* Actual Content Container */}
        <div className="relative z-10 p-6 pt-12 mt-4">
          <div className="space-y-1 relative mb-6">
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-2">
              Hi, {nickname}
            </p>
            
            {/* Title with floating decorations */}
            <div className="relative inline-block">
               <h2 className="text-3xl font-extrabold text-red-600 tracking-tight relative z-10 drop-shadow-sm">
                 恭喜中獎！
               </h2>
               {/* Cute floating particles - No Text, just visuals */}
               <div className="absolute -top-6 -left-8 text-2xl animate-[float-1_3s_ease-in-out_infinite]">✨</div>
               <div className="absolute -bottom-2 -right-10 text-2xl animate-[float-2_2.5s_ease-in-out_infinite]">🎉</div>
               {isBigPrize && <div className="absolute top-0 -right-8 text-xl animate-[float-1_2s_ease-in-out_infinite_reverse]">⭐</div>}
               {isGrandPrize && <div className="absolute -top-4 right-1/2 text-xl animate-[float-2_4s_ease-in-out_infinite]">💖</div>}
            </div>
            
            <p className="text-xs text-green-600 font-bold mt-1">Ho Ho Ho! 聖誕快樂!</p>
          </div>

          {/* Prize Card */}
          <div className={`p-6 rounded-2xl border-4 border-double ${prize.color} shadow-inner bg-white/90 backdrop-blur-sm relative mb-6`}>
            
            {/* New Gift Box Component */}
            <div className="mb-4 transform hover:scale-105 transition-transform duration-300 animate-[pop-in_0.6s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]">
               <GiftBox tier={prize.tier} />
            </div>

            <h3 className="text-xl font-bold mb-2 text-gray-800 leading-tight">{prize.title}</h3>
            
            {/* Description (Updated: Subtle, small, thin gray) */}
            <p className="text-xs text-gray-400 font-light tracking-wide">
              {prize.description}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] text-gray-300">請截圖此畫面，並回傳至官方 LINE</p>
            
            <button 
                onClick={onClose}
                className="w-full bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-700 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>📸</span> 我已截圖，關閉視窗
            </button>

            <button 
                onClick={onPlayAgain}
                className="w-full bg-white text-red-600 border-2 border-red-200 font-bold py-3 px-6 rounded-full shadow-sm hover:bg-red-50 active:scale-95 transition-all text-sm"
            >
                🔄 還有機會？再抽一次
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
