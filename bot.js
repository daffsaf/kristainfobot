const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

// Paleidžiame HTTP serverį, kad Render (Web Service) neuždarytų botiuko
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('KristaInfoBot is running!\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

const token = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID; // Administracijos grupės ID (-5475178737)

const bot = new TelegramBot(token, { polling: true });

// Pagrindinis meniu su visais mygtukais ir emoji
const mainKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: '📦 Prekių sąrašas' }, { text: '📞 Kontaktai' }],
      [{ text: '❓ Pagalba (Ticket)' }, { text: '💰 Kripto piniginė' }]
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

// Bilietų (Ticket) būsenos sekimui
const waitingForTicket = new Set();

// Žinučių apdorojimas
bot.on('message', async (msg) => {
  // Apsauga: jei žinutė ne iš asmeninio pokalbio, botas administracijos grupėje visiškai tylus
  if (msg.chat.type !== 'private') return;

  if (!msg.text || msg.text.startsWith('/')) return;

  const text = msg.text.trim();
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : (msg.from.first_name || 'Vartotojas');

  // 1. Pagalba (Ticket) paspaudimas
  if (text === '❓ Pagalba (Ticket)') {
    waitingForTicket.add(userId);
    return bot.sendMessage(
      chatId,
      '✍️ Parašykite savo problemą ar klausimą čia, ir administratorius su jumis susisieks:',
      { reply_markup: { remove_keyboard: true } }
    );
  }

  // 2. Jei vartotojas rašo problemą po paspausto biletuko
  if (waitingForTicket.has(userId)) {
    waitingForTicket.delete(userId);

    if (ADMIN_CHAT_ID) {
      const adminMessage = `🚨 **Gautas naujas bilietas (Ticket)!**\n\n👤 **Vartotojas:** ${username} (ID: \`${userId}\`)\n💬 **Žinutė:** ${text}`;
      
      try {
        await bot.sendMessage(ADMIN_CHAT_ID, adminMessage, { parse_mode: 'Markdown' });
      } catch (err) {
        console.error('Klaida siunčiant administracijai:', err);
      }
    }

    return bot.sendMessage(
      chatId,
      '✅ Jūsų žinutė perduota administracijai. Greitu metu susisieksime!',
      mainKeyboard
    );
  }

  // 3. Prekių sąrašas su detaliomis prekėmis
  if (text === '📦 Prekių sąrašas') {
    return bot.sendMessage(
      chatId,
      '📦 **Mūsų prekių katalogas:**\n\n' +
      '1️⃣ **Prekė A** – 15.00 USDT\n   _Trumpas aprašymas arba savybės._\n\n' +
      '2️⃣ **Prekė B** – 30.00 USDT\n   _Trumpas aprašymas arba savybės._\n\n' +
      '3️⃣ **Prekė C** – 50.00 USDT\n   _Trumpas aprašymas arba savybės._\n\n' +
      'Norėdami įsigyti, pasinaudokite „❓ Pagalba (Ticket)“.',
      { parse_mode: 'Markdown', ...mainKeyboard }
    );
  }

  // 4. Kontaktai
  if (text === '📞 Kontaktai') {
    return bot.sendMessage(
      chatId,
      '📞 **Susisiekite su mumis:**\n• El. paštas: info@pavyzdys.lt\n• Telefonas: +37060000000',
      { parse_mode: 'Markdown', ...mainKeyboard }
    );
  }

  // 5. Kripto piniginė
  if (text === '💰 Kripto piniginė') {
    return bot.sendMessage(
      chatId,
      '💰 **Jūsų Kripto piniginė:**\n\n• Balansas: `0.00 USDT`\n• Piniginės adresas: `0xPavyzdinisAdresas...`\n\nNorėdami papildyti ar atlikti mokėjimą, kreipkitės į administraciją per „❓ Pagalba (Ticket)“.',
      { parse_mode: 'Markdown', ...mainKeyboard }
    );
  }

  // Numatytasis atsakymas
  bot.sendMessage(
    chatId,
    'Ačiū už žinutę! 😊 Pasirinkite norimą punktą meniu.',
    mainKeyboard
  );
});
