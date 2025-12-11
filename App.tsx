
import React, { useState, useEffect, useRef } from 'react';
import SnowEffect from './components/SnowEffect';
import Sock from './components/Sock';
import RulesSection from './components/RulesSection';
import ResultModal from './components/ResultModal';
import WelcomeScreen from './components/WelcomeScreen';
import { PrizeConfig, PrizeTier } from './types';
import { 
  performDraw, 
  getDrawCount, 
  resetPrizesToDefault,
  exportRecordsToCSV,
  subscribeToPrizes,
  saveActivePrizes
} from './services/lotterySystem';
import { isCloudEnabled } from './services/firebase';

const App: React.FC = () => {
  // Game State
  const [nickname, setNickname] = useState<string>('');
  const [hasPlayed, setHasPlayed] = useState(false);
  const [playedSockIds, setPlayedSockIds] = useState<number[]>([]); 
  const [prize, setPrize] = useState<PrizeConfig | null>(null);
  const [prizesList, setPrizesList] = useState<PrizeConfig[]>([]);
  const [isProcessing, setIsProcessing] = useState(false); // New: 處理中狀態
  
  // Admin / Secret State
  const [debugCount, setDebugCount] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false); 
  
  // Custom Password Modal State
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdInput, setPwdInput] = useState('');
  const [pwdError, setPwdError] = useState(false);

  const [clickFeedback, setClickFeedback] = useState(false);
  const secretClicksRef = useRef(0);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 初始化：訂閱獎項更新 (Realtime)
  useEffect(() => {
    // 這個 callback 會在第一次載入以及未來任何時候資料庫變動時被呼叫
    const unsubscribe = subscribeToPrizes((updatedPrizes) => {
      setPrizesList(updatedPrizes);
    });
    
    // 取得當前次數 (用於後台顯示)
    getDrawCount().then(c => setDebugCount(c));

    return () => unsubscribe();
  }, []);

  const handleStartGame = (name: string) => {
    setNickname(name);
  };

  const handleSockSelect = async (id: number) => {
    // 加入 isProcessing 檢查，防止連點
    if (hasPlayed || playedSockIds.includes(id) || isProcessing) return;

    setIsProcessing(true); // 開始 loading

    try {
      // 1. 執行抽獎邏輯 (Async: 可能需要等待網路)
      const resultPrize = await performDraw(nickname);

      // 2. 更新計數顯示 (UI)
      const newCount = await getDrawCount();
      setDebugCount(newCount);

      // 3. 紀錄這隻襪子已開過
      setPlayedSockIds(prev => [...prev, id]);

      // 4. 顯示結果
      setPrize(resultPrize);
      setHasPlayed(true);

    } catch (e) {
      console.error("Draw error:", e);
      alert("網路連線錯誤，請重試");
    } finally {
      setIsProcessing(false); // 結束 loading
    }
  };

  const handlePlayAgain = () => {
    setPlayedSockIds([]); 
    setHasPlayed(false);
    setPrize(null);
  };

  const handleReset = () => {
    setHasPlayed(false);
    setPrize(null);
    setPlayedSockIds([]); 
    setShowAdmin(false);
    alert("畫面已重整");
  };

  const handleFullReset = async () => {
    if (resetConfirm) {
      await resetPrizesToDefault();
      alert("系統已重置成功！(若是雲端模式，資料庫已清空)");
      window.location.reload(); 
    } else {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 3000);
    }
  };

  // --- Admin Logic ---

  const handleSecretClick = () => {
    setClickFeedback(true);
    setTimeout(() => setClickFeedback(false), 150);
    secretClicksRef.current += 1;
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    if (secretClicksRef.current >= 3) {
        setShowPwdModal(true); 
        secretClicksRef.current = 0;
    } else {
        clickTimeoutRef.current = setTimeout(() => {
            secretClicksRef.current = 0;
        }, 2000);
    }
  };

  const handlePwdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdInput === '8705') {
      setShowAdmin(true);
      setShowPwdModal(false);
      setPwdInput('');
      setPwdError(false);
    } else {
      setPwdError(true);
      setPwdInput('');
    }
  };

  // --- Prize Editor Logic ---
  
  const handlePrizeChange = (id: string, field: keyof PrizeConfig, value: any) => {
    const updated = prizesList.map(p => {
        if (p.id === id) return { ...p, [field]: value };
        return p;
    });
    setPrizesList(updated);
  };

  const savePrizeConfig = async () => {
    await saveActivePrizes(prizesList);
    alert("獎項設定已儲存！(所有連線中的裝置都會同步更新)");
  };

  const addNewPrize = () => {
    const newPrize: PrizeConfig = {
        id: Date.now().toString(),
        tier: PrizeTier.B,
        title: "新獎項",
        description: "獎品描述",
        emoji: "🎁",
        color: "bg-purple-100 border-purple-500 text-purple-800",
        baseProbability: 5,
        totalStock: 10,
        currentStock: 10
    };
    setPrizesList([...prizesList, newPrize]);
  };

  const removePrize = (id: string) => {
    if(confirm("確定刪除此獎項？")) {
        setPrizesList(prizesList.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden text-gray-900 bg-gradient-to-b from-red-700 to-green-900 selection:bg-yellow-300 selection:text-red-900 font-sans">
      <SnowEffect />

      {/* Login Screen Overlay */}
      {!nickname && <WelcomeScreen onStart={handleStartGame} />}

      {/* Password Modal */}
      {showPwdModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xs p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-red-800 mb-4 text-center">🔐 管理員登入</h3>
            <form onSubmit={handlePwdSubmit} className="space-y-4">
              <input 
                type="password" 
                inputMode="numeric"
                pattern="[0-9]*"
                autoFocus
                className={`w-full bg-white border-2 rounded-xl p-3 text-center text-lg text-gray-900 outline-none focus:border-red-500 ${pwdError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                placeholder="請輸入密碼"
                value={pwdInput}
                onChange={(e) => setPwdInput(e.target.value)}
              />
              {pwdError && <p className="text-red-500 text-xs text-center font-bold">密碼錯誤，請再試一次</p>}
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => { setShowPwdModal(false); setPwdError(false); }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold"
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700"
                >
                  登入
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 pt-10 pb-6 text-center px-4">
        <div className="inline-block bg-black/20 backdrop-blur-sm rounded-full px-4 py-1 mb-2 border border-white/20">
             <span className="text-yellow-300 text-xs font-bold tracking-widest">MERRY CHRISTMAS</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-md tracking-wider leading-tight">
          GPICK 聖誕連線<br />
          <span className="text-yellow-400">幸運抽抽樂</span> 🎄
        </h1>
        {nickname && (
             <p className="text-white/90 mt-2 text-sm font-bold bg-white/10 inline-block px-3 py-1 rounded-lg">
                Hi, {nickname}！選一隻襪子吧！
             </p>
        )}
      </header>

      {/* Main Game Area */}
      <main className="relative z-10 container mx-auto px-4 pb-20">
        
        {/* Loading Overlay for Processing */}
        {isProcessing && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
              <div className="bg-white px-6 py-4 rounded-full shadow-xl flex items-center gap-3 animate-pulse">
                <span className="text-2xl">🎁</span>
                <span className="font-bold text-red-600">正在拆禮物...</span>
              </div>
           </div>
        )}

        {/* Socks Grid */}
        <div className={`flex flex-col items-center gap-2 md:gap-6 mb-8 mt-4 transition-opacity ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* First Row: 2 socks */}
            <div className="flex justify-center gap-6 w-full">
                {[0, 1].map((id) => (
                    <Sock 
                        key={id}
                        id={id} 
                        onSelect={() => handleSockSelect(id)} 
                        disabled={hasPlayed || playedSockIds.includes(id) || isProcessing} 
                    />
                ))}
            </div>
            {/* Second Row: 3 socks */}
            <div className="flex justify-center gap-4 w-full">
                {[2, 3, 4].map((id) => (
                    <Sock 
                        key={id}
                        id={id} 
                        onSelect={() => handleSockSelect(id)} 
                        disabled={hasPlayed || playedSockIds.includes(id) || isProcessing} 
                    />
                ))}
            </div>
        </div>

        {/* Rules */}
        <RulesSection />

        {/* Secret Admin Footer */}
        <div className="text-center relative">
            {showAdmin ? (
                // --- Admin Panel UI ---
                <div className="bg-white max-w-lg mx-auto rounded-lg p-6 text-left shadow-2xl mb-12 relative z-50 animate-in slide-in-from-bottom-5">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <div className="flex items-center gap-2">
                           <h3 className="font-bold text-red-800 text-lg">🔧 管理員後台</h3>
                           <span className={`text-[10px] px-2 py-0.5 rounded-full ${isCloudEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {isCloudEnabled ? '🟢 雲端連線中' : '⚪ 本機模式'}
                           </span>
                        </div>
                        <button onClick={() => setShowAdmin(false)} className="text-gray-400 hover:text-gray-600">✕ 關閉</button>
                    </div>

                    <div className="space-y-6">
                        {/* Stats Section */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-bold text-gray-700 mb-2">📊 數據統計</h4>
                            <p className="text-sm">累積抽獎次數: <span className="font-mono font-bold text-red-600">{debugCount}</span></p>
                            <div className="mt-3 flex gap-2">
                                <button onClick={handleReset} className="text-xs bg-gray-200 text-gray-800 px-3 py-2 rounded hover:bg-gray-300 font-bold">
                                  重整畫面
                                </button>
                                
                                <button 
                                  onClick={handleFullReset} 
                                  className={`text-xs px-3 py-2 rounded font-bold transition-colors duration-200 text-white ${resetConfirm ? 'bg-red-600 animate-pulse' : 'bg-red-400 hover:bg-red-500'}`}
                                >
                                  {resetConfirm ? '⚠️ 確定清除？' : '清除所有資料'}
                                </button>

                                <button onClick={exportRecordsToCSV} className="text-xs bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 font-bold ml-auto">
                                  匯出 CSV
                                </button>
                            </div>
                        </div>

                        {/* Prize Editor Section */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-gray-700">🎁 獎項設定 (同步中)</h4>
                                <button onClick={addNewPrize} className="text-xs bg-blue-500 text-white px-2 py-1 rounded">+ 新增</button>
                            </div>
                            
                            <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                                {prizesList.map((p, idx) => (
                                    <div key={p.id} className="border border-gray-200 p-2 rounded bg-white text-xs space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-gray-400">#{idx + 1}</span>
                                            <div className="text-xs text-gray-500">
                                                剩餘 <span className={`font-bold ${p.currentStock === 0 ? 'text-red-500' : 'text-green-600'}`}>{p.currentStock}</span> / {p.totalStock}
                                            </div>
                                            <button onClick={() => removePrize(p.id)} className="text-red-500 hover:underline ml-2">刪除</button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-gray-500">名稱</label>
                                                <input className="w-full bg-white text-gray-900 border rounded px-1" value={p.title} onChange={(e) => handlePrizeChange(p.id, 'title', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="block text-gray-500">機率(權重)</label>
                                                <input type="number" className="w-full bg-white text-gray-900 border rounded px-1" value={p.baseProbability} onChange={(e) => handlePrizeChange(p.id, 'baseProbability', Number(e.target.value))} />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-gray-500">描述 (具體獎品)</label>
                                                <input className="w-full bg-white text-gray-900 border rounded px-1" value={p.description} onChange={(e) => handlePrizeChange(p.id, 'description', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="block text-gray-500">總庫存</label>
                                                <input type="number" className="w-full bg-white text-gray-900 border rounded px-1" value={p.totalStock} onChange={(e) => handlePrizeChange(p.id, 'totalStock', Number(e.target.value))} />
                                            </div>
                                            <div>
                                                <label className="block text-gray-500">目前剩餘</label>
                                                <input type="number" className="w-full bg-white text-gray-900 border rounded px-1" value={p.currentStock} onChange={(e) => handlePrizeChange(p.id, 'currentStock', Number(e.target.value))} />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-gray-500">等級與禮盒顏色</label>
                                                <select className="w-full bg-white text-gray-900 border rounded px-1" value={p.tier} onChange={(e) => handlePrizeChange(p.id, 'tier', e.target.value)}>
                                                    <option value={PrizeTier.A}>A (大獎 - 金色禮盒)</option>
                                                    <option value={PrizeTier.B}>B (中獎 - 藍色禮盒)</option>
                                                    <option value={PrizeTier.C}>C (小獎 - 綠色禮盒)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={savePrizeConfig} className="w-full mt-3 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">儲存變更 (Sync to All)</button>
                            <button onClick={() => {resetPrizesToDefault();}} className="w-full mt-2 text-gray-400 text-xs hover:text-red-500">恢復預設值</button>
                        </div>
                    </div>
                </div>
            ) : (
                // --- Hidden Trigger Area ---
                <div 
                    onClick={handleSecretClick}
                    className={`fixed bottom-0 left-0 w-full h-20 z-[100] flex items-end justify-center pb-4 cursor-pointer select-none transition-colors duration-200 ${clickFeedback ? 'bg-white/20' : 'bg-transparent'}`}
                    title="Admin"
                >
                     <p className="text-white/30 text-[10px] drop-shadow-md">Designed for GPICK Christmas Event</p>
                </div>
            )}
        </div>
      </main>

      {/* Modal */}
      <ResultModal 
        prize={prize} 
        onClose={() => setPrize(null)} 
        onPlayAgain={handlePlayAgain}
        nickname={nickname}
      />
      
      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none z-0" />
    </div>
  );
};

export default App;
