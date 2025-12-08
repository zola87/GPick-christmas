
import React, { useState } from 'react';

interface WelcomeScreenProps {
  onStart: (nickname: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('請輸入暱稱才能參加喔！');
      return;
    }
    onStart(nickname.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl border-4 border-red-100 relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-100 rounded-full opacity-50 blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-100 rounded-full opacity-50 blur-xl"></div>

        <div className="relative text-center">
          <div className="text-4xl mb-4 animate-bounce">🎅</div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">歡迎參加聖誕連線</h2>
          <p className="text-gray-600 mb-6 text-sm">請輸入您的社群暱稱以利我們紀錄中獎資訊</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-left">
              <label htmlFor="nickname" className="block text-xs font-bold text-gray-500 mb-1 ml-2">
                社群暱稱
              </label>
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setError('');
                }}
                className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 text-lg rounded-xl focus:ring-red-500 focus:border-red-500 block p-3 transition-colors outline-none"
                placeholder="例如：小美"
              />
              {error && <p className="text-red-500 text-xs mt-2 ml-2 font-bold">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#D62828] to-[#A51C1C] hover:from-[#A51C1C] hover:to-[#D62828] text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2 group"
            >
              開始抽獎
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;