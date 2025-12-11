
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// -----------------------------------------------------------
// [重要] 請在此處填入您的 Firebase 專案設定
// 1. 前往 https://console.firebase.google.com/ 建立專案
// 2. 建立 Realtime Database (設定規則為 read: true, write: true 供測試)
// 3. 在專案設定中找到 SDK 設定並複製貼上
// -----------------------------------------------------------

const firebaseConfig = {
  // 請將您的 API Key 填入下方引號中
  apiKey: "AIzaSyBvNRSFKTU1OKy_lmfM4W9Os57N0tLHLxc", 
  authDomain: "gpick-xmas-2025.firebaseapp.com",
  databaseURL: "https://gpick-xmas-2025-default-rtdb.asia-southeast1.firebasedatabase.app", // 例如: "https://your-project-id.firebasedatabase.app"
  projectId: "gpick-xmas-2025",
  storageBucket: "gpick-xmas-2025.firebasestorage.app",
  messagingSenderId: "335391782976",
  appId: "1:335391782976:web:2676188b7524cdc919c7a5"
};

// 檢查是否已設定 API Key
export const isCloudEnabled = !!firebaseConfig.apiKey && !!firebaseConfig.databaseURL;

let app;
let db: any = null;

if (isCloudEnabled) {
  try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    console.log("🔥 Firebase 連線成功：已啟用雲端同步模式");
  } catch (error) {
    console.error("Firebase 初始化失敗:", error);
    db = null;
  }
} else {
  console.warn("⚠️ 未設定 Firebase Config：系統將運作於「單機離線模式」。\n請至 services/firebase.ts 填入設定以啟用後台同步功能。");
}

export { db };
