
const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error("Trūksta BOT_TOKEN!");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

const menu = {
  reply_markup: {
    keyboard: [
      ["ℹ️ Apie mus", "📞 Kontaktai"],
      ["❓ Pagalba", "📋 Informacija"]
    ],
    resize_keyboard: true
  }
};

bot.onText(/^\/start$/, (msg) => {
  bot.sendMessage(msg.chat.id, "Sveiki! Ačiū, kad parašėte ❤️", menu);
});

bot.onText(/^\/help$/, (msg) => {
  bot.sendMessage(msg.chat.id, "Kuo galime jums padėti?", menu);
});

bot.onText(/^\/about$/, (msg) => {
  bot.sendMessage(msg.chat.id, "ℹ️ Sveiki! Čia KristaInfoBot.", menu);
});

bot.onText(/^\/contact$/, (msg) => {
  bot.sendMessage(msg.chat.id, "📞 Susisiekite su mumis asmenine žinute.", menu);
});

bot.on("message", (msg) => {
  const text = msg.text;
  if (!text || text.startsWith("/")) return;

  if (text.includes("Apie mus")) {
    bot.sendMessage(msg.chat.id, "ℹ️ Sveiki! Čia mūsų informacija.");
  } else if (text.includes("Kontaktai")) {
    bot.sendMessage(msg.chat.id, "📞 Ačiū, kad parašėte! Parašykite mums asmeniškai.");
  } else if (text.includes("Pagalba")) {
    bot.sendMessage(msg.chat.id, "❓ Parašykite, kuo galime padėti.");
  } else if (text.includes("Informacija")) {
    bot.sendMessage(msg.chat.id, "📋 Čia rasite svarbiausią informaciją.");
  } else {
    bot.sendMessage(msg.chat.id, "Ačiū už žinutę! Pasirinkite norimą meniu punktą.", menu);
  }
});

bot.on("polling_error", (error) => {
  console.error("Telegram klaida:", error.message);
});

console.log("KristaInfoBot paleistas!");
