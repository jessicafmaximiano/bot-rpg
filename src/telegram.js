const TelegramBot = require("node-telegram-bot-api");

const { generateReply } = require("./ai");
const { ConversationHistory } = require("./history");
const { RateLimiter } = require("./rateLimit");

const HISTORY_TURNS = parseInt(process.env.HISTORY_TURNS || "8", 10);
const RATE_LIMIT = parseInt(process.env.RATE_LIMIT_PER_MINUTE || "15", 10);

// IDs de usuário do Telegram autorizados a usar o bot (separados por vírgula).
// Vazio = qualquer pessoa que achar o bot pode usar (os IDs de quem mandar
// mensagem aparecem no log, para você copiar o seu e preencher depois).
const ALLOWED_IDS = (process.env.TELEGRAM_ALLOWED_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const history = new ConversationHistory(HISTORY_TURNS);
const rateLimiter = new RateLimiter(RATE_LIMIT);

const HELP_TEXT = `*Bot de D&D 5e* 🎲

Manda sua dúvida ou pedido em texto livre, por exemplo:
- "como funciona a condição agarrado?"
- "cria um NPC ladino desconfiado"
- "que tática eu uso contra um troll com meu bárbaro nível 6?"
- "monta um encontro pra 4 jogadores nível 5"
- "ideia de gancho de aventura envolvendo um culto"
- "qual arma combina melhor com um build de acuidade?"

Comandos:
/ajuda — mostra esta mensagem
/limpar — apaga o histórico desta conversa`;

function isAllowed(userId) {
  if (ALLOWED_IDS.length === 0) return true;
  return ALLOWED_IDS.includes(String(userId));
}

// Telegram limita mensagens a 4096 caracteres; divide respostas longas.
// Tenta enviar com formatação Markdown; se o Telegram rejeitar (caracteres
// especiais na resposta), reenvia como texto puro em vez de falhar.
async function sendReply(bot, chatId, text) {
  const chunks = [];
  for (let i = 0; i < text.length; i += 4000) {
    chunks.push(text.slice(i, i + 4000));
  }
  for (const chunk of chunks) {
    try {
      await bot.sendMessage(chatId, chunk, { parse_mode: "Markdown" });
    } catch (err) {
      await bot.sendMessage(chatId, chunk);
    }
  }
}

function startBot() {
  const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

  bot.on("polling_error", (err) => {
    console.error("Erro de polling do Telegram:", err.message);
  });

  bot.on("message", async (msg) => {
    try {
      await handleMessage(bot, msg);
    } catch (err) {
      console.error("Erro ao processar mensagem:", err);
    }
  });

  console.log("Bot de D&D 5e conectado ao Telegram com sucesso! Aguardando mensagens...");
  return bot;
}

async function handleMessage(bot, msg) {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  const who = msg.from?.username ? `@${msg.from.username}` : msg.from?.first_name || "?";
  const text = (msg.text || msg.caption || "").trim();

  if (!text) return;

  if (!isAllowed(userId)) {
    console.log(`Mensagem ignorada de usuário não autorizado: ${userId} (${who})`);
    return;
  }

  console.log(`Mensagem de ${who} (id ${userId}): ${text.slice(0, 80)}`);

  const chatKey = String(chatId);

  if (text === "/start" || text === "/ajuda") {
    await sendReply(bot, chatId, HELP_TEXT);
    return;
  }

  if (text === "/limpar") {
    history.clear(chatKey);
    await bot.sendMessage(chatId, "Histórico desta conversa apagado. Pode começar do zero! 🎲");
    return;
  }

  if (!rateLimiter.allow(chatKey)) {
    await bot.sendMessage(chatId, "Calma aí, muitas mensagens em pouco tempo! Espera um minutinho e manda de novo. ⏳");
    return;
  }

  await bot.sendChatAction(chatId, "typing");

  try {
    const previousHistory = history.get(chatKey);
    const reply = await generateReply(text, previousHistory);
    history.append(chatKey, text, reply);
    await sendReply(bot, chatId, reply);
  } catch (err) {
    console.error("Erro ao gerar resposta da IA:", err);
    await bot.sendMessage(chatId, "Deu um erro aqui do meu lado tentando responder. Tenta de novo em instantes?");
  }
}

module.exports = { startBot };
