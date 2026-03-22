// index.js
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// 從環境變數讀取 Token (上線到 Railway 時會用到)
const token = process.env.TELEGRAM_BOT_TOKEN || '8694836259:AAFDEl2OlL5cEIMxQlMDH6h0cly_YMAX46s';

// 建立機器人實體 (使用 polling 模式)
const bot = new TelegramBot(token, { polling: true });

console.log('🤖 機器人伺服器已啟動...');

// 當使用者輸入 /start 時的反應
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '你好！我是信用卡推薦機器人 💳\n輸入 /test 看看我能不能正常運作。');
});

// 當使用者輸入 /test 時的反應
bot.onText(/\/test/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Railway 部署成功！機器人連線正常 🚀');
});

// 監聽所有文字訊息 (未來可以把你的 cardsDB 邏輯接在這裡)
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // 排除指令
  if (text.startsWith('/')) return;

  bot.sendMessage(chatId, `你剛剛說了：「${text}」，但我還在學習如何計算信用卡回饋喔！`);
});
