
import { PrizeConfig, PrizeTier } from './types';

// --- 設定區 Start ---

// 觸發A賞解鎖的抽獎次數門檻
export const UNLOCK_THRESHOLD = 50;

// 資源連結 (Assets)
// 使用 Wikimedia Commons Transcoded MP3 以確保最大相容性 (Safari/Chrome/iOS)
export const ASSETS = {
  // 背景音樂: We Wish You A Merry Christmas (US Air Force Band)
  bgMusic: "https://upload.wikimedia.org/wikipedia/commons/transcoded/d/df/We_Wish_You_a_Merry_Christmas_-_US_Air_Force_Band_of_the_West.ogg/We_Wish_You_a_Merry_Christmas_-_US_Air_Force_Band_of_the_West.ogg.mp3",
  // 中獎音效: Santa Ho Ho Ho
  winSound: "https://upload.wikimedia.org/wikipedia/commons/transcoded/8/86/Santa_Claus_Ho_Ho_Ho.ogg/Santa_Claus_Ho_Ho_Ho.ogg.mp3"
};

// 預設獎項配置 (可被後台覆蓋)
export const DEFAULT_PRIZES: PrizeConfig[] = [
  {
    id: 'p1',
    tier: PrizeTier.A,
    title: "A賞・超級大獎",
    description: "現金 $2,000",
    emoji: "🎁", 
    color: "bg-yellow-100 border-yellow-500 text-yellow-800",
    baseProbability: 1, // 1%
    totalStock: 1,      // 只有 1 個
    currentStock: 1
  },
  {
    id: 'p2',
    tier: PrizeTier.B,
    title: "B賞・幸運好禮",
    description: "日本入浴劑",
    emoji: "🎀", 
    color: "bg-blue-100 border-blue-400 text-blue-800",
    baseProbability: 10, // 10%
    totalStock: 20,
    currentStock: 20
  },
  // 範例：C賞拆分為兩種不同的獎品
  {
    id: 'p3_money',
    tier: PrizeTier.C,
    title: "C賞・參加獎",
    description: "購物金 $20",
    emoji: "🧧", 
    color: "bg-green-100 border-green-500 text-green-800",
    baseProbability: 45, // 權重分配
    totalStock: 200,     // 庫存充足
    currentStock: 200
  },
  {
    id: 'p3_coupon',
    tier: PrizeTier.C,
    title: "C賞・特別獎",
    description: "免運優惠券",
    emoji: "🎫", 
    color: "bg-green-50 border-green-600 text-green-900",
    baseProbability: 44, // 權重分配
    totalStock: 10,      // 限量 10 張
    currentStock: 10
  },
];

// 規則文案
export const RULES_CONTENT = {
  method: [
    { title: "點擊襪子", text: "憑直覺選一隻喜歡的聖誕襪！" },
    { title: "截圖領獎", text: "出現中獎畫面後，請務必「手機截圖」保存畫面。" },
    { title: "回報登記", text: "將截圖回傳至「官方 LINE」並於結帳時主動提出，即可兌換。" },
  ],
  notices: [
    { title: "參加門檻", text: "本次連線每滿 $1,000 (不含運) 即可獲得一次抽獎機會 (金額可累計)。" },
    { title: "領獎規則", text: "獎品與購物金將隨本次連線商品一同寄出/折抵，若最後取消訂單或未達出貨門檻，視同放棄得獎資格。" },
    { title: "截圖為憑", text: "請務必保留中獎截圖，若無截圖證明，恕無法補發獎項。", highlight: true },
    { title: "其他說明", text: "GPICK 保有活動最終解釋與修改權利。" },
  ]
};
