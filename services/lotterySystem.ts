
import { DEFAULT_PRIZES, UNLOCK_THRESHOLD } from '../constants';
import { PrizeConfig, PrizeTier, PlayRecord } from '../types';

const STORAGE_KEY_COUNT = 'gpick_draw_count';
const STORAGE_KEY_RECORDS = 'gpick_draw_records';
const STORAGE_KEY_PRIZES = 'gpick_prize_config_v4'; // Bump version for stock structure

// --- 獎項配置邏輯 (可編輯) ---

export const getActivePrizes = (): PrizeConfig[] => {
  const stored = localStorage.getItem(STORAGE_KEY_PRIZES);
  if (stored) {
    return JSON.parse(stored);
  }
  // Return a deep copy of defaults to ensure no reference pollution
  return JSON.parse(JSON.stringify(DEFAULT_PRIZES));
};

export const saveActivePrizes = (prizes: PrizeConfig[]) => {
  localStorage.setItem(STORAGE_KEY_PRIZES, JSON.stringify(prizes));
};

export const resetPrizesToDefault = () => {
  localStorage.removeItem(STORAGE_KEY_PRIZES);
  return getActivePrizes();
};

// --- 庫存扣除邏輯 ---

export const deductStock = (prizeId: string) => {
  const prizes = getActivePrizes();
  const updatedPrizes = prizes.map(p => {
    if (p.id === prizeId && p.currentStock > 0) {
      return { ...p, currentStock: p.currentStock - 1 };
    }
    return p;
  });
  saveActivePrizes(updatedPrizes);
};

// --- 抽獎次數邏輯 ---

export const getDrawCount = (): number => {
  const count = localStorage.getItem(STORAGE_KEY_COUNT);
  return count ? parseInt(count, 10) : 0;
};

export const incrementDrawCount = (): number => {
  const current = getDrawCount();
  const newCount = current + 1;
  localStorage.setItem(STORAGE_KEY_COUNT, newCount.toString());
  return newCount;
};

export const resetDrawCount = () => {
  localStorage.setItem(STORAGE_KEY_COUNT, '0');
  localStorage.removeItem(STORAGE_KEY_RECORDS);
};

// --- 資料紀錄邏輯 (Mock Backend) ---

export const saveRecord = (nickname: string, prize: PrizeConfig) => {
  const records = getRecords();
  const newRecord: PlayRecord = {
    id: Date.now().toString(),
    nickname,
    prizeTitle: prize.title,
    prizeDescription: prize.description, // 紀錄詳細描述
    prizeTier: prize.tier,
    timestamp: Date.now()
  };
  
  records.push(newRecord);
  localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
};

export const getRecords = (): PlayRecord[] => {
  const data = localStorage.getItem(STORAGE_KEY_RECORDS);
  return data ? JSON.parse(data) : [];
};

export const exportRecordsToCSV = () => {
  const records = getRecords();
  if (records.length === 0) {
    alert("目前沒有任何紀錄喔！");
    return;
  }

  // Add BOM for Excel Chinese character support
  let csvContent = "\uFEFF";
  // 新增「獎項描述」欄位
  csvContent += "時間,暱稱,獎項等級,獎項名稱,獎項描述\n";

  records.forEach(row => {
    const date = new Date(row.timestamp).toLocaleString('zh-TW');
    // Escape quotes to prevent CSV breakage
    const safeNick = row.nickname.replace(/"/g, '""');
    const safeTitle = row.prizeTitle.replace(/"/g, '""');
    const safeDesc = row.prizeDescription ? row.prizeDescription.replace(/"/g, '""') : '';
    csvContent += `"${date}","${safeNick}","${row.prizeTier}","${safeTitle}","${safeDesc}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `gpick_lottery_records_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- 核心抽獎邏輯 (含權重分配與庫存檢查) ---

export const drawPrize = (currentCount: number): PrizeConfig => {
  const allPrizes = getActivePrizes();
  const isLocked = currentCount < UNLOCK_THRESHOLD;

  // 1. 過濾掉沒有庫存的獎項
  let availablePrizes = allPrizes.filter(p => p.currentStock > 0);

  // 防呆：如果所有獎項都抽完了 (極端情況)，暫時回傳一個安慰獎結構避免當機
  // 實務上管理者應確保 C 賞庫存足夠
  if (availablePrizes.length === 0) {
    return {
       ...allPrizes[0],
       id: 'fallback',
       title: '活動已結束',
       description: '獎項已全數抽完',
       tier: PrizeTier.C
    }; 
  }

  // 2. 處理鎖獎機制 (Rigged Logic)
  // 如果還沒解鎖，且 A 賞還有庫存，強行將 A 賞從候選名單中暫時移除
  // (注意：如果只剩 A 賞有庫存，這裡會導致 availablePrizes 為空，需要 fallback)
  if (isLocked) {
    const nonATier = availablePrizes.filter(p => p.tier !== PrizeTier.A);
    if (nonATier.length > 0) {
        availablePrizes = nonATier;
    }
    // 如果只剩 A 賞但被鎖住... 就只能讓它抽到 A (或顯示銘謝惠顧)，這裡暫時允許抽 A 避免卡死
  }

  // 3. 權重隨機算法 (Weighted Random)
  // 因為移除了庫存為 0 的項目，分母總和可能不是 100，所以要動態計算
  const totalWeight = availablePrizes.reduce((sum, p) => sum + p.baseProbability, 0);
  let random = Math.random() * totalWeight;
  
  for (const prize of availablePrizes) {
    if (random < prize.baseProbability) {
      return prize;
    }
    random -= prize.baseProbability;
  }

  // Fallback
  return availablePrizes[availablePrizes.length - 1];
};
