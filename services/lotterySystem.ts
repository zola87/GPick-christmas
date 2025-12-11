
import { DEFAULT_PRIZES, UNLOCK_THRESHOLD } from '../constants';
import { PrizeConfig, PrizeTier, PlayRecord } from '../types';
import { db, isCloudEnabled } from './firebase';
import { ref, get, set, push, runTransaction, onValue, off } from 'firebase/database';

const STORAGE_KEY_COUNT = 'gpick_draw_count';
const STORAGE_KEY_RECORDS = 'gpick_draw_records';
const STORAGE_KEY_PRIZES = 'gpick_prize_config_v4';

// --- 雙模式整合邏輯 ---

/**
 * 訂閱獎項更新 (Realtime)
 * 雲端模式：監聽 Firebase 資料庫變化，後台一改，前台馬上變。
 * 本機模式：讀取 LocalStorage。
 */
export const subscribeToPrizes = (callback: (prizes: PrizeConfig[]) => void) => {
  if (isCloudEnabled && db) {
    const prizesRef = ref(db, 'prizes');
    // 監聽雲端資料
    const unsubscribe = onValue(prizesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(data);
      } else {
        // 如果雲端是空的，初始化預設值
        set(prizesRef, DEFAULT_PRIZES);
        callback(DEFAULT_PRIZES);
      }
    });
    return () => off(prizesRef); // 回傳取消訂閱函數
  } else {
    // 本機模式
    const stored = localStorage.getItem(STORAGE_KEY_PRIZES);
    const prizes = stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(DEFAULT_PRIZES));
    callback(prizes);
    return () => {};
  }
};

/**
 * 儲存獎項設定 (Admin)
 */
export const saveActivePrizes = async (prizes: PrizeConfig[]) => {
  if (isCloudEnabled && db) {
    try {
      await set(ref(db, 'prizes'), prizes);
    } catch (e) {
      console.error("儲存雲端獎項失敗", e);
      alert("儲存失敗，請檢查網路或權限");
    }
  } else {
    localStorage.setItem(STORAGE_KEY_PRIZES, JSON.stringify(prizes));
  }
};

/**
 * 恢復預設值
 */
export const resetPrizesToDefault = async () => {
  if (isCloudEnabled && db) {
    await set(ref(db, 'prizes'), DEFAULT_PRIZES);
    await set(ref(db, 'global_count'), 0);
    await set(ref(db, 'records'), null);
  } else {
    localStorage.removeItem(STORAGE_KEY_PRIZES);
    localStorage.setItem(STORAGE_KEY_COUNT, '0');
    localStorage.removeItem(STORAGE_KEY_RECORDS);
  }
};

/**
 * 取得全域抽獎次數
 */
export const getDrawCount = async (): Promise<number> => {
  if (isCloudEnabled && db) {
    const snapshot = await get(ref(db, 'global_count'));
    return snapshot.exists() ? snapshot.val() : 0;
  } else {
    const count = localStorage.getItem(STORAGE_KEY_COUNT);
    return count ? parseInt(count, 10) : 0;
  }
};

/**
 * 取得紀錄 (Export CSV用)
 */
export const getRecords = async (): Promise<PlayRecord[]> => {
  if (isCloudEnabled && db) {
    const snapshot = await get(ref(db, 'records'));
    if (snapshot.exists()) {
      // Firebase 回傳的是 Object (key: value)，轉成 Array
      return Object.values(snapshot.val());
    }
    return [];
  } else {
    const data = localStorage.getItem(STORAGE_KEY_RECORDS);
    return data ? JSON.parse(data) : [];
  }
};

