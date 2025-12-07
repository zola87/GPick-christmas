import React, { useEffect, useState } from 'react';
import { PrizeConfig } from '../types';
import { ASSETS } from '../constants';
import Santa from './Santa';
import GiftBox from './GiftBox';

interface ResultModalProps {
  prize: PrizeConfig | null;
  onClose: () => void;
  nickname: string;
}

const ResultModal: React.FC<ResultModalProps> = ({ prize, onClose, nickname }) => {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    if (prize) {
      // Small delay for entrance animation
      setTimeout(() => setShow(true), 50);
      
      // Play Santa Sound Effect
      try {
        const sfx = new Audio(ASSETS.winSound);
        sfx.volume = 1.0;
        const playPromise = sfx.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.warn("SFX play failed (likely browser policy):", e);
          });
        }
      } catch (err) {
        console.warn("Audio error:", err);
      }

    } else {
      setShow(false);
    }
  }, [prize]);

  if (!prize) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-sm bg-white rounded-3xl p-6 pt-12 shadow-2xl transform transition-all duration-500 text-center ${show ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}`}>
        
        {/* Animated SVG Santa */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 pointer-events-none drop-shadow-xl z-20">
           <Santa />
        </div>

        <div className="mt-8 space-y-4 relative z-10">
          <div className="space-y-1">
            <p className="text-gray-400 text-sm font-bold tracking-widest uppercase">
              Hi, {nickname}
            </p>
            <h2 className="text-3xl font-extrabold text-red-600 tracking-tight">恭喜中獎！</h2>
            <p className="text-xs text-green-600 font-bold">Ho Ho Ho! 聖誕快樂!</p>
          </div>

          {/* Prize Card */}
          <div className={`p-6 rounded-2xl border-4 border-double ${prize.color} shadow-inner bg-opacity-30 relative overflow-hidden`}>
            
            {/* New Gift Box Component */}
            <div className="mb-4 transform hover:scale-105 transition-transform duration-300">
               <GiftBox tier={prize.tier} />
            </div>

            <h3 className="text-xl font-bold mb-2 text-gray-800">{prize.title}</h3>
            <p className="text-gray-700 font-medium leading-relaxed">{prize.description}</p>
          </div>

          <div className="pt-2">
            <p className="text-xs text-gray-400 mb-3">請截圖此畫面，並回傳至官方 LINE</p>
            <button 
                onClick={onClose}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>📸</span> 我已截圖，關閉視窗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;