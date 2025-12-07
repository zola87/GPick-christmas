
export enum PrizeTier {
  A = 'A', // 大獎
  B = 'B', // 小獎
  C = 'C', // 安慰獎
}

export interface PrizeConfig {
  id: string; // Unique ID for editing
  tier: PrizeTier;
  title: string;
  description: string;
  emoji: string;
  color: string;
  baseProbability: number; // 0-100 percentage
  totalStock: number;   // 總庫存
  currentStock: number; // 目前剩餘
}

export interface DrawResult {
  prize: PrizeConfig;
  timestamp: number;
}

export interface PlayRecord {
  id: string;
  nickname: string;
  prizeTitle: string;
  prizeDescription: string; // 新增：紀錄當下的描述，方便區分同獎項不同內容
  prizeTier: PrizeTier;
  timestamp: number;
}
