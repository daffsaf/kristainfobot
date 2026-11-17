const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("Trūksta BOT_TOKEN aplinkos kintamojo. Įrašyk jį hostingo nustatymuose.");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// Pagrindinio meniu mygtukai (pridėtos prekės ir atnaujinta pagalba)
const menu = {
  reply_markup: {
    keyboard: [
      ["📦 Prekių sąrašas", "📞 Kontaktai"],
      ["❓ Pagalba (Ticket)", "ℹ️ Apie mus"]
    ],
    resize_keyboard: true
  }
};

bot.onText(/^\/start$/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Sveiki atvykę į KristaInfoBot! 👋\n\nPasirinkite norimą skiltį žemiau esančiame meniu.",
    menu
  );
});

bot.onText(/^\/help$/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Galimos komandos:\n/start – pradžia\n/help – pagalba\n/contact – kontaktai\n/prekes – prekių sąrašas",
    menu
  );
});

bot.onText(/^\/about$/, (msg) => {
  bot.sendMessage(msg.chat.id, "ℹ️ Apie mus\n\nTai informacinis botas, skirtas teikti naujausią informaciją bei pagalbą.", menu);
});

bot.onText(/^\/contact$/, (msg) => {
  bot.sendMessage(msg.chat.id, "📞 Kontaktai:\n\nTelegram: @Vadovybe\nSusisiekite su administracija tiesiogiai.", menu);
});

bot.onText(/^\/prekes$/, (msg) => {
  bot.sendMessage(msg.chat.id, "📦 **Prekių sąrašas:**\n\n1. Žolytė 🌱\n2. Kristutė 💎\n\nNorėdami užsisakyti ar gauti daugiau info, kreipkitės į administraciją @Vadovybe.", { parse_mode: "Markdown" });
});

bot.on("message", (msg) => {
  if (!msg.text || msg.text.startsWith("/")) return;
  const t = msg.text.toLowerCase().trim();

  if (["📦 prekių sąrašas", "prekių sąrašas", "prekes"].includes(t)) {
    return bot.sendMessage(
      msg.chat.id, 
      "📦 **Prekių sąrašas:**\n\n1. Žolytė 🌱\n2. Kristutė 💎\n\nNorėdami užsisakyti ar gauti daugiau info, kreipkitės į administraciją @Vadovybe.", 
      { parse_mode: "Markdown", ...menu }
    );
  }

  if (["📞 kontaktai", "kontaktai", "contact"].includes(t)) {
    return bot.sendMessage(msg.chat.id, "📞 Kontaktai:\n\nTelegram: @Vadovybe\nSusisiekite su administracija tiesiogiai.", menu);
  }

  if (["❓ pagalba (ticket)", "pagalba", "help"].includes(t)) {
    return bot.sendMessage(
      msg.chat.id, 
      "❓ **Pagalbos sistema (Ticket)**\n\nJei turite klausimų ar problemų, kreipkitės į mūsų administracijos kanalą / asmenį:\n👉 **@Vadovybe**\n\nAdministratoriai matys jūsų bilietą ir greitai su jumis susisieks!", 
      { parse_mode: "Markdown", ...menu }
    );
  }

  if (["ℹ️ apie mus", "apie mus", "about us"].includes(t)) {
    return bot.sendMessage(msg.chat.id, "ℹ️ Apie mus\n\nTai informacinis botas, skirtas teikti naujausią informaciją bei pagalbą.", menu);
  }

  if (/\b(labas|sveiki|sveikas|sveika)\b/.test(t)) {
    return bot.sendMessage(msg.chat.id, "Sveiki! 👋 Kuo galime padėti? Pasirinkite vieną iš meniu punktų.", menu);
  }

  bot.sendMessage(msg.chat.id, "Ačiū už žinutę! 😊 Pasirinkite norimą punktą meniu.", menu);
});

console.log("KristaInfoBot sėkmingai paleistas!");
