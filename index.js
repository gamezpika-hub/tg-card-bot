// index.js
import dotenv from 'dotenv';
dotenv.config();
import TelegramBot from 'node-telegram-bot-api';

// 🧠 引入你寫好的超強大腦
import { CARDS, MERCHANTS, computeBestRule } from './cardsDB.js';

// 從環境變數讀取 Token (上線到 Railway 時會用到)
const token = process.env.TELEGRAM_BOT_TOKEN || '8694836259:AAFDEl2OlL5cEIMxQlMDH6h0cly_YMAX46s';

// 建立機器人實體 (使用 polling 模式)
const bot = new TelegramBot(token, { polling: true });

console.log('🤖 機器人伺服器已啟動...');

// 當使用者輸入 /start 時的反應
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '你好！我是信用卡推薦神器 💳\n請直接告訴我你想去哪裡消費？\n(例如輸入：全聯、7-11、蝦皮購物)');
});

// 監聽所有文字訊息，串接 cardsDB 邏輯
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // 排除指令
  if (text.startsWith('/')) return;

  // 1. 嘗試從使用者輸入中比對出「商家」
  let matchedMerchant = null;
  let merchantName = '';
  for (const m of MERCHANTS) {
    if (text.includes(m.label)) {
      matchedMerchant = m.value;
      merchantName = m.label;
      break;
    }
  }

  // 如果找不到商家，請他重新輸入
  if (!matchedMerchant) {
    bot.sendMessage(chatId, `我還不太懂「${text}」是哪裡 😅\n請嘗試輸入支援的通路，例如：全聯、7-11、全家、新光三越、蝦皮購物、momo購物、Uber Eats`);
    return;
  }

  // 2. 找到商家了！開始計算所有卡片的最優回饋
  let bestCardResult = null;
  let highestRate = -1;

  // 這裡先簡單預設使用者有最頂級的方案設定，並預設為實體刷卡 (physical)
  const defaultPayment = (matchedMerchant === 'shopee' || matchedMerchant === 'momo' || matchedMerchant === 'uber_eats') ? 'linepay' : 'physical'; 
  const fakeUserSettings = { is_dahu: true, cobo_level: 'super', plan: 'up' };

  for (const card of CARDS) {
    const result = computeBestRule(card, matchedMerchant, defaultPayment, 'weekday', fakeUserSettings);
    if (result && result.rate > highestRate) {
      highestRate = result.rate;
      bestCardResult = result;
    }
  }

  // 3. 回覆結果給使用者
  if (bestCardResult) {
    const reply = `📍 發現通路：*${merchantName}*\n\n💳 推薦神卡：*${bestCardResult.card}*\n🔥 最高回饋：*${bestCardResult.rate}%* ${bestCardResult.rateType === 'cashback' ? '現金' : '點數'}\n💡 條件：${bestCardResult.note}`;
    bot.sendMessage(chatId, reply, { parse_mode: 'Markdown' });
  } else {
    bot.sendMessage(chatId, `去 ${merchantName} 消費，目前沒有特別加碼的卡片，建議用一般消費神卡！`);
  }
});
