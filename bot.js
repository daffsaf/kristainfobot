const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

// Paleidžiame HTTP serverį, kad Render (Web Service) nepalaikytų klaidos ir neuždarytų botiuko
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('KristaInfoBot is running!\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

// Pakeiskite šį žetoną (token) arba palikite aplinkos kintamąjį
const token = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID; // Čia ateis bilietai (-5475178737)

const bot = new TelegramBot(token, { polling: true });

// Pagrindinis meniu mygtukų dizainas
const mainKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: 'Prekių sąrašas' }, { text: 'Kontaktai' }],
      [{ text: 'Pagalba (Ticket)' }, { text: 'Apie mus' }]
    ],
    resize_keyboard: true
  }
};

// Start komanda
bot.onText(/\/start/, (msg) => {
  if (msg.chat.type !== 'private') return; // Grupėse /start ignoruojamas
  
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    'Sveiki! 👋 Kuo galime padėti?\nPasirinkite vieną iš meniu punktų.',
    mainKeyboard
  );
});

// Bilietų (Ticket) būsenos sekimui, jei vartotojas rašo problemą
const waitingForTicket = new Set();

// Žinučių apdorojimas
bot.on('message', async (msg) => {
  // SVARBI APSAUGA: Jei žinutė ne iš asmeninio pokalbio (t.y. grupėje ar kanale), botas visiškai nereaguoja!
  if (msg.chat.type !== 'private') return;

  if (!msg.text || msg.text.startsWith('/')) return;

  const text = msg.text.trim();
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : (msg.from.first_name || 'Vartotojas');

  // Jei vartotojas paspaudė „Pagalba (Ticket)“
  if (text === 'Pagalba (Ticket)') {
    waitingForTicket.add(userId);
    return bot.sendMessage(
      chatId,
      '✍️ Parašykite savo problemą ar klausimą čia, ir administratorius su jumis susisieks:',
      { reply_markup: { remove_keyboard: true } }
    );
  }

  // Jei vartotojas rašo savo problemą po paspausto biletuko
  if (waitingForTicket.has(userId)) {
    waitingForTicket.delete(userId);

    // Siunčiame pranešimą į administratorių grupę
    if (ADMIN_CHAT_ID) {
      const adminMessage = `🚨 **Gautas naujas bilietas (Ticket)!**\n\n👤 **Vartotojas:** ${username} (ID: \`${userId}\мых\``\n💬 **Žinutė:** ${text}`;
      
      try {
        await bot.sendMessage(ADMIN_CHAT_ID, adminMessage, { parse_mode: 'Markdown' });
      } catch (err) {
        console.error('Klaida siunčiant administracijai:', err);
      }
    }

    // Atsakome vartotojui, kad bilietas gautas
    return bot.sendMessage(
      chatId,
      '✅ Jūsų žinutė perduota administracijai. Greitu metu susisieksime!',
      mainKeyboard
    );
  }

  // Kiti meniu punktai
  if (text === 'Prekių sąrašas') {
    return bot.sendMessage(chatId, '📦 Čia yra mūsų prekių sąrašas: [Nuoroda į katalogą]', mainKeyboard);
  }

  if (text === 'Kontaktai') {
    return bot.sendMessage(chatId, '📞 Susisiekti galite el. paštu: info@pavyzdys.lt arba telefonu.', mainKeyboard);
  }

  if (text === 'Apie mus') {
    return bot.sendMessage(chatId, 'ℹ️ Mes esame įmonė, padedanti rasti geriausius sprendimus.', mainKeyboard);
  }

  // Numatytasis atsakymas bet kokiam kitam tekstui
  bot.sendMessage(
    chatId,
    'Ačiū už žinutę! 😊 Pasirinkite norimą punktą meniu.',
    mainKeyboard
  );
});