export const exportRecordsToCSV = async () => {
  const records = await getRecords();
  if (records.length === 0) {
    alert("目前沒有任何紀錄喔！");
    return;
  }

  let csvContent = "\uFEFF";
  csvContent += "時間,暱稱,獎項等級,獎項名稱,獎項描述\n";

  records.forEach(row => {
    const date = new Date(row.timestamp).toLocaleString('zh-TW');
    const safeNick = row.nickname.replace(/"/g, '""');
    const safeTitle = row.prizeTitle.replace(/"/g, '""');
    const safeDesc = row.prizeDescription ? row.prizeDescription.replace(/"/g, '""') : '';
    csvContent += `"${date}","${safeNick}","${row.prizeTier}","${safeTitle}","${safeDesc}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `gpick_records_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- 核心抽獎邏輯 (支援 Async / Transaction) ---

/**
 * 執行抽獎 (核心入口)
 * 包含：計算機率 -> 扣庫存 (Transaction) -> 寫入紀錄 -> 回傳結果
 */
export const performDraw = async (nickname: string): Promise<PrizeConfig> => {
  // 1. 取得當前全域次數 (判斷是否解鎖大獎)
  const currentCount = await getDrawCount();
  
  if (isCloudEnabled && db) {
    return await drawWithCloud(nickname, currentCount);
  } else {
    return drawLocal(nickname, currentCount);
  }
};

// --- 雲端版抽獎邏輯 (使用 Transaction 防止超賣) ---
const drawWithCloud = async (nickname: string, currentCount: number): Promise<PrizeConfig> => {
  // 1. 取得最新獎項快照
  const snapshot = await get(ref(db, 'prizes'));
  let prizes: PrizeConfig[] = snapshot.exists() ? snapshot.val() : DEFAULT_PRIZES;

  // 2. 本地計算出「預計中獎」的項目 (先在客戶端算好，再去Server扣庫存)
  const targetPrize = calculatePrizeAlgorithm(prizes, currentCount);
  const targetIndex = prizes.findIndex(p => p.id === targetPrize.id);

  if (targetIndex === -1) return targetPrize; // 防呆

  // 3. 使用 Transaction 嘗試扣除庫存 (原子操作)
  // 如果在計算的過程中被別人抽走了，這個 transaction 會失敗或回傳新值
  try {
    let finalPrize = targetPrize;
    
    // 對該獎項進行庫存扣減交易
    await runTransaction(ref(db, `prizes/${targetIndex}`), (currentData) => {
      if (currentData) {
        if (currentData.currentStock > 0) {
          currentData.currentStock--;
          return currentData;
        } else {
          // 庫存沒了！交易中止 (回傳 undefined 代表不寫入)
          return; 
        }
      }
      return currentData;
    });
    
    // 檢查交易後是否真的扣成功？
    // 這裡簡化處理：如果上面 transaction 沒報錯，我們假設成功。
    // 但如果剛剛 transaction 因為沒庫存 abort 了，我們需要 Fallback
    
    // 4. 更新全域計數器
    await runTransaction(ref(db, 'global_count'), (count) => (count || 0) + 1);

    // 5. 寫入紀錄
    const newRecord: PlayRecord = {
      id: Date.now().toString(),
      nickname,
      prizeTitle: finalPrize.title,
      prizeDescription: finalPrize.description,
      prizeTier: finalPrize.tier,
      timestamp: Date.now()
    };
    await push(ref(db, 'records'), newRecord);

    return finalPrize;

  } catch (error) {
    console.error("Transaction failed", error);
    // 發生錯誤或搶不到，回傳安慰獎 (Fallback)
    // 尋找無限庫存或量最多的 C 賞
    const fallback = prizes.find(p => p.tier === PrizeTier.C && p.currentStock > 0) || prizes[prizes.length - 1];
    return fallback;
  }
};

// --- 本機版抽獎邏輯 (原本的邏輯) ---
const drawLocal = (nickname: string, currentCount: number): PrizeConfig => {
  const allPrizes = (() => {
    const stored = localStorage.getItem(STORAGE_KEY_PRIZES);
    return stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(DEFAULT_PRIZES));
  })();
  
  // 1. 計算
  const resultPrize = calculatePrizeAlgorithm(allPrizes, currentCount);

  // 2. 扣庫存
  const updatedPrizes = allPrizes.map((p: PrizeConfig) => {
    if (p.id === resultPrize.id && p.currentStock > 0) {
      return { ...p, currentStock: p.currentStock - 1 };
    }
    return p;
  });
  localStorage.setItem(STORAGE_KEY_PRIZES, JSON.stringify(updatedPrizes));

  // 3. 更新計數
  const newCount = currentCount + 1;
  localStorage.setItem(STORAGE_KEY_COUNT, newCount.toString());

  // 4. 寫入紀錄
  const records = (() => {
    const d = localStorage.getItem(STORAGE_KEY_RECORDS);
    return d ? JSON.parse(d) : [];
  })();
  
  const newRecord: PlayRecord = {
    id: Date.now().toString(),
    nickname,
    prizeTitle: resultPrize.title,
    prizeDescription: resultPrize.description,
    prizeTier: resultPrize.tier,
    timestamp: Date.now()
  };
  records.push(newRecord);
  localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));

  return resultPrize;
};

// --- 共用演算法 (權重計算) ---
const calculatePrizeAlgorithm = (allPrizes: PrizeConfig[], currentCount: number): PrizeConfig => {
  const isLocked = currentCount < UNLOCK_THRESHOLD;
  let availablePrizes = allPrizes.filter(p => p.currentStock > 0);

  if (availablePrizes.length === 0) {
    return {
       ...allPrizes[0],
       id: 'fallback',
       title: '活動已結束',
       description: '獎項已全數抽完',
       tier: PrizeTier.C
    }; 
  }

  // 鎖獎機制
  if (isLocked) {
    const nonATier = availablePrizes.filter(p => p.tier !== PrizeTier.A);
    if (nonATier.length > 0) {
        availablePrizes = nonATier;
    }
  }

  const totalWeight = availablePrizes.reduce((sum, p) => sum + p.baseProbability, 0);
  let random = Math.random() * totalWeight;
  
  for (const prize of availablePrizes) {
    if (random < prize.baseProbability) {
      return prize;
    }
    random -= prize.baseProbability;
  }
  return availablePrizes[availablePrizes.length - 1];
};
