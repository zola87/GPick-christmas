
import { PrizeConfig, PrizeTier } from './types';

// --- 設定區 Start ---

// 觸發A賞解鎖的抽獎次數門檻
export const UNLOCK_THRESHOLD = 50;

// 資源連結 (Assets)
export const ASSETS = {
  // 背景音樂已移除
  
  // 中獎音效: Santa Ho Ho Ho (Wikimedia Commons)
  winSound: "https://upload.wikimedia.org/wikipedia/commons/transcoded/8/86/Santa_Claus_Ho_Ho_Ho.ogg/Santa_Claus_Ho_Ho_Ho.ogg.mp3"
};

// 預設獎項配置 (可被後台覆蓋)
export const DEFAULT_PRIZES: PrizeConfig[] = [
  // --- A賞等級 (金色禮盒 - 稀有大獎) ---
  {
    id: 'p_usj',
    tier: PrizeTier.A,
    title: "USJ 無敵星星發光爆米花桶",
    description: "夢幻逸品 (限量1名)",
    emoji: "⭐", 
    color: "bg-yellow-100 border-yellow-500 text-yellow-800",
    baseProbability: 0.5,
    totalStock: 1,
    currentStock: 1
  },
  {
    id: 'p_suica',
    tier: PrizeTier.A,
    title: "Suica 西瓜卡企鵝軟萌娃娃",
    description: "超人氣玩偶 (限量1名)",
    emoji: "🐧", 
    color: "bg-yellow-100 border-yellow-500 text-yellow-800",
    baseProbability: 0.5,
    totalStock: 1,
    currentStock: 1
  },
  {
    id: 'p_pikmin',
    tier: PrizeTier.A,
    title: "皮克敏花瓶 (顏色隨機)",
    description: "療癒系居家小物 (限量1名)",
    emoji: "🌱", 
    color: "bg-yellow-100 border-yellow-500 text-yellow-800",
    baseProbability: 0.5,
    totalStock: 1,
    currentStock: 1
  },

  // --- B賞等級 (藍色禮盒 - 精選好禮) ---
  {
    id: 'p_human_made',
    tier: PrizeTier.B,
    title: "Human Made 愛心長襪",
    description: "潮流時尚單品 (限量1名)",
    emoji: "❤️", 
    color: "bg-blue-100 border-blue-400 text-blue-800",
    baseProbability: 1,
    totalStock: 1,
    currentStock: 1
  },
  {
    id: 'p_shiro',
    tier: PrizeTier.B,
    title: "Shiro 質感香氛髮噴霧",
    description: "日本必買香氛 (限量1名)",
    emoji: "✨", 
    color: "bg-blue-100 border-blue-400 text-blue-800",
    baseProbability: 1,
    totalStock: 1,
    currentStock: 1
  },

  // --- C賞等級 (綠色禮盒 - 開心小獎) ---
  {
    id: 'p_gacha',
    tier: PrizeTier.C,
    title: "¥400扭蛋兌換券",
    description: "可兌換 ¥400 扭蛋一顆",
    emoji: "💊", 
    color: "bg-green-50 border-green-600 text-green-900",
    baseProbability: 5,
    totalStock: 15,
    currentStock: 15
  },
  {
    id: 'p_snack',
    tier: PrizeTier.C,
    title: "日本熱門零食",
    description: "隨機款式",
    emoji: "🍘", 
    color: "bg-green-100 border-green-500 text-green-800",
    baseProbability: 5,
    totalStock: 10,
    currentStock: 10
  },
  {
    id: 'p_cute',
    tier: PrizeTier.C,
    title: "日系可愛小物",
    description: "隨機款式",
    emoji: "🧸", 
    color: "bg-green-100 border-green-500 text-green-800",
    baseProbability: 5,
    totalStock: 10,
    currentStock: 10
  },
  {
    id: 'p_free_ship',
    tier: PrizeTier.C,
    title: "本次連線免運券",
    description: "直接折抵本次運費",
    emoji: "🚚", 
    color: "bg-green-50 border-green-600 text-green-900",
    baseProbability: 15,
    totalStock: 40,
    currentStock: 40
  },
  {
    id: 'p_next_100',
    tier: PrizeTier.C,
    title: "下次連線折$100",
    description: "滿$1000可用",
    emoji: "💵", 
    color: "bg-green-50 border-green-600 text-green-900",
    baseProbability: 5,
    totalStock: 10,
    currentStock: 10
  },
  {
    id: 'p_next_50',
    tier: PrizeTier.C,
    title: "下次連線折$50",
    description: "滿$500可用",
    emoji: "🎫", 
    color: "bg-green-50 border-green-600 text-green-900",
    baseProbability: 25,
    totalStock: 80,
    currentStock: 80
  },
  {
    id: 'p_now_20',
    tier: PrizeTier.C,
    title: "本次訂單現折 $20",
    description: "結帳直接折抵",
    emoji: "💰", 
    color: "bg-green-50 border-green-600 text-green-900",
    baseProbability: 25,
    totalStock: 60,
    currentStock: 60
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
    { title: "參加門檻", text: "本次連線每滿 $1,000 (不含運) 即可獲得一次抽獎機會 (可累計)。" },
    { title: "截圖為憑", text: "請務必當下截圖中獎畫面。若無截圖證明，恕無法補發獎項。", highlight: true },
    { title: "領獎規則", text: "獎品與購物金將隨本次連線商品一同寄出/折抵，若未達出貨門檻或取消訂單，視同放棄資格。" },
    { title: "缺貨替換", text: "若遇獎品現場缺貨，將更換為「同品牌」或「等值」商品。" },
    { title: "嚴禁試抽", text: "每人限抽一次。系統以後台「第一筆紀錄」為準，後續任何重複操作或多抽之紀錄，均視為無效且不予保留。" },
    { title: "其他說明", text: "GPICK 保有活動最終解釋與修改權利。" },
  ]
};
